import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Correctly import the components that actually exist in the directory
import KnightDisplay from '../components/dashboard/KnightDisplay';
import CodexWidget from '../components/dashboard/CodexWidget';
import XPGauge from '../components/dashboard/XPGauge';
import ReframeForge from '../components/dashboard/ReframeForge';
import AnchorWidget from '../components/dashboard/AnchorWidget';
import ExposureLadderWidget from '../components/dashboard/ExposureLadderWidget';
import MoodGauge from '../components/dashboard/MoodGauge';


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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(50);
  
  useEffect(() => {
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
          Welcome back, <span>{user?.user_metadata?.name || user?.email || 'Ashen One'}</span>
        </WelcomeTitle>
        <WelcomeText>
          Your journey continues at Eric's Keep. Explore the realm of FromSoft characters and tune your Mitsubishi Evo IX.
        </WelcomeText>
      </WelcomeSection>
      
      <ContentGrid>
        <KnightDisplay />
        <XPGauge />
        <CodexWidget />
        <ReframeForge />
        <AnchorWidget />
        <ExposureLadderWidget />
        <MoodGauge mood={mood} setMood={setMood} />
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;