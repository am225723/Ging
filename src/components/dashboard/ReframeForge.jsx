import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { getReframe } from '../../services/reframeForgeClient';

const ForgeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ForgeContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
`;

const ForgeTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .forge-icon {
    font-size: 1rem;
  }
`;

const ForgeDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ForgeSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.primary : 'rgba(138, 3, 3, 0.2)'};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.primary};
  flex-shrink: 0;
`;

const StepTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme, active }) => 
    active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const StepContent = styled.div`
  padding-left: 2.75rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ThoughtPatterns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const PatternButton = styled.button`
  padding: 0.75rem;
  background-color: ${({ theme, selected }) => 
    selected ? 'rgba(138, 3, 3, 0.2)' : theme.colors.background.dark};
  border: 1px solid ${({ theme, selected }) => 
    selected ? theme.colors.primary : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme, selected }) => 
    selected ? theme.colors.text.primary : theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(138, 3, 3, 0.1);
  }
  
  .pattern-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .pattern-description {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.text.primary : theme.colors.text.secondary};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.primary : 'rgba(138, 3, 3, 0.1)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.secondary};
    border-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CompletedView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BeforeAfterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ThoughtBox = styled.div`
  padding: 1rem;
  background-color: ${({ theme, type }) => 
    type === 'before' ? 'rgba(138, 3, 3, 0.1)' : 'rgba(77, 126, 62, 0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme, type }) => 
    type === 'before' ? theme.colors.primary : theme.colors.status.success};
  
  .thought-header {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: ${({ theme, type }) => 
      type === 'before' ? theme.colors.primary : theme.colors.status.success};
  }
  
  .thought-content {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;
  }
  
  .thought-pattern {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    font-style: italic;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ResetButton = styled(Button)`
  align-self: center;
  margin-top: 1rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-top: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EvidenceSection = styled.div`
  margin-top: 1rem;
  
  h5 {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: ${({ theme, type }) => 
      type === 'for' ? theme.colors.primary : theme.colors.status.success};
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

const TinyAction = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(199, 167, 88, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  
  .action-header {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.accent};
  }
  
  .action-content {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SafetyNote = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(138, 3, 3, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  
  .note-header {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .note-content {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const AiAssistButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background.dark};
  border-color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    opacity: 0.9;
  }
  
  .ai-icon {
    font-size: 1rem;
  }
`;

const HistoryCard = styled(ForgeContainer)`
  margin-top: 2rem;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const HistoryItem = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .history-thought {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .history-date {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const thoughtPatterns = [
  { id: 1, name: 'All-or-Nothing Thinking', description: 'Seeing things in black and white categories' },
  { id: 2, name: 'Overgeneralization', description: 'Viewing a negative event as a never-ending pattern' },
  { id: 3, name: 'Mental Filter', description: 'Focusing on a single negative detail' },
  { id: 4, name: 'Discounting the Positive', description: 'Rejecting positive experiences' },
  { id: 5, name: 'Jumping to Conclusions', description: 'Making negative interpretations without facts' },
  { id: 6, name: 'Catastrophizing', description: 'Expecting disaster; magnifying problems' }
];

const ReframeForge = () => {
  const { user } = useAuth();

  // Component state
  const [currentStep, setCurrentStep] = useState(1);
  const [negativeThought, setNegativeThought] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [reframedThought, setReframedThought] = useState('');
  const [completed, setCompleted] = useState(false);
  const [context, setContext] = useState('');

  // DB and AI state
  const [dbLoading, setDbLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [pastReframes, setPastReframes] = useState([]);

  const fetchReframes = useCallback(async () => {
    if (!user) return;
    setDbLoading(true);
    try {
      const { data, error } = await supabase
        .from('reframes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPastReframes(data);
    } catch (error) {
      console.error("Error fetching reframes:", error);
    } finally {
      setDbLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReframes();
  }, [fetchReframes]);

  const handlePatternToggle = (patternId) => {
    setSelectedPatterns(prev =>
      prev.includes(patternId) ? prev.filter(id => id !== patternId) : [...prev, patternId]
    );
  };

  const handleSaveReframe = async () => {
    if (!user) return;
    setDbLoading(true);

    const reframeData = {
      user_id: user.id,
      negative_thought: negativeThought,
      context: context,
      cognitive_distortions: getSelectedPatternNames().split(', '),
      reframed_thought: aiResult ? aiResult.balanced_reframe : reframedThought,
      ai_analysis: aiResult,
    };

    try {
      const { error } = await supabase.from('reframes').insert(reframeData);
      if (error) throw error;
      await fetchReframes(); // Refresh history
    } catch (error) {
      console.error("Error saving reframe:", error);
      alert("Failed to save reframe.");
    } finally {
      setDbLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      handleSaveReframe();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  
  const handleReset = () => {
    setCurrentStep(1);
    setNegativeThought('');
    setSelectedPatterns([]);
    setReframedThought('');
    setCompleted(false);
    setAiResult(null);
    setContext('');
  };
  
  const isStepComplete = (step) => {
    switch (step) {
      case 1: return negativeThought.trim().length > 0;
      case 2: return selectedPatterns.length > 0 || aiResult;
      case 3: return (reframedThought.trim().length > 0 && !aiResult) || aiResult;
      default: return false;
    }
  };
  
  const getSelectedPatternNames = () => {
    if (aiResult && aiResult.distortions) return aiResult.distortions.join(', ');
    return selectedPatterns
      .map(id => thoughtPatterns.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };
  
  const handleAiAssist = async () => {
    if (!negativeThought.trim()) return;
    setAiLoading(true);
    try {
      const result = await getReframe(negativeThought, context);
      setAiResult(result);
      if (currentStep >= 2) {
        const matchedPatternIds = result.distortions?.map(distortion =>
          thoughtPatterns.find(p => p.name.toLowerCase() === distortion.toLowerCase())?.id
        ).filter(Boolean) || [];
        if (matchedPatternIds.length > 0) setSelectedPatterns(matchedPatternIds);
      }
      if (currentStep >= 3) {
        setReframedThought(result.balanced_reframe || '');
      }
    } catch (error) {
      console.error('Error getting AI reframe:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const viewHistoryItem = (item) => {
    setNegativeThought(item.negative_thought);
    setContext(item.context || '');
    setReframedThought(item.reframed_thought || '');
    setAiResult(item.ai_analysis);
    setSelectedPatterns(item.cognitive_distortions?.map(d =>
      thoughtPatterns.find(p => p.name === d)?.id).filter(Boolean) || []);
    setCompleted(true);
  };

  return (
    <ForgeWrapper>
      <ForgeContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {(dbLoading || aiLoading) && <LoadingOverlay><LoadingSpinner /></LoadingOverlay>}

        <ForgeTitle>
          <span className="forge-icon">🔥</span>
          Reframe Forge
        </ForgeTitle>

        <ForgeDescription>
          Transform negative thoughts into balanced perspectives using cognitive behavioral techniques.
        </ForgeDescription>

        {!completed ? (
          <ForgeSteps>
            <ForgeStep>
              <StepHeader><StepNumber active={currentStep === 1}>1</StepNumber><StepTitle active={currentStep === 1}>Identify the Negative Thought</StepTitle></StepHeader>
              {currentStep === 1 && (
                <StepContent>
                  <TextArea value={negativeThought} onChange={(e) => setNegativeThought(e.target.value)} placeholder="Write down the negative thought..." />
                  <TextArea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Optional: Add context..." style={{ marginTop: '1rem', minHeight: '80px' }} />
                  <ButtonGroup>
                    <AiAssistButton onClick={handleAiAssist} disabled={!negativeThought.trim() || aiLoading}><span className="ai-icon">🧠</span> AI Assist</AiAssistButton>
                    <Button variant="primary" onClick={handleNextStep} disabled={!isStepComplete(1)}>Next</Button>
                  </ButtonGroup>
                </StepContent>
              )}
            </ForgeStep>
            
            <ForgeStep>
              <StepHeader><StepNumber active={currentStep === 2}>2</StepNumber><StepTitle active={currentStep === 2}>Identify Thought Patterns</StepTitle></StepHeader>
              {currentStep === 2 && (
                <StepContent>
                  {aiResult ? (
                    <div>
                      <h5>AI-Identified Patterns:</h5>
                      <ul>{aiResult.distortions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                      <EvidenceSection type="for"><h5>Evidence For:</h5><ul>{aiResult.evidence_for.map((e, i) => <li key={i}>{e}</li>)}</ul></EvidenceSection>
                      <EvidenceSection type="against"><h5>Evidence Against:</h5><ul>{aiResult.evidence_against.map((e, i) => <li key={i}>{e}</li>)}</ul></EvidenceSection>
                    </div>
                  ) : (
                    <ThoughtPatterns>
                      {thoughtPatterns.map(p => <PatternButton key={p.id} selected={selectedPatterns.includes(p.id)} onClick={() => handlePatternToggle(p.id)}><div className="pattern-name">{p.name}</div><div className="pattern-description">{p.description}</div></PatternButton>)}
                    </ThoughtPatterns>
                  )}
                  <ButtonGroup>
                    <Button onClick={handlePrevStep}>Back</Button>
                    {!aiResult && <AiAssistButton onClick={handleAiAssist} disabled={!negativeThought.trim() || aiLoading}><span className="ai-icon">🧠</span> AI Assist</AiAssistButton>}
                    <Button variant="primary" onClick={handleNextStep} disabled={!isStepComplete(2)}>Next</Button>
                  </ButtonGroup>
                </StepContent>
              )}
            </ForgeStep>

            <ForgeStep>
              <StepHeader><StepNumber active={currentStep === 3}>3</StepNumber><StepTitle active={currentStep === 3}>Create Balanced Thought</StepTitle></StepHeader>
              {currentStep === 3 && (
                <StepContent>
                  {aiResult ? (
                    <div>
                      <h5>AI-Generated Balanced Thought:</h5><p>{aiResult.balanced_reframe}</p>
                      {aiResult.tiny_action && <TinyAction><div className="action-header">Suggested Action:</div><div className="action-content">{aiResult.tiny_action}</div></TinyAction>}
                      {aiResult.safety_note && <SafetyNote><div className="note-header">Note:</div><div className="note-content">{aiResult.safety_note}</div></SafetyNote>}
                    </div>
                  ) : (
                    <TextArea value={reframedThought} onChange={(e) => setReframedThought(e.target.value)} placeholder="Rewrite your thought in a more balanced way..." />
                  )}
                  <ButtonGroup>
                    <Button onClick={handlePrevStep}>Back</Button>
                    {!aiResult && <AiAssistButton onClick={handleAiAssist} disabled={!negativeThought.trim() || aiLoading}><span className="ai-icon">🧠</span> AI Assist</AiAssistButton>}
                    <Button variant="primary" onClick={handleNextStep} disabled={!isStepComplete(3)}>Complete</Button>
                  </ButtonGroup>
                </StepContent>
              )}
            </ForgeStep>
          </ForgeSteps>
        ) : (
          <CompletedView>
            <BeforeAfterContainer>
              <ThoughtBox type="before">
                <div className="thought-header">Original Thought</div>
                <div className="thought-content">{negativeThought}</div>
                <div className="thought-pattern">Patterns: {getSelectedPatternNames()}</div>
                {aiResult && <EvidenceSection type="for"><h5>Evidence For:</h5><ul>{aiResult.evidence_for.map((e, i) => <li key={i}>{e}</li>)}</ul></EvidenceSection>}
              </ThoughtBox>
              <ThoughtBox type="after">
                <div className="thought-header">Reframed Thought</div>
                <div className="thought-content">{aiResult ? aiResult.balanced_reframe : reframedThought}</div>
                {aiResult && <EvidenceSection type="against"><h5>Evidence Against:</h5><ul>{aiResult.evidence_against.map((e, i) => <li key={i}>{e}</li>)}</ul></EvidenceSection>}
                {aiResult?.tiny_action && <TinyAction><div className="action-header">Next Step:</div><div className="action-content">{aiResult.tiny_action}</div></TinyAction>}
              </ThoughtBox>
            </BeforeAfterContainer>
            {aiResult?.safety_note && <SafetyNote><div className="note-header">Note:</div><div className="note-content">{aiResult.safety_note}</div></SafetyNote>}
            <ResetButton onClick={handleReset}>Create New Reframe</ResetButton>
          </CompletedView>
        )}
      </ForgeContainer>

      {pastReframes.length > 0 && (
        <HistoryCard>
          <ForgeTitle>Recent Reframes</ForgeTitle>
          <HistoryList>
            {pastReframes.map(item => (
              <HistoryItem key={item.id} onClick={() => viewHistoryItem(item)}>
                <div className="history-thought">{item.negative_thought}</div>
                <div className="history-date">{new Date(item.created_at).toLocaleDateString()}</div>
              </HistoryItem>
            ))}
          </HistoryList>
        </HistoryCard>
      )}
    </ForgeWrapper>
  );
};

export default ReframeForge;