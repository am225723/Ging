import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LockContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  max-width: 500px;
  margin: 0 auto;
`;

const LockTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.evo.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  text-align: center;
`;

const LockDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
`;

const ShifterContainer = styled.div`
  position: relative;
  width: 280px;
  height: 350px;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #1A1A1A, #2A2A2A);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 2px solid #333333;
  padding: 1.5rem;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
`;

const ShifterBase = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at center, #444444, #222222);
  border-radius: 50%;
  border: 3px solid #555555;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle at center, #333333, #111111);
    border-radius: 50%;
    border: 2px solid #555555;
  }
`;

const ShifterKnob = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle at center, #1E3264, #0A1A40);
  border-radius: 50%;
  border: 2px solid #CCCCCC;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(30, 50, 100, 0.7);
  
  &:hover {
    background: radial-gradient(circle at center, #2A4280, #1E3264);
    box-shadow: 0 0 15px rgba(30, 50, 100, 0.9);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: radial-gradient(circle at center, #CCCCCC, #AAAAAA);
    border-radius: 50%;
    border: 1px solid #DDDDDD;
  }
`;

const ShifterGate = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
`;

const ShifterPattern = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 100px;
  pointer-events: none;
  
  .pattern-line {
    position: absolute;
    background-color: rgba(204, 204, 204, 0.2);
    height: 4px;
    border-radius: 2px;
  }
  
  .vertical-line {
    width: 4px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .horizontal-line {
    width: 100%;
    height: 4px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const GearPosition = styled.div`
  position: relative;
  background-color: ${({ theme, active, completed }) => 
    completed ? 'rgba(77, 126, 62, 0.3)' : 
    active ? 'rgba(30, 50, 100, 0.3)' : 
    'rgba(61, 61, 61, 0.3)'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme, active, completed }) => 
    completed ? theme.colors.status.success : 
    active ? theme.colors.evo.primary : 
    theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  
  &:hover {
    background-color: rgba(30, 50, 100, 0.2);
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.7);
  }
  
  .gear-number {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme, active, completed }) => 
      completed ? theme.colors.status.success : 
      active ? theme.colors.evo.primary : 
      theme.colors.text.secondary};
    font-family: ${({ theme }) => theme.fonts.primary};
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
`;

const ShifterLabel = styled.div`
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #AAAAAA;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
`;

const SequenceDisplay = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SequenceStep = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme, active, completed }) => 
    completed ? theme.colors.status.success : 
    active ? theme.colors.evo.primary : 
    theme.colors.background.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-weight: 600;
  border: 2px solid ${({ theme, active, completed }) => 
    completed ? theme.colors.status.success : 
    active ? theme.colors.evo.primary : 
    theme.colors.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const StatusMessage = styled.div`
  font-size: 0.9rem;
  color: ${({ theme, success, error }) => 
    success ? theme.colors.status.success : 
    error ? theme.colors.status.danger : 
    theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 1rem;
  min-height: 1.5rem;
`;

const ResetButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Gear positions on the grid
const gearPositions = [
  { id: 1, row: 0, col: 0 },
  { id: 2, row: 0, col: 1 },
  { id: 3, row: 0, col: 2 },
  { id: 4, row: 1, col: 0 },
  { id: 5, row: 1, col: 1 },
  { id: 6, row: 1, col: 2 },
];

// Calculate pixel position for a gear
const calculateGearPosition = (gear) => {
  // Base position (center of the shifter gate)
  const baseX = 140;
  const baseY = 175;
  
  // Offset for each gear position
  const colOffset = 80;
  const rowOffset = 80;
  
  const gearInfo = gearPositions.find(g => g.id === gear);
  
  if (!gearInfo) return { x: baseX, y: baseY + 100 }; // Neutral position
  
  return {
    x: baseX + (gearInfo.col - 1) * colOffset,
    y: baseY + (gearInfo.row - 0.5) * rowOffset
  };
};

const GearShifterLock = ({ onUnlock }) => {
  const [currentPosition, setCurrentPosition] = useState({ x: 140, y: 275 }); // Start in neutral
  const [currentGear, setCurrentGear] = useState(null);
  const [targetSequence, setTargetSequence] = useState([1, 3, 5]); // Example sequence
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [message, setMessage] = useState('Enter the gear sequence to unlock');
  const [messageType, setMessageType] = useState('info');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Handle gear selection
  const handleSelectGear = (gear) => {
    if (isUnlocked) return;
    
    const position = calculateGearPosition(gear);
    setCurrentPosition(position);
    setCurrentGear(gear);
    
    // Check if this is the correct gear in the sequence
    if (gear === targetSequence[currentSequenceIndex]) {
      // If we haven't already completed this step
      if (!completedSteps.includes(currentSequenceIndex)) {
        setCompletedSteps(prev => [...prev, currentSequenceIndex]);
        
        if (currentSequenceIndex < targetSequence.length - 1) {
          setCurrentSequenceIndex(currentSequenceIndex + 1);
          setMessage(`Good! Now shift to gear ${targetSequence[currentSequenceIndex + 1]}`);
          setMessageType('success');
        } else {
          // Sequence completed
          setIsUnlocked(true);
          setMessage('Sequence matched! Access granted.');
          setMessageType('success');
          
          // Call the onUnlock callback after a delay
          setTimeout(() => {
            if (onUnlock) onUnlock();
          }, 1500);
        }
      }
    } else {
      // Wrong gear
      setMessage(`Wrong gear! Try again. Shift to gear ${targetSequence[currentSequenceIndex]}`);
      setMessageType('error');
      
      // Reset the sequence after a delay
      setTimeout(() => {
        setCompletedSteps([]);
        setCurrentSequenceIndex(0);
        setMessage(`Sequence reset. Start with gear ${targetSequence[0]}`);
        setMessageType('info');
      }, 1500);
    }
  };
  
  // Reset to neutral
  const handleReset = () => {
    setCurrentPosition({ x: 140, y: 275 });
    setCurrentGear(null);
    setCompletedSteps([]);
    setCurrentSequenceIndex(0);
    setMessage(`Sequence reset. Start with gear ${targetSequence[0]}`);
    setMessageType('info');
    setIsUnlocked(false);
  };
  
  return (
    <LockContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LockTitle>Evo IX Gear Shifter Security Lock</LockTitle>
      <LockDescription>
        Enter the correct gear sequence to complete the authentication.
      </LockDescription>
      
      <SequenceDisplay>
        {targetSequence.map((target, index) => (
          <SequenceStep 
            key={index}
            active={index === currentSequenceIndex}
            completed={completedSteps.includes(index)}
          >
            {target}
          </SequenceStep>
        ))}
      </SequenceDisplay>
      
      <ShifterContainer>
        <ShifterPattern>
          <div className="pattern-line vertical-line"></div>
          <div className="pattern-line horizontal-line"></div>
        </ShifterPattern>
        <ShifterGate>
          {gearPositions.map(gear => (
            <GearPosition 
              key={gear.id}
              active={currentGear === gear.id}
              completed={completedSteps.includes(targetSequence.indexOf(gear.id))}
              onClick={() => handleSelectGear(gear.id)}
              style={{ 
                gridRow: gear.row + 1, 
                gridColumn: gear.col + 1 
              }}
            >
              <span className="gear-number">{gear.id}</span>
            </GearPosition>
          ))}
        </ShifterGate>
        <ShifterBase />
        <ShifterKnob position={currentPosition} />
        <ShifterLabel>MITSUBISHI</ShifterLabel>
      </ShifterContainer>
      
      <StatusMessage 
        success={messageType === 'success'} 
        error={messageType === 'error'}
      >
        {message}
      </StatusMessage>
      
      <ResetButton onClick={handleReset} disabled={isUnlocked}>
        Reset to Neutral
      </ResetButton>
    </LockContainer>
  );
};

export default GearShifterLock;