import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import { suggestAnchors } from '../services/anchorClient';

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

const TechniqueSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TechniqueButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.accent : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, active }) => 
      active ? theme.colors.background.dark : theme.colors.accent};
  }
`;

const ExerciseContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ExerciseTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const ExerciseDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
`;

// 5-4-3-2-1 Senses Exercise
const SensesExercise = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SenseStep = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const SenseNumber = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: ${({ theme, completed }) => 
    completed ? 'rgba(77, 126, 62, 0.2)' : 'rgba(199, 167, 88, 0.1)'};
  color: ${({ theme, completed }) => 
    completed ? theme.colors.status.success : theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.primary};
  flex-shrink: 0;
  font-size: 1.2rem;
`;

const SenseContent = styled.div`
  flex: 1;
  
  .sense-label {
    font-size: 1.1rem;
    color: ${({ theme, completed }) => 
      completed ? theme.colors.status.success : theme.colors.text.primary};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    
    .sense-icon {
      font-size: 1.3rem;
    }
  }
  
  .sense-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const InputField = styled.input`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

// Mantra Exercise
const MantraExercise = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MantraInput = styled.textarea`
  width: 100%;
  min-height: 100px;
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

const MantraDisplay = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  text-align: center;
  
  .mantra-text {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
    line-height: 1.8;
    font-weight: 500;
  }
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SuggestionItem = styled(motion.button)`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: rgba(199, 167, 88, 0.1);
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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

const Anchor = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTechnique, setActiveTechnique] = useState('senses');
  
  // 5-4-3-2-1 Senses state
  const [senses, setSenses] = useState({
    see: ['', '', '', '', ''],
    touch: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });
  
  // Mantra state
  const [mantraText, setMantraText] = useState('');
  const [currentMantra, setCurrentMantra] = useState('');
  const [mantraSuggestions, setMantraSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSenseChange = (sense, index, value) => {
    setSenses(prev => ({
      ...prev,
      [sense]: prev[sense].map((item, i) => i === index ? value : item)
    }));
  };

  const isSenseComplete = (sense) => {
    return senses[sense].every(item => item.trim() !== '');
  };

  const handleSaveSenses = async () => {
    try {
      const { error } = await supabase
        .from('anchors')
        .insert({
          user_id: user.id,
          technique: '5-4-3-2-1',
          content: senses
        });

      if (error) throw error;
      
      showToast('Grounding exercise saved!', 'success');
      
      // Reset
      setSenses({
        see: ['', '', '', '', ''],
        touch: ['', '', '', ''],
        hear: ['', '', ''],
        smell: ['', ''],
        taste: ['']
      });
    } catch (error) {
      console.error('Error saving senses:', error);
      showToast('Failed to save exercise', 'error');
    }
  };

  const handleGetMantraSuggestions = async () => {
    if (!mantraText.trim()) {
      showToast('Please describe your situation first', 'error');
      return;
    }

    setLoadingSuggestions(true);

    try {
      const response = await suggestAnchors(mantraText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setMantraSuggestions(response.mantras || []);
      showToast('Suggestions generated!', 'success');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      showToast(error.message || 'Failed to get suggestions', 'error');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectMantra = (mantra) => {
    setCurrentMantra(mantra);
    showToast('Mantra selected!', 'success');
  };

  const handleSaveMantra = async () => {
    if (!currentMantra.trim()) {
      showToast('Please select or enter a mantra', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('anchors')
        .insert({
          user_id: user.id,
          technique: 'mantra',
          content: { mantra: currentMantra, context: mantraText }
        });

      if (error) throw error;
      
      showToast('Mantra saved!', 'success');
      
      // Reset
      setMantraText('');
      setCurrentMantra('');
      setMantraSuggestions([]);
    } catch (error) {
      console.error('Error saving mantra:', error);
      showToast('Failed to save mantra', 'error');
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>⚓ Anchor & Mantra</PageTitle>
        <PageDescription>
          Ground yourself in the present moment using proven mindfulness techniques. 
          Choose between the 5-4-3-2-1 senses exercise for immediate grounding or create 
          personalized mantras for ongoing support.
        </PageDescription>
      </PageHeader>

      <TechniqueSelector>
        <TechniqueButton
          active={activeTechnique === 'senses'}
          onClick={() => setActiveTechnique('senses')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          👁️ 5-4-3-2-1 Senses
        </TechniqueButton>
        <TechniqueButton
          active={activeTechnique === 'mantra'}
          onClick={() => setActiveTechnique('mantra')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🕉️ Mantra
        </TechniqueButton>
      </TechniqueSelector>

      {activeTechnique === 'senses' && (
        <ExerciseContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ExerciseTitle>5-4-3-2-1 Grounding Exercise</ExerciseTitle>
          <ExerciseDescription>
            This technique helps you ground yourself by focusing on your immediate sensory experience. 
            Take your time with each sense, and notice the details around you.
          </ExerciseDescription>

          <SensesExercise>
            <SenseStep>
              <SenseNumber completed={isSenseComplete('see')}>5</SenseNumber>
              <SenseContent completed={isSenseComplete('see')}>
                <div className="sense-label">
                  <span className="sense-icon">👁️</span>
                  <span>5 things you can SEE</span>
                </div>
                <div className="sense-input">
                  {senses.see.map((item, index) => (
                    <InputField
                      key={index}
                      value={item}
                      onChange={(e) => handleSenseChange('see', index, e.target.value)}
                      placeholder={`Thing ${index + 1} you can see...`}
                    />
                  ))}
                </div>
              </SenseContent>
            </SenseStep>

            <SenseStep>
              <SenseNumber completed={isSenseComplete('touch')}>4</SenseNumber>
              <SenseContent completed={isSenseComplete('touch')}>
                <div className="sense-label">
                  <span className="sense-icon">✋</span>
                  <span>4 things you can TOUCH</span>
                </div>
                <div className="sense-input">
                  {senses.touch.map((item, index) => (
                    <InputField
                      key={index}
                      value={item}
                      onChange={(e) => handleSenseChange('touch', index, e.target.value)}
                      placeholder={`Thing ${index + 1} you can touch...`}
                    />
                  ))}
                </div>
              </SenseContent>
            </SenseStep>

            <SenseStep>
              <SenseNumber completed={isSenseComplete('hear')}>3</SenseNumber>
              <SenseContent completed={isSenseComplete('hear')}>
                <div className="sense-label">
                  <span className="sense-icon">👂</span>
                  <span>3 things you can HEAR</span>
                </div>
                <div className="sense-input">
                  {senses.hear.map((item, index) => (
                    <InputField
                      key={index}
                      value={item}
                      onChange={(e) => handleSenseChange('hear', index, e.target.value)}
                      placeholder={`Thing ${index + 1} you can hear...`}
                    />
                  ))}
                </div>
              </SenseContent>
            </SenseStep>

            <SenseStep>
              <SenseNumber completed={isSenseComplete('smell')}>2</SenseNumber>
              <SenseContent completed={isSenseComplete('smell')}>
                <div className="sense-label">
                  <span className="sense-icon">👃</span>
                  <span>2 things you can SMELL</span>
                </div>
                <div className="sense-input">
                  {senses.smell.map((item, index) => (
                    <InputField
                      key={index}
                      value={item}
                      onChange={(e) => handleSenseChange('smell', index, e.target.value)}
                      placeholder={`Thing ${index + 1} you can smell...`}
                    />
                  ))}
                </div>
              </SenseContent>
            </SenseStep>

            <SenseStep>
              <SenseNumber completed={isSenseComplete('taste')}>1</SenseNumber>
              <SenseContent completed={isSenseComplete('taste')}>
                <div className="sense-label">
                  <span className="sense-icon">👅</span>
                  <span>1 thing you can TASTE</span>
                </div>
                <div className="sense-input">
                  {senses.taste.map((item, index) => (
                    <InputField
                      key={index}
                      value={item}
                      onChange={(e) => handleSenseChange('taste', index, e.target.value)}
                      placeholder="Thing you can taste..."
                    />
                  ))}
                </div>
              </SenseContent>
            </SenseStep>
          </SensesExercise>

          <ButtonGroup>
            <Button
              variant="primary"
              onClick={handleSaveSenses}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              💾 Save Exercise
            </Button>
          </ButtonGroup>
        </ExerciseContainer>
      )}

      {activeTechnique === 'mantra' && (
        <ExerciseContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ExerciseTitle>Personal Mantra</ExerciseTitle>
          <ExerciseDescription>
            Create a personal mantra to use during difficult moments. Our AI can suggest mantras 
            based on your situation, or you can create your own.
          </ExerciseDescription>

          <MantraExercise>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Describe your situation or what you need support with:
              </label>
              <MantraInput
                value={mantraText}
                onChange={(e) => setMantraText(e.target.value)}
                placeholder="Example: I'm feeling anxious about an upcoming presentation..."
              />
            </div>

            <ButtonGroup>
              <Button
                variant="primary"
                onClick={handleGetMantraSuggestions}
                disabled={loadingSuggestions || !mantraText.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loadingSuggestions ? 'Generating...' : '🤖 Get AI Suggestions'}
              </Button>
            </ButtonGroup>

            {loadingSuggestions && <LoadingSpinner />}

            {mantraSuggestions.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Suggested Mantras:</h3>
                <SuggestionsList>
                  {mantraSuggestions.map((mantra, index) => (
                    <SuggestionItem
                      key={index}
                      onClick={() => handleSelectMantra(mantra)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {mantra}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              </div>
            )}

            {currentMantra && (
              <MantraDisplay
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mantra-text">"{currentMantra}"</div>
              </MantraDisplay>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Or create your own mantra:
              </label>
              <MantraInput
                value={currentMantra}
                onChange={(e) => setCurrentMantra(e.target.value)}
                placeholder="Example: I am capable and prepared. I can handle this challenge."
                style={{ minHeight: '80px' }}
              />
            </div>

            <ButtonGroup>
              <Button
                variant="primary"
                onClick={handleSaveMantra}
                disabled={!currentMantra.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                💾 Save Mantra
              </Button>
            </ButtonGroup>
          </MantraExercise>
        </ExerciseContainer>
      )}
    </PageContainer>
  );
};

export default Anchor;