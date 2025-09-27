import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getReframe } from '../../services/reframeForgeClient';

const ForgeContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
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

// Cognitive distortion patterns
const thoughtPatterns = [
  {
    id: 1,
    name: 'All-or-Nothing Thinking',
    description: 'Seeing things in black and white categories'
  },
  {
    id: 2,
    name: 'Overgeneralization',
    description: 'Viewing a negative event as a never-ending pattern'
  },
  {
    id: 3,
    name: 'Mental Filter',
    description: 'Focusing on a single negative detail'
  },
  {
    id: 4,
    name: 'Discounting the Positive',
    description: 'Rejecting positive experiences'
  },
  {
    id: 5,
    name: 'Jumping to Conclusions',
    description: 'Making negative interpretations without facts'
  },
  {
    id: 6,
    name: 'Catastrophizing',
    description: 'Expecting disaster; magnifying problems'
  }
];

const ReframeForge = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [negativeThought, setNegativeThought] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [reframedThought, setReframedThought] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [context, setContext] = useState('');
  
  const handlePatternToggle = (patternId) => {
    if (selectedPatterns.includes(patternId)) {
      setSelectedPatterns(selectedPatterns.filter(id => id !== patternId));
    } else {
      setSelectedPatterns([...selectedPatterns, patternId]);
    }
  };
  
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
      case 1:
        return negativeThought.trim().length > 0;
      case 2:
        return selectedPatterns.length > 0 || aiResult;
      case 3:
        return reframedThought.trim().length > 0 || aiResult;
      default:
        return false;
    }
  };
  
  const getSelectedPatternNames = () => {
    if (aiResult && aiResult.distortions) {
      return aiResult.distortions.join(', ');
    }
    
    return selectedPatterns
      .map(id => thoughtPatterns.find(pattern => pattern.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };
  
  const handleAiAssist = async () => {
    if (!negativeThought.trim()) return;
    
    setLoading(true);
    try {
      const result = await getReframe(negativeThought, context);
      setAiResult(result);
      
      // If we're on step 2 or 3, we can auto-fill the reframed thought
      if (currentStep >= 2) {
        // Find pattern IDs that match the AI-identified distortions
        const matchedPatternIds = [];
        if (result.distortions) {
          result.distortions.forEach(distortion => {
            const pattern = thoughtPatterns.find(p => 
              p.name.toLowerCase() === distortion.toLowerCase()
            );
            if (pattern) matchedPatternIds.push(pattern.id);
          });
        }
        
        if (matchedPatternIds.length > 0) {
          setSelectedPatterns(matchedPatternIds);
        }
      }
      
      if (currentStep >= 3) {
        setReframedThought(result.balanced_reframe || '');
      }
      
    } catch (error) {
      console.error('Error getting AI reframe:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ForgeContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'relative' }}
    >
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      
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
            <StepHeader>
              <StepNumber active={currentStep === 1}>1</StepNumber>
              <StepTitle active={currentStep === 1}>Identify the Negative Thought</StepTitle>
            </StepHeader>
            
            {currentStep === 1 && (
              <StepContent>
                <TextArea 
                  value={negativeThought}
                  onChange={(e) => setNegativeThought(e.target.value)}
                  placeholder="Write down the negative thought that's bothering you..."
                />
                
                <TextArea 
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Optional: Add some context about the situation..."
                  style={{ marginTop: '1rem', minHeight: '80px' }}
                />
                
                <ButtonGroup>
                  <AiAssistButton 
                    onClick={handleAiAssist}
                    disabled={!negativeThought.trim()}
                  >
                    <span className="ai-icon">🧠</span>
                    AI Assist
                  </AiAssistButton>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleNextStep}
                    disabled={!isStepComplete(1)}
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </StepContent>
            )}
          </ForgeStep>
          
          <ForgeStep>
            <StepHeader>
              <StepNumber active={currentStep === 2}>2</StepNumber>
              <StepTitle active={currentStep === 2}>Identify Thought Patterns</StepTitle>
            </StepHeader>
            
            {currentStep === 2 && (
              <StepContent>
                {aiResult ? (
                  <div>
                    <h5>AI-Identified Thought Patterns:</h5>
                    <ul>
                      {aiResult.distortions.map((distortion, index) => (
                        <li key={index}>{distortion}</li>
                      ))}
                    </ul>
                    
                    <EvidenceSection type="for">
                      <h5>Evidence Supporting the Thought:</h5>
                      <ul>
                        {aiResult.evidence_for.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    </EvidenceSection>
                    
                    <EvidenceSection type="against">
                      <h5>Evidence Against the Thought:</h5>
                      <ul>
                        {aiResult.evidence_against.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    </EvidenceSection>
                  </div>
                ) : (
                  <ThoughtPatterns>
                    {thoughtPatterns.map(pattern => (
                      <PatternButton 
                        key={pattern.id}
                        selected={selectedPatterns.includes(pattern.id)}
                        onClick={() => handlePatternToggle(pattern.id)}
                      >
                        <div className="pattern-name">{pattern.name}</div>
                        <div className="pattern-description">{pattern.description}</div>
                      </PatternButton>
                    ))}
                  </ThoughtPatterns>
                )}
                
                <ButtonGroup>
                  <Button onClick={handlePrevStep}>
                    Back
                  </Button>
                  
                  {!aiResult && (
                    <AiAssistButton 
                      onClick={handleAiAssist}
                      disabled={!negativeThought.trim()}
                    >
                      <span className="ai-icon">🧠</span>
                      AI Assist
                    </AiAssistButton>
                  )}
                  
                  <Button 
                    variant="primary" 
                    onClick={handleNextStep}
                    disabled={!isStepComplete(2)}
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </StepContent>
            )}
          </ForgeStep>
          
          <ForgeStep>
            <StepHeader>
              <StepNumber active={currentStep === 3}>3</StepNumber>
              <StepTitle active={currentStep === 3}>Create Balanced Thought</StepTitle>
            </StepHeader>
            
            {currentStep === 3 && (
              <StepContent>
                {aiResult ? (
                  <div>
                    <h5>AI-Generated Balanced Thought:</h5>
                    <p>{aiResult.balanced_reframe}</p>
                    
                    {aiResult.tiny_action && (
                      <TinyAction>
                        <div className="action-header">Suggested Action:</div>
                        <div className="action-content">{aiResult.tiny_action}</div>
                      </TinyAction>
                    )}
                    
                    {aiResult.safety_note && (
                      <SafetyNote>
                        <div className="note-header">Important Note:</div>
                        <div className="note-content">{aiResult.safety_note}</div>
                      </SafetyNote>
                    )}
                  </div>
                ) : (
                  <TextArea 
                    value={reframedThought}
                    onChange={(e) => setReframedThought(e.target.value)}
                    placeholder="Rewrite your thought in a more balanced, realistic way..."
                  />
                )}
                
                <ButtonGroup>
                  <Button onClick={handlePrevStep}>
                    Back
                  </Button>
                  
                  {!aiResult && (
                    <AiAssistButton 
                      onClick={handleAiAssist}
                      disabled={!negativeThought.trim()}
                    >
                      <span className="ai-icon">🧠</span>
                      AI Assist
                    </AiAssistButton>
                  )}
                  
                  <Button 
                    variant="primary" 
                    onClick={handleNextStep}
                    disabled={!isStepComplete(3)}
                  >
                    Complete
                  </Button>
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
              <div className="thought-pattern">
                Patterns: {getSelectedPatternNames()}
              </div>
              
              {aiResult && (
                <>
                  <EvidenceSection type="for">
                    <h5>Evidence Supporting:</h5>
                    <ul>
                      {aiResult.evidence_for.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </EvidenceSection>
                </>
              )}
            </ThoughtBox>
            
            <ThoughtBox type="after">
              <div className="thought-header">Reframed Thought</div>
              <div className="thought-content">
                {aiResult ? aiResult.balanced_reframe : reframedThought}
              </div>
              
              {aiResult && (
                <>
                  <EvidenceSection type="against">
                    <h5>Evidence Against:</h5>
                    <ul>
                      {aiResult.evidence_against.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </EvidenceSection>
                  
                  {aiResult.tiny_action && (
                    <TinyAction>
                      <div className="action-header">Next Step:</div>
                      <div className="action-content">{aiResult.tiny_action}</div>
                    </TinyAction>
                  )}
                </>
              )}
            </ThoughtBox>
          </BeforeAfterContainer>
          
          {aiResult && aiResult.safety_note && (
            <SafetyNote>
              <div className="note-header">Important Note:</div>
              <div className="note-content">{aiResult.safety_note}</div>
            </SafetyNote>
          )}
          
          <ResetButton onClick={handleReset}>
            Create New Reframe
          </ResetButton>
        </CompletedView>
      )}
    </ForgeContainer>
  );
};

export default ReframeForge;