import { generateJsonWithGemini, generateWithGemini } from './geminiClient';

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
 * Creates a base prompt with the user's journal data.
 * @param {Object} journalData - The journal entry data.
 * @returns {string} - A base prompt string.
 */
const createBasePrompt = (journalData) => {
  return `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entry:
    - Title: "${journalData.title || 'Untitled'}"
    - Content: "${journalData.content}"
    - Mood Rating (0-100): ${journalData.mood}
    - Tags: ${journalData.tags.length > 0 ? journalData.tags.join(', ') : 'None'}
  `;
};

/**
 * Process a journal entry with the Journal AI service using the Gemini API.
 *
 * @param {string} mode - The processing mode.
 * @param {Object} journalData - The journal entry data.
 * @returns {Promise<Object>} - The AI response.
 */
export async function processJournalEntry(mode, journalData) {
  const basePrompt = createBasePrompt(journalData);
  let fullPrompt = '';
  let useJsonOutput = true;

  switch (mode) {
    case JOURNAL_AI_MODES.SUMMARIZE:
      fullPrompt = `
        ${basePrompt}
        Please provide a concise, one-paragraph summary of this journal entry.
        
        Respond with a JSON object in the following format:
        {
          "summary": "Your one-paragraph summary here."
        }
      `;
      break;

    case JOURNAL_AI_MODES.INSIGHTS:
      fullPrompt = `
        ${basePrompt}
        Based on the entry, identify key emotional themes, potential cognitive patterns (like catastrophizing, black-and-white thinking, etc.), and underlying feelings.
        
        Respond with a JSON object in the following format:
        {
          "insights": "A bulleted or numbered list of 2-4 key insights. Frame them constructively and gently."
        }
      `;
      break;

    case JOURNAL_AI_MODES.ACTIONS:
      fullPrompt = `
        ${basePrompt}
        Suggest 2-3 small, concrete, and actionable steps the user could take based on their entry. These should be practical and aimed at improving their situation or mindset.
        
        Respond with a JSON object in the following format:
        {
          "actions": "A bulleted or numbered list of 2-3 actionable suggestions."
        }
      `;
      break;

    case JOURNAL_AI_MODES.REWRITE:
      fullPrompt = `
        ${basePrompt}
        The user wants to rewrite their entry with a different tone.
        The desired tone is: "${journalData.tone}"

        Rewrite the core message of the journal entry in this new tone, maintaining the original meaning but shifting the perspective.
        
        Respond with a JSON object in the following format:
        {
          "rewrite": "The rewritten journal entry text."
        }
      `;
      break;

    case JOURNAL_AI_MODES.ASK:
      useJsonOutput = false; // This mode expects a direct text answer.
      fullPrompt = `
        ${basePrompt}
        The user has a specific question about their entry. Answer it based *only* on the information provided in the journal entry itself. Do not invent information.
        
        User's question: "${journalData.question}"

        Your answer:
      `;
      break;

    default:
      throw new Error(`Invalid journal AI mode: ${mode}`);
  }

  try {
    if (useJsonOutput) {
      // For modes that expect a structured response
      const result = await generateJsonWithGemini(fullPrompt);
      if (result && !result.error) {
        return result;
      } else {
        throw new Error('Received an invalid JSON response from the AI service.');
      }
    } else {
      // For the 'ASK' mode, which expects a plain text response
      const answer = await generateWithGemini(fullPrompt);
      return { answer };
    }
  } catch (error) {
    console.error(`Error in journal AI service (mode: ${mode}):`, error);
    throw error;
  }
}