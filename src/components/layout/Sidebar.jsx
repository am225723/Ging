import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

const SidebarContainer = styled(motion.aside)`
  width: ${({ isOpen }) => (isOpen ? '280px' : '70px')};
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  transition: width ${({ theme }) => theme.transitions.medium};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: fixed;
    left: ${({ isMobileOpen }) => (isMobileOpen ? '0' : '-280px')};
    width: 280px;
    z-index: 1000;
    transition: left 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  
  h2 {
    margin: 0;
    font-size: ${({ isOpen }) => (isOpen ? '1.25rem' : '1.5rem')};
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
    text-align: ${({ isOpen }) => (isOpen ? 'left' : 'center')};
    white-space: ${({ isOpen }) => (isOpen ? 'normal' : 'nowrap')};
  }
  
  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }
`;

const NavSection = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const NavGroupTitle = styled.h3`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 0.5rem 0;
  padding: 0 ${({ isOpen }) => (isOpen ? '1.5rem' : '0')};
  font-weight: 600;
  text-align: ${({ isOpen }) => (isOpen ? 'left' : 'center')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem ${({ isOpen }) => (isOpen ? '1.5rem' : '0')};
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.95rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  border-left: 3px solid transparent;
  
  .icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .label {
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    transition: opacity ${({ theme }) => theme.transitions.fast};
    white-space: nowrap;
  }
  
  &:hover {
    background-color: rgba(199, 167, 88, 0.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &.active {
    background-color: rgba(199, 167, 88, 0.15);
    color: ${({ theme }) => theme.colors.accent};
    border-left-color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }
`;

const AdminNotesSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  max-height: ${({ isOpen }) => (isOpen ? '400px' : '0')};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.medium};
`;

const AdminNotesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(199, 167, 88, 0.1);
  }
  
  h3 {
    margin: 0;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .toggle-icon {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    transform: ${({ isNotesOpen }) => (isNotesOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.3s ease;
  }
`;

const AdminNotesContent = styled(motion.div)`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  max-height: 300px;
  overflow-y: auto;
  
  .note-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
    
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }
  
  .note-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }
  
  .note-content {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;
  }
  
  .note-date {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: 0.25rem;
  }
  
  .no-notes {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.muted};
    text-align: center;
    padding: 1rem 0;
  }
`;

const MobileToggle = styled.button`
  display: none;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 1001;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.background.dark};
    border: none;
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.large};
    font-size: 1.5rem;
    align-items: center;
    justify-content: center;
  }
`;

const Overlay = styled(motion.div)`
  display: none;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const Sidebar = ({ isOpen = true, toggleSidebar }) => {
  const { isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [adminNotes, setAdminNotes] = useState([]);

  useEffect(() => {
    loadAdminNotes();
  }, []);

  const loadAdminNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAdminNotes(data || []);
    } catch (error) {
      console.error('Error loading admin notes:', error);
    }
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <SidebarContainer isOpen={isOpen} isMobileOpen={isMobileOpen}>
        <SidebarHeader isOpen={isOpen}>
          <h2>{isOpen ? '🏰 The Citadel' : '🏰'}</h2>
          <p>Your Mental Fortress</p>
        </SidebarHeader>

        <NavSection>
          <NavGroup>
            <NavGroupTitle isOpen={isOpen}>Overview</NavGroupTitle>
            <NavItem to="/dashboard" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">🏠</span>
              <span className="label">Dashboard</span>
            </NavItem>
          </NavGroup>

          <NavGroup>
            <NavGroupTitle isOpen={isOpen}>Therapeutic Tools</NavGroupTitle>
            <NavItem to="/reframe-forge" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">⚒️</span>
              <span className="label">Reframe & Reforge</span>
            </NavItem>
            <NavItem to="/journal" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">📔</span>
              <span className="label">Journal</span>
            </NavItem>
            <NavItem to="/exposure-ladder" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">🪜</span>
              <span className="label">Exposure Ladder</span>
            </NavItem>
            <NavItem to="/anchor" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">⚓</span>
              <span className="label">Anchor & Mantra</span>
            </NavItem>
          </NavGroup>

          <NavGroup>
            <NavGroupTitle isOpen={isOpen}>Progress</NavGroupTitle>
            <NavItem to="/characters" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">⚔️</span>
              <span className="label">Characters</span>
            </NavItem>
            <NavItem to="/garage" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">🚗</span>
              <span className="label">The Garage</span>
            </NavItem>
          </NavGroup>

          <NavGroup>
            <NavGroupTitle isOpen={isOpen}>Resources</NavGroupTitle>
            <NavItem to="/safe" isOpen={isOpen} onClick={closeMobile}>
              <span className="icon">🛡️</span>
              <span className="label">Safe View</span>
            </NavItem>
          </NavGroup>

          {isAdmin && (
            <NavGroup>
              <NavGroupTitle isOpen={isOpen}>Admin</NavGroupTitle>
              <NavItem to="/admin" isOpen={isOpen} onClick={closeMobile}>
                <span className="icon">⚙️</span>
                <span className="label">Admin Panel</span>
              </NavItem>
            </NavGroup>
          )}
        </NavSection>

        <AdminNotesSection isOpen={isOpen}>
          <AdminNotesHeader 
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            isNotesOpen={isNotesOpen}
          >
            <h3>
              <span>📜</span>
              <span>From Warden Aleix</span>
            </h3>
            <span className="toggle-icon">▼</span>
          </AdminNotesHeader>
          
          <AnimatePresence>
            {isNotesOpen && (
              <AdminNotesContent
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {adminNotes.length > 0 ? (
                  adminNotes.map((note) => (
                    <div key={note.id} className="note-item">
                      <div className="note-title">{note.title}</div>
                      <div className="note-content">{note.content}</div>
                      <div className="note-date">
                        {new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notes">
                    No messages from the Warden yet.
                  </div>
                )}
              </AdminNotesContent>
            )}
          </AnimatePresence>
        </AdminNotesSection>
      </SidebarContainer>

      <MobileToggle onClick={toggleMobile}>
        {isMobileOpen ? '✕' : '☰'}
      </MobileToggle>

      <AnimatePresence>
        {isMobileOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;