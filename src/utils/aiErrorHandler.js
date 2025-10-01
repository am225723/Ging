// NEW FILE: src/utils/aiErrorHandler.js
// Centralized error handling for all AI features

/**
 * Handles AI-related errors and provides user-friendly messages
 * @param {Error} error - The error object
 * @param {Function} addToast - Toast notification function
 * @returns {string} User-friendly error message
 */
export function handleAIError(error, addToast) {
  console.error('AI Error:', error);
  
  const errorMsg = error.message || error.toString();
  let userMessage = '';
  let toastType = 'error';
  
  // API Key errors
  if (errorMsg.includes('API key') || errorMsg.includes('not configured')) {
    userMessage = 'AI service is not properly configured. Please contact support.';
  }
  // JSON parsing errors
  else if (errorMsg.includes('parse') || errorMsg.includes('JSON') || errorMsg.includes('invalid format')) {
    userMessage = 'AI returned an invalid response. Please try again.';
  }
  // Rate limit / quota errors
  else if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
    userMessage = 'AI service is temporarily unavailable due to high demand. Please try again in a few minutes.';
  }
  // Network errors
  else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
    userMessage = 'Network error. Please check your internet connection and try again.';
  }
  // Timeout errors
  else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    userMessage = 'Request timed out. Please try again.';
  }
  // Unauthorized errors
  else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
    userMessage = 'Authentication error. Please log in again.';
  }
  // Gemini API specific errors
  else if (errorMsg.includes('Gemini API failed')) {
    userMessage = 'AI service encountered an error. Please try again.';
  }
  // Database errors
  else if (errorMsg.includes('Database') || errorMsg.includes('Supabase')) {
    userMessage = 'Failed to save data. Please try again.';
  }
  // Generic fallback
  else {
    userMessage = `AI request failed: ${errorMsg.substring(0, 100)}`;
  }
  
  // Show toast notification if function provided
  if (addToast) {
    addToast(userMessage, toastType);
  }
  
  return userMessage;
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      const errorMsg = error.message || error.toString();
      if (
        errorMsg.includes('API key') ||
        errorMsg.includes('Unauthorized') ||
        errorMsg.includes('400') ||
        errorMsg.includes('invalid')
      ) {
        throw error; // Don't retry these errors
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Validates AI response structure
 * @param {any} response - The AI response to validate
 * @param {Array<string>} requiredFields - Required fields in the response
 * @throws {Error} If validation fails
 */
export function validateAIResponse(response, requiredFields = []) {
  if (!response) {
    throw new Error('AI response is empty');
  }
  
  if (typeof response !== 'object') {
    throw new Error('AI response is not an object');
  }
  
  for (const field of requiredFields) {
    if (!(field in response)) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }
}

/**
 * Sanitizes user input before sending to AI
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 5000)
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, maxLength = 5000) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove potentially problematic characters
  // (Keep this minimal to preserve user intent)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Formats AI response for display
 * @param {string} text - Text to format
 * @returns {string} Formatted text
 */
export function formatAIResponse(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Convert bullet points to proper format
  let formatted = text.replace(/^[•\-\*]\s*/gm, '• ');
  
  // Ensure proper line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
}

// Export all functions
export default {
  handleAIError,
  retryWithBackoff,
  validateAIResponse,
  sanitizeInput,
  formatAIResponse
};