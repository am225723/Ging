import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Generate a cognitive reframe by calling the Firebase Cloud Function
 * @param {string} negativeThought - The negative thought to reframe
 * @param {string} context - Additional context about the thought
 * @returns {Promise<Object>} AI response with cognitive reframe analysis
 */
export async function generateReframe(negativeThought, context = '') {
  if (!negativeThought) {
    return { error: 'A negative thought is required.' };
  }

  try {
    const reframeForge = httpsCallable(functions, 'reframeForge');
    const result = await reframeForge({
      negative_thought: negativeThought,
      context
    });

    return result.data;
  } catch (error) {
    console.error('Error in reframe forge service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}