
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will not work. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Provide a fallback to avoid error if API_KEY is undefined

export const generateCourseDescription = async (topic: string): Promise<string | null> => {
  if (!API_KEY) return "AI features disabled. API Key not configured.";
  try {
    const prompt = `Generate a concise and engaging course description (2-3 sentences) for an online course about "${topic}". Focus on the key benefits and what students will learn. Provide the output as plain text without any Markdown formatting.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating course description:", error);
    return "Failed to generate description. Please try again.";
  }
};

export const generateLessonContent = async (courseTitle: string, moduleTitle: string, lessonTopic: string): Promise<string | null> => {
  if (!API_KEY) return "AI features disabled. API Key not configured.";
  try {
    const prompt = `Generate educational content for a lesson titled "${lessonTopic}" within the module "${moduleTitle}" for the course "${courseTitle}". The content should be informative, clear, and suitable for online learning. Provide a few paragraphs of plain text, without any Markdown formatting.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating lesson content:", error);
    return "Failed to generate lesson content. Please try again.";
  }
};

export const generateModuleSuggestions = async (courseTitle: string, courseDescription: string): Promise<string[] | null> => {
  if (!API_KEY) return ["AI features disabled. API Key not configured."];
  try {
    const prompt = `Based on the course titled "${courseTitle}" with the description: "${courseDescription}", suggest 3-5 relevant module titles. Return a JSON array of strings. Example: ["Module 1: Introduction", "Module 2: Core Concepts"]`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData;
      }
      console.warn("Gemini returned non-array or non-string array for module suggestions:", parsedData);
      return ["Could not parse module suggestions correctly."];
    } catch (e) {
      console.error("Failed to parse JSON response for module suggestions:", e, "Raw response:", jsonStr);
      return ["Error parsing AI suggestions."];
    }

  } catch (error) {
    console.error("Error generating module suggestions:", error);
    return ["Failed to generate module suggestions."];
  }
};
