import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  if (!user) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // If the route requires admin privileges and the user is not an admin,
  // redirect them to the main dashboard.
  if (requireAdmin && user.user_metadata?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // If the user is authenticated and has the required permissions, render the child components
  return children;
};

export default ProtectedRoute;