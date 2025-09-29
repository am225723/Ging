import { createContext, useState, useContext, useEffect } from 'react';
import { AI_PROVIDERS } from '../services/aiProviderFactory';
import { createEnhancedAIService } from '../services/enhancedAiService';

// Default AI configuration
const DEFAULT_AI_CONFIG = {
  provider: AI_PROVIDERS.GEMINI,
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 1024,
  detailLevel: 3,
  cacheEnabled: true,
};

// Create the context
const AiContext = createContext();

/**
 * AI Context Provider Component
 * 
 * Provides global access to AI configuration and services
 */
export function AiProvider({ children }) {
  // State for AI configuration
  const [aiConfig, setAiConfig] = useState(() => {
    // Try to load from localStorage
    const savedConfig = localStorage.getItem('aiConfig');
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_AI_CONFIG;
  });
  
  // Create AI service instance
  const [aiService, setAiService] = useState(() => createEnhancedAIService(aiConfig));
  
  // Update AI service when config changes
  useEffect(() => {
    aiService.updateConfig(aiConfig);
    // Save to localStorage
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
  }, [aiConfig, aiService]);
  
  // Update AI configuration
  const updateAiConfig = (newConfig) => {
    setAiConfig(prev => ({ ...prev, ...newConfig }));
  };
  
  // Reset AI configuration to defaults
  const resetAiConfig = () => {
    setAiConfig(DEFAULT_AI_CONFIG);
  };
  
  // Clear AI cache
  const clearAiCache = () => {
    aiService.clearCache();
  };
  
  // Track AI usage statistics
  const [aiUsageStats, setAiUsageStats] = useState({
    totalCalls: 0,
    cachedCalls: 0,
    failedCalls: 0,
    lastCall: null,
  });
  
  // Function to log AI usage
  const logAiUsage = (result, isError = false) => {
    setAiUsageStats(prev => ({
      totalCalls: prev.totalCalls + 1,
      cachedCalls: prev.cachedCalls + (result?.fromCache ? 1 : 0),
      failedCalls: prev.failedCalls + (isError ? 1 : 0),
      lastCall: new Date().toISOString(),
    }));
  };
  
  // Provide the context value
  const contextValue = {
    aiConfig,
    updateAiConfig,
    resetAiConfig,
    aiService,
    clearAiCache,
    aiUsageStats,
    logAiUsage,
  };
  
  return (
    <AiContext.Provider value={contextValue}>
      {children}
    </AiContext.Provider>
  );
}

/**
 * Custom hook to use the AI context
 * 
 * @returns {Object} The AI context value
 */
export function useAi() {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
}