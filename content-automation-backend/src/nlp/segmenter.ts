import { Scene } from "../types";
import OpenAI from "openai";

export async function segmentContent(text: string, openaiApiKey: string): Promise<Scene[]> {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    // Default: OpenAI to summarize into 8-12 single-sentence lines (<=180 chars), each with 3-6 keywords.
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that segments blog post content into 8-12 single-sentence scenes, each with 3-6 keywords. Each sentence should be no more than 180 characters." },
        { role: "user", content: `Segment the following text into scenes:\n\n${text}` },
      ],
      model: "gpt-3.5-turbo",
    });

    const segmentedText = completion.choices[0].message.content;
    if (!segmentedText) {
      throw new Error("OpenAI did not return any segmented text.");
    }

    const scenes: Scene[] = segmentedText.split("\n").filter(line => line.trim() !== "").map((line, index) => {
      const parts = line.split("Keywords:");
      const text = parts[0].trim();
      const keywords = parts[1] ? parts[1].split(",").map(kw => kw.trim()) : [];
      return { index, text, keywords };
    });
    return scenes;
  } catch (error) {
    console.warn("OpenAI segmentation failed, falling back to heuristic segmentation:", error);
    return heuristicSegmentation(text);
  }
}

function heuristicSegmentation(text: string): Scene[] {
  // Fallback heuristic: split by headings/paragraphs; compress; keyword extraction via tf-idf.
  const paragraphs = text.split(/\n\s*\n/);
  const scenes: Scene[] = [];
  let index = 0;

  for (const para of paragraphs) {
    if (para.trim() === "") continue;

    // Simple keyword extraction (can be improved with a proper tf-idf implementation)
    const keywords = para.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 6); // Limit to 6 keywords

    // Compress text to single sentence (very basic, can be improved)
    let compressedText = para.replace(/\s+/g, " ").trim();
    if (compressedText.length > 180) {
      compressedText = compressedText.substring(0, 177) + "...";
    }

    scenes.push({ index: index++, text: compressedText, keywords: uniqueKeywords });
    if (scenes.length >= 12) break; // Limit to 12 scenes
  }
  return scenes;
}


