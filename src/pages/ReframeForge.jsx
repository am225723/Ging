import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import { getReframe } from '../services/reframeForgeClient';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const PageDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  max-width: 800px;
`;

const ForgeContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ForgeSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ForgeStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StepNumber = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.accent : 'rgba(199, 167, 88, 0.2)'};
  color: ${({ theme, active }) => 
    active ? theme.colors.background.dark : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.primary};
  flex-shrink: 0;
  font-size: 1.1rem;
`;

const StepTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme, active }) => 
    active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const StepContent = styled.div`
  padding-left: 3.25rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.background.dark : theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.primary : 'rgba(199, 167, 88, 0.1)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  margin-top: 2rem;
`;

const ResultTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const ResultItem = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .content {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.6;
  }
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
  }
`;

const HistorySection = styled.div`
  margin-top: 2rem;
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateX(5px);
  }
  
  .date {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 0.5rem;
  }
  
  .thought {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.5;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.secondary};
    border-top-color: ${({ theme }) => theme.colors.accent};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ReframeForge = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [negativeThought, setNegativeThought] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history
  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reframes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      showToast('Failed to load history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!negativeThought.trim()) {
      showToast('Please enter a negative thought', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await getReframe(negativeThought, context);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response);
      showToast('Analysis complete!', 'success');
      
      // Reload history to show new entry
      await loadHistory();
      
      // Clear form
      setNegativeThought('');
      setContext('');
    } catch (error) {
      console.error('Error getting reframe:', error);
      showToast(error.message || 'Failed to analyze thought. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setResult(item.ai_analysis);
    setNegativeThought(item.negative_thought);
    setContext(item.context || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>⚒️ Reframe & Reforge</PageTitle>
        <PageDescription>
          Transform negative thoughts into balanced perspectives using Cognitive Behavioral Therapy (CBT) techniques. 
          Enter a negative thought below, and our AI will help you identify cognitive distortions, examine evidence, 
          and create a more balanced reframe.
        </PageDescription>
      </PageHeader>

      <ForgeContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ForgeSteps>
          <ForgeStep>
            <StepHeader>
              <StepNumber active={true}>1</StepNumber>
              <StepTitle active={true}>Enter Your Negative Thought</StepTitle>
            </StepHeader>
            <StepContent>
              <TextArea
                value={negativeThought}
                onChange={(e) => setNegativeThought(e.target.value)}
                placeholder="Example: I'm terrible at my job and everyone thinks I'm incompetent..."
                disabled={loading}
              />
            </StepContent>
          </ForgeStep>

          <ForgeStep>
            <StepHeader>
              <StepNumber active={true}>2</StepNumber>
              <StepTitle active={true}>Add Context (Optional)</StepTitle>
            </StepHeader>
            <StepContent>
              <TextArea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Example: I made a mistake in a presentation today and my boss seemed disappointed..."
                disabled={loading}
                style={{ minHeight: '80px' }}
              />
            </StepContent>
          </ForgeStep>

          <ForgeStep>
            <StepHeader>
              <StepNumber active={true}>3</StepNumber>
              <StepTitle active={true}>Get AI Analysis</StepTitle>
            </StepHeader>
            <StepContent>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || !negativeThought.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Analyzing...' : '🤖 AI Assist'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNegativeThought('');
                    setContext('');
                    setResult(null);
                  }}
                  disabled={loading}
                >
                  Clear
                </Button>
              </ButtonGroup>
            </StepContent>
          </ForgeStep>
        </ForgeSteps>

        {loading && <LoadingSpinner />}

        {result && !loading && (
          <ResultsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultTitle>📊 Analysis Results</ResultTitle>
            
            {result.distortions && result.distortions.length > 0 && (
              <ResultItem>
                <div className="label">Cognitive Distortions Identified</div>
                <div className="content">
                  <ul>
                    {result.distortions.map((distortion, index) => (
                      <li key={index}>{distortion}</li>
                    ))}
                  </ul>
                </div>
              </ResultItem>
            )}

            {result.evidence_for && result.evidence_for.length > 0 && (
              <ResultItem>
                <div className="label">Evidence Supporting the Thought</div>
                <div className="content">
                  <ul>
                    {result.evidence_for.map((evidence, index) => (
                      <li key={index}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              </ResultItem>
            )}

            {result.evidence_against && result.evidence_against.length > 0 && (
              <ResultItem>
                <div className="label">Evidence Against the Thought</div>
                <div className="content">
                  <ul>
                    {result.evidence_against.map((evidence, index) => (
                      <li key={index}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              </ResultItem>
            )}

            {result.balanced_reframe && (
              <ResultItem>
                <div className="label">✨ Balanced Reframe</div>
                <div className="content">{result.balanced_reframe}</div>
              </ResultItem>
            )}

            {result.tiny_action && (
              <ResultItem>
                <div className="label">🎯 Tiny Action Step</div>
                <div className="content">{result.tiny_action}</div>
              </ResultItem>
            )}

            {result.safety_note && (
              <ResultItem>
                <div className="label">⚠️ Safety Note</div>
                <div className="content" style={{ color: '#ff6b6b' }}>
                  {result.safety_note}
                </div>
              </ResultItem>
            )}
          </ResultsSection>
        )}
      </ForgeContainer>

      <HistorySection>
        <HistoryTitle>📜 Recent Reframes</HistoryTitle>
        {loadingHistory ? (
          <LoadingSpinner />
        ) : history.length > 0 ? (
          <HistoryList>
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="date">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="thought">{item.negative_thought}</div>
              </HistoryItem>
            ))}
          </HistoryList>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            No reframes yet. Start by entering a negative thought above!
          </p>
        )}
      </HistorySection>
    </PageContainer>
  );
};

export default ReframeForge;