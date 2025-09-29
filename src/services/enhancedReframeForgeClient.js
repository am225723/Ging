/**
 * Enhanced Reframe Forge Client
 * 
 * This module provides an improved interface for cognitive reframing
 * using the enhanced AI service with better user control and feedback mechanisms.
 */

import { createEnhancedAIService } from './enhancedAiService';

// Create an AI service instance for reframing
const aiService = createEnhancedAIService({
  temperature: 0.7, // Balanced creativity and consistency
  maxTokens: 1200,  // Enough for detailed reframing
  cacheEnabled: true,
  retryCount: 2,
});

/**
 * Sends a thought to the Reframe Forge AI for analysis and reframing
 *
 * @param {Object} params - Parameters for reframing
 * @param {string} params.thought - The negative thought to reframe
 * @param {string} params.context - Optional context about the situation
 * @param {number} params.detailLevel - Level of detail for the response (1-5)
 * @param {Array} params.focusAreas - Specific areas to focus on (e.g., ['evidence', 'actions'])
 * @param {Object} options - Additional AI generation options
 * @returns {Promise<Object>} - The AI response with distortions, evidence, and reframed thought
 */
export async function getReframe(params, options = {}) {
  const { 
    thought, 
    context = '', 
    detailLevel = 3,
    focusAreas = []
  } = params;

  // Validate inputs
  if (!thought || typeof thought !== 'string' || thought.trim().length === 0) {
    throw new Error('Negative thought is required');
  }

  // Adjust detail level text based on the parameter
  let detailLevelText = 'moderate';
  switch (detailLevel) {
    case 1: detailLevelText = 'minimal'; break;
    case 2: detailLevelText = 'brief'; break;
    case 3: detailLevelText = 'moderate'; break;
    case 4: detailLevelText = 'detailed'; break;
    case 5: detailLevelText = 'comprehensive'; break;
  }

  // Build focus areas instruction
  let focusAreasText = '';
  if (focusAreas && focusAreas.length > 0) {
    focusAreasText = `Please pay special attention to the following areas: ${focusAreas.join(', ')}.`;
  }

  // Create a more detailed prompt with user parameters
  const prompt = `
    You are an expert in Cognitive Behavioral Therapy (CBT). Your task is to help a user reframe a negative thought.

    The user's negative thought is: "${thought}"
    The context is: "${context || 'Not specified'}"
    ${focusAreasText}

    Please analyze the thought and generate a JSON object with the following structure:
    {
      "distortions": ["A list of identified cognitive distortions, e.g., 'Catastrophizing', 'All-or-Nothing Thinking'"],
      "evidence_for": ["A ${detailLevelText} list of points that seem to support the negative thought, from the user's perspective."],
      "evidence_against": ["A ${detailLevelText} list of points that challenge or contradict the negative thought."],
      "balanced_reframe": "A more balanced, realistic, and compassionate alternative to the original thought.",
      "tiny_action": "A small, concrete, actionable step the user can take right now to feel better or test the new thought.",
      "safety_note": "An important safety note, advising professional consultation for severe issues. This should always be included if the thought involves self-harm or significant distress.",
      "reasoning": "Explain your thought process in analyzing this thought and creating the reframe, which helps the user understand the therapeutic approach."
    }

    - Identify 1-3 likely cognitive distortions.
    - Provide ${detailLevel >= 3 ? '2-3' : '1-2'} points for "evidence_for" and "evidence_against".
    - The "balanced_reframe" should be constructive and non-judgmental.
    - The "tiny_action" should be simple and easy to accomplish.
    - If the thought content is sensitive or suggests severe distress (e.g., self-harm), the safety_note must be prominent and clear. Otherwise, it can be a gentle reminder.
    - The "reasoning" field should explain your thought process, which helps the user understand the therapeutic approach.
    - Ensure the output is a valid JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await aiService.generateJson(prompt, options);
    
    // Basic validation
    if (result.data && Array.isArray(result.data.distortions) && result.data.balanced_reframe) {
      return {
        ...result.data,
        metadata: {
          generatedAt: result.timestamp,
          fromCache: result.fromCache,
          provider: result.provider,
          attempts: result.attempts,
        }
      };
    } else {
      console.error('Invalid response structure from AI:', result);
      throw new Error('Received an invalid response from the AI service.');
    }
  } catch (error) {
    console.error('Error in enhanced reframe forge service:', error);
    throw error;
  }
}

/**
 * Provides feedback on an AI-generated reframe to improve future generations
 *
 * @param {Object} originalParams - The original parameters used for generation
 * @param {Object} generatedReframe - The generated reframe
 * @param {Object} feedback - User feedback about the reframe
 * @param {number} feedback.rating - Rating from 1-5
 * @param {string} feedback.comments - User comments
 * @param {Object} feedback.specificFeedback - Feedback on specific parts of the reframe
 */
export function provideReframeFeedback(originalParams, generatedReframe, feedback) {
  aiService.incorporateFeedback(
    JSON.stringify(originalParams),
    generatedReframe,
    feedback
  );
}

/**
 * Regenerates a specific part of the reframe
 *
 * @param {Object} reframe - The current reframe
 * @param {string} part - The part to regenerate ('balanced_reframe', 'tiny_action', etc.)
 * @param {Object} partFeedback - Feedback on what to improve
 * @returns {Promise<Object>} - The updated reframe
 */
export async function regenerateReframePart(reframe, part, partFeedback) {
  if (!reframe || !part || !reframe[part]) {
    throw new Error('Invalid reframe or part');
  }

  const prompt = `
    You are an expert in Cognitive Behavioral Therapy (CBT). Your task is to improve a specific part of a cognitive reframe.

    Here is the current reframe:
    ${JSON.stringify(reframe, null, 2)}

    The part that needs improvement is: "${part}"
    Current value: "${reframe[part]}"

    User feedback on what to improve:
    "${partFeedback.comments || 'Make this more specific and helpful.'}"

    Please generate a new version of this part that addresses the feedback while maintaining consistency with the rest of the reframe.
    Return only the text for the improved part, not the entire reframe.
  `;

  try {
    const result = await aiService.generateText(prompt);
    
    // Update the reframe with the new part
    const updatedReframe = { ...reframe };
    updatedReframe[part] = result.text;
    
    return updatedReframe;
  } catch (error) {
    console.error('Error regenerating reframe part:', error);
    throw error;
  }
}