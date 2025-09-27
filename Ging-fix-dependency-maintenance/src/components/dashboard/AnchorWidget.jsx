import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AnchorContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const AnchorTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .anchor-icon {
    font-size: 1rem;
  }
`;

const AnchorDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const TechniqueSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const TechniqueButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.accent : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, active }) => 
      active ? theme.colors.background.dark : theme.colors.accent};
  }
`;

const SensesExercise = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SenseStep = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const SenseNumber = styled.div`
  width: 2rem;
  height: 2rem;
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
`;

const SenseContent = styled.div`
  flex: 1;
  
  .sense-label {
    font-size: 1rem;
    color: ${({ theme, completed }) => 
      completed ? theme.colors.status.success : theme.colors.text.primary};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .sense-icon {
      font-size: 1.2rem;
    }
  }
  
  .sense-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const InputField = styled.input`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  input {
    flex: 1;
  }
`;

const MantraExercise = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MantraInput = styled.textarea`
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

const MantraSuggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MantraSuggestion = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(199, 167, 88, 0.1);
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const BreathingExercise = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const BreathingCircle = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.colors.accent};
    opacity: 0.5;
  }
`;

const BreathingInnerCircle = styled.div`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accent};
  opacity: 0.7;
  transition: all 4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.background.dark};
  font-weight: 600;
  font-size: 1.2rem;
`;

const BreathingInstructions = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const BreathingControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const BreathingButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.accent : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, active }) => 
      active ? theme.colors.background.dark : theme.colors.accent};
  }
`;

