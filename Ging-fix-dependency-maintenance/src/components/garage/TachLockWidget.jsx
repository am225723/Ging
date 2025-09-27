import { useState, useEffect, useRef } from 'react';
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

const TachometerContainer = styled.div`
  position: relative;
  width: 300px;
  height: 200px;
  margin-bottom: 2rem;
`;

const TachometerBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #111111;
  border-top-left-radius: 150px;
  border-top-right-radius: 150px;
  overflow: hidden;
  border: 2px solid #333333;
  border-bottom: none;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
`;

const TachometerFace = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 0;
  background: radial-gradient(circle at center, #222222, #111111);
  border-top-left-radius: 150px;
  border-top-right-radius: 150px;
`;

const TachometerNeedle = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 3px;
  height: 140px;
  background-color: ${({ theme }) => theme.colors.evo.secondary};
  transform-origin: bottom center;
  transform: ${({ rotation }) => `rotate(${rotation}deg)`};
  transition: transform 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -8px;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle at center, #D10000, #8A0303);
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(209, 0, 0, 0.7);
  }
`;

const TachometerMarkers = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  .marker {
    position: absolute;
    bottom: 0;
    width: 2px;
    height: 10px;
    background-color: #555555;
    transform-origin: bottom center;
    
    &.major {
      height: 15px;
      width: 3px;
      background-color: #AAAAAA;
    }
    
    &.redline {
      background-color: #D10000;
    }
  }
`;

const TachometerLabels = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  .label {
    position: absolute;
    bottom: 30px;
    font-size: 0.9rem;
    color: #CCCCCC;
    transform-origin: bottom center;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    
    &.redline {
      color: #D10000;
    }
  }
`;

const RedlineZone = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  
  .zone {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-top-left-radius: 150px;
    border-top-right-radius: 150px;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    background: linear-gradient(90deg, transparent, rgba(209, 0, 0, 0.2));
    transform: rotate(45deg);
    transform-origin: bottom center;
  }
`;

const RPMDisplay = styled.div`
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  color: #FFFFFF;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #333333;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
`;

