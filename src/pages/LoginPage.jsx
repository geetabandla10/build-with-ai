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
             <button 
               className="guest-login-btn glass" 
               onClick={() => { guestLogin(); navigate('/notes'); }}
             >
               <Sparkles size={16} />
               <span>Sign in as Guest (Bypass Auth)</span>
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
