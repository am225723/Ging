import { describe, it, expect } from 'vitest';

// Simple test to verify the bug fix - using correct model name
describe('GeminiClient Bug Fix - Model Name Verification', () => {
  it('should use gemini-2.0-flash model instead of non-existent gemini-1.5-flash', async () => {
    // Import the module to check the actual implementation
    const module = await import('../geminiClient');
    
    // The key fix: verify that the module exports functions
    expect(module.generateWithGemini).toBeDefined();
    expect(module.generateJsonWithGemini).toBeDefined();
    
    // Check that the file contains the correct model name
    const fs = await import('fs');
    const fileContent = fs.readFileSync('src/services/geminiClient.js', 'utf8');
    
    // CRITICAL BUG FIX VERIFICATION:
    // Should contain gemini-2.0-flash (valid model)
    expect(fileContent).toContain('gemini-2.0-flash');
    
    // Should contain the bug fix comments
    expect(fileContent).toContain('BUG FIX: Updated from gemini-1.5-flash to gemini-2.0-flash');
    
    // Verify the actual model usage (not just comments)
    const modelUsages = fileContent.match(/model:\s*"gemini-[^"]*"/g);
    expect(modelUsages).toBeDefined();
    expect(modelUsages.length).toBe(2); // Two functions use the model
    expect(modelUsages.every(usage => usage.includes('gemini-2.0-flash'))).toBe(true);
    
    console.log('✅ Bug fix verified: Model updated from gemini-1.5-flash to gemini-2.0-flash');
    console.log('✅ All model usages now use the valid gemini-2.0-flash model');
  });

  it('should have enhanced error handling for 404 errors', async () => {
    const fs = await import('fs');
    const fileContent = fs.readFileSync('src/services/geminiClient.js', 'utf8');
    
    // Verify enhanced error handling was added
    expect(fileContent).toContain('404');
    expect(fileContent).toContain('not found');
    expect(fileContent).toContain('The AI model is not available');
  });
});