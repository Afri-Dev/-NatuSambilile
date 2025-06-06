import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Chat features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "MISSING_API_KEY");

export const getStudyBuddyResponse = async (
  courseContent: string,
  userQuestion: string,
  chatHistory: Array<{ role: 'user' | 'model', parts: string }>
): Promise<string> => {
  if (!API_KEY) return "Chat features are currently unavailable. Please check the API configuration.";
  
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_TEXT });
    
    // Prepare the prompt with course context and chat history
    const prompt = `You are a helpful study assistant for this course. 
    Course Content: ${courseContent}\n\n` +
      `Chat History:\n${chatHistory.map(msg => `${msg.role}: ${msg.parts}`).join('\n')}\n\n` +
      `Student's Question: ${userQuestion}\n\n` +
      `Please provide a helpful response based on the course content. If the question is outside the course scope, 
      politely guide the student back to the course material.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};
