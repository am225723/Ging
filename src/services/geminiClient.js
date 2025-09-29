import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') ? new GoogleGenerativeAI(API_KEY) : null;

const handleApiError = (error) => {
  console.error("Gemini API Error:", error);
  const errorMessage = error.toString();

  if (errorMessage.includes('API key not valid')) {
    return 'Your Gemini API key is not valid. Please check it in your .env file.';
  }
  if (errorMessage.includes('429')) {
    return 'You have exceeded your API quota. Please check your Gemini account.';
  }
  if (errorMessage.includes('Could not parse response')) {
    return 'The AI returned an invalid response. Please try again.';
  }
  if (errorMessage.includes('404') && errorMessage.includes('not found')) {
    return 'The AI model is not available. Please check if the model name is correct.';
  }
  return 'An unknown error occurred with the AI service. Please check your connection.';
};

/**
 * Generates content using the Gemini 2.0 Flash model.
 *
 * @param {string} prompt The text prompt to send to the model.
 * @returns {Promise<string>} The generated text.
 */
export async function generateWithGemini(prompt) {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  try {
    // BUG FIX: Updated from gemini-1.5-flash to gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Generates a structured JSON response using the Gemini 2.0 Flash model.
 *
 * @param {string} prompt The text prompt describing the desired JSON structure.
 * @returns {Promise<Object>} The generated JSON object.
 */
export async function generateJsonWithGemini(prompt) {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  try {
    // BUG FIX: Updated from gemini-1.5-flash to gemini-2.0-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON from Gemini:", error);
      throw new Error("The AI returned an invalid JSON response. Please try rephrasing your request.");
    }
    throw new Error(handleApiError(error));
  }
}