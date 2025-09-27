import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { generateExposureLadder } from '../../services/exposureLadderClient';

const LadderContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
`;

const LadderTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .ladder-icon {
    font-size: 1rem;
  }
`;

const LadderDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const FearTitle = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .edit-button {
    font-size: 0.9rem;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FearInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const LadderSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const LadderStep = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme, active, completed }) => 
    completed ? 'rgba(77, 126, 62, 0.1)' : 
    active ? 'rgba(199, 167, 88, 0.1)' : 
    theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme, active, completed }) => 
    completed ? theme.colors.status.success : 
    active ? theme.colors.accent : 
    theme.colors.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, completed }) => 
      completed ? 'rgba(77, 126, 62, 0.15)' : 'rgba(199, 167, 88, 0.15)'};
  }
`;

const StepNumber = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ theme, active, completed }) => 
    completed ? 'rgba(77, 126, 62, 0.2)' : 
    active ? 'rgba(199, 167, 88, 0.2)' : 
    'rgba(61, 61, 61, 0.3)'};
  color: ${({ theme, active, completed }) => 
    completed ? theme.colors.status.success : 
    active ? theme.colors.accent : 
    theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.primary};
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
  
  .step-description {
    font-size: 0.9rem;
    color: ${({ theme, completed }) => 
      completed ? theme.colors.status.success : theme.colors.text.primary};
    margin-bottom: ${({ hasAnxiety }) => hasAnxiety ? '0.5rem' : '0'};
  }
  
  .step-anxiety {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  .step-details {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const StepActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.muted};
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
    
    &.complete-button {
      color: ${({ theme, completed }) => 
        completed ? theme.colors.status.success : theme.colors.text.muted};
        
      &:hover {
        color: ${({ theme, completed }) => 
          completed ? theme.colors.status.success : theme.colors.status.success};
      }
    }
  }
`;

const AddStepButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
  
  .add-icon {
    font-size: 1.2rem;
  }
`;

const StepForm = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.medium};
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
`;

const AnxietySlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .slider {
      flex: 1;
      -webkit-appearance: none;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, 
        ${({ theme }) => theme.colors.status.success}, 
        ${({ theme }) => theme.colors.accent}, 
        ${({ theme }) => theme.colors.status.danger}
      );
      outline: none;
      
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.text.primary};
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.accent};
      }
    }
    
    .slider-value {
      width: 40px;
      text-align: center;
      font-weight: 600;
      color: ${({ theme, value }) => 
        value <= 3 ? theme.colors.status.success : 
        value <= 7 ? theme.colors.accent : 
        theme.colors.status.danger};
    }
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.background.dark : theme.colors.accent};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ progress }) => `${progress}%`};
  background-color: ${({ theme }) => theme.colors.accent};
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
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

const AiGenerateForm = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const AiButton = styled(Button)`
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.background.dark : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .ai-icon {
    font-size: 1rem;
  }
`;

const NotesSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(199, 167, 88, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  
  h5 {
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.accent};
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const SafetyNote = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(138, 3, 3, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  
  h5 {
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const StepDetails = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  
  .detail-item {
    display: flex;
    margin-bottom: 0.5rem;
    
    .detail-label {
      width: 100px;
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.muted};
      flex-shrink: 0;
    }
    
    .detail-value {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

// Sample data for a fear ladder
const initialLadderSteps = [
  {
    id: 1,
    title: 'Looking at pictures of spiders online',
    description: 'Browse through images of small spiders on websites',
    anxietyLevel: 3,
    completed: true,
    prep: 'Practice deep breathing for 1 minute before starting',
    duration: 5,
    success: 'Can view all images without looking away'
  },
  {
    id: 2,
    title: 'Watching videos of spiders',
    description: 'Watch short nature videos featuring spiders',
    anxietyLevel: 5,
    completed: false,
    prep: 'Remind yourself that you\'re safe and can stop anytime',
    duration: 10,
    success: 'Complete watching without pausing or muting'
  },
  {
    id: 3,
    title: 'Being in the same room as a spider in a closed container',
    description: 'Have someone place a small spider in a sealed jar in the room',
    anxietyLevel: 7,
    completed: false,
    prep: 'Use positive self-talk: "I am safe, it cannot reach me"',
    duration: 15,
    success: 'Remain in the room for the full duration'
  },
  {
    id: 4,
    title: 'Being in the same room as a free spider',
    description: 'Stay in a room where a small spider is visible but at a distance',
    anxietyLevel: 9,
    completed: false,
    prep: 'Remind yourself that most spiders are harmless and avoid humans',
    duration: 20,
    success: 'Remain in room without attempting to leave or kill spider'
  },
  {
    id: 5,
    title: 'Holding a small spider in your hand',
    description: 'Allow a small, harmless spider to crawl on your hand',
    anxietyLevel: 10,
    completed: false,
    prep: 'Practice slow breathing and remind yourself that you are in control',
    duration: 1,
    success: 'Hold position for at least 30 seconds'
  }
];

const ExposureLadderWidget = () => {
  const [fear, setFear] = useState('Fear of Spiders');
  const [goal, setGoal] = useState('Be able to remain calm when encountering spiders');
  const [constraints, setConstraints] = useState('');
  const [editingFear, setEditingFear] = useState(false);
  const [ladderSteps, setLadderSteps] = useState(initialLadderSteps);
  const [activeStep, setActiveStep] = useState(2);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiForm, setShowAiForm] = useState(false);
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    anxietyLevel: 5,
    prep: '',
    duration: 10,
    success: ''
  });
  const [editingStepId, setEditingStepId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [safetyNote, setSafetyNote] = useState('');
  const [expandedStepId, setExpandedStepId] = useState(null);
  
  // Calculate progress
  const completedSteps = ladderSteps.filter(step => step.completed).length;
  const progress = (completedSteps / ladderSteps.length) * 100;
  
  // Handle step completion toggle
  const toggleStepCompletion = (id) => {
    setLadderSteps(ladderSteps.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };
  
  // Handle step edit
  const handleEditStep = (step) => {
    setNewStep({
      title: step.title,
      description: step.description,
      anxietyLevel: step.anxietyLevel,
      prep: step.prep || '',
      duration: step.duration || 10,
      success: step.success || ''
    });
    setEditingStepId(step.id);
    setShowAddForm(true);
  };
  
  // Handle step delete
  const handleDeleteStep = (id) => {
    setLadderSteps(ladderSteps.filter(step => step.id !== id));
  };
  
  // Handle form submission
  const handleSubmitStep = (e) => {
    e.preventDefault();
    
    if (newStep.title.trim() === '') return;
    
    if (editingStepId) {
      // Update existing step
      setLadderSteps(ladderSteps.map(step => 
        step.id === editingStepId ? { 
          ...step, 
          title: newStep.title,
          description: newStep.description,
          anxietyLevel: newStep.anxietyLevel,
          prep: newStep.prep,
          duration: newStep.duration,
          success: newStep.success
        } : step
      ));
      setEditingStepId(null);
    } else {
      // Add new step
      const newId = Math.max(0, ...ladderSteps.map(step => step.id)) + 1;
      setLadderSteps([...ladderSteps, {
        id: newId,
        title: newStep.title,
        description: newStep.description,
        anxietyLevel: newStep.anxietyLevel,
        completed: false,
        prep: newStep.prep,
        duration: newStep.duration,
        success: newStep.success
      }]);
    }
    
    // Reset form
    setNewStep({
      title: '',
      description: '',
      anxietyLevel: 5,
      prep: '',
      duration: 10,
      success: ''
    });
    setShowAddForm(false);
  };
  
  // Cancel form
  const handleCancelForm = () => {
    setNewStep({
      title: '',
      description: '',
      anxietyLevel: 5,
      prep: '',
      duration: 10,
      success: ''
    });
    setEditingStepId(null);
    setShowAddForm(false);
  };
  
  // Generate ladder with AI
  const handleGenerateLadder = async () => {
    if (!fear.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateExposureLadder(fear, goal, constraints);
      
      if (result.ladder && result.ladder.length > 0) {
        // Transform the AI response into our ladder step format
        const newSteps = result.ladder.map((step, index) => ({
          id: index + 1,
          title: step.title,
          description: step.action,
          anxietyLevel: step.suds_start,
          completed: false,
          prep: step.prep,
          duration: step.duration_min,
          success: step.success_criteria,
          suds_target: step.suds_target
        }));
        
        setLadderSteps(newSteps);
        setAiNotes(result.notes || '');
        setSafetyNote(result.safety_note || '');
        setActiveStep(1);
      }
      
      setShowAiForm(false);
    } catch (error) {
      console.error('Error generating ladder:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle step details
  const toggleStepDetails = (id) => {
    if (expandedStepId === id) {
      setExpandedStepId(null);
    } else {
      setExpandedStepId(id);
    }
  };
  
  return (
    <LadderContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      
      <LadderTitle>
        <span className="ladder-icon">🪜</span>
        Exposure Ladder
      </LadderTitle>
      
      <LadderDescription>
        Break down your fear into manageable steps. Start with the least anxiety-provoking step and work your way up.
      </LadderDescription>
      
      {editingFear ? (
        <FearInput 
          value={fear}
          onChange={(e) => setFear(e.target.value)}
          onBlur={() => setEditingFear(false)}
          onKeyPress={(e) => e.key === 'Enter' && setEditingFear(false)}
          autoFocus
        />
      ) : (
        <FearTitle>
          {fear}
          <button className="edit-button" onClick={() => setEditingFear(true)}>
            Edit
          </button>
        </FearTitle>
      )}
      
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>
      <ProgressText>
        {completedSteps} of {ladderSteps.length} steps completed ({Math.round(progress)}%)
      </ProgressText>
      
      <ButtonGroup style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
        <AiButton 
          variant="primary"
          onClick={() => setShowAiForm(!showAiForm)}
        >
          <span className="ai-icon">🧠</span>
          Generate with AI
        </AiButton>
      </ButtonGroup>
      
      {showAiForm && (
        <AiGenerateForm>
          <h4>Generate Exposure Ladder with AI</h4>
          <FormGroup>
            <Label htmlFor="fear-input">What are you afraid of?</Label>
            <Input 
              id="fear-input"
              value={fear}
              onChange={(e) => setFear(e.target.value)}
              placeholder="e.g., Fear of public speaking"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="goal-input">What's your goal? (optional)</Label>
            <Input 
              id="goal-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Be able to give presentations comfortably"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="constraints-input">Any constraints or context? (optional)</Label>
            <TextArea 
              id="constraints-input"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g., I need to give a presentation at work in 3 weeks"
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button onClick={() => setShowAiForm(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleGenerateLadder}
              disabled={!fear.trim()}
            >
              Generate Ladder
            </Button>
          </ButtonGroup>
        </AiGenerateForm>
      )}
      
      {aiNotes && (
        <NotesSection>
          <h5>Notes:</h5>
          <p>{aiNotes}</p>
        </NotesSection>
      )}
      
      {safetyNote && (
        <SafetyNote>
          <h5>Safety Note:</h5>
          <p>{safetyNote}</p>
        </SafetyNote>
      )}
      
      <LadderSteps>
        {ladderSteps
          .sort((a, b) => a.anxietyLevel - b.anxietyLevel)
          .map(step => (
            <LadderStep 
              key={step.id}
              active={activeStep === step.id}
              completed={step.completed}
              onClick={() => setActiveStep(step.id)}
            >
              <StepNumber 
                active={activeStep === step.id}
                completed={step.completed}
              >
                {step.completed ? '✓' : step.anxietyLevel}
              </StepNumber>
              <StepContent 
                completed={step.completed}
                hasAnxiety={!step.completed}
              >
                <div className="step-description">{step.title}</div>
                {!step.completed && (
                  <div className="step-anxiety">
                    Anxiety Level: {step.anxietyLevel}/10
                    {step.suds_target && ` → Target: ${step.suds_target}/10`}
                  </div>
                )}
                {step.description && (
                  <div className="step-details">
                    {step.description}
                    <button 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#C7A758', 
                        fontSize: '0.8rem',
                        padding: '0 0 0 0.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepDetails(step.id);
                      }}
                    >
                      {expandedStepId === step.id ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                )}
                
                {expandedStepId === step.id && (
                  <StepDetails>
                    {step.prep && (
                      <div className="detail-item">
                        <div className="detail-label">Preparation:</div>
                        <div className="detail-value">{step.prep}</div>
                      </div>
                    )}
                    {step.duration && (
                      <div className="detail-item">
                        <div className="detail-label">Duration:</div>
                        <div className="detail-value">{step.duration} minutes</div>
                      </div>
                    )}
                    {step.success && (
                      <div className="detail-item">
                        <div className="detail-label">Success when:</div>
                        <div className="detail-value">{step.success}</div>
                      </div>
                    )}
                  </StepDetails>
                )}
              </StepContent>
              <StepActions>
                <button 
                  className="complete-button"
                  title={step.completed ? "Mark as incomplete" : "Mark as complete"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompletion(step.id);
                  }}
                >
                  {step.completed ? '✓' : '○'}
                </button>
                <button 
                  title="Edit step"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStep(step);
                  }}
                >
                  ✎
                </button>
                <button 
                  title="Delete step"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.id);
                  }}
                >
                  🗑️
                </button>
              </StepActions>
            </LadderStep>
          ))}
      </LadderSteps>
      
      {showAddForm ? (
        <StepForm>
          <h4>{editingStepId ? 'Edit Step' : 'Add New Step'}</h4>
          <form onSubmit={handleSubmitStep}>
            <FormGroup>
              <Label htmlFor="step-title">Step Title</Label>
              <Input 
                id="step-title"
                value={newStep.title}
                onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                placeholder="Brief title for this step..."
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="step-description">Description (optional)</Label>
              <TextArea 
                id="step-description"
                value={newStep.description}
                onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                placeholder="Describe what you'll do in this step..."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="anxiety-level">Anxiety Level (1-10)</Label>
              <AnxietySlider value={newStep.anxietyLevel}>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newStep.anxietyLevel}
                    onChange={(e) => setNewStep({...newStep, anxietyLevel: parseInt(e.target.value)})}
                    className="slider"
                  />
                  <div className="slider-value">{newStep.anxietyLevel}</div>
                </div>
                <div className="slider-labels">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </AnxietySlider>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="step-prep">Preparation (optional)</Label>
              <Input 
                id="step-prep"
                value={newStep.prep}
                onChange={(e) => setNewStep({...newStep, prep: e.target.value})}
                placeholder="How will you prepare for this step?"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="step-duration">Duration (minutes)</Label>
              <Input 
                id="step-duration"
                type="number"
                min="1"
                value={newStep.duration}
                onChange={(e) => setNewStep({...newStep, duration: parseInt(e.target.value)})}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="step-success">Success Criteria (optional)</Label>
              <Input 
                id="step-success"
                value={newStep.success}
                onChange={(e) => setNewStep({...newStep, success: e.target.value})}
                placeholder="How will you know you've succeeded?"
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button type="button" onClick={handleCancelForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingStepId ? 'Update Step' : 'Add Step'}
              </Button>
            </ButtonGroup>
          </form>
        </StepForm>
      ) : (
        <AddStepButton onClick={() => setShowAddForm(true)}>
          <span className="add-icon">+</span>
          <span>Add New Step</span>
        </AddStepButton>
      )}
    </LadderContainer>
  );
};

export default ExposureLadderWidget;