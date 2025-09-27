// Theme inspired by FromSoft games (Dark Souls, Bloodborne, Elden Ring)
export const theme = {
  colors: {
    // Dark, muted colors with a medieval/gothic feel
    primary: '#8A0303', // Blood red
    secondary: '#3D3D3D', // Dark steel
    accent: '#C7A758', // Gold/brass
    background: {
      dark: '#1A1A1A', // Almost black
      medium: '#2A2A2A', // Dark gray
      light: '#3A3A2A', // Slightly lighter with a hint of green
    },
    text: {
      primary: '#E8E8E8', // Off-white
      secondary: '#AAAAAA', // Light gray
      accent: '#C7A758', // Gold/brass
      muted: '#777777', // Muted gray
    },
    status: {
      success: '#4D7E3E', // Forest green
      warning: '#C7A758', // Gold/brass
      danger: '#8A0303', // Blood red
      info: '#4A6670', // Slate blue
    },
    evo: {
      primary: '#1E3264', // Mitsubishi blue
      secondary: '#D10000', // Mitsubishi red
      body: '#CCCCCC', // Silver/gray for the car body
    }
  },
  fonts: {
    primary: '"Cinzel", serif', // Medieval-style serif font
    secondary: '"Cormorant Garamond", serif', // Elegant serif for body text
    tertiary: '"Roboto", sans-serif', // Clean sans-serif for UI elements
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    large: '0 8px 16px rgba(0, 0, 0, 0.7)',
    text: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  },
  borders: {
    thin: '1px solid #3D3D3D',
    medium: '2px solid #3D3D3D',
    thick: '4px solid #3D3D3D',
    accent: '2px solid #C7A758',
  },
  borderRadius: {
    small: '3px',
    medium: '5px',
    large: '10px',
    full: '50%',
  },
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
};