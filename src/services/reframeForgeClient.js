import { generateJsonWithGemini } from './geminiClient';

/**
 * Sends a thought to the Reframe Forge AI for analysis and reframing using the Gemini API.
 *
 * @param {string} thought - The negative thought to reframe.
 * @param {string} context - Optional context about the situation.
 * @returns {Promise<Object>} - The AI response with distortions, evidence, and reframed thought.
 */
export async function getReframe(thought, context = '') {
  const prompt = `
    You are an expert in Cognitive Behavioral Therapy (CBT). Your task is to help a user reframe a negative thought.

    The user's negative thought is: "${thought}"
    The context is: "${context || 'Not specified'}"

    Please analyze the thought and generate a JSON object with the following structure:
    {
      "distortions": ["A list of identified cognitive distortions, e.g., 'Catastrophizing', 'All-or-Nothing Thinking'"],
      "evidence_for": ["A list of points that seem to support the negative thought, from the user's perspective."],
      "evidence_against": ["A list of points that challenge or contradict the negative thought."],
      "balanced_reframe": "A more balanced, realistic, and compassionate alternative to the original thought.",
      "tiny_action": "A small, concrete, actionable step the user can take right now to feel better or test the new thought.",
      "safety_note": "An important safety note, advising professional consultation for severe issues. This should always be included if the thought involves self-harm or significant distress."
    }

    - Identify 1-3 likely cognitive distortions.
    - Provide 2-3 points for "evidence_for" and "evidence_against".
    - The "balanced_reframe" should be constructive and non-judgmental.
    - The "tiny_action" should be simple and easy to accomplish.
    - If the thought content is sensitive or suggests severe distress (e.g., self-harm), the safety_note must be prominent and clear. Otherwise, it can be a gentle reminder.
    - Ensure the output is a valid JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await generateJsonWithGemini(prompt);
    // Basic validation
    if (result && Array.isArray(result.distortions) && result.balanced_reframe) {
      return result;
    } else {
      console.error('Invalid response structure from Gemini:', result);
      throw new Error('Received an invalid response from the AI service.');
    }
  } catch (error) {
    console.error('Error in reframe forge service:', error);
    throw error;
  }
}