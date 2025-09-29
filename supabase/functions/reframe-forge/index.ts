import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const getPrompt = (negative_thought: string, context: string) => {
  return `
Analyze the following negative thought and its context. Provide a detailed analysis in JSON format.

**Negative Thought:** "${negative_thought}"
**Context:** "${context || 'No additional context provided.'}"

**Instructions:**
1.  **Identify Cognitive Distortions:** List the cognitive distortions present (e.g., "All-or-Nothing Thinking", "Catastrophizing").
2.  **Challenge the Thought:** Provide evidence for and against the negative thought.
3.  **Create a Balanced Reframe:** Write a more balanced and realistic alternative thought.
4.  **Suggest a Tiny Action:** Propose a small, concrete action the user can take.
5.  **Add a Safety Note:** If the thought involves self-harm, crisis, or abuse, include a safety note advising professional help. Otherwise, set this to null.

**Output ONLY the raw JSON object, without any markdown formatting, like this:**
{
  "distortions": ["Distortion 1", "Distortion 2"],
  "evidence_for": ["Evidence 1", "Evidence 2"],
  "evidence_against": ["Evidence 1", "Evidence 2"],
  "balanced_reframe": "The balanced alternative thought.",
  "tiny_action": "A small, actionable step.",
  "safety_note": "A safety note or null."
}
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { negative_thought, context } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (!negative_thought) {
      return new Response(JSON.stringify({ error: "Missing negative_thought" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: getPrompt(negative_thought, context) }],
        }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API failed with status ${geminiResponse.status}: ${errorBody}`);
    }
    const geminiData = await geminiResponse.json();

    // Extract the JSON string and parse it
    const rawText = geminiData.candidates[0].content.parts[0].text;
    const ai_analysis = JSON.parse(rawText.trim());

    const { data, error } = await supabase
      .from("reframes")
      .insert({
        user_id: user.id,
        negative_thought,
        context,
        cognitive_distortions: ai_analysis.distortions,
        reframed_thought: ai_analysis.balanced_reframe,
        ai_analysis,
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