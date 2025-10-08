import { GoogleGenerativeAI } from "@google/generative-ai";

export const MODEL = "gemini-2.5-flash-lite";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
