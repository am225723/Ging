import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Generate an exposure ladder by calling the Firebase Cloud Function
 * @param {string} fear - The fear or anxiety to address
 * @param {string} goal - The ultimate goal or desired outcome
 * @param {string} constraints - Any limitations or specific requirements
 * @returns {Promise<Object>} AI response with structured exposure ladder
 */
export async function generateExposureLadder(fear, goal = '', constraints = '') {
  if (!fear) {
    return { error: 'A fear is required to generate a ladder.' };
  }

  try {
    const exposureLadder = httpsCallable(functions, 'exposureLadder');
    const result = await exposureLadder({
      fear_title: fear,
      goal,
      constraints
    });

    return result.data;
  } catch (error) {
    console.error('Error in exposure ladder service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}