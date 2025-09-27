import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import KnightDisplay from '../components/dashboard/KnightDisplay';
import CodexWidget from '../components/dashboard/CodexWidget';
import XPGauge from '../components/dashboard/XPGauge';
import ReframeForge from '../components/dashboard/ReframeForge';
import AnchorWidget from '../components/dashboard/AnchorWidget';
import ExposureLadderWidget from '../components/dashboard/ExposureLadderWidget';

// Dashboard components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.medium} 0%, 
    ${({ theme }) => theme.colors.background.dark} 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background-image: url('/assets/images/bonfire.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: right center;
    opacity: 0.2;
    pointer-events: none;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const WelcomeText = styled.p`
  font-size: 1.1rem;
  max-width: 600px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  
  h3 {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.5rem;
    font-family: ${({ theme }) => theme.fonts.tertiary};
    font-weight: 400;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
  
  .change {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: ${({ positive, theme }) => 
      positive ? theme.colors.status.success : theme.colors.status.danger};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.small};
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }
`;

const CharacterList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const CharacterCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  .image {
    height: 120px;
    background-color: ${({ theme }) => theme.colors.background.light};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .info {
    padding: 0.75rem;
    
    h4 {
      font-size: 0.9rem;
      margin: 0;
      text-align: center;
      font-family: ${({ theme }) => theme.fonts.primary};
    }
  }
`;

const CarSection = styled.div`
  margin-top: 1rem;
  
  .car-image {
    width: 100%;
    height: 150px;
    background-color: ${({ theme }) => theme.colors.background.dark};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 1rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .car-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.text.secondary};
      }
      
      .value {
        font-size: 1rem;
        color: ${({ theme }) => theme.colors.text.primary};
        font-weight: 500;
      }
    }
  }
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  padding: 0.75rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }
  
  .icon {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: ${({ theme, type }) => {
      switch (type) {
        case 'character': return 'rgba(199, 167, 88, 0.2)';
        case 'car': return 'rgba(30, 50, 100, 0.2)';
        default: return 'rgba(255, 255, 255, 0.1)';
      }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme, type }) => {
      switch (type) {
        case 'character': return theme.colors.accent;
        case 'car': return theme.colors.evo.primary;
        default: return theme.colors.text.primary;
      }
    }};
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.25rem;
      
      span {
        color: ${({ theme }) => theme.colors.accent};
      }
    }
    
    .time {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.muted};
    }
  }
`;

// Mock data
const mockCharacters = [
  { id: 1, name: 'Solaire of Astora', image: '/assets/images/characters/solaire.png', game: 'Dark Souls' },
  { id: 2, name: 'Lady Maria', image: '/assets/images/characters/lady_maria.png', game: 'Bloodborne' },
  { id: 3, name: 'Siegward', image: '/assets/images/characters/siegward.png', game: 'Dark Souls 3' },
  { id: 4, name: 'Malenia', image: '/assets/images/characters/malenia.png', game: 'Elden Ring' },
];

const mockActivities = [
  { id: 1, type: 'character', title: 'Added new character', character: 'Malenia', time: '2 hours ago' },
  { id: 2, type: 'car', title: 'Updated Evo IX specs', detail: 'Horsepower increased', time: '1 day ago' },
  { id: 3, type: 'character', title: 'Modified character stats', character: 'Solaire', time: '3 days ago' },
  { id: 4, type: 'car', title: 'Added new modification', detail: 'Carbon fiber hood', time: '1 week ago' },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('knight');
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-icon"></div>
      </div>
    );
  }
  
  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeTitle>
          Welcome back, <span>{currentUser?.name || 'Ashen One'}</span>
        </WelcomeTitle>
        <WelcomeText>
          Your journey continues at Eric's Keep. Explore the realm of FromSoft characters and tune your Mitsubishi Evo IX.
        </WelcomeText>
        
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3>Total Characters</h3>
            <div className="value">12</div>
            <div className="change" positive={true}>+2 this week</div>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3>Car Modifications</h3>
            <div className="value">8</div>
            <div className="change" positive={true}>+1 this week</div>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3>Horsepower</h3>
            <div className="value">480</div>
            <div className="change" positive={true}>+50 from stock</div>
          </StatCard>
        </StatsGrid>
      </WelcomeSection>
      
      <ContentGrid>
        <KnightDisplay />
        
        <XPGauge />
        
        <CodexWidget />
        
        <ReframeForge />
        
        <AnchorWidget />
        
        <ExposureLadderWidget />
        
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2>Featured Characters</h2>
          <CharacterList>
            {mockCharacters.map(character => (
              <CharacterCard key={character.id}>
                <div className="image">
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    {character.name} Image
                  </div>
                </div>
                <div className="info">
                  <h4>{character.name}</h4>
                </div>
              </CharacterCard>
            ))}
          </CharacterList>
          
          <CarSection>
            <h3>Mitsubishi Evo IX</h3>
            <div className="car-image">
              <div style={{ padding: '10px', textAlign: 'center' }}>
                Mitsubishi Evo IX Image
              </div>
            </div>
            <div className="car-stats">
              <div className="stat">
                <span className="label">Horsepower</span>
                <span className="value">480 HP</span>
              </div>
              <div className="stat">
                <span className="label">Torque</span>
                <span className="value">430 lb-ft</span>
              </div>
              <div className="stat">
                <span className="label">0-60 mph</span>
                <span className="value">3.5s</span>
              </div>
              <div className="stat">
                <span className="label">Top Speed</span>
                <span className="value">165 mph</span>
              </div>
            </div>
          </CarSection>
        </ContentCard>
        
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2>Recent Activity</h2>
          <ActivityList>
            {mockActivities.map(activity => (
              <ActivityItem key={activity.id} type={activity.type}>
                <div className="icon">
                  {activity.type === 'character' ? '🎭' : '🚗'}
                </div>
                <div className="content">
                  <div className="title">
                    {activity.title}
                    {activity.character && <span> ({activity.character})</span>}
                    {activity.detail && <span> ({activity.detail})</span>}
                  </div>
                  <div className="time">{activity.time}</div>
                </div>
              </ActivityItem>
            ))}
          </ActivityList>
        </ContentCard>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;