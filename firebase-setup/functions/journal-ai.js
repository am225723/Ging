const functions = require("firebase-functions");
const cors = require("./utils/cors");
const {verifyAuth} = require("./utils/auth");
const {callGeminiAPI, parseGeminiResponse} = require("./utils/gemini");

const GEMINI_API_KEY = functions.config().gemini.api_key;

/**
 * Generate prompt based on mode and journal data
 * @param {string} mode - Processing mode
 * @param {Object} journalData - Journal entry data
 * @return {string} Generated prompt
 */
function getPrompt(mode, journalData) {
  const basePrompt = `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entry:
    - Title: "${journalData.title || "Untitled"}"
    - Content: "${journalData.content}"
    - Mood Rating (0-100): ${journalData.mood}
    - Tags: ${journalData.tags?.length > 0 ? journalData.tags.join(", ") : "None"}
  `;

  switch (mode) {
    case "summarize":
      return `${basePrompt}

Please provide a concise, one-paragraph summary of the main themes and emotions in this entry.

Return your response as a JSON object with this exact structure:
{
  "summary": "Your one-paragraph summary here"
}`;

    case "insights":
      return `${basePrompt}

Identify 3-5 key emotional themes, cognitive patterns, or recurring thoughts in this entry. 
Present them as clear, actionable insights.

Return your response as a JSON object with this exact structure:
{
  "insights": "• First insight\\n• Second insight\\n• Third insight"
}`;

    case "actions":
      return `${basePrompt}

Based on this journal entry, suggest 2-3 small, concrete, actionable steps the user could take.
These should be specific and achievable within the next 24-48 hours.

Return your response as a JSON object with this exact structure:
{
  "actions": "1. First action step\\n2. Second action step\\n3. Third action step"
}`;

    case "ask":
      return `${basePrompt}

The user has asked the following question about their entry:
"${journalData.question}"

Answer their question based on the content of their journal entry. Be supportive and insightful.

Return your response as a JSON object with this exact structure:
{
  "answer": "Your answer to their question here"
}`;

    case "rewrite":
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
}

/**
 * Journal AI Cloud Function
 */
exports.journalAi = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const {mode, journalData} = req.body;

      // Validate input
      if (!journalData?.content) {
        return res.status(400).json({error: "Missing journal content"});
      }

      if (!mode) {
        return res.status(400).json({error: "Missing mode parameter"});
      }

      // Generate prompt
      const prompt = getPrompt(mode, journalData);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiResult = parseGeminiResponse(rawText);

      // Validate response has expected key
      const expectedKeys = {
        "summarize": "summary",
        "insights": "insights",
        "actions": "actions",
        "ask": "answer",
        "rewrite": "rewrite",
      };

      const expectedKey = expectedKeys[mode];
      if (expectedKey && !aiResult[expectedKey]) {
        throw new Error(`AI response missing expected key: ${expectedKey}`);
      }

      // Return AI result
      return res.status(200).json(aiResult);
    } catch (error) {
      console.error("Journal AI Error:", error);

      if (error.message.includes("Unauthorized")) {
        return res.status(401).json({error: error.message});
      }

      return res.status(500).json({
        error: error.message || "An unexpected error occurred",
      });
    }
  });
});