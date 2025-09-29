import { supabase } from './supabaseClient';

/**
 * Available modes for the Journal AI service
 */
export const JOURNAL_AI_MODES = {
  SUMMARIZE: 'summarize',
  INSIGHTS: 'insights',
  ACTIONS: 'actions',
  REWRITE: 'rewrite',
  ASK: 'ask'
};

/**
 * Process a journal entry by invoking the 'journal-ai' Supabase Edge Function.
 *
 * @param {string} mode - The processing mode (e.g., 'insights', 'summarize').
 * @param {Object} journalData - The journal entry data, including title, content, mood, etc.
 * @param {Object} entry - The full journal entry object from Supabase, if it exists.
 * @returns {Promise<Object>} - The AI response from the Edge Function.
 */
export async function processJournalEntry(mode, journalData, entry = null) {
  if (!journalData || !journalData.content) {
    return { error: 'Journal content is required.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('journal-ai', {
      body: {
        mode,
        journalData,
        entry, // Pass the existing entry object for potential updates
      },
    });

    if (error) {
      throw new Error(`Edge function invocation failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Error in journal AI service (mode: ${mode}):`, error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}