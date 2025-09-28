import { createContext, useState, useContext, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const ToastContext = createContext();

const fadeIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const ToastMessage = styled.div`
  background-color: ${({ theme, type }) => type === 'error' ? theme.colors.status.danger : theme.colors.status.success};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 1rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.large};
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.5s, ${fadeOut} 0.5s 4.5s;
  animation-fill-mode: forwards;
  border-left: 5px solid ${({ theme, type }) => type === 'error' ? '#ff4d4d' : '#4dff4d'};
`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastWrapper>
        {toasts.map(toast => (
          <ToastMessage key={toast.id} type={toast.type}>
            {toast.message}
          </ToastMessage>
        ))}
      </ToastWrapper>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};