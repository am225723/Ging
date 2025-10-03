const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("./utils/cors");
const {verifyAuth} = require("./utils/auth");
const {callGeminiAPI, parseGeminiResponse} = require("./utils/gemini");

const GEMINI_API_KEY = functions.config().gemini.api_key;
const db = admin.firestore();

/**
 * Generate prompt for exposure ladder
 * @param {string} fear - User's fear
 * @param {string} goal - User's goal
 * @param {string} constraints - User's constraints
 * @return {string} Generated prompt
 */
function getPrompt(fear, goal, constraints) {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT) and exposure therapy. Create a structured exposure ladder to help someone gradually face their fear.

**User's Fear:** "${fear}"
**User's Goal:** "${goal || "Not specified"}"
**Constraints/Context:** "${constraints || "Not specified"}"

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
}

/**
 * Map AI steps to frontend format
 * @param {Array} aiSteps - Steps from AI
 * @return {Array} Mapped steps
 */
function mapStepsToFormat(aiSteps) {
  return aiSteps.map((step, index) => ({
    id: index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || step.action || "",
    anxietyLevel: step.anxietyLevel || step.suds_start || 5,
    suds_target: step.suds_target || Math.max(1, (step.anxietyLevel || 5) - 2),
    prep: step.prep || "",
    duration: step.duration || step.duration_min || 10,
    success: step.success || step.success_criteria || "",
    completed: false,
  }));
}

/**
 * Exposure Ladder Cloud Function
 */
exports.exposureLadder = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const {fear_title, goal, constraints} = req.body;

      // Validate input
      if (!fear_title || fear_title.trim().length === 0) {
        return res.status(400).json({error: "Missing or empty fear_title"});
      }

      // Generate prompt
      const prompt = getPrompt(fear_title, goal, constraints);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiResult = parseGeminiResponse(rawText);

      // Validate structure
      if (!aiResult.ladder || !Array.isArray(aiResult.ladder)) {
        throw new Error("Missing or invalid ladder array");
      }

      // Map steps to frontend format
      const mappedSteps = mapStepsToFormat(aiResult.ladder);

      // Sort by anxiety level
      mappedSteps.sort((a, b) => a.anxietyLevel - b.anxietyLevel);

      // Save to Firestore
      const ladderData = {
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        fearTitle: fear_title,
        goal: goal || null,
        constraints: constraints || null,
        steps: mappedSteps,
        aiNotes: aiResult.notes || null,
        safetyNote: aiResult.safety_note || null,
        completedSteps: 0,
      };

      const docRef = await db.collection("exposure_ladders").add(ladderData);
      const doc = await docRef.get();

      // Return the full document
      return res.status(201).json({
        id: doc.id,
        ...doc.data(),
      });
    } catch (error) {
      console.error("Exposure Ladder Error:", error);

      if (error.message.includes("Unauthorized")) {
        return res.status(401).json({error: error.message});
      }

      return res.status(500).json({
        error: error.message || "An unexpected error occurred",
      });
    }
  });
});