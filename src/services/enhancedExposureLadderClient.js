/**
 * Enhanced Exposure Ladder Client
 * 
 * This module provides an improved interface for generating exposure ladders
 * using the enhanced AI service with better user control and feedback mechanisms.
 */

import { createEnhancedAIService } from './enhancedAiService';

// Create an AI service instance for exposure ladder generation
const aiService = createEnhancedAIService({
  temperature: 0.7, // Balanced creativity and consistency
  maxTokens: 1500,  // Enough for detailed ladder steps
  cacheEnabled: true,
  retryCount: 2,
});

/**
 * Generates a customized exposure ladder for a specific fear using the AI service
 *
 * @param {Object} params - Parameters for ladder generation
 * @param {string} params.fear - The fear or anxiety to address
 * @param {string} params.goal - The ultimate goal or desired outcome
 * @param {string} params.constraints - Any limitations or specific requirements
 * @param {number} params.stepCount - Number of steps to generate (default: 5-8)
 * @param {number} params.detailLevel - Level of detail for each step (1-5)
 * @param {Object} options - Additional AI generation options
 * @returns {Promise<Object>} - The AI response with a structured exposure ladder
 */
export async function generateExposureLadder(params, options = {}) {
  const { 
    fear, 
    goal = '', 
    constraints = '', 
    stepCount = '5-8',
    detailLevel = 3
  } = params;

  // Validate inputs
  if (!fear || typeof fear !== 'string' || fear.trim().length === 0) {
    throw new Error('Fear description is required');
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

  // Create a more detailed prompt with user parameters
  const prompt = `
    You are an expert in Cognitive Behavioral Therapy (CBT). Your task is to create a structured exposure ladder for a user's fear.

    The user's fear is: "${fear}"
    The user's goal is: "${goal || 'Not specified'}"
    Any constraints are: "${constraints || 'Not specified'}"
    
    Please generate a JSON object with the following structure:
    {
      "ladder": [
        {
          "step": 1,
          "title": "A short, clear title for the step",
          "prep": "A ${detailLevelText} preparation task for the user before they start.",
          "action": "The specific, concrete action the user needs to perform.",
          "duration_min": 10,
          "suds_start": 3,
          "suds_target": 2,
          "success_criteria": "A clear definition of what success looks like for this step."
        }
      ],
      "notes": "General guidance on how to approach the ladder, encouraging the user to proceed at their own pace.",
      "safety_note": "An important safety note, advising professional consultation for severe issues or if the user feels unsafe. This should always be included.",
      "reasoning": "Explain your thought process in creating this ladder, including how you ordered the steps and why."
    }

    - The "ladder" array should contain between ${typeof stepCount === 'string' ? stepCount : `${stepCount}-${stepCount+1}`} steps.
    - The steps must be ordered from least to most anxiety-provoking.
    - "suds_start" is the estimated Subjective Units of Distress (SUDS) at the beginning of the exercise (1=no anxiety, 10=extreme anxiety).
    - "suds_target" is the desired SUDS level after completing the exercise, which should be lower than suds_start.
    - The "reasoning" field should explain your thought process in creating this ladder, which helps the user understand the therapeutic approach.
    - Ensure the output is a valid JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await aiService.generateJson(prompt, options);
    
    // Basic validation to ensure the response has the expected structure
    if (result.data && Array.isArray(result.data.ladder)) {
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
    console.error('Error in enhanced exposure ladder service:', error);
    throw error;
  }
}

/**
 * Provides feedback on an AI-generated exposure ladder to improve future generations
 *
 * @param {Object} originalParams - The original parameters used for generation
 * @param {Object} generatedLadder - The generated ladder
 * @param {Object} feedback - User feedback about the ladder
 * @param {number} feedback.rating - Rating from 1-5
 * @param {string} feedback.comments - User comments
 * @param {Array} feedback.stepFeedback - Feedback on specific steps
 */
export function provideExposureLadderFeedback(originalParams, generatedLadder, feedback) {
  aiService.incorporateFeedback(
    JSON.stringify(originalParams),
    generatedLadder,
    feedback
  );
}

/**
 * Regenerates a specific step in the exposure ladder
 *
 * @param {Object} ladder - The current exposure ladder
 * @param {number} stepIndex - The index of the step to regenerate
 * @param {Object} stepFeedback - Feedback on what to improve
 * @returns {Promise<Object>} - The updated exposure ladder
 */
export async function regenerateExposureLadderStep(ladder, stepIndex, stepFeedback) {
  if (!ladder || !Array.isArray(ladder.ladder) || stepIndex < 0 || stepIndex >= ladder.ladder.length) {
    throw new Error('Invalid ladder or step index');
  }

  const currentStep = ladder.ladder[stepIndex];
  const previousStep = stepIndex > 0 ? ladder.ladder[stepIndex - 1] : null;
  const nextStep = stepIndex < ladder.ladder.length - 1 ? ladder.ladder[stepIndex + 1] : null;

  const prompt = `
    You are an expert in Cognitive Behavioral Therapy (CBT). Your task is to improve a specific step in an exposure ladder.

    Here is the current step that needs improvement:
    ${JSON.stringify(currentStep, null, 2)}

    ${previousStep ? `The previous step in the ladder is:\n${JSON.stringify(previousStep, null, 2)}` : ''}
    ${nextStep ? `The next step in the ladder is:\n${JSON.stringify(nextStep, null, 2)}` : ''}

    User feedback on what to improve:
    "${stepFeedback.comments || 'Make this step more specific and actionable.'}"

    Please generate a JSON object with the improved step, maintaining the same structure but addressing the feedback.
    Ensure the step fits appropriately between the previous and next steps in terms of difficulty.
  `;

  try {
    const result = await aiService.generateJson(prompt);
    
    // Update the ladder with the new step
    const updatedLadder = { ...ladder };
    updatedLadder.ladder[stepIndex] = result.data;
    
    return updatedLadder;
  } catch (error) {
    console.error('Error regenerating ladder step:', error);
    throw error;
  }
}