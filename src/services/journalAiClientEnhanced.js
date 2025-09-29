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
 * Enhanced version with better error handling and debugging
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
    console.log(`🔄 Calling journal-ai edge function (mode: ${mode})...`);
    console.log('Input:', { mode, journalData: { ...journalData, content: journalData.content.substring(0, 100) + '...' }, entry: entry?.id });
    
    const { data, error } = await supabase.functions.invoke('journal-ai', {
      body: {
        mode,
        journalData,
        entry, // Pass the existing entry object for potential updates
      },
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      
      // Provide more specific error messages
      if (error.message?.includes('Edge function')) {
        return { error: 'AI service is temporarily unavailable. Please check if the edge function is deployed and try again.' };
      }
      if (error.message?.includes('Gemini API')) {
        return { error: 'AI analysis service is experiencing issues. The Gemini API key may be missing or invalid.' };
      }
      if (error.message?.includes('Unauthorized')) {
        return { error: 'Please log in to use AI features.' };
      }
      if (error.message?.includes('content too short')) {
        return { error: 'Please write more content (at least 20 words) for AI analysis.' };
      }
      
      throw new Error(`Edge function invocation failed: ${error.message}`);
    }

    console.log('✅ Edge function response:', data);
    return data;

  } catch (error) {
    console.error(`❌ Error in journal AI service (mode: ${mode}):`, error);
    console.error('Error stack:', error.stack);
    
    // Network or connection errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return { error: 'Network connection failed. Please check your internet connection and try again.' };
    }
    
    // Function deployment errors
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return { error: 'AI service not found. Please ensure the edge function is properly deployed.' };
    }
    
    // API key or authentication errors
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return { error: 'Authentication failed. Please log in again.' };
    }
    
    // Generic fallback
    return { error: 'An unexpected error occurred. Please try again or contact support if the issue persists.' };
  }
}

/**
 * Debug function to test connectivity
 */
export async function testJournalAiConnection() {
  try {
    console.log('🔍 Testing connection to journal-ai function...');
    
    const testData = {
      title: 'Test Entry',
      content: 'This is a test journal entry to verify the AI service connection.',
      mood: 50,
      tags: ['test']
    };
    
    const { data, error } = await supabase.functions.invoke('journal-ai', {
      body: {
        mode: 'summarize',
        journalData: testData
      },
    });
    
    if (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Connection test successful');
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return { success: false, error: error.message };
  }
}