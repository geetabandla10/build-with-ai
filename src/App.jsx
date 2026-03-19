import React from 'react';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import NotesSaver from './pages/NotesSaver';
import YouTubeSummariser from './pages/YouTubeSummariser';
import JobSearch from './pages/JobSearch';
import ResumeMaker from './pages/ResumeMaker';
import LoginPage from './pages/LoginPage';
import './App.css';

// Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#fff', background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <ErrorBoundary>
      <div className="app-container">
        {user && <Sidebar />}
        <main className={`main-content ${!user ? 'full-width' : ''}`}>
          <div className="content-inner">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/notes" /> : <LoginPage />} />
              
              <Route path="/" element={<ProtectedRoute><Navigate to="/notes" /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesSaver /></ProtectedRoute>} />
              <Route path="/youtube" element={<ProtectedRoute><YouTubeSummariser /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
              <Route path="/resume" element={<ProtectedRoute><ResumeMaker /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

