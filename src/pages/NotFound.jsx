import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for doesn't exist or has been moved.</p>
    <Link to="/dashboard" style={{ marginTop: '2rem' }}>Return to Dashboard</Link>
  </div>
);

export default NotFound;