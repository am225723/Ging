import { supabase } from './supabaseClient';

/**
 * Enhanced version with better error handling and debugging
 */
export async function getReframe(thought, context = '') {
  if (!thought) {
    return { error: 'A negative thought is required.' };
  }

  try {
    console.log('🔄 Calling reframe-forge edge function...');
    console.log('Input:', { thought, context });
    
    const { data, error } = await supabase.functions.invoke('reframe-forge', {
      body: {
        negative_thought: thought,
        context: context,
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
      
      throw new Error(`Edge function invocation failed: ${error.message}`);
    }

    console.log('✅ Edge function response:', data);
    
    // Handle different response formats
    if (data.ai_analysis) {
      return data.ai_analysis;
    }
    
    if (data.error) {
      return { error: data.error };
    }
    
    return data;

  } catch (error) {
    console.error('❌ Error in reframe forge service:', error);
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
export async function testReframeConnection() {
  try {
    console.log('🔍 Testing connection to reframe-forge function...');
    
    const { data, error } = await supabase.functions.invoke('reframe-forge', {
      body: {
        negative_thought: 'test thought',
        context: 'test context'
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