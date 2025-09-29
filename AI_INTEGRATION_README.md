# AI Integration Improvements

This document outlines the improvements made to the AI integration in the Ging application.

## Overview

The AI integration has been enhanced to provide a more flexible, robust, and user-friendly experience. The key improvements include:

1. **Abstracted AI Provider Layer**: The application now uses an AI provider factory that allows for easy switching between different AI providers (currently Gemini, with support for others like OpenAI planned).

2. **Enhanced AI Service**: A new service layer with additional features such as response caching, retry mechanisms, and better error handling.

3. **User Configuration**: Users can now customize AI behavior through a dedicated AI Settings page.

4. **Feedback Mechanism**: Users can provide feedback on AI-generated content to help improve future responses.

5. **Improved Prompts**: All AI prompts have been enhanced to provide more detailed and contextual information to the AI models.

## Architecture

The new AI integration architecture consists of the following components:

### 1. AI Provider Factory (`aiProviderFactory.js`)

This module provides a factory for creating AI service instances based on configuration. It abstracts the underlying AI provider implementation, allowing for easy switching between different AI services.

```javascript
import { createAIProvider, AI_PROVIDERS } from './aiProviderFactory';

// Create a Gemini provider
const geminiProvider = createAIProvider({
  provider: AI_PROVIDERS.GEMINI,
  model: 'gemini-1.5-flash'
});

// In the future, create an OpenAI provider
const openAIProvider = createAIProvider({
  provider: AI_PROVIDERS.OPENAI,
  model: 'gpt-4'
});
```

### 2. Enhanced AI Service (`enhancedAiService.js`)

This service provides an enhanced interface to AI providers with additional features like caching, retry mechanisms, and better error handling.

```javascript
import { createEnhancedAIService } from './enhancedAiService';

const aiService = createEnhancedAIService({
  temperature: 0.7,
  maxTokens: 1500,
  cacheEnabled: true,
  retryCount: 2
});

// Generate text
const result = await aiService.generateText(prompt);

// Generate JSON
const jsonResult = await aiService.generateJson(jsonPrompt);
```

### 3. Feature-Specific AI Clients

Each feature has its own enhanced client that uses the enhanced AI service:

- `enhancedExposureLadderClient.js`: For generating exposure ladders
- `enhancedReframeForgeClient.js`: For cognitive reframing
- `enhancedJournalAiClient.js`: For journal entry analysis

### 4. AI Context Provider (`AiContext.jsx`)

A React context provider that manages AI configuration globally across the application.

```javascript
import { useAi } from '../contexts/AiContext';

function MyComponent() {
  const { aiConfig, updateAiConfig, aiService } = useAi();
  
  // Use AI service
  const handleGenerateContent = async () => {
    const result = await aiService.generateText(prompt);
    // Handle result
  };
  
  return (
    // Component JSX
  );
}
```

### 5. AI Configuration UI (`AiConfigPanel.jsx`)

A component that allows users to configure AI behavior.

### 6. AI Feedback UI (`AiFeedbackPanel.jsx`)

A component that allows users to provide feedback on AI-generated content.

## Usage Examples

### Generating an Exposure Ladder

```javascript
import { generateExposureLadder } from '../services/enhancedExposureLadderClient';

const handleGenerateLadder = async () => {
  try {
    const result = await generateExposureLadder({
      fear: 'Public speaking',
      goal: 'Give a presentation at work',
      constraints: 'I need to present in 3 weeks',
      stepCount: 6,
      detailLevel: 4
    });
    
    // Handle the result
    setLadderSteps(result.ladder);
    setAiNotes(result.notes);
    setSafetyNote(result.safety_note);
    
    // Access metadata
    console.log(`Generated at: ${result.metadata.generatedAt}`);
    console.log(`From cache: ${result.metadata.fromCache}`);
    console.log(`Provider: ${result.metadata.provider}`);
  } catch (error) {
    console.error('Error generating ladder:', error);
  }
};
```

### Reframing a Negative Thought

```javascript
import { getReframe } from '../services/enhancedReframeForgeClient';

const handleReframe = async () => {
  try {
    const result = await getReframe({
      thought: 'I always mess up important presentations',
      context: 'I have a big presentation next week',
      detailLevel: 3,
      focusAreas: ['evidence', 'actions']
    });
    
    // Handle the result
    setDistortions(result.distortions);
    setEvidenceFor(result.evidence_for);
    setEvidenceAgainst(result.evidence_against);
    setBalancedReframe(result.balanced_reframe);
    setTinyAction(result.tiny_action);
  } catch (error) {
    console.error('Error getting reframe:', error);
  }
};
```

### Processing a Journal Entry

```javascript
import { processJournalEntry, ENHANCED_JOURNAL_AI_MODES } from '../services/enhancedJournalAiClient';

const handleGetInsights = async () => {
  try {
    const result = await processJournalEntry(
      ENHANCED_JOURNAL_AI_MODES.INSIGHTS,
      {
        title: 'My presentation today',
        content: 'I was nervous about my presentation but it went better than expected...',
        mood: 75,
        tags: ['work', 'anxiety', 'success']
      },
      {
        detailLevel: 4
      }
    );
    
    // Handle the result
    setInsights(result.insights);
    setEmotionalThemes(result.emotional_themes);
    setCognitivePatterns(result.cognitive_patterns);
  } catch (error) {
    console.error('Error processing journal entry:', error);
  }
};
```

## AI Settings

Users can access the AI Settings page to customize their AI experience:

1. Navigate to the AI Settings page from the sidebar
2. Adjust settings such as:
   - AI Provider (currently Gemini, with OpenAI coming soon)
   - Model selection
   - Temperature (creativity level)
   - Detail level
   - Response length
   - Caching options

## Providing Feedback

Users can provide feedback on AI-generated content to help improve future responses:

1. After receiving AI-generated content, click the "Provide Feedback" button
2. Rate the response (1-5 stars)
3. Select quick feedback options or provide detailed comments
4. Submit the feedback

## Future Improvements

Planned future improvements include:

1. Support for additional AI providers (OpenAI, Anthropic, etc.)
2. More fine-grained control over AI parameters
3. Enhanced feedback analysis to automatically improve prompts
4. User-specific AI preferences
5. AI usage analytics and insights