const AnchorWidget = () => {
  const [activeTechnique, setActiveTechnique] = useState('senses');
  const [senseInputs, setSenseInputs] = useState({
    see: ['', '', '', '', ''],
    feel: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });
  const [mantra, setMantra] = useState('');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [circleSize, setCircleSize] = useState(50);
  
  // Check if a sense step is completed
  const isSenseCompleted = (sense) => {
    return senseInputs[sense].every(input => input.trim() !== '');
  };
  
  // Handle input change for senses
  const handleSenseInputChange = (sense, index, value) => {
    const newInputs = { ...senseInputs };
    newInputs[sense][index] = value;
    setSenseInputs(newInputs);
  };
  
  // Handle mantra suggestion click
  const handleMantraSuggestion = (suggestion) => {
    setMantra(suggestion);
  };
  
  // Toggle breathing exercise
  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setCircleSize(50);
    } else {
      setIsBreathing(true);
      startBreathingCycle();
    }
  };
  
  // Start breathing cycle
  const startBreathingCycle = () => {
    setBreathingPhase('inhale');
    setCircleSize(150);
    
    setTimeout(() => {
      setBreathingPhase('hold');
      
      setTimeout(() => {
        setBreathingPhase('exhale');
        setCircleSize(50);
        
        setTimeout(() => {
          if (isBreathing) {
            startBreathingCycle();
          }
        }, 4000); // Exhale for 4 seconds
      }, 2000); // Hold for 2 seconds
    }, 4000); // Inhale for 4 seconds
  };
  
  // Mantra suggestions
  const mantraSuggestions = [
    'I am safe in this moment',
    'This feeling will pass',
    'I am grounded and centered',
    'I am in control of my thoughts',
    'I breathe in calm, I breathe out tension'
  ];
  
  return (
    <AnchorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnchorTitle>
        <span className="anchor-icon">⚓</span>
        Anchor - Grounding Exercises
      </AnchorTitle>
      
      <AnchorDescription>
        Use these grounding techniques when feeling overwhelmed or anxious to bring yourself back to the present moment.
      </AnchorDescription>
      
      <TechniqueSelector>
        <TechniqueButton 
          active={activeTechnique === 'senses'} 
          onClick={() => setActiveTechnique('senses')}
        >
          5-4-3-2-1 Senses
        </TechniqueButton>
        <TechniqueButton 
          active={activeTechnique === 'mantra'} 
          onClick={() => setActiveTechnique('mantra')}
        >
          Mantra Repetition
        </TechniqueButton>
        <TechniqueButton 
          active={activeTechnique === 'breathing'} 
          onClick={() => setActiveTechnique('breathing')}
        >
          Deep Breathing
        </TechniqueButton>
      </TechniqueSelector>
      
      {activeTechnique === 'senses' && (
        <SensesExercise>
          <SenseStep>
            <SenseNumber completed={isSenseCompleted('see')}>5</SenseNumber>
            <SenseContent completed={isSenseCompleted('see')}>
              <div className="sense-label">
                <span className="sense-icon">👁️</span>
                <span>Things you can SEE</span>
              </div>
              <div className="sense-input">
                {senseInputs.see.map((input, index) => (
                  <InputField 
                    key={index}
                    value={input}
                    onChange={(e) => handleSenseInputChange('see', index, e.target.value)}
                    placeholder={`Something you can see...`}
                  />
                ))}
              </div>
            </SenseContent>
          </SenseStep>
          
          <SenseStep>
            <SenseNumber completed={isSenseCompleted('feel')}>4</SenseNumber>
            <SenseContent completed={isSenseCompleted('feel')}>
              <div className="sense-label">
                <span className="sense-icon">👋</span>
                <span>Things you can FEEL</span>
              </div>
              <div className="sense-input">
                {senseInputs.feel.map((input, index) => (
                  <InputField 
                    key={index}
                    value={input}
                    onChange={(e) => handleSenseInputChange('feel', index, e.target.value)}
                    placeholder={`Something you can feel...`}
                  />
                ))}
              </div>
            </SenseContent>
          </SenseStep>
          
          <SenseStep>
            <SenseNumber completed={isSenseCompleted('hear')}>3</SenseNumber>
            <SenseContent completed={isSenseCompleted('hear')}>
              <div className="sense-label">
                <span className="sense-icon">👂</span>
                <span>Things you can HEAR</span>
              </div>
              <div className="sense-input">
                {senseInputs.hear.map((input, index) => (
                  <InputField 
                    key={index}
                    value={input}
                    onChange={(e) => handleSenseInputChange('hear', index, e.target.value)}
                    placeholder={`Something you can hear...`}
                  />
                ))}
              </div>
            </SenseContent>
          </SenseStep>
          
          <SenseStep>
            <SenseNumber completed={isSenseCompleted('smell')}>2</SenseNumber>
            <SenseContent completed={isSenseCompleted('smell')}>
              <div className="sense-label">
                <span className="sense-icon">👃</span>
                <span>Things you can SMELL</span>
              </div>
              <div className="sense-input">
                {senseInputs.smell.map((input, index) => (
                  <InputField 
                    key={index}
                    value={input}
                    onChange={(e) => handleSenseInputChange('smell', index, e.target.value)}
                    placeholder={`Something you can smell...`}
                  />
                ))}
              </div>
            </SenseContent>
          </SenseStep>
          
          <SenseStep>
            <SenseNumber completed={isSenseCompleted('taste')}>1</SenseNumber>
            <SenseContent completed={isSenseCompleted('taste')}>
              <div className="sense-label">
                <span className="sense-icon">👅</span>
                <span>Thing you can TASTE</span>
              </div>
              <div className="sense-input">
                {senseInputs.taste.map((input, index) => (
                  <InputField 
                    key={index}
                    value={input}
                    onChange={(e) => handleSenseInputChange('taste', index, e.target.value)}
                    placeholder={`Something you can taste...`}
                  />
                ))}
              </div>
            </SenseContent>
          </SenseStep>
        </SensesExercise>
      )}
      
      {activeTechnique === 'mantra' && (
        <MantraExercise>
          <div>
            <h4>Select a calming mantra or create your own:</h4>
            <MantraSuggestions>
              {mantraSuggestions.map((suggestion, index) => (
                <MantraSuggestion 
                  key={index}
                  onClick={() => handleMantraSuggestion(suggestion)}
                >
                  {suggestion}
                </MantraSuggestion>
              ))}
            </MantraSuggestions>
          </div>
          
          <MantraInput 
            value={mantra}
            onChange={(e) => setMantra(e.target.value)}
            placeholder="Enter your mantra here..."
          />
          
          {mantra && (
            <div style={{ textAlign: 'center' }}>
              <p>Repeat your mantra slowly, focusing on each word:</p>
              <h2 style={{ 
                color: '#C7A758', 
                margin: '1.5rem 0', 
                fontFamily: 'Cinzel, serif',
                fontSize: '1.8rem',
                lineHeight: '1.5'
              }}>
                "{mantra}"
              </h2>
              <p>Take deep breaths between repetitions.</p>
            </div>
          )}
        </MantraExercise>
      )}
      
      {activeTechnique === 'breathing' && (
        <BreathingExercise>
          <BreathingCircle>
            <BreathingInnerCircle size={circleSize}>
              {breathingPhase === 'inhale' ? 'Inhale' : 
               breathingPhase === 'hold' ? 'Hold' : 'Exhale'}
            </BreathingInnerCircle>
          </BreathingCircle>
          
          <BreathingInstructions>
            {isBreathing ? (
              breathingPhase === 'inhale' ? 'Breathe in slowly...' : 
              breathingPhase === 'hold' ? 'Hold your breath...' : 
              'Breathe out slowly...'
            ) : (
              'Press Start to begin the breathing exercise'
            )}
          </BreathingInstructions>
          
          <BreathingControls>
            <BreathingButton 
              active={isBreathing} 
              onClick={toggleBreathing}
            >
              {isBreathing ? 'Stop' : 'Start'}
            </BreathingButton>
          </BreathingControls>
        </BreathingExercise>
      )}
    </AnchorContainer>
  );
};

export default AnchorWidget;