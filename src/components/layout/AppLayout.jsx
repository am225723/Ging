import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/assets/images/content-background.png');
    background-size: cover;
    background-position: center;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
`;

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Header toggleSidebar={toggleSidebar} />
        <MainContent>
          <ContentWrapper>
            <Outlet />
          </ContentWrapper>
        </MainContent>
      </div>
    </LayoutContainer>
  );
};

export default AppLayout;