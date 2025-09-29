/**
 * AI Provider Factory
 * 
 * This module provides a factory for creating AI service instances based on configuration.
 * It abstracts the underlying AI provider implementation, allowing for easy switching
 * between different AI services (Gemini, OpenAI, etc.)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// AI Provider Types
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  // Add more providers as needed
};

// Default configuration
const DEFAULT_CONFIG = {
  provider: AI_PROVIDERS.GEMINI,
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * Creates an AI provider instance based on the given configuration
 * 
 * @param {Object} config - Configuration for the AI provider
 * @returns {Object} An AI provider instance with standardized methods
 */
export function createAIProvider(config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  switch (finalConfig.provider) {
    case AI_PROVIDERS.GEMINI:
      return createGeminiProvider(finalConfig);
    case AI_PROVIDERS.OPENAI:
      // Implement OpenAI provider when needed
      throw new Error('OpenAI provider not yet implemented');
    default:
      throw new Error(`Unknown AI provider: ${finalConfig.provider}`);
  }
}

/**
 * Creates a Gemini AI provider instance
 * 
 * @param {Object} config - Configuration for the Gemini provider
 * @returns {Object} A Gemini provider instance with standardized methods
 */
function createGeminiProvider(config) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  return {
    /**
     * Generates text content using the Gemini model
     * 
     * @param {string} prompt - The text prompt to send to the model
     * @param {Object} options - Additional options for generation
     * @returns {Promise<string>} The generated text
     */
    async generateText(prompt, options = {}) {
      try {
        const modelConfig = {
          model: config.model,
          generationConfig: {
            temperature: options.temperature || config.temperature,
            maxOutputTokens: options.maxTokens || config.maxTokens,
            topP: options.topP || 0.8,
            topK: options.topK || 40,
          },
        };
        
        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        throw handleGeminiError(error);
      }
    },
    
    /**
     * Generates structured JSON content using the Gemini model
     * 
     * @param {string} prompt - The text prompt describing the desired JSON structure
     * @param {Object} options - Additional options for generation
     * @returns {Promise<Object>} The generated JSON object
     */
    async generateJson(prompt, options = {}) {
      try {
        const modelConfig = {
          model: config.model,
          generationConfig: {
            temperature: options.temperature || config.temperature,
            maxOutputTokens: options.maxTokens || config.maxTokens,
            topP: options.topP || 0.8,
            topK: options.topK || 40,
            responseMimeType: "application/json",
          },
        };
        
        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return JSON.parse(text);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("The AI returned an invalid JSON response. Please try again with different parameters.");
        }
        throw handleGeminiError(error);
      }
    },
    
    /**
     * Get the name of the current provider
     * 
     * @returns {string} The provider name
     */
    getProviderName() {
      return AI_PROVIDERS.GEMINI;
    },
    
    /**
     * Get the current configuration
     * 
     * @returns {Object} The current configuration
     */
    getConfig() {
      return { ...config };
    }
  };
}

/**
 * Handles errors from the Gemini API
 * 
 * @param {Error} error - The error from the Gemini API
 * @returns {Error} A more user-friendly error
 */
function handleGeminiError(error) {
  console.error("Gemini API Error:", error);
  const errorMessage = error.toString();

  if (errorMessage.includes('API key not valid')) {
    return new Error('Your Gemini API key is not valid. Please check it in your .env file.');
  }
  if (errorMessage.includes('429')) {
    return new Error('You have exceeded your API quota. Please check your Gemini account.');
  }
  if (errorMessage.includes('Could not parse response')) {
    return new Error('The AI returned an invalid response. Please try again.');
  }
  return new Error('An unknown error occurred with the AI service. Please check your connection.');
}