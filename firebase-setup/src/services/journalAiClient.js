import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

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
 * Process a journal entry by calling the Firebase Cloud Function
 * @param {string} mode - Processing mode (summarize, insights, actions, rewrite, ask)
 * @param {Object} journalData - Journal entry data
 * @param {Object} entry - Full journal entry object (optional)
 * @returns {Promise<Object>} AI response
 */
export async function processJournalEntry(mode, journalData, entry = null) {
  if (!journalData || !journalData.content) {
    return { error: 'Journal content is required.' };
  }

  try {
    const journalAi = httpsCallable(functions, 'journalAi');
    const result = await journalAi({
      mode,
      journalData,
      entry
    });

    return result.data;
  } catch (error) {
    console.error(`Error in journal AI service (mode: ${mode}):`, error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}