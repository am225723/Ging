import { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'password123', // In a real app, never store passwords in plain text
    role: 'admin',
    name: 'Admin User',
    avatar: '/assets/images/characters/solaire.png'
  },
  {
    id: 2,
    username: 'user',
    password: 'password123',
    role: 'user',
    name: 'Regular User',
    avatar: '/assets/images/characters/chosen_undead.png'
  }
];

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('ericKeepUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('ericKeepUser');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (username, password) => {
    setError('');
    
    // Find user in our mock database
    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      // Remove password before storing user
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('ericKeepUser', JSON.stringify(userWithoutPassword));
      return true;
    } else {
      setError('Invalid username or password');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ericKeepUser');
  };

  // Check if user has admin role
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;