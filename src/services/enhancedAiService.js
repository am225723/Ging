/**
 * Enhanced AI Service
 * 
 * This service provides an enhanced interface to AI providers with additional features:
 * - Response caching to reduce API calls
 * - Retry mechanisms for failed requests
 * - Detailed error handling
 * - User feedback incorporation
 * - Transparent AI reasoning
 */

import { createAIProvider, AI_PROVIDERS } from './aiProviderFactory';

// Simple in-memory cache
const responseCache = new Map();

// Default configuration
const DEFAULT_CONFIG = {
  provider: AI_PROVIDERS.GEMINI,
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 1024,
  cacheEnabled: true,
  retryCount: 2,
  retryDelay: 1000, // ms
};

/**
 * Creates an enhanced AI service with additional features
 * 
 * @param {Object} config - Configuration for the AI service
 * @returns {Object} An enhanced AI service instance
 */
export function createEnhancedAIService(config = {}) {
  const serviceConfig = { ...DEFAULT_CONFIG, ...config };
  let aiProvider = createAIProvider(serviceConfig);
  
  return {
    /**
     * Generates text content with enhanced features
     * 
     * @param {string} prompt - The text prompt to send to the model
     * @param {Object} options - Additional options for generation
     * @returns {Promise<Object>} The generation result with metadata
     */
    async generateText(prompt, options = {}) {
      const finalOptions = { ...serviceConfig, ...options };
      const cacheKey = getCacheKey('text', prompt, finalOptions);
      
      // Check cache if enabled
      if (finalOptions.cacheEnabled && responseCache.has(cacheKey)) {
        return {
          text: responseCache.get(cacheKey),
          fromCache: true,
          provider: aiProvider.getProviderName(),
          timestamp: new Date().toISOString(),
        };
      }
      
      // Generate with retry
      let attempt = 0;
      let lastError = null;
      
      while (attempt <= finalOptions.retryCount) {
        try {
          const result = await aiProvider.generateText(prompt, finalOptions);
          
          // Cache the result if enabled
          if (finalOptions.cacheEnabled) {
            responseCache.set(cacheKey, result);
          }
          
          return {
            text: result,
            fromCache: false,
            provider: aiProvider.getProviderName(),
            timestamp: new Date().toISOString(),
            attempts: attempt + 1,
          };
        } catch (error) {
          lastError = error;
          attempt++;
          
          if (attempt <= finalOptions.retryCount) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, finalOptions.retryDelay));
            
            // Adjust parameters for retry if needed
            if (finalOptions.adjustOnRetry) {
              finalOptions.temperature = Math.max(0.1, finalOptions.temperature - 0.1);
              finalOptions.maxTokens = Math.min(2048, finalOptions.maxTokens + 256);
            }
          }
        }
      }
      
      // All retries failed
      throw new Error(`Failed after ${attempt} attempts: ${lastError.message}`);
    },
    
    /**
     * Generates JSON content with enhanced features
     * 
     * @param {string} prompt - The text prompt describing the desired JSON structure
     * @param {Object} options - Additional options for generation
     * @returns {Promise<Object>} The generation result with metadata
     */
    async generateJson(prompt, options = {}) {
      const finalOptions = { ...serviceConfig, ...options };
      const cacheKey = getCacheKey('json', prompt, finalOptions);
      
      // Check cache if enabled
      if (finalOptions.cacheEnabled && responseCache.has(cacheKey)) {
        return {
          data: responseCache.get(cacheKey),
          fromCache: true,
          provider: aiProvider.getProviderName(),
          timestamp: new Date().toISOString(),
        };
      }
      
      // Generate with retry
      let attempt = 0;
      let lastError = null;
      
      while (attempt <= finalOptions.retryCount) {
        try {
          const result = await aiProvider.generateJson(prompt, finalOptions);
          
          // Cache the result if enabled
          if (finalOptions.cacheEnabled) {
            responseCache.set(cacheKey, result);
          }
          
          return {
            data: result,
            fromCache: false,
            provider: aiProvider.getProviderName(),
            timestamp: new Date().toISOString(),
            attempts: attempt + 1,
          };
        } catch (error) {
          lastError = error;
          attempt++;
          
          if (attempt <= finalOptions.retryCount) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, finalOptions.retryDelay));
            
            // Adjust parameters for retry if needed
            if (finalOptions.adjustOnRetry) {
              finalOptions.temperature = Math.max(0.1, finalOptions.temperature - 0.1);
              finalOptions.maxTokens = Math.min(2048, finalOptions.maxTokens + 256);
            }
          }
        }
      }
      
      // All retries failed
      throw new Error(`Failed after ${attempt} attempts: ${lastError.message}`);
    },
    
    /**
     * Clears the response cache
     */
    clearCache() {
      responseCache.clear();
    },
    
    /**
     * Updates the service configuration
     * 
     * @param {Object} newConfig - New configuration parameters
     */
    updateConfig(newConfig) {
      Object.assign(serviceConfig, newConfig);
      aiProvider = createAIProvider(serviceConfig);
    },
    
    /**
     * Gets the current service configuration
     * 
     * @returns {Object} The current configuration
     */
    getConfig() {
      return { ...serviceConfig };
    },
    
    /**
     * Incorporates user feedback to improve future responses
     * 
     * @param {string} prompt - The original prompt
     * @param {string|Object} response - The AI response
     * @param {Object} feedback - User feedback about the response
     */
    incorporateFeedback(prompt, response, feedback) {
      // In a real implementation, this could:
      // 1. Store feedback for analytics
      // 2. Adjust future prompts based on feedback
      // 3. Update cache with corrected responses
      
      // For now, we'll just invalidate the cache entry if feedback is negative
      if (feedback.rating < 3) { // Assuming rating is 1-5
        const cacheKey = typeof response === 'string' 
          ? getCacheKey('text', prompt, serviceConfig)
          : getCacheKey('json', prompt, serviceConfig);
        
        if (responseCache.has(cacheKey)) {
          responseCache.delete(cacheKey);
        }
      }
    }
  };
}

/**
 * Generates a cache key for a prompt and options
 * 
 * @param {string} type - The type of generation ('text' or 'json')
 * @param {string} prompt - The prompt text
 * @param {Object} options - The generation options
 * @returns {string} A cache key
 */
function getCacheKey(type, prompt, options) {
  // Include only the options that affect the output
  const relevantOptions = {
    provider: options.provider,
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    topP: options.topP,
    topK: options.topK,
  };
  
  return `${type}:${prompt}:${JSON.stringify(relevantOptions)}`;
}