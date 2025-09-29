import { supabase } from './supabaseClient';

/**
 * Invokes the 'reframe-forge' Supabase Edge Function to get an AI-powered analysis of a negative thought.
 *
 * @param {string} thought - The negative thought to reframe.
 * @param {string} context - Optional context about the situation.
 * @returns {Promise<Object>} - The AI analysis and other data returned from the function.
 */
export async function getReframe(thought, context = '') {
  if (!thought) {
    return { error: 'A negative thought is required.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('reframe-forge', {
      body: {
        negative_thought: thought,
        context: context,
      },
    });

    if (error) {
      throw new Error(`Edge function invocation failed: ${error.message}`);
    }

    // The function returns the newly created row from the 'reframes' table,
    // which includes the ai_analysis JSON object.
    return data.ai_analysis;
  } catch (error) {
    console.error('Error in reframe forge service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}