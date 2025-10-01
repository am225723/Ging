// FIXED VERSION: supabase/functions/journal-ai/index.ts
// This version includes proper JSON response configuration and robust error handling

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const getPrompt = (mode: string, journalData: any) => {
  const basePrompt = `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entry:
    - Title: "${journalData.title || 'Untitled'}"
    - Content: "${journalData.content}"
    - Mood Rating (0-100): ${journalData.mood}
    - Tags: ${journalData.tags?.length > 0 ? journalData.tags.join(', ') : 'None'}
  `;

  switch (mode) {
    case 'summarize':
      return `${basePrompt}

Please provide a concise, one-paragraph summary of the main themes and emotions in this entry.

Return your response as a JSON object with this exact structure:
{
  "summary": "Your one-paragraph summary here"
}`;

    case 'insights':
      return `${basePrompt}

Identify 3-5 key emotional themes, cognitive patterns, or recurring thoughts in this entry. 
Present them as clear, actionable insights.

Return your response as a JSON object with this exact structure:
{
  "insights": "• First insight\n• Second insight\n• Third insight"
}`;

    case 'actions':
      return `${basePrompt}

Based on this journal entry, suggest 2-3 small, concrete, actionable steps the user could take.
These should be specific and achievable within the next 24-48 hours.

Return your response as a JSON object with this exact structure:
{
  "actions": "1. First action step\n2. Second action step\n3. Third action step"
}`;

    case 'ask':
      return `${basePrompt}

The user has asked the following question about their entry:
"${journalData.question}"

Answer their question based on the content of their journal entry. Be supportive and insightful.

Return your response as a JSON object with this exact structure:
{
  "answer": "Your answer to their question here"
}`;

    case 'rewrite':
      return `${basePrompt}

Rewrite this journal entry in a "${journalData.tone}" tone while preserving the core meaning and emotions.
Keep the same general length and structure.

Return your response as a JSON object with this exact structure:
{
  "rewrite": "The rewritten journal entry here"
}`;

    default:
      throw new Error(`Invalid mode: ${mode}`);
  }
};

// Helper function to parse JSON from AI response
const parseAIResponse = (rawText: string): any => {
  try {
    // Remove markdown code blocks if present
    let cleanedText = rawText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();
    
    // Parse JSON
    const parsed = JSON.parse(cleanedText);
    
    // Validate that we got an object
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('AI response is not a valid JSON object');
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw text:', rawText);
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mode, journalData } = await req.json();

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Validate input
    if (!journalData?.content) {
      return new Response(JSON.stringify({ error: "Missing journal content" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (!mode) {
      return new Response(JSON.stringify({ error: "Missing mode parameter" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Generate prompt
    const prompt = getPrompt(mode, journalData);

    // Call Gemini API with JSON response configuration
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API failed with status ${geminiResponse.status}: ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    
    // Validate response structure
    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const rawText = geminiData.candidates[0].content.parts[0].text;
    const ai_result = parseAIResponse(rawText);

    // Validate that the response has the expected key for the mode
    const expectedKeys = {
      'summarize': 'summary',
      'insights': 'insights',
      'actions': 'actions',
      'ask': 'answer',
      'rewrite': 'rewrite'
    };

    const expectedKey = expectedKeys[mode];
    if (expectedKey && !ai_result[expectedKey]) {
      throw new Error(`AI response missing expected key: ${expectedKey}`);
    }

    // Return the AI result directly
    // Note: Database updates are handled by the frontend
    return new Response(JSON.stringify(ai_result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Journal AI Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});