import axios from "axios";

const PIXABAY_RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { MediaAsset } from "../types";

export async function searchPixabayVideos(query: string, pixabayApiKey: string): Promise<MediaAsset[]> {
  let retries = 0;
  while (retries < 5) {
    try {
      const response = await axios.get(`https://pixabay.com/api/videos/?key=${pixabayApiKey}&q=${query}&video_type=film`);
      await sleep(PIXABAY_RATE_LIMIT_DELAY); // Rate limit
      return response.data.hits.map((hit: any) => ({
        type: "video",
        src: hit.videos.tiny.url, // Using tiny for simplicity, can be adjusted
        duration: hit.duration,
        thumbnail: hit.picture_id,
      }));
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.warn(`Pixabay rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        retries++;
      } else {
        console.error("Error searching Pixabay videos:", error);
        return [];
      }
    }
  }
  console.error("Max retries reached for Pixabay API.");
  return [];
}


