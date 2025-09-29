import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { testReframeConnection } from '../../services/reframeForgeClientEnhanced';
import { testJournalAiConnection } from '../../services/journalAiClientEnhanced';
import { supabase } from '../../services/supabaseClient';

const DebugContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const DebugTitle = styled.h3`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 1rem 0;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const DebugSection = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const DebugButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background.dark};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.tertiary};
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
  }
`;

const DebugOutput = styled.pre`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  margin-top: 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
`;

const StatusIndicator = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${({ theme, status }) => 
    status === 'success' ? theme.colors.status.success :
    status === 'error' ? theme.colors.primary :
    theme.colors.secondary};
`;

const ConfigDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(199, 167, 88, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  font-size: 0.9rem;
  
  .config-item {
    margin-bottom: 0.5rem;
    
    .config-label {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.accent};
    }
    
    .config-value {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-family: monospace;
    }
  }
`;

const AIDebugPanel = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({});

  const runConnectionTests = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: Check Supabase connection
      console.log('🔄 Testing Supabase connection...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.supabase = {
        success: !authError,
        user: user?.email || 'No user',
        error: authError?.message
      };

      // Test 2: Test reframe-forge function
      console.log('🔄 Testing reframe-forge function...');
      const reframeResult = await testReframeConnection();
      results.reframe = reframeResult;

      // Test 3: Test journal-ai function
      console.log('🔄 Testing journal-ai function...');
      const journalResult = await testJournalAiConnection();
      results.journal = journalResult;

      // Test 4: Check environment variables
      const envConfig = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_PROJECT_URL ? '✅ Set' : '❌ Missing',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        geminiKey: import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
        geminiKeyValid: import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'YOUR_API_KEY_HERE' ? '✅ Valid' : '❌ Invalid'
      };
      setConfig(envConfig);

    } catch (error) {
      console.error('❌ Test suite error:', error);
      results.suiteError = {
        message: error.message,
        stack: error.stack
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const testGeminiApiKey = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setTestResults(prev => ({
          ...prev,
          geminiTest: {
            success: false,
            error: 'Gemini API key is not configured'
          }
        }));
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, this is a test.' }] }]
        })
      });

      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        geminiTest: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: data.candidates ? '✅ API Key Valid' : '❌ API Key Invalid',
          error: data.error?.message || data.error
        }
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        geminiTest: {
          success: false,
          error: error.message,
          stack: error.stack
        }
      }));
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults({});
  };

  return (
    <DebugContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DebugTitle>
        🔧 AI Service Debug Panel
      </DebugTitle>

      <DebugSection>
        <h4>Connection Tests</h4>
        <DebugButton onClick={runConnectionTests} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run All Tests'}
        </DebugButton>
        <DebugButton onClick={testGeminiApiKey} disabled={isLoading}>
          Test Gemini API Key
        </DebugButton>
        <DebugButton onClick={clearResults} disabled={isLoading}>
          Clear Results
        </DebugButton>
      </DebugSection>

      <ConfigDisplay>
        <h4>Environment Configuration</h4>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="config-item">
            <span className="config-label">{key}:</span>
            <span className="config-value"> {value}</span>
          </div>
        ))}
      </ConfigDisplay>

      {Object.keys(testResults).length > 0 && (
        <DebugSection>
          <h4>Test Results</h4>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName}>
              <h5>
                <StatusIndicator status={result.success ? 'success' : 'error'} />
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h5>
              <DebugOutput>
                {JSON.stringify(result, null, 2)}
              </DebugOutput>
            </div>
          ))}
        </DebugSection>
      )}

      <DebugSection>
        <h4>Quick Fix Instructions</h4>
        <ol style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li>Go to Supabase Dashboard → Settings → API</li>
          <li>Add Environment Variable: GEMINI_API_KEY = AIzaSyARhDWIEFUjS8pYXK_g3vocsWmnwkRp93A</li>
          <li>Redeploy edge functions: supabase functions deploy</li>
          <li>Test using the buttons above</li>
        </ol>
      </DebugSection>
    </DebugContainer>
  );
};

export default AIDebugPanel;