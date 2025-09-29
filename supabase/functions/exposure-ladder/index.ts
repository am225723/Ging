import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const getPrompt = (fear: string, goal: string, constraints: string) => {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT). Create a structured exposure ladder for a user's fear.

**User's Fear:** "${fear}"
**User's Goal:** "${goal || 'Not specified'}"
**Constraints:** "${constraints || 'Not specified'}"

**Instructions:**
Generate a JSON object with a "ladder" (5-8 ordered steps), "notes" for guidance, and a "safety_note".
Each step should include: "step", "title", "prep", "action", "duration_min", "suds_start" (1-10), "suds_target", and "success_criteria".

**Output ONLY the raw JSON object, without any markdown formatting, like this:**
{
  "ladder": [
    {
      "step": 1,
      "title": "Short title",
      "prep": "Preparation task",
      "action": "Specific action to perform",
      "duration_min": 10,
      "suds_start": 3,
      "suds_target": 2,
      "success_criteria": "Clear success definition"
    }
  ],
  "notes": "General guidance here.",
  "safety_note": "Safety note here."
}
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fear_title, goal, constraints } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!fear_title) {
      return new Response(JSON.stringify({ error: "Missing fear_title" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = getPrompt(fear_title, goal, constraints);
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API failed: ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates[0].content.parts[0].text;
    const ai_result = JSON.parse(rawText.trim());

    // Insert the new ladder into the database
    const { data, error } = await supabase
      .from("exposure_ladders")
      .insert({
        user_id: user.id,
        fear_title,
        goal,
        constraints,
        steps: ai_result.ladder,
        ai_notes: ai_result.notes,
        safety_note: ai_result.safety_note,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});