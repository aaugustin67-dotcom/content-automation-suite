import axios from "axios";

const PEXELS_RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { MediaAsset } from "../types";

export async function searchPexelsVideos(query: string, pexelsApiKey: string): Promise<MediaAsset[]> {
  let retries = 0;
  while (retries < 5) {
    try {
      const response = await axios.get(`https://api.pexels.com/videos/search?query=${query}&per_page=10`, {
        headers: {
          Authorization: pexelsApiKey,
        },
      });
      await sleep(PEXELS_RATE_LIMIT_DELAY); // Rate limit
      return response.data.videos
        .filter((video: any) => video.duration >= 6) // Choose clips >=6s
        .map((video: any) => ({
          type: "video",
          src: video.video_files[0].link, // Take the first video file available
          duration: video.duration,
          thumbnail: video.image,
        }));
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.warn(`Pexels rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        retries++;
      } else {
        console.error("Error searching Pexels videos:", error);
        return [];
      }
    }
  }
  console.error("Max retries reached for Pexels API.");
  return [];
}


}

