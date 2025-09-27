import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const GaugeContainer = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GaugeBackground = styled.div`
  position: relative;
  width: 100%;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  overflow: hidden;
`;

const GaugeFill = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.status.danger},
    ${({ theme }) => theme.colors.accent} 50%,
    ${({ theme }) => theme.colors.status.success}
  );
  opacity: 0.5;
`;

const GaugeNeedle = styled.div`
  position: absolute;
  bottom: 0;
  left: ${({ position }) => `${position}%`};
  width: 4px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  transform-origin: bottom center;
  transition: left 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -8px;
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.colors.text.primary};
    border-radius: 50%;
  }
`;

const GaugeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
`;

const GaugeLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  text-align: center;
  transition: color 0.3s ease;
`;

const GaugeSlider = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
`;

const MoodDisplay = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme, mood }) => 
    mood < 25 ? theme.colors.status.danger :
    mood < 45 ? '#BF6E61' :
    mood < 55 ? theme.colors.accent :
    mood < 75 ? '#8BBF61' :
    theme.colors.status.success};
  font-weight: 500;
  text-align: center;
`;

const MoodGauge = ({ mood, setMood }) => {
  const [moodText, setMoodText] = useState('Neutral');
  
  useEffect(() => {
    // Update mood text based on mood value
    if (mood < 25) {
      setMoodText('Terrible');
    } else if (mood < 45) {
      setMoodText('Bad');
    } else if (mood < 55) {
      setMoodText('Neutral');
    } else if (mood < 75) {
      setMoodText('Good');
    } else {
      setMoodText('Great');
    }
  }, [mood]);
  
  const handleMoodChange = (e) => {
    setMood(parseInt(e.target.value));
  };
  
  return (
    <GaugeContainer>
      <GaugeBackground>
        <GaugeFill />
        <GaugeNeedle position={mood} />
        <GaugeSlider 
          type="range" 
          min="0" 
          max="100" 
          value={mood} 
          onChange={handleMoodChange}
        />
      </GaugeBackground>
      
      <GaugeLabels>
        <GaugeLabel active={mood < 25}>Terrible</GaugeLabel>
        <GaugeLabel active={mood >= 25 && mood < 45}>Bad</GaugeLabel>
        <GaugeLabel active={mood >= 45 && mood < 55}>Neutral</GaugeLabel>
        <GaugeLabel active={mood >= 55 && mood < 75}>Good</GaugeLabel>
        <GaugeLabel active={mood >= 75}>Great</GaugeLabel>
      </GaugeLabels>
      
      <MoodDisplay mood={mood}>{moodText}</MoodDisplay>
    </GaugeContainer>
  );
};

export default MoodGauge;