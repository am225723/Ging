const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("./utils/cors");
const {verifyAuth} = require("./utils/auth");
const {callGeminiAPI, parseGeminiResponse} = require("./utils/gemini");

const GEMINI_API_KEY = functions.config().gemini.api_key;
const db = admin.firestore();

/**
 * Generate prompt for cognitive reframe
 * @param {string} negativeThought - User's negative thought
 * @param {string} context - Additional context
 * @return {string} Generated prompt
 */
function getPrompt(negativeThought, context) {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT). Analyze the following negative thought and its context, then provide a detailed analysis.

**Negative Thought:** "${negativeThought}"
**Context:** "${context || "No additional context provided."}"

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
}

/**
 * Reframe Forge Cloud Function
 */
exports.reframeForge = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const {negative_thought, context} = req.body;

      // Validate input
      if (!negative_thought || negative_thought.trim().length === 0) {
        return res.status(400).json({error: "Missing or empty negative_thought"});
      }

      // Generate prompt
      const prompt = getPrompt(negative_thought, context);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiAnalysis = parseGeminiResponse(rawText);

      // Validate required fields
      const requiredFields = ["distortions", "evidence_for", "evidence_against", "balanced_reframe", "tiny_action"];
      for (const field of requiredFields) {
        if (!(field in aiAnalysis)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Save to Firestore
      const reframeData = {
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        negativeThought: negative_thought,
        context: context || null,
        cognitiveDistortions: aiAnalysis.distortions,
        reframedThought: aiAnalysis.balanced_reframe,
        aiAnalysis,
      };

      const docRef = await db.collection("reframes").add(reframeData);
      const doc = await docRef.get();

      // Return the full document
      return res.status(201).json({
        id: doc.id,
        ...doc.data(),
      });
    } catch (error) {
      console.error("Reframe Forge Error:", error);

      if (error.message.includes("Unauthorized")) {
        return res.status(401).json({error: error.message});
      }

      return res.status(500).json({
        error: error.message || "An unexpected error occurred",
      });
    }
  });
});