import { generateJsonWithGemini } from './geminiClient';

/**
 * Generates a customized exposure ladder for a specific fear using the Gemini API.
 *
 * @param {string} fear - The fear or anxiety to address.
 * @param {string} goal - The ultimate goal or desired outcome.
 * @param {string} constraints - Any limitations or specific requirements.
 * @returns {Promise<Object>} - The AI response with a structured exposure ladder.
 */
export async function generateExposureLadder(fear, goal = '', constraints = '') {
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
          "prep": "A brief preparation task for the user before they start.",
          "action": "The specific, concrete action the user needs to perform.",
          "duration_min": 10,
          "suds_start": 3,
          "suds_target": 2,
          "success_criteria": "A clear definition of what success looks like for this step."
        }
      ],
      "notes": "General guidance on how to approach the ladder, encouraging the user to proceed at their own pace.",
      "safety_note": "An important safety note, advising professional consultation for severe issues or if the user feels unsafe. This should always be included."
    }

    - The "ladder" array should contain between 5 and 8 steps.
    - The steps must be ordered from least to most anxiety-provoking.
    - "suds_start" is the estimated Subjective Units of Distress (SUDS) at the beginning of the exercise (1=no anxiety, 10=extreme anxiety).
    - "suds_target" is the desired SUDS level after completing the exercise, which should be lower than suds_start.
    - Ensure the output is a valid JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await generateJsonWithGemini(prompt);
    // Basic validation to ensure the response has the expected structure
    if (result && Array.isArray(result.ladder)) {
      return result;
    } else {
      console.error('Invalid response structure from Gemini:', result);
      throw new Error('Received an invalid response from the AI service.');
    }
  } catch (error) {
    console.error('Error in exposure ladder service:', error);
    throw error;
  }
}