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

function AppContent() {
  const { user } = useAuth();
  
  return (
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

