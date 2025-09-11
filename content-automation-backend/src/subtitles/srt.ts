import { Scene } from "../types";
import fs from "fs/promises";
import path from "path";

export async function generateSrtFile(scenes: Scene[], postId: string, aspect: string, audioDurations: number[]): Promise<string> {
  let srtContent = "";
  let currentTime = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const duration = audioDurations[i];

    const startMs = currentTime * 1000;
    const endMs = (currentTime + duration) * 1000;

    const formatTime = (ms: number) => {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor(((ms % 3600000) % 60000) / 1000);
      const milliseconds = ms % 1000;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
    };

    srtContent += `${i + 1}\n`;
    srtContent += `${formatTime(startMs)} --> ${formatTime(endMs)}\n`;
    srtContent += `${scene.text}\n\n`;

    currentTime += duration;
  }

  const srtDir = path.join(process.cwd(), "dist", postId, aspect);
  await fs.mkdir(srtDir, { recursive: true });
  const srtFilePath = path.join(srtDir, "captions.srt");
  await fs.writeFile(srtFilePath, srtContent);
  return srtFilePath;
}


