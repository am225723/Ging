import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const KnightContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const KnightTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  text-align: center;
`;

const KnightFigure = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background.dark};
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const KnightInfo = styled.div`
  width: 100%;
  text-align: center;
`;

const KnightName = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const KnightRank = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 1rem;
  font-family: ${({ theme }) => theme.fonts.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const KnightStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
  }
`;

const XPBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin: 1rem 0;
  overflow: hidden;
  position: relative;
`;

const XPProgress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.primary}, 
    ${({ theme }) => theme.colors.accent}
  );
  width: ${({ progress }) => `${progress}%`};
  transition: width 1s ease;
`;

const XPText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: 0.25rem;
`;

// Knight ranks from lowest to highest
const knightRanks = [
  'Squire',
  'Knight Errant',
  'Knight',
  'Knight Protector',
  'Knight Champion',
  'Knight Commander',
  'Paladin'
];

const KnightDisplay = () => {
  const { currentUser } = useAuth();
  const [level, setLevel] = useState(2);
  const [xp, setXp] = useState(75);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  
  // Calculate knight rank based on level
  const knightRank = knightRanks[Math.min(Math.floor(level / 5), knightRanks.length - 1)];
  
  // Calculate XP progress percentage
  const xpProgress = (xp / xpToNextLevel) * 100;
  
  // Mock stats
  const stats = {
    strength: 65,
    wisdom: 48,
    honor: 72,
    courage: 55
  };
  
  return (
    <KnightContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <KnightTitle>Your Knight</KnightTitle>
      
      <KnightFigure>
        <div style={{ padding: '10px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Knight Avatar
        </div>
      </KnightFigure>
      
      <KnightInfo>
        <KnightName>{currentUser?.name || 'Ashen One'}</KnightName>
        <KnightRank>{knightRank}</KnightRank>
        
        <div>
          <div>Level {level}</div>
          <XPBar>
            <XPProgress progress={xpProgress} />
          </XPBar>
          <XPText>{xp}/{xpToNextLevel} XP</XPText>
        </div>
        
        <KnightStats>
          {Object.entries(stats).map(([stat, value]) => (
            <StatItem key={stat}>
              <span className="stat-label">{stat}</span>
              <span className="stat-value">{value}</span>
            </StatItem>
          ))}
        </KnightStats>
      </KnightInfo>
    </KnightContainer>
  );
};

export default KnightDisplay;