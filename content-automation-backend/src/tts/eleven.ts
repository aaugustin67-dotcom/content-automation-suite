import axios from "axios";
import fs from "fs/promises";
import path from "path";

export async function generateVoiceover(text: string, elevenApiKey: string, voiceId: string, postId: string, sceneIndex: number): Promise<string> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const headers = {
    "Accept": "audio/mpeg",
    "xi-api-key": elevenApiKey,
    "Content-Type": "application/json",
  };
  const data = {
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  try {
    const response = await axios.post(url, data, { headers, responseType: "arraybuffer" });
    const audioDir = path.join(process.cwd(), "dist", postId, "audio");
    await fs.mkdir(audioDir, { recursive: true });
    const audioFilePath = path.join(audioDir, `scene-${sceneIndex}.mp3`);
    await fs.writeFile(audioFilePath, response.data);
    return audioFilePath;
  } catch (error) {
    console.error("Error generating voiceover with ElevenLabs:", error);
    throw error;
  }
}

export function calculateSrtTiming(wordCount: number, wpm: number = 160): number {
  return (wordCount / wpm) * 60; // Duration in seconds
}


