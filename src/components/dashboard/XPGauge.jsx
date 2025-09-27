import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const GaugeContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const GaugeTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  text-align: center;
`;

const GaugeWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
  margin-bottom: 1.5rem;
`;

const GaugeBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  height: ${({ percentage }) => `${percentage}%`};
  background: linear-gradient(0deg, 
    ${({ theme }) => theme.colors.primary}, 
    ${({ theme }) => theme.colors.accent}
  );
  transition: height 1s ease;
`;

const GaugeNeedle = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  transform-origin: bottom center;
  transform: ${({ rotation }) => `rotate(${rotation}deg)`};
  transition: transform 1s ease;
  
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

const GaugeMarkers = styled.div`
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
    background-color: ${({ theme }) => theme.colors.text.muted};
    transform-origin: bottom center;
    
    &.major {
      height: 15px;
      width: 3px;
      background-color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

const GaugeLabels = styled.div`
  position: absolute;
  top: -25px;
  left: 0;
  width: 100%;
  height: 100%;
  
  .label {
    position: absolute;
    bottom: 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    transform-origin: bottom center;
    text-align: center;
  }
`;

const GaugeInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const LevelDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  margin-bottom: 0.5rem;
`;

const XPDisplay = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const QuestList = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  padding-top: 1rem;
`;

const QuestTitle = styled.h4`
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const QuestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: 0.75rem;
  
  .quest-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: rgba(199, 167, 88, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.accent};
    font-size: 1rem;
    flex-shrink: 0;
  }
  
  .quest-content {
    flex: 1;
    
    .quest-name {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.25rem;
    }
    
    .quest-progress {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
  
  .quest-reward {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.accent};
    background-color: rgba(199, 167, 88, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    white-space: nowrap;
  }
`;

// Sample quests
const activeQuests = [
  {
    id: 1,
    name: "Scribe's Path",
    description: "Complete 5 consecutive days of journaling",
    progress: 3,
    total: 5,
    reward: "+50 XP"
  },
  {
    id: 2,
    name: "Blacksmith's Forge",
    description: "Complete 3 Reframe Forge exercises",
    progress: 1,
    total: 3,
    reward: "+30 XP"
  }
];

const XPGauge = () => {
  const [level, setLevel] = useState(2);
  const [xp, setXp] = useState(75);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [gaugeRotation, setGaugeRotation] = useState(0);
  const [gaugePercentage, setGaugePercentage] = useState(0);
  
  useEffect(() => {
    // Calculate gauge rotation (from -90 to 90 degrees)
    const rotation = -90 + ((xp / xpToNextLevel) * 180);
    setGaugeRotation(rotation);
    
    // Calculate gauge fill percentage
    const percentage = (xp / xpToNextLevel) * 100;
    setGaugePercentage(percentage);
  }, [xp, xpToNextLevel]);
  
  // Create gauge markers
  const markers = [];
  for (let i = 0; i <= 180; i += 10) {
    const isMajor = i % 30 === 0;
    const rotation = -90 + i;
    markers.push(
      <div 
        key={i} 
        className={`marker ${isMajor ? 'major' : ''}`} 
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    );
  }
  
  // Create gauge labels
  const labels = [
    { value: 0, rotation: -90, text: '0' },
    { value: 50, rotation: 0, text: '50%' },
    { value: 100, rotation: 90, text: '100%' }
  ];
  
  return (
    <GaugeContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GaugeTitle>Experience Progress</GaugeTitle>
      
      <GaugeWrapper>
        <GaugeBackground>
          <GaugeFill percentage={gaugePercentage} />
        </GaugeBackground>
        <GaugeMarkers>
          {markers}
        </GaugeMarkers>
        <GaugeLabels>
          {labels.map(label => (
            <div 
              key={label.value} 
              className="label" 
              style={{ 
                transform: `rotate(${label.rotation}deg) translateX(-50%)`,
                left: '50%',
                marginLeft: label.rotation === -90 ? '-30px' : 
                           label.rotation === 90 ? '30px' : '0'
              }}
            >
              {label.text}
            </div>
          ))}
        </GaugeLabels>
        <GaugeNeedle rotation={gaugeRotation} />
      </GaugeWrapper>
      
      <GaugeInfo>
        <LevelDisplay>Level {level}</LevelDisplay>
        <XPDisplay>{xp}/{xpToNextLevel} XP to Next Level</XPDisplay>
      </GaugeInfo>
      
      <QuestList>
        <QuestTitle>Active Quests</QuestTitle>
        {activeQuests.map(quest => (
          <QuestItem key={quest.id}>
            <div className="quest-icon">⚔️</div>
            <div className="quest-content">
              <div className="quest-name">{quest.name}</div>
              <div className="quest-progress">
                Progress: {quest.progress}/{quest.total} - {quest.description}
              </div>
            </div>
            <div className="quest-reward">{quest.reward}</div>
          </QuestItem>
        ))}
      </QuestList>
    </GaugeContainer>
  );
};

export default XPGauge;