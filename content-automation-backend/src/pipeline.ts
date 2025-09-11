import { fetchBlogPosts, normalizeHtmlToPlainText } from "./ingest/blogger";
import { segmentContent } from "./nlp/segmenter";
import { searchPexelsVideos } from "./media/pexels";
import { searchPixabayVideos } from "./media/pixabay";
import { generateVoiceover, calculateSrtTiming } from "./tts/eleven";
import { assembleShotstackTimeline, pollShotstackStatus } from "./assemble/shotstack";
import { generateSrtFile } from "./subtitles/srt";
import { BlogPost, Scene, MediaAsset, VideoMetadata } from "./types";
import fs from "fs/promises";
import path from "path";

interface PipelineOptions {
  latestCount?: number;
  postId?: string;
  aspects?: string[];
  dryRun?: boolean;
}

export async function runPipeline(options: PipelineOptions) {
  const { latestCount = 1, postId, aspects = ["16:9"], dryRun = false } = options;

  // 1) Ingest (Blogger)
  console.log("Fetching blog posts...");
  const BLOGGER_FEED_URL = process.env.BLOGGER_FEED_URL || "";
  const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID || "";
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

  if (!BLOGGER_FEED_URL || !BLOGGER_BLOG_ID || !GOOGLE_API_KEY) {
    console.error("Missing Blogger environment variables.");
    return;
  }

  let posts: BlogPost[] = [];
  if (postId) {
    // Fetch specific post if postId is provided (not implemented in fetchBlogPosts yet)
    console.warn("Fetching specific post by ID is not fully implemented. Fetching latest.");
    posts = await fetchBlogPosts(BLOGGER_FEED_URL, BLOGGER_BLOG_ID, GOOGLE_API_KEY);
    posts = posts.filter(p => p.id === postId);
  } else {
    posts = await fetchBlogPosts(BLOGGER_FEED_URL, BLOGGER_BLOG_ID, GOOGLE_API_KEY);
    posts = posts.slice(0, latestCount);
  }

  if (posts.length === 0) {
    console.log("No blog posts found to process.");
    return;
  }

  const seenCachePath = path.join(process.cwd(), "cache", "seen.json");
  let seen: { postId: string; aspect: string }[] = [];
  try {
    const seenContent = await fs.readFile(seenCachePath, "utf-8");
    seen = JSON.parse(seenContent);
  } catch (error) {
    console.warn("Could not read seen.json, starting with empty cache.", error);
  }

  for (const post of posts) {
    console.log(`Processing post: ${post.title}`);
    const plainTextContent = normalizeHtmlToPlainText(post.html);

    // 2) Segment to scenes
    console.log("Segmenting content to scenes...");
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable.");
      return;
    }
    const scenes: Scene[] = await segmentContent(plainTextContent, OPENAI_API_KEY);
    console.log(`Generated ${scenes.length} scenes.`);

    for (const aspect of aspects) {
      // Idempotency check
      if (seen.some(item => item.postId === post.id && item.aspect === aspect)) {
        console.log(`Skipping post ${post.id} for aspect ${aspect}: already seen.`);
        continue;
      }

      console.log(`Processing for aspect ratio: ${aspect}`);
      const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
      const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "";
      const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY || "";
      const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY || "";

      if (!PEXELS_API_KEY || !PIXABAY_API_KEY || !ELEVEN_API_KEY || !SHOTSTACK_API_KEY) {
        console.error("Missing API keys for media search, voiceover, or Shotstack.");
        return;
      }

      const sceneAssets: MediaAsset[] = [];
      const audioFilePaths: string[] = [];
      const audioDurations: number[] = [];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log(`Searching media and generating voiceover for scene ${i + 1}/${scenes.length}: ${scene.text}`);

        // 3) Media search
        let assets: MediaAsset[] = await searchPexelsVideos(scene.keywords.join(" "), PEXELS_API_KEY);
        if (assets.length === 0) {
          assets = await searchPixabayVideos(scene.keywords.join(" "), PIXABAY_API_KEY);
        }

        if (assets.length > 0) {
          sceneAssets.push(assets[0]); // Take the first relevant asset
        } else {
          console.warn(`No media found for scene ${i + 1}. Using placeholder.`);
          sceneAssets.push({
            type: "image",
            src: "/api/placeholder/1280/720", // Placeholder image
            thumbnail: "/api/placeholder/1280/720",
          });
        }

        // 4) Voiceover (ElevenLabs)
        const audioFilePath = await generateVoiceover(scene.text, ELEVEN_API_KEY, "21m00Tzpb8CgX-H3PczE", post.id, i); // Using a default voice_id
        audioFilePaths.push(audioFilePath);
        const duration = calculateSrtTiming(scene.text.split(" ").length); // Basic duration calculation
        audioDurations.push(duration);
      }

      if (dryRun) {
        console.log("Dry run: Skipping Shotstack assembly and rendering.");
        continue;
      }

      // 5) Assemble Shotstack timeline
      console.log("Assembling Shotstack timeline...");
      const jobId = await assembleShotstackTimeline(scenes, sceneAssets, audioFilePaths, SHOTSTACK_API_KEY, post.id, aspect);
      console.log(`Shotstack job started with ID: ${jobId}`);

      console.log("Polling Shotstack render status...");
      const outputUrl = await pollShotstackStatus(jobId, SHOTSTACK_API_KEY);
      console.log(`Shotstack render complete. Output URL: ${outputUrl}`);

      // Write metadata and SRT
      const videoMetadata: VideoMetadata = {
        postId: post.id,
        aspect: aspect,
        scenes: scenes,
        assets: sceneAssets,
        durations: audioDurations,
        renderJobId: jobId,
        outputUrl: outputUrl,
      };

      const distDir = path.join(process.cwd(), "dist", post.id, aspect);
      await fs.mkdir(distDir, { recursive: true });
      await fs.writeFile(path.join(distDir, "metadata.json"), JSON.stringify(videoMetadata, null, 2));
      console.log("Metadata written.");

      await generateSrtFile(scenes, post.id, aspect, audioDurations);
      console.log("SRT file generated.");

      // Update seen.json
      seen.push({ postId: post.id, aspect: aspect });
      await fs.writeFile(seenCachePath, JSON.stringify(seen, null, 2));
      console.log("Updated seen.json cache.");
    }
  }
}

// CLI entry point (to be implemented in a separate file or directly here for simplicity)
// For now, this pipeline function will be called from the CLI script.


