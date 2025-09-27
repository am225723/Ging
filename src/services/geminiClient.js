import { GoogleGenerativeAI } from "@google/genai";

// Access the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in your environment variables. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates content using the Gemini Pro model.
 *
 * @param {string} prompt The text prompt to send to the model.
 * @returns {Promise<string>} The generated text.
 */
export async function generateWithGemini(prompt) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    // Return a more user-friendly error message or handle it as needed
    return "Sorry, I was unable to generate a response at this time. Please ensure your API key is valid and has the necessary permissions.";
  }
}

/**
 * Generates a structured JSON response using the Gemini Pro model.
 *
 * @param {string} prompt The text prompt describing the desired JSON structure.
 * @returns {Promise<Object>} The generated JSON object.
 */
export async function generateJsonWithGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // The response text should be a valid JSON string.
    // We'll parse it to ensure it's valid JSON before returning.
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating JSON with Gemini:", error);
    // In case of an error (e.g., invalid JSON response), return a default or error object
    return { error: "Failed to generate a valid JSON response. Please check the prompt and API key." };
  }
}