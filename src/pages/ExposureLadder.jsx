import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import { generateExposureLadder } from '../services/exposureLadderClient';

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

const CreateSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .hint {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: 0.25rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
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

const LadderDisplay = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-top: 2rem;
`;

const LadderTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const LadderSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StepCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1.5rem;
  border: 2px solid ${({ theme, completed }) => 
    completed ? theme.colors.status.success : theme.colors.secondary};
  position: relative;
  
  &::before {
    content: '${({ stepNumber }) => stepNumber}';
    position: absolute;
    top: -12px;
    left: 1rem;
    background-color: ${({ theme, completed }) => 
      completed ? theme.colors.status.success : theme.colors.accent};
    color: ${({ theme }) => theme.colors.background.dark};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StepTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  flex: 1;
`;

const AnxietyBadge = styled.span`
  padding: 0.25rem 0.75rem;
  background-color: ${({ level, theme }) => {
    if (level <= 3) return 'rgba(77, 126, 62, 0.2)';
    if (level <= 6) return 'rgba(199, 167, 88, 0.2)';
    return 'rgba(138, 3, 3, 0.2)';
  }};
  color: ${({ level, theme }) => {
    if (level <= 3) return theme.colors.status.success;
    if (level <= 6) return theme.colors.accent;
    return theme.colors.status.error;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.85rem;
  font-weight: 600;
`;

const StepDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const StepDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const DetailItem = styled.div`
  .label {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  span {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotesSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1.5rem;
  margin-top: 2rem;
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
  
  h3 {
    font-size: 1.1rem;
    margin: 0 0 0.75rem 0;
    color: ${({ theme }) => theme.colors.accent};
  }
  
  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin: 0;
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

const ExposureLadder = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fearTitle, setFearTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLadder, setCurrentLadder] = useState(null);
  const [ladders, setLadders] = useState([]);
  const [loadingLadders, setLoadingLadders] = useState(true);

  useEffect(() => {
    loadLadders();
  }, [user]);

  const loadLadders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('exposure_ladders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLadders(data || []);
      
      // Load the most recent ladder if available
      if (data && data.length > 0) {
        setCurrentLadder(data[0]);
      }
    } catch (error) {
      console.error('Error loading ladders:', error);
      showToast('Failed to load ladders', 'error');
    } finally {
      setLoadingLadders(false);
    }
  };

  const handleGenerate = async () => {
    if (!fearTitle.trim()) {
      showToast('Please enter your fear', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await generateExposureLadder(fearTitle, goal, constraints);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setCurrentLadder(response);
      showToast('Exposure ladder created!', 'success');
      
      // Reload ladders
      await loadLadders();
      
      // Clear form
      setFearTitle('');
      setGoal('');
      setConstraints('');
    } catch (error) {
      console.error('Error generating ladder:', error);
      showToast(error.message || 'Failed to generate ladder. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepId, completed) => {
    if (!currentLadder) return;

    try {
      const updatedSteps = currentLadder.steps.map(step => 
        step.id === stepId ? { ...step, completed } : step
      );

      const { error } = await supabase
        .from('exposure_ladders')
        .update({ steps: updatedSteps })
        .eq('id', currentLadder.id);

      if (error) throw error;

      setCurrentLadder({ ...currentLadder, steps: updatedSteps });
      showToast(completed ? 'Step completed! 🎉' : 'Step unmarked', 'success');
    } catch (error) {
      console.error('Error updating step:', error);
      showToast('Failed to update step', 'error');
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>🪜 Exposure Ladder</PageTitle>
        <PageDescription>
          Create a personalized exposure ladder to gradually face your fears using evidence-based exposure therapy techniques. 
          Our AI will help you build a step-by-step plan with manageable challenges that increase in difficulty.
        </PageDescription>
      </PageHeader>

      <CreateSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Create New Ladder
        </h2>
        
        <FormGroup>
          <label htmlFor="fear">What are you afraid of? *</label>
          <Input
            id="fear"
            type="text"
            value={fearTitle}
            onChange={(e) => setFearTitle(e.target.value)}
            placeholder="Example: Public speaking, dogs, heights, social situations..."
            disabled={loading}
          />
          <div className="hint">Be specific about what triggers your anxiety</div>
        </FormGroup>

        <FormGroup>
          <label htmlFor="goal">What's your goal?</label>
          <Input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: Give a presentation at work, pet a friendly dog..."
            disabled={loading}
          />
          <div className="hint">What would you like to be able to do?</div>
        </FormGroup>

        <FormGroup>
          <label htmlFor="constraints">Any constraints or context?</label>
          <TextArea
            id="constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Example: I live in a city with many dogs, I need to present quarterly reports..."
            disabled={loading}
          />
          <div className="hint">Share any relevant details that might help tailor the ladder</div>
        </FormGroup>

        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={loading || !fearTitle.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Generating...' : '🤖 Generate Ladder'}
        </Button>
      </CreateSection>

      {loading && <LoadingSpinner />}

      {currentLadder && !loading && (
        <LadderDisplay
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LadderTitle>📊 Your Exposure Ladder: {currentLadder.fear_title}</LadderTitle>
          
          {currentLadder.goal && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              <strong>Goal:</strong> {currentLadder.goal}
            </p>
          )}

          <LadderSteps>
            {currentLadder.steps && currentLadder.steps.map((step, index) => (
              <StepCard
                key={step.id || index}
                stepNumber={index + 1}
                completed={step.completed}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StepHeader>
                  <StepTitle>{step.title}</StepTitle>
                  <AnxietyBadge level={step.anxietyLevel}>
                    Anxiety: {step.anxietyLevel}/10
                  </AnxietyBadge>
                </StepHeader>

                {step.description && (
                  <StepDescription>{step.description}</StepDescription>
                )}

                <StepDetails>
                  {step.prep && (
                    <DetailItem>
                      <div className="label">Preparation</div>
                      <div className="value">{step.prep}</div>
                    </DetailItem>
                  )}
                  
                  {step.duration && (
                    <DetailItem>
                      <div className="label">Duration</div>
                      <div className="value">{step.duration} minutes</div>
                    </DetailItem>
                  )}
                  
                  {step.success && (
                    <DetailItem>
                      <div className="label">Success Criteria</div>
                      <div className="value">{step.success}</div>
                    </DetailItem>
                  )}
                </StepDetails>

                <CheckboxContainer>
                  <input
                    type="checkbox"
                    checked={step.completed || false}
                    onChange={(e) => handleStepComplete(step.id, e.target.checked)}
                  />
                  <span>Mark as completed</span>
                </CheckboxContainer>
              </StepCard>
            ))}
          </LadderSteps>

          {currentLadder.ai_notes && (
            <NotesSection>
              <h3>💡 Guidance & Tips</h3>
              <p>{currentLadder.ai_notes}</p>
            </NotesSection>
          )}

          {currentLadder.safety_note && (
            <NotesSection style={{ borderLeftColor: '#ff6b6b' }}>
              <h3>⚠️ Safety Note</h3>
              <p style={{ color: '#ff6b6b' }}>{currentLadder.safety_note}</p>
            </NotesSection>
          )}
        </LadderDisplay>
      )}
    </PageContainer>
  );
};

export default ExposureLadder;