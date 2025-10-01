// FIXED VERSION: supabase/functions/reframe-forge/index.ts
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

const getPrompt = (negative_thought: string, context: string) => {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT). Analyze the following negative thought and its context, then provide a detailed analysis.

**Negative Thought:** "${negative_thought}"
**Context:** "${context || 'No additional context provided.'}"

**Instructions:**
1. **Identify Cognitive Distortions:** List the cognitive distortions present (e.g., "All-or-Nothing Thinking", "Catastrophizing", "Overgeneralization", "Mental Filter", "Discounting the Positive", "Jumping to Conclusions").

2. **Challenge the Thought:** 
   - Provide 2-4 pieces of evidence that support the negative thought
   - Provide 2-4 pieces of evidence that contradict the negative thought

3. **Create a Balanced Reframe:** Write a more balanced, realistic, and compassionate alternative thought that acknowledges both perspectives.

4. **Suggest a Tiny Action:** Propose one small, concrete action the user can take right now (within the next hour) to test or challenge this thought.

5. **Add a Safety Note:** If the thought involves self-harm, suicidal ideation, crisis, or abuse, include a safety note advising professional help. Otherwise, set this to null.

**Return your response as a JSON object with this exact structure:**
{
  "distortions": ["Distortion 1", "Distortion 2"],
  "evidence_for": ["Evidence supporting the thought 1", "Evidence 2"],
  "evidence_against": ["Evidence contradicting the thought 1", "Evidence 2"],
  "balanced_reframe": "A balanced, compassionate alternative thought that acknowledges reality while being more helpful.",
  "tiny_action": "A specific, small action the user can take right now.",
  "safety_note": "A safety note if needed, or null"
}

**Important:** Return ONLY the JSON object, no additional text or markdown formatting.
`;
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
    
    // Validate structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('AI response is not a valid JSON object');
    }
    
    // Validate required fields
    const requiredFields = ['distortions', 'evidence_for', 'evidence_against', 'balanced_reframe', 'tiny_action'];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate array fields
    if (!Array.isArray(parsed.distortions)) {
      throw new Error('distortions must be an array');
    }
    if (!Array.isArray(parsed.evidence_for)) {
      throw new Error('evidence_for must be an array');
    }
    if (!Array.isArray(parsed.evidence_against)) {
      throw new Error('evidence_against must be an array');
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw text:', rawText);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { negative_thought, context } = await req.json();

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Validate input
    if (!negative_thought || negative_thought.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Missing or empty negative_thought" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Generate prompt
    const prompt = getPrompt(negative_thought, context);

    // Call Gemini API with JSON response configuration
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
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

    // Extract and parse the JSON response
    const rawText = geminiData.candidates[0].content.parts[0].text;
    const ai_analysis = parseAIResponse(rawText);

    // Save to database
    const { data, error } = await supabase
      .from("reframes")
      .insert({
        user_id: user.id,
        negative_thought,
        context: context || null,
        cognitive_distortions: ai_analysis.distortions,
        reframed_thought: ai_analysis.balanced_reframe,
        ai_analysis,
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to save reframe: ${error.message}`);
    }

    // Return the full database record
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('Reframe Forge Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});