// NEW IMPLEMENTATION: AI-powered mantra generation for Anchor Widget
// This includes both the service client and updated component code

// ============================================================================
// FILE 1: src/services/anchorClient.js
// ============================================================================

import { generateJsonWithGemini } from './geminiClient';

/**
 * Generates personalized grounding mantras using AI
 * @param {string} context - Optional context about user's current state
 * @param {number} count - Number of mantras to generate (default: 7)
 * @returns {Promise<Array<string>>} Array of mantra suggestions
 */
export async function suggestAnchors(context = '', count = 7) {
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

**Return your response as a JSON array of strings:**
["Mantra 1", "Mantra 2", "Mantra 3", ...]

**Example mantras:**
- "I am safe enough right now"
- "This wave will pass through me"
- "I can ride this moment"
- "My breath is my anchor"
- "I am here, I am present"

**Return ONLY the JSON array, no additional text or markdown formatting.**
`;

  try {
    const result = await generateJsonWithGemini(prompt);
    
    // Validate response is an array
    if (!Array.isArray(result)) {
      throw new Error('AI returned invalid format - expected array');
    }
    
    // Validate array has items
    if (result.length === 0) {
      throw new Error('AI returned empty array');
    }
    
    // Validate all items are strings
    if (!result.every(item => typeof item === 'string')) {
      throw new Error('AI returned non-string items in array');
    }
    
    return result;
  } catch (error) {
    console.error('Error generating anchors:', error);
    throw error;
  }
}

// ============================================================================
// FILE 2: Updated src/components/dashboard/AnchorWidget.jsx
// Add these imports and modifications to the existing file
// ============================================================================

// ADD THIS IMPORT at the top:
import { suggestAnchors } from '../../services/anchorClient';

// ADD THESE STATE VARIABLES in the component (around line 450):
const [aiLoading, setAiLoading] = useState(false);
const [aiSuggestions, setAiSuggestions] = useState([]);
const [showAiSuggestions, setShowAiSuggestions] = useState(false);

// ADD THIS HANDLER FUNCTION:
const handleGenerateAnchors = async () => {
  setAiLoading(true);
  try {
    const suggestions = await suggestAnchors('', 7);
    setAiSuggestions(suggestions);
    setShowAiSuggestions(true);
  } catch (error) {
    console.error('Error generating anchors:', error);
    // You can add toast notification here if you have useToast
    alert('Failed to generate AI mantras. Please try again.');
  } finally {
    setAiLoading(false);
  }
};

// REPLACE THE MANTRA EXERCISE SECTION (around line 550) with this:
{activeTechnique === 'mantra' && (
  <MantraExercise>
    <div>
      <h4>Select a calming mantra or create your own:</h4>
      
      {/* AI Generation Button */}
      <div style={{ marginBottom: '1rem' }}>
        <Button 
          onClick={handleGenerateAnchors} 
          disabled={aiLoading}
          style={{
            backgroundColor: '#C7A758',
            color: '#0A0A0A',
            border: 'none',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            opacity: aiLoading ? 0.6 : 1
          }}
        >
          <span style={{ fontSize: '1rem' }}>🧠</span>
          {aiLoading ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      {/* Show AI or default suggestions */}
      <MantraSuggestions>
        {(showAiSuggestions && aiSuggestions.length > 0 ? aiSuggestions : mantraSuggestions).map((suggestion, index) => (
          <MantraSuggestion 
            key={index}
            onClick={() => handleMantraSuggestion(suggestion)}
          >
            {suggestion}
          </MantraSuggestion>
        ))}
      </MantraSuggestions>

      {/* Toggle button to switch between AI and default */}
      {showAiSuggestions && aiSuggestions.length > 0 && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowAiSuggestions(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#C7A758',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Show default mantras
          </button>
        </div>
      )}
      {!showAiSuggestions && aiSuggestions.length > 0 && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowAiSuggestions(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#C7A758',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Show AI-generated mantras
          </button>
        </div>
      )}
    </div>
    
    <MantraInput 
      value={mantra}
      onChange={(e) => setMantra(e.target.value)}
      placeholder="Enter your mantra here or select one above..."
    />
    
    {mantra && (
      <div style={{ textAlign: 'center' }}>
        <p>Repeat your mantra slowly, focusing on each word:</p>
        <h2 style={{ 
          color: '#C7A758', 
          margin: '1.5rem 0', 
          fontFamily: 'Cinzel, serif',
          fontSize: '1.8rem',
          lineHeight: '1.5'
        }}>
          "{mantra}"
        </h2>
        <p>Take deep breaths between repetitions.</p>
      </div>
    )}
  </MantraExercise>
)}

// ============================================================================
// USAGE NOTES:
// ============================================================================
// 1. Create the anchorClient.js file in src/services/
// 2. Update AnchorWidget.jsx with the new imports, state, and handler
// 3. Replace the mantra exercise section with the updated code
// 4. The AI button will appear above the mantra suggestions
// 5. Users can toggle between AI-generated and default mantras
// ============================================================================