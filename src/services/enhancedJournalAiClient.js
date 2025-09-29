/**
 * Enhanced Journal AI Client
 * 
 * This module provides an improved interface for journal entry analysis
 * using the enhanced AI service with better user control and feedback mechanisms.
 */

import { createEnhancedAIService } from './enhancedAiService';

// Create an AI service instance for journal analysis
const aiService = createEnhancedAIService({
  temperature: 0.7, // Balanced creativity and consistency
  maxTokens: 1200,  // Enough for detailed analysis
  cacheEnabled: true,
  retryCount: 2,
});

/**
 * Available modes for the Enhanced Journal AI service
 */
export const ENHANCED_JOURNAL_AI_MODES = {
  SUMMARIZE: 'summarize',
  INSIGHTS: 'insights',
  ACTIONS: 'actions',
  REWRITE: 'rewrite',
  ASK: 'ask',
  THEMES: 'themes',     // New mode: identify recurring themes
  PROGRESS: 'progress', // New mode: track progress over time
};

/**
 * Creates a base prompt with the user's journal data
 * 
 * @param {Object} journalData - The journal entry data
 * @param {Object} options - Additional options for prompt creation
 * @returns {string} - A base prompt string
 */
const createBasePrompt = (journalData, options = {}) => {
  const { detailLevel = 3 } = options;
  
  // Adjust detail level text based on the parameter
  let detailLevelText = 'moderate';
  switch (detailLevel) {
    case 1: detailLevelText = 'minimal'; break;
    case 2: detailLevelText = 'brief'; break;
    case 3: detailLevelText = 'moderate'; break;
    case 4: detailLevelText = 'detailed'; break;
    case 5: detailLevelText = 'comprehensive'; break;
  }
  
  return `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entry with ${detailLevelText} detail:
    - Title: "${journalData.title || 'Untitled'}"
    - Content: "${journalData.content}"
    - Mood Rating (0-100): ${journalData.mood}
    - Tags: ${journalData.tags.length > 0 ? journalData.tags.join(', ') : 'None'}
    ${journalData.previousEntries ? `- Previous entries: ${journalData.previousEntries}` : ''}
  `;
};

/**
 * Process a journal entry with the Enhanced Journal AI service
 *
 * @param {string} mode - The processing mode
 * @param {Object} journalData - The journal entry data
 * @param {Object} options - Additional options for processing
 * @returns {Promise<Object>} - The AI response
 */
export async function processJournalEntry(mode, journalData, options = {}) {
  // Validate inputs
  if (!journalData || !journalData.content || journalData.content.trim().length === 0) {
    throw new Error('Journal content is required');
  }

  const basePrompt = createBasePrompt(journalData, options);
  let fullPrompt = '';
  let useJsonOutput = true;

  switch (mode) {
    case ENHANCED_JOURNAL_AI_MODES.SUMMARIZE:
      fullPrompt = `
        ${basePrompt}
        Please provide a concise, one-paragraph summary of this journal entry.
        
        Respond with a JSON object in the following format:
        {
          "summary": "Your one-paragraph summary here.",
          "key_points": ["A list of 2-3 key points from the entry"],
          "reasoning": "A brief explanation of how you identified the main themes and points."
        }
      `;
      break;

    case ENHANCED_JOURNAL_AI_MODES.INSIGHTS:
      fullPrompt = `
        ${basePrompt}
        Based on the entry, identify key emotional themes, potential cognitive patterns (like catastrophizing, black-and-white thinking, etc.), and underlying feelings.
        
        Respond with a JSON object in the following format:
        {
          "insights": "A bulleted or numbered list of 2-4 key insights. Frame them constructively and gently.",
          "emotional_themes": ["A list of primary emotions detected in the entry"],
          "cognitive_patterns": ["Any cognitive distortions or thinking patterns identified"],
          "reasoning": "A brief explanation of how you identified these insights and patterns."
        }
      `;
      break;

    case ENHANCED_JOURNAL_AI_MODES.ACTIONS:
      fullPrompt = `
        ${basePrompt}
        Suggest 2-3 small, concrete, and actionable steps the user could take based on their entry. These should be practical and aimed at improving their situation or mindset.
        
        Respond with a JSON object in the following format:
        {
          "actions": "A bulleted or numbered list of 2-3 actionable suggestions.",
          "rationale": "A brief explanation of why these actions might be helpful.",
          "timeframe": "Suggested timeframe for implementing these actions (e.g., 'today', 'this week').",
          "reasoning": "A brief explanation of how you determined these actions would be helpful."
        }
      `;
      break;

    case ENHANCED_JOURNAL_AI_MODES.REWRITE:
      fullPrompt = `
        ${basePrompt}
        The user wants to rewrite their entry with a different tone.
        The desired tone is: "${journalData.tone}"

        Rewrite the core message of the journal entry in this new tone, maintaining the original meaning but shifting the perspective.
        
        Respond with a JSON object in the following format:
        {
          "rewrite": "The rewritten journal entry text.",
          "tone_analysis": "A brief description of how the tone has been shifted.",
          "reasoning": "A brief explanation of your approach to rewriting while preserving meaning."
        }
      `;
      break;

    case ENHANCED_JOURNAL_AI_MODES.ASK:
      useJsonOutput = false; // This mode expects a direct text answer
      fullPrompt = `
        ${basePrompt}
        The user has a specific question about their entry. Answer it based *only* on the information provided in the journal entry itself. Do not invent information.
        
        User's question: "${journalData.question}"

        Your answer:
      `;
      break;
      
    case ENHANCED_JOURNAL_AI_MODES.THEMES:
      fullPrompt = `
        ${basePrompt}
        Identify recurring themes, patterns, or topics in this journal entry. If previous entries were provided, compare them to identify trends over time.
        
        Respond with a JSON object in the following format:
        {
          "themes": ["A list of 2-4 primary themes identified in the entry"],
          "recurring_patterns": ["Any patterns that appear to be recurring, if previous entries were provided"],
          "growth_areas": ["Areas where the user might focus for personal growth"],
          "reasoning": "A brief explanation of how you identified these themes and patterns."
        }
      `;
      break;
      
    case ENHANCED_JOURNAL_AI_MODES.PROGRESS:
      fullPrompt = `
        ${basePrompt}
        Analyze this entry for signs of progress, growth, or change. If previous entries were provided, compare them to identify improvements or areas of continued challenge.
        
        Respond with a JSON object in the following format:
        {
          "progress_indicators": ["Signs of progress or growth identified in the entry"],
          "continued_challenges": ["Areas that still present challenges"],
          "growth_trajectory": "A brief assessment of the overall growth trajectory (improving, stable, fluctuating, etc.)",
          "reasoning": "A brief explanation of how you assessed progress and challenges."
        }
      `;
      break;

    default:
      throw new Error(`Invalid journal AI mode: ${mode}`);
  }

  try {
    if (useJsonOutput) {
      // For modes that expect a structured response
      const result = await aiService.generateJson(fullPrompt, options);
      if (result.data && !result.data.error) {
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
        throw new Error('Received an invalid JSON response from the AI service.');
      }
    } else {
      // For the 'ASK' mode, which expects a plain text response
      const answer = await aiService.generateText(fullPrompt, options);
      return { 
        answer: answer.text,
        metadata: {
          generatedAt: answer.timestamp,
          fromCache: answer.fromCache,
          provider: answer.provider,
          attempts: answer.attempts,
        }
      };
    }
  } catch (error) {
    console.error(`Error in enhanced journal AI service (mode: ${mode}):`, error);
    throw error;
  }
}

