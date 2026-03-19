import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    login(credentialResponse.credential);
    navigate('/notes');
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <ShieldCheck size={48} color="#818cf8" />
          </div>
          <h1 className="gradient-text">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access your AI Suite Dashboard</p>
        </div>

        <div className="login-body">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
                theme="filled_blue"
                shape="pill"
              />
            </div>
          ) : (
            <div className="auth-notice glass">
              <p>Google Auth is currently unconfigured.</p>
              <small>Add <code>VITE_GOOGLE_CLIENT_ID</code> to your <code>.env</code> to activate.</small>
            </div>
          )}

          <div className="guest-login-wrapper">
             <div className="auth-troubleshooting glass">
               <p>🔑 Quick Access</p>
               <small>Google Auth may be blocked on some environments. Use Guest Login for instant access.</small>
             </div>
             <button 
               className="guest-login-btn primary-glow" 
               onClick={() => { guestLogin(); navigate('/notes'); }}
               style={{ 
                 marginTop: '1rem', width: '100%', padding: '12px', 
                 borderRadius: '30px', border: 'none', background: 'linear-gradient(45deg, #6366f1, #a855f7)',
                 color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', 
                 justifyContent: 'center', gap: '10px', cursor: 'pointer',
                 boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
               }}
             >
               <Sparkles size={18} />
               <span>Access as Guest (Skip Login)</span>
             </button>
          </div>
          
          <div className="login-divider">
            <span>Secure Access Powerred by Google</span>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <Sparkles size={16} color="#c084fc" />
              <span>Unlock AI-powered tools</span>
            </div>
            <div className="feature-item">
              <Sparkles size={16} color="#c084fc" />
              <span>Persist your notes & insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