const MitsubishiLogo = styled.div`
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #CCCCCC;
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
  width: 50px;
  height: 50px;
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

const ControlsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ControlButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, type }) => 
    type === 'gas' ? theme.colors.evo.primary : theme.colors.evo.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
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

const TachLockWidget = ({ onUnlock }) => {
  const [rpm, setRpm] = useState(0);
  const [targetSequence, setTargetSequence] = useState([2500, 5000, 3000]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [message, setMessage] = useState('Match the RPM sequence to unlock');
  const [messageType, setMessageType] = useState('info');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const rpmInterval = useRef(null);
  const rpmDecayInterval = useRef(null);
  
  // Calculate needle rotation based on RPM (0-9000 RPM maps to -90 to 90 degrees)
  const needleRotation = -90 + ((rpm / 9000) * 180);
  
  // Create tachometer markers
  const markers = [];
  for (let i = 0; i <= 180; i += 5) {
    const isMajor = i % 15 === 0;
    const isRedline = i >= 135; // Redline starts at 6750 RPM (135 degrees)
    const rotation = -90 + i;
    markers.push(
      <div 
        key={i} 
        className={`marker ${isMajor ? 'major' : ''} ${isRedline ? 'redline' : ''}`} 
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    );
  }
  
  // Create tachometer labels
  const labels = [
    { value: 0, rotation: -90, text: '0', redline: false },
    { value: 1000, rotation: -72, text: '1', redline: false },
    { value: 2000, rotation: -54, text: '2', redline: false },
    { value: 3000, rotation: -36, text: '3', redline: false },
    { value: 4000, rotation: -18, text: '4', redline: false },
    { value: 5000, rotation: 0, text: '5', redline: false },
    { value: 6000, rotation: 18, text: '6', redline: false },
    { value: 7000, rotation: 36, text: '7', redline: true },
    { value: 8000, rotation: 54, text: '8', redline: true },
    { value: 9000, rotation: 72, text: '9', redline: true }
  ];
  
  // Handle gas pedal press
  const handleGas = () => {
    // Clear any existing decay interval
    if (rpmDecayInterval.current) {
      clearInterval(rpmDecayInterval.current);
    }
    
    // Start increasing RPM
    if (!rpmInterval.current) {
      rpmInterval.current = setInterval(() => {
        setRpm(prev => {
          if (prev >= 9000) {
            clearInterval(rpmInterval.current);
            rpmInterval.current = null;
            return 9000;
          }
          return prev + 200;
        });
      }, 50);
    }
  };
  
  // Handle gas pedal release
  const handleGasRelease = () => {
    // Clear the acceleration interval
    if (rpmInterval.current) {
      clearInterval(rpmInterval.current);
      rpmInterval.current = null;
    }
    
    // Start RPM decay
    if (!rpmDecayInterval.current) {
      rpmDecayInterval.current = setInterval(() => {
        setRpm(prev => {
          if (prev <= 0) {
            clearInterval(rpmDecayInterval.current);
            rpmDecayInterval.current = null;
            return 0;
          }
          return prev - 100;
        });
      }, 50);
    }
  };
  
  // Handle brake pedal press
  const handleBrake = () => {
    // Clear any existing intervals
    if (rpmInterval.current) {
      clearInterval(rpmInterval.current);
      rpmInterval.current = null;
    }
    
    if (rpmDecayInterval.current) {
      clearInterval(rpmDecayInterval.current);
      rpmDecayInterval.current = null;
    }
    
    // Rapidly decrease RPM
    rpmDecayInterval.current = setInterval(() => {
      setRpm(prev => {
        if (prev <= 0) {
          clearInterval(rpmDecayInterval.current);
          rpmDecayInterval.current = null;
          return 0;
        }
        return prev - 300;
      });
    }, 50);
  };
  
  // Check if current RPM matches target
  useEffect(() => {
    if (isUnlocked) return;
    
    const currentTarget = targetSequence[currentSequenceIndex];
    const tolerance = 200; // RPM tolerance
    
    if (Math.abs(rpm - currentTarget) <= tolerance) {
      // If we haven't already completed this step
      if (!completedSteps.includes(currentSequenceIndex)) {
        setCompletedSteps(prev => [...prev, currentSequenceIndex]);
        
        if (currentSequenceIndex < targetSequence.length - 1) {
          setCurrentSequenceIndex(currentSequenceIndex + 1);
          setMessage(`Good! Now match ${targetSequence[currentSequenceIndex + 1]} RPM`);
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
    }
  }, [rpm, currentSequenceIndex, targetSequence, completedSteps, isUnlocked, onUnlock]);
  
  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (rpmInterval.current) clearInterval(rpmInterval.current);
      if (rpmDecayInterval.current) clearInterval(rpmDecayInterval.current);
    };
  }, []);
  
  return (
    <LockContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LockTitle>Mitsubishi Evo IX Tachometer Security Lock</LockTitle>
      <LockDescription>
        Match the RPM sequence using the gas and brake pedals to access the secure garage.
      </LockDescription>
      
      <SequenceDisplay>
        {targetSequence.map((target, index) => (
          <SequenceStep 
            key={index}
            active={index === currentSequenceIndex}
            completed={completedSteps.includes(index)}
          >
            {index + 1}
          </SequenceStep>
        ))}
      </SequenceDisplay>
      
      <TachometerContainer>
        <TachometerBackground>
          <TachometerFace />
          <RedlineZone>
            <div className="zone" />
          </RedlineZone>
        </TachometerBackground>
        <TachometerMarkers>
          {markers}
        </TachometerMarkers>
        <TachometerLabels>
          {labels.map(label => (
            <div 
              key={label.value} 
              className={`label ${label.redline ? 'redline' : ''}`} 
              style={{ 
                transform: `rotate(${label.rotation}deg) translateX(-50%)`,
                left: '50%',
                marginLeft: label.rotation === -90 ? '-20px' : 
                           label.rotation === 72 ? '20px' : '0'
              }}
            >
              {label.text}
            </div>
          ))}
        </TachometerLabels>
        <MitsubishiLogo>MITSUBISHI</MitsubishiLogo>
        <TachometerNeedle rotation={needleRotation} />
        <RPMDisplay>{rpm.toLocaleString()} RPM</RPMDisplay>
      </TachometerContainer>
      
      <StatusMessage 
        success={messageType === 'success'} 
        error={messageType === 'error'}
      >
        {message}
      </StatusMessage>
      
      <ControlsContainer>
        <ControlButton 
          type="gas" 
          onMouseDown={handleGas} 
          onMouseUp={handleGasRelease}
          onMouseLeave={handleGasRelease}
          onTouchStart={handleGas}
          onTouchEnd={handleGasRelease}
          disabled={isUnlocked}
        >
          Gas
        </ControlButton>
        <ControlButton 
          type="brake" 
          onMouseDown={handleBrake} 
          onMouseUp={handleGasRelease}
          onMouseLeave={handleGasRelease}
          onTouchStart={handleBrake}
          onTouchEnd={handleGasRelease}
          disabled={isUnlocked}
        >
          Brake
        </ControlButton>
      </ControlsContainer>
    </LockContainer>
  );
};

export default TachLockWidget;