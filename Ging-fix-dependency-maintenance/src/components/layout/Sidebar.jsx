import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// Icons (we'll use text for now, but you can replace with actual icons)
const DashboardIcon = () => <span>📊</span>;
const UsersIcon = () => <span>👥</span>;
const ContentIcon = () => <span>📝</span>;
const SettingsIcon = () => <span>⚙️</span>;
const CarIcon = () => <span>🚗</span>;
const CharactersIcon = () => <span>🎭</span>;
const JournalIcon = () => <span>📓</span>;
const SafeIcon = () => <span>🔒</span>;

const SidebarContainer = styled(motion.aside)`
  width: ${({ isOpen }) => (isOpen ? '250px' : '70px')};
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transitions.medium};
  overflow: hidden;
  position: relative;
  z-index: 20;
`;

const Logo = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const LogoText = styled.h1`
  margin: 0;
  font-size: ${({ isOpen }) => (isOpen ? '1.5rem' : '1.2rem')};
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  span {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${({ isOpen }) => (isOpen ? '0.75rem 1.5rem' : '0.75rem')};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};
  border-left: 3px solid transparent;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.accent};
    border-left-color: ${({ theme }) => theme.colors.accent};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.2rem;
`;

const NavText = styled.span`
  margin-left: 1rem;
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: ${({ isOpen }) => (isOpen ? '1rem 1.5rem 0.5rem' : '1rem 0 0.5rem')};
  margin: 0;
  white-space: nowrap;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  text-align: ${({ isOpen }) => (isOpen ? 'left' : 'center')};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-weight: 500;
`;

const Footer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
`;

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isAdmin } = useAuth();
  
  return (
    <SidebarContainer
      isOpen={isOpen}
      initial={false}
      animate={{ width: isOpen ? '250px' : '70px' }}
    >
      <Logo isOpen={isOpen}>
        <LogoText isOpen={isOpen}>
          E<span>K</span>
        </LogoText>
      </Logo>
      
      <NavMenu>
        <NavItem to="/dashboard" isOpen={isOpen}>
          <IconWrapper>
            <DashboardIcon />
          </IconWrapper>
          <NavText isOpen={isOpen}>Dashboard</NavText>
        </NavItem>
        
        <SectionTitle isOpen={isOpen}>Features</SectionTitle>
        
        <NavItem to="/characters" isOpen={isOpen}>
          <IconWrapper>
            <CharactersIcon />
          </IconWrapper>
          <NavText isOpen={isOpen}>Characters</NavText>
        </NavItem>
        
        <NavItem to="/garage" isOpen={isOpen}>
          <IconWrapper>
            <CarIcon />
          </IconWrapper>
          <NavText isOpen={isOpen}>Garage</NavText>
        </NavItem>
        
        <NavItem to="/journal" isOpen={isOpen}>
          <IconWrapper>
            <JournalIcon />
          </IconWrapper>
          <NavText isOpen={isOpen}>Journal</NavText>
        </NavItem>
        
        <NavItem to="/safe" isOpen={isOpen}>
          <IconWrapper>
            <SafeIcon />
          </IconWrapper>
          <NavText isOpen={isOpen}>Secure Garage</NavText>
        </NavItem>
        
        {isAdmin && (
          <>
            <SectionTitle isOpen={isOpen}>Admin</SectionTitle>
            
            <NavItem to="/admin/users" isOpen={isOpen}>
              <IconWrapper>
                <UsersIcon />
              </IconWrapper>
              <NavText isOpen={isOpen}>Users</NavText>
            </NavItem>
            
            <NavItem to="/admin/content" isOpen={isOpen}>
              <IconWrapper>
                <ContentIcon />
              </IconWrapper>
              <NavText isOpen={isOpen}>Content</NavText>
            </NavItem>
            
            <NavItem to="/admin/settings" isOpen={isOpen}>
              <IconWrapper>
                <SettingsIcon />
              </IconWrapper>
              <NavText isOpen={isOpen}>Settings</NavText>
            </NavItem>
          </>
        )}
      </NavMenu>
      
      <Footer>
        {isOpen ? '© 2025 Eric\'s Keep' : '© 2025'}
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;