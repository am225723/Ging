/**
 * Call Gemini API with JSON response configuration
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} apiKey - Gemini API key
 * @return {Promise<string>} Raw text response from Gemini
 */
async function callGeminiAPI(prompt, apiKey) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      contents: [{parts: [{text: prompt}]}],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API failed: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid response structure from Gemini API");
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Parse JSON response from Gemini
 * @param {string} rawText - Raw text from Gemini
 * @return {Object} Parsed JSON object
 */
function parseGeminiResponse(rawText) {
  try {
    let cleanedText = rawText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, "");
    cleanedText = cleanedText.replace(/```\n?/g, "");
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Response is not a valid JSON object");
    }

    return parsed;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Raw text:", rawText);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

module.exports = {callGeminiAPI, parseGeminiResponse};