import { supabase } from './supabaseClient';

/**
 * Generates a customized exposure ladder by invoking the 'exposure-ladder' Supabase Edge Function.
 *
 * @param {string} fear - The fear or anxiety to address.
 * @param {string} goal - The ultimate goal or desired outcome.
 * @param {string} constraints - Any limitations or specific requirements.
 * @returns {Promise<Object>} - The AI response with a structured exposure ladder.
 */
export async function generateExposureLadder(fear, goal = '', constraints = '') {
  if (!fear) {
    return { error: 'A fear is required to generate a ladder.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('exposure-ladder', {
      body: {
        fear_title: fear,
        goal,
        constraints,
      },
    });

    if (error) {
      throw new Error(`Edge function invocation failed: ${error.message}`);
    }

    // The function now returns the full ladder object from the database
    return data;
  } catch (error) {
    console.error('Error in exposure ladder service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}