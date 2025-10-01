// FIXED VERSION: supabase/functions/exposure-ladder/index.ts
// This version includes proper field mapping and improved prompt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

const getPrompt = (fear: string, goal: string, constraints: string) => {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT) and exposure therapy. Create a structured exposure ladder to help someone gradually face their fear.

**User's Fear:** "${fear}"
**User's Goal:** "${goal || 'Not specified'}"
**Constraints/Context:** "${constraints || 'Not specified'}"

**Instructions:**
Create an exposure ladder with 5-8 steps that gradually increase in difficulty. Each step should be:
- Specific and actionable
- Measurable (with clear success criteria)
- Ordered from least to most anxiety-provoking
- Realistic and achievable

**Return your response as a JSON object with this exact structure:**
{
  "ladder": [
    {
      "title": "Brief, clear title for this step (e.g., 'Look at pictures of dogs')",
      "description": "Detailed description of what to do in this step",
      "anxietyLevel": 2,
      "suds_target": 1,
      "prep": "How to prepare for this step (e.g., 'Find a comfortable, safe space')",
      "duration": 10,
      "success": "Clear criteria for success (e.g., 'Can look at pictures for 5 minutes without leaving')"
    }
  ],
  "notes": "General guidance and encouragement for the user as they work through this ladder. Include tips for managing anxiety and when to move to the next step.",
  "safety_note": "If this fear involves potential danger, self-harm, or requires professional supervision, include a safety warning here. Otherwise, set to null."
}

**Important Guidelines:**
- anxietyLevel: Rate from 1-10 (1=minimal anxiety, 10=extreme anxiety)
- suds_target: The target anxiety level after practicing this step (usually 1-2 points lower)
- duration: Suggested time in minutes to practice this step
- Order steps from lowest to highest anxietyLevel
- Make sure there's a gradual progression (don't jump from 2 to 8)
- Include 5-8 steps total
- Be compassionate and encouraging in your notes

**Return ONLY the JSON object, no additional text or markdown formatting.**
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
    if (!parsed.ladder || !Array.isArray(parsed.ladder)) {
      throw new Error('Missing or invalid ladder array');
    }
    
    if (parsed.ladder.length < 5 || parsed.ladder.length > 8) {
      console.warn(`Ladder has ${parsed.ladder.length} steps, expected 5-8`);
    }
    
    // Validate each step has required fields
    for (let i = 0; i < parsed.ladder.length; i++) {
      const step = parsed.ladder[i];
      const requiredFields = ['title', 'anxietyLevel'];
      for (const field of requiredFields) {
        if (!(field in step)) {
          throw new Error(`Step ${i + 1} missing required field: ${field}`);
        }
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw text:', rawText);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

// Helper function to map AI response to frontend-expected format
const mapStepsToFrontendFormat = (aiSteps: any[]): any[] => {
  return aiSteps.map((step, index) => ({
    id: index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || step.action || '',
    anxietyLevel: step.anxietyLevel || step.suds_start || 5,
    suds_target: step.suds_target || Math.max(1, (step.anxietyLevel || 5) - 2),
    prep: step.prep || '',
    duration: step.duration || step.duration_min || 10,
    success: step.success || step.success_criteria || '',
    completed: false
  }));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fear_title, goal, constraints } = await req.json();

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input
    if (!fear_title || fear_title.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Missing or empty fear_title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate prompt
    const prompt = getPrompt(fear_title, goal, constraints);

    // Call Gemini API with JSON response configuration
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          responseMimeType: "application/json",
        },
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

    // Map steps to frontend-expected format
    const mappedSteps = mapStepsToFrontendFormat(ai_result.ladder);

    // Sort steps by anxiety level (lowest to highest)
    mappedSteps.sort((a, b) => a.anxietyLevel - b.anxietyLevel);

    // Save to database
    const { data, error } = await supabase
      .from("exposure_ladders")
      .insert({
        user_id: user.id,
        fear_title,
        goal: goal || null,
        constraints: constraints || null,
        steps: mappedSteps,
        ai_notes: ai_result.notes || null,
        safety_note: ai_result.safety_note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to save exposure ladder: ${error.message}`);
    }

    // Return the full database record
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('Exposure Ladder Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});