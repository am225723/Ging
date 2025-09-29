import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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
      return `${basePrompt}\n\nPlease provide a concise, one-paragraph summary. Respond with a JSON object: {"summary": "Your summary here."}`;
    case 'insights':
      return `${basePrompt}\n\nIdentify key emotional themes and cognitive patterns. Respond with a JSON object: {"insights": "Your bulleted list of insights here."}`;
    case 'actions':
      return `${basePrompt}\n\nSuggest 2-3 small, actionable steps. Respond with a JSON object: {"actions": "Your bulleted list of actions here."}`;
    case 'ask':
      return `${basePrompt}\n\nAnswer the user's question based only on the entry: "${journalData.question}". Respond with a JSON object: {"answer": "Your answer here."}`;
    case 'rewrite':
      return `${basePrompt}\n\nRewrite the entry in a "${journalData.tone}" tone. Respond with a JSON object: {"rewrite": "Your rewritten text here."}`;
    default:
      throw new Error(`Invalid mode: ${mode}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mode, entry, journalData } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!journalData?.content) {
      return new Response(JSON.stringify({ error: "Missing content" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = getPrompt(mode, journalData);
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

    // If an existing entry was passed, update it with the new AI data
    if (entry?.id) {
      const updateData: { [key: string]: any } = {};
      if (ai_result.summary) updateData.ai_summary = ai_result.summary;
      if (ai_result.insights) updateData.ai_insights = ai_result.insights;
      if (ai_result.actions) updateData.ai_actions = ai_result.actions;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("journal_entries")
          .update(updateData)
          .eq("id", entry.id);
        if (updateError) throw updateError;
      }
    }

    return new Response(JSON.stringify(ai_result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});