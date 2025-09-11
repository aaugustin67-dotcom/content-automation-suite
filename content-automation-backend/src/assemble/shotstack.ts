import axios from "axios";
import { ShotstackEdit, ShotstackClip, ShotstackTrack, ShotstackTimeline, ShotstackOutput } from "../types";

export async function assembleShotstackTimeline(scenes: any[], assets: any[], audioFiles: string[], shotstackApiKey: string, postId: string, aspect: string): Promise<string> {
  const clips: ShotstackClip[] = [];
  let currentTime = 0;

  // Assuming a simple mapping of scenes to assets and audio
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const asset = assets[i]; // Assuming assets are ordered by scene
    const audioDuration = scene.duration; // Duration from ElevenLabs

    if (asset) {
      clips.push({
        asset: {
          type: asset.type,
          src: asset.src,
          trim: 0, // Will be trimmed later if needed
        },
        start: currentTime,
        length: audioDuration + 0.3, // Pad for crossfade
        transition: { in: "fade" },
      });
    } else {
      // Placeholder title card if no asset found
      clips.push({
        asset: {
          type: "title",
          text: scene.text,
          style: "minimal",
        },
        start: currentTime,
        length: audioDuration,
      });
    }
    currentTime += audioDuration;
  }

  const timeline: ShotstackTimeline = {
    tracks: [
      { clips: clips }, // Track 2: scene b-roll
      // Add other tracks for background, captions, logo overlay later
    ],
    soundtrack: {
      src: "", // Concatenated VO will be set here
      effect: "fadeInFadeOut",
    },
  };

  const output: ShotstackOutput = {
    format: "mp4",
    resolution: "hd",
    fps: 30,
  };

  const edit: ShotstackEdit = {
    timeline: timeline,
    output: output,
  };

  try {
    const response = await axios.post("https://api.shotstack.io/edit/v1/render", edit, {
      headers: {
        "x-api-key": shotstackApiKey,
        "Content-Type": "application/json",
      },
    });
    return response.data.response.id; // Return render job ID
  } catch (error) {
    console.error("Error assembling Shotstack timeline:", error);
    throw error;
  }
}

export async function pollShotstackStatus(jobId: string, shotstackApiKey: string): Promise<string> {
  let status = "queued";
  let outputUrl = "";

  while (status !== "done" && status !== "failed") {
    try {
      const response = await axios.get(`https://api.shotstack.io/edit/v1/render/${jobId}`, {
        headers: {
          "x-api-key": shotstackApiKey,
        },
      });
      status = response.data.response.status;
      outputUrl = response.data.response.url;
      console.log(`Shotstack job ${jobId} status: ${status}`);

      if (status === "failed") {
        throw new Error(`Shotstack job ${jobId} failed.`);
      }
      if (status === "done") {
        return outputUrl;
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
    } catch (error) {
      console.error("Error polling Shotstack status:", error);
      throw error;
    }
  }
  return outputUrl; // Should be done or failed
}


