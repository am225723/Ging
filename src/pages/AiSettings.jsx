import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAi } from '../contexts/AiContext';
import AiConfigPanel from '../components/ai/AiConfigPanel';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SettingsTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SettingsCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 
    variant === 'danger' ? theme.colors.primary : 'transparent'};
  color: ${({ theme, variant }) =>
    variant === 'primary' || variant === 'danger' ? theme.colors.background.dark : theme.colors.text.primary};
  border: ${({ theme, variant }) => 
    variant === 'secondary' ? `1px solid ${theme.colors.accent}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.accent : 
      variant === 'danger' ? theme.colors.primary : 
      'rgba(199, 167, 88, 0.1)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  text-align: center;
  
  .stat-value {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const AiSettings = () => {
  const { 
    aiConfig, 
    updateAiConfig, 
    resetAiConfig, 
    clearAiCache,
    aiUsageStats
  } = useAi();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleConfigUpdate = (newConfig) => {
    updateAiConfig(newConfig);
  };
  
  const handleResetConfig = () => {
    if (showResetConfirm) {
      resetAiConfig();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };
  
  const handleClearCache = () => {
    clearAiCache();
    alert('AI cache cleared successfully!');
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>AI Settings</SettingsTitle>
      </SettingsHeader>
      
      <SettingsContent>
        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Customize how the AI generates content for you. These settings will affect all AI-powered features
            including the Exposure Ladder, Reframe Forge, and Journal Assistant.
          </CardDescription>
          
          <AiConfigPanel 
            initialConfig={aiConfig}
            onConfigChange={handleConfigUpdate}
            isOpen={true}
          />
          
          <ButtonGroup>
            <Button variant="secondary" onClick={handleClearCache}>
              Clear AI Cache
            </Button>
            <Button 
              variant={showResetConfirm ? "danger" : "secondary"} 
              onClick={handleResetConfig}
            >
              {showResetConfirm ? "Confirm Reset" : "Reset to Defaults"}
            </Button>
          </ButtonGroup>
        </SettingsCard>
        
        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardTitle>AI Usage Statistics</CardTitle>
          <CardDescription>
            View statistics about your AI usage. This helps you understand how you're using the AI features
            and can help you optimize your usage.
          </CardDescription>
          
          <StatsGrid>
            <StatCard>
              <div className="stat-value">{aiUsageStats.totalCalls}</div>
              <div className="stat-label">Total AI Calls</div>
            </StatCard>
            <StatCard>
              <div className="stat-value">{aiUsageStats.cachedCalls}</div>
              <div className="stat-label">Cached Responses</div>
            </StatCard>
            <StatCard>
              <div className="stat-value">{aiUsageStats.failedCalls}</div>
              <div className="stat-label">Failed Calls</div>
            </StatCard>
            <StatCard>
              <div className="stat-value">
                {aiUsageStats.cachedCalls > 0 
                  ? Math.round((aiUsageStats.cachedCalls / aiUsageStats.totalCalls) * 100) 
                  : 0}%
              </div>
              <div className="stat-label">Cache Hit Rate</div>
            </StatCard>
          </StatsGrid>
          
          {aiUsageStats.lastCall && (
            <p>Last AI call: {new Date(aiUsageStats.lastCall).toLocaleString()}</p>
          )}
        </SettingsCard>
      </SettingsContent>
    </SettingsContainer>
  );
};

export default AiSettings;