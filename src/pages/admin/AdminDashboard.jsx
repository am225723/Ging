import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Admin Dashboard components
const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const AdminTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const AdminActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : 
    variant === 'secondary' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
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
      variant === 'primary' ? theme.colors.primary : 
      variant === 'secondary' ? 'rgba(199, 167, 88, 0.1)' : theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.small};
  
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
    color: ${({ theme, color }) => 
      color === 'primary' ? theme.colors.primary :
      color === 'accent' ? theme.colors.accent :
      color === 'evo' ? theme.colors.evo.primary :
      theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
  
  .change {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: ${({ theme, trend }) => 
      trend === 'up' ? theme.colors.status.success :
      trend === 'down' ? theme.colors.status.danger :
      theme.colors.text.secondary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .actions {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.accent};
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }
  
  th {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.9rem;
  }
  
  td {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  tr:hover td {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    
    button {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.text.muted};
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      transition: color ${({ theme }) => theme.transitions.fast};
      
      &:hover {
        color: ${({ theme }) => theme.colors.accent};
      }
    }
  }
`;

const UserRow = styled.tr`
  .status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
    
    &.active {
      background-color: rgba(77, 126, 62, 0.2);
      color: ${({ theme }) => theme.colors.status.success};
    }
    
    &.inactive {
      background-color: rgba(138, 3, 3, 0.2);
      color: ${({ theme }) => theme.colors.status.danger};
    }
  }
`;

const CharacterRow = styled.tr`
  .game {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
    background-color: rgba(199, 167, 88, 0.1);
    color: ${({ theme }) => theme.colors.accent};
  }
`;

// Mock data
const mockUsers = [
  { id: 1, name: 'Admin User', username: 'admin', role: 'admin', status: 'active', lastLogin: '2 hours ago' },
  { id: 2, name: 'Regular User', username: 'user', role: 'user', status: 'active', lastLogin: '1 day ago' },
  { id: 3, name: 'John Doe', username: 'johndoe', role: 'user', status: 'inactive', lastLogin: '2 weeks ago' },
  { id: 4, name: 'Jane Smith', username: 'janesmith', role: 'user', status: 'active', lastLogin: '3 days ago' },
];

const mockCharacters = [
  { id: 1, name: 'Solaire of Astora', game: 'Dark Souls', added: '2023-01-15', status: 'published' },
  { id: 2, name: 'Lady Maria', game: 'Bloodborne', added: '2023-02-20', status: 'published' },
  { id: 3, name: 'Siegward', game: 'Dark Souls 3', added: '2023-03-10', status: 'published' },
  { id: 4, name: 'Malenia', game: 'Elden Ring', added: '2023-04-05', status: 'draft' },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  
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
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>Admin Dashboard</AdminTitle>
        <AdminActions>
          <Button variant="secondary">
            Export Data
          </Button>
          <Button variant="primary">
            System Settings
          </Button>
        </AdminActions>
      </AdminHeader>
      
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          color="primary"
        >
          <h3>Total Users</h3>
          <div className="value">24</div>
          <div className="change" trend="up">
            +3 this month
          </div>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          color="accent"
        >
          <h3>Characters</h3>
          <div className="value">12</div>
          <div className="change" trend="up">
            +2 this month
          </div>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          color="evo"
        >
          <h3>Car Modifications</h3>
          <div className="value">8</div>
          <div className="change" trend="up">
            +1 this month
          </div>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>System Uptime</h3>
          <div className="value">99.9%</div>
          <div className="change">
            Last 30 days
          </div>
        </StatCard>
      </StatsGrid>
      
      <ContentGrid>
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2>
            User Management
            <span className="actions">View All</span>
          </h2>
          
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <UserRow key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td className="actions">
                    <button title="Edit">✏️</button>
                    <button title="Delete">🗑️</button>
                  </td>
                </UserRow>
              ))}
            </tbody>
          </Table>
        </ContentCard>
        
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2>
            Character Management
            <span className="actions">View All</span>
          </h2>
          
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Game</th>
                <th>Date Added</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCharacters.map(character => (
                <CharacterRow key={character.id}>
                  <td>{character.name}</td>
                  <td>
                    <span className="game">
                      {character.game}
                    </span>
                  </td>
                  <td>{character.added}</td>
                  <td>{character.status}</td>
                  <td className="actions">
                    <button title="Edit">✏️</button>
                    <button title="Delete">🗑️</button>
                  </td>
                </CharacterRow>
              ))}
            </tbody>
          </Table>
        </ContentCard>
      </ContentGrid>
    </AdminContainer>
  );
};

export default AdminDashboard;