import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    width: 100%;
    font-size: 16px;
  }

  body {
    font-family: ${theme.fonts.secondary};
    background-color: ${theme.colors.background.dark};
    color: ${theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
    background-image: url('/assets/images/background-texture.png');
    background-blend-mode: overlay;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.primary};
    margin-bottom: ${theme.spacing.md};
    font-weight: 600;
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.shadows.text};
    letter-spacing: 0.05em;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: ${theme.spacing.lg};
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  h5 {
    font-size: 1.25rem;
  }

  h6 {
    font-size: 1rem;
  }

  p {
    margin-bottom: ${theme.spacing.md};
    font-size: 1rem;
  }

  a {
    color: ${theme.colors.accent};
    text-decoration: none;
    transition: color ${theme.transitions.fast};
    
    &:hover {
      color: ${theme.colors.text.primary};
    }
  }

  button {
    font-family: ${theme.fonts.primary};
    cursor: pointer;
  }

  input, textarea, select {
    font-family: ${theme.fonts.tertiary};
  }

  ul, ol {
    margin-left: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.md};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.medium};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.secondary};
    border-radius: ${theme.borderRadius.small};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.accent};
  }

  /* FromSoft-inspired loading animation */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 9999;
  }

  .loading-icon {
    width: 80px;
    height: 80px;
    border: 3px solid transparent;
    border-top: 3px solid ${theme.colors.accent};
    border-radius: 50%;
    animation: spin 1.5s linear infinite;
    position: relative;
    
    &:before, &:after {
      content: '';
      position: absolute;
      border: 3px solid transparent;
      border-radius: 50%;
    }
    
    &:before {
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      border-top: 3px solid ${theme.colors.primary};
      animation: spin 2s linear infinite reverse;
    }
    
    &:after {
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border-top: 3px solid ${theme.colors.text.primary};
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-accent {
    color: ${theme.colors.accent};
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }
`;

export default GlobalStyles;