/**
 * Provides feedback on an AI-generated journal analysis to improve future generations
 *
 * @param {string} mode - The processing mode that was used
 * @param {Object} journalData - The original journal data
 * @param {Object} generatedAnalysis - The generated analysis
 * @param {Object} feedback - User feedback about the analysis
 */
export function provideJournalFeedback(mode, journalData, generatedAnalysis, feedback) {
  aiService.incorporateFeedback(
    `${mode}:${JSON.stringify(journalData)}`,
    generatedAnalysis,
    feedback
  );
}

/**
 * Analyzes multiple journal entries to identify patterns over time
 *
 * @param {Array} journalEntries - An array of journal entries
 * @param {Object} options - Additional options for analysis
 * @returns {Promise<Object>} - Analysis of patterns over time
 */
export async function analyzeJournalTrends(journalEntries, options = {}) {
  if (!journalEntries || !Array.isArray(journalEntries) || journalEntries.length === 0) {
    throw new Error('At least one journal entry is required');
  }

  // Create a summary of the entries for the prompt
  const entriesSummary = journalEntries.map((entry, index) => `
    Entry ${index + 1} (${new Date(entry.created_at).toLocaleDateString()}):
    - Title: "${entry.title || 'Untitled'}"
    - Content: "${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}"
    - Mood: ${entry.mood}
    - Tags: ${entry.tags.length > 0 ? entry.tags.join(', ') : 'None'}
  `).join('\n');

  const prompt = `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entries over time to identify patterns, trends, and changes:

    ${entriesSummary}

    Please provide a comprehensive analysis of:
    1. Emotional trends (how the user's mood has changed over time)
    2. Recurring themes or topics
    3. Progress on any challenges or goals mentioned
    4. Changes in thinking patterns or perspective

    Respond with a JSON object in the following format:
    {
      "emotional_trends": "Analysis of how the user's emotions have evolved over time",
      "recurring_themes": ["List of themes that appear across multiple entries"],
      "progress_areas": ["Areas where the user shows progress or growth"],
      "challenge_areas": ["Areas where the user continues to face challenges"],
      "thinking_patterns": "Analysis of any changes in thinking patterns or perspective",
      "recommendations": ["2-3 suggestions based on the overall analysis"]
    }
  `;

  try {
    const result = await aiService.generateJson(prompt, options);
    
    return {
      ...result.data,
      metadata: {
        generatedAt: result.timestamp,
        fromCache: result.fromCache,
        provider: result.provider,
        attempts: result.attempts,
      }
    };
  } catch (error) {
    console.error('Error analyzing journal trends:', error);
    throw error;
  }
}