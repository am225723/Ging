import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

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
  line-height: 1.6;
`;

const QuickLinksSection = styled.div`
  h2 {
    font-size: 1.75rem;
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const QuickLinkCard = styled(motion(Link))`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  .icon {
    font-size: 2.5rem;
  }
  
  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
  
  .description {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;
  }
`;

const StatsSection = styled.div`
  h2 {
    font-size: 1.75rem;
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  text-align: center;
  
  .value {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const RecentActivitySection = styled.div`
  h2 {
    font-size: 1.75rem;
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
`;

const ActivityList = styled.div`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
`;

const ActivityItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
  
  .activity-title {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }
  
  .activity-date {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reframes: 0,
    journalEntries: 0,
    ladders: 0,
    anchors: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load stats
      const [reframesRes, journalsRes, laddersRes, anchorsRes] = await Promise.all([
        supabase.from('reframes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('exposure_ladders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('anchors').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setStats({
        reframes: reframesRes.count || 0,
        journalEntries: journalsRes.count || 0,
        ladders: laddersRes.count || 0,
        anchors: anchorsRes.count || 0
      });

      // Load recent activity (last 5 reframes)
      const { data: recentReframes } = await supabase
        .from('reframes')
        .select('negative_thought, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(recentReframes || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div>Loading...</div>
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
          Welcome back, <span>{user?.user_metadata?.name || user?.email || 'Warrior'}</span>
        </WelcomeTitle>
        <WelcomeText>
          Your journey continues at The Citadel. Use the therapeutic tools to strengthen your mental fortress, 
          track your progress, and build resilience one step at a time.
        </WelcomeText>
      </WelcomeSection>

      <QuickLinksSection>
        <h2>🛠️ Therapeutic Tools</h2>
        <QuickLinksGrid>
          <QuickLinkCard
            to="/reframe-forge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="icon">⚒️</div>
            <div className="title">Reframe & Reforge</div>
            <div className="description">
              Transform negative thoughts into balanced perspectives using CBT techniques.
            </div>
          </QuickLinkCard>

          <QuickLinkCard
            to="/journal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="icon">📔</div>
            <div className="title">Journal</div>
            <div className="description">
              Record your thoughts, feelings, and experiences with AI-powered insights.
            </div>
          </QuickLinkCard>

          <QuickLinkCard
            to="/exposure-ladder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="icon">🪜</div>
            <div className="title">Exposure Ladder</div>
            <div className="description">
              Create step-by-step plans to gradually face your fears with confidence.
            </div>
          </QuickLinkCard>

          <QuickLinkCard
            to="/anchor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="icon">⚓</div>
            <div className="title">Anchor & Mantra</div>
            <div className="description">
              Ground yourself with mindfulness exercises and personalized mantras.
            </div>
          </QuickLinkCard>
        </QuickLinksGrid>
      </QuickLinksSection>

      <StatsSection>
        <h2>📊 Your Progress</h2>
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="value">{stats.reframes}</div>
            <div className="label">Reframes</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="value">{stats.journalEntries}</div>
            <div className="label">Journal Entries</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="value">{stats.ladders}</div>
            <div className="label">Exposure Ladders</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="value">{stats.anchors}</div>
            <div className="label">Anchors Created</div>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {recentActivity.length > 0 && (
        <RecentActivitySection>
          <h2>📜 Recent Activity</h2>
          <ActivityList>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <div className="activity-title">
                  Reframed: {activity.negative_thought.substring(0, 80)}
                  {activity.negative_thought.length > 80 ? '...' : ''}
                </div>
                <div className="activity-date">
                  {new Date(activity.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivitySection>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;