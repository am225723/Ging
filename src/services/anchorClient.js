import { generateJsonWithGemini } from './geminiClient';

/**
 * Generates personalized grounding mantras using AI
 * @param {string} context - Optional context about user's current state
 * @param {number} count - Number of mantras to generate (default: 5)
 * @returns {Promise<Object>} Object with mantras array
 */
export async function suggestAnchors(context = '', count = 5) {
  const prompt = `
You are a compassionate mindfulness coach and expert in grounding techniques. Generate ${count} short, calming grounding mantras or "anchors" for someone experiencing anxiety, stress, or overwhelm.

${context ? `Context about the user's current state: ${context}` : ''}

**Requirements for each mantra:**
- 3-8 words long
- Use present tense and positive language
- Focus on safety, calm, presence, and grounding
- Be creative and avoid clichés
- Use compassionate, supportive tone
- Vary the themes (safety, breath, presence, strength, acceptance)

**Return your response as a JSON object with this structure:**
{
  "mantras": ["Mantra 1", "Mantra 2", "Mantra 3", ...]
}

**Example mantras:**
- "I am safe enough right now"
- "This wave will pass through me"
- "I can ride this moment"
- "My breath is my anchor"
- "I am here, I am present"

**Return ONLY the JSON object, no additional text or markdown formatting.**
`;

  try {
    const result = await generateJsonWithGemini(prompt);
    
    // Validate response has mantras property
    if (!result.mantras || !Array.isArray(result.mantras)) {
      throw new Error('AI returned invalid format - expected object with mantras array');
    }
    
    // Validate array has items
    if (result.mantras.length === 0) {
      throw new Error('AI returned empty mantras array');
    }
    
    // Validate all items are strings
    if (!result.mantras.every(item => typeof item === 'string')) {
      throw new Error('AI returned non-string items in mantras array');
    }
    
    return result;
  } catch (error) {
    console.error('Error generating anchors:', error);
    throw error;
  }
}