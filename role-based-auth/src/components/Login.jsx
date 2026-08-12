import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Lock, ArrowRight, UserCheck, Edit3, Eye } from 'lucide-react';
import { logToConsole } from '../services/mockApi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route where the user was trying to go, default to dashboard
  const destination = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e, directUser = null) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const userToLogin = directUser || username;
    const passToLogin = directUser 
      ? (directUser === 'admin' ? 'admin' : 'password123') 
      : password;

    if (!userToLogin || !passToLogin) {
      setError('Please provide both username and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(userToLogin, passToLogin);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role) => {
    logToConsole('CLIENT-UI', `Quick-fill clicked for role: "${role.toUpperCase()}"`, 'info');
    setUsername(role);
    const pass = role === 'admin' ? 'admin' : 'password123';
    setPassword(pass);
    handleLogin(null, role);
  };

  return (
    <div className="login-page">
      <div className="login-background-glow"></div>
      <div className="login-card-container">
        
        <div className="login-card-left">
          <div className="brand-logo">
            <div className="logo-hex">
              <ShieldAlert size={26} className="logo-shield" />
            </div>
            <span>RoleSecurityGuard</span>
          </div>
          
          <div className="login-intro">
            <h2>Welcome Back</h2>
            <p>Demonstrating client-side Role-Based Access Control and Token Lifecycle Management securely.</p>
          </div>

          {error && (
            <div className="login-error-alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-field">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, editor, viewer"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-field">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="login-card-right">
          <h3>Quick-Fill Roles</h3>
          <p className="subtitle">Select a predefined user role to test route guarding and actions.</p>
          
          <div className="role-cards-grid">
            <div className="role-card admin" onClick={() => handleQuickLogin('admin')}>
              <div className="role-card-header">
                <UserCheck size={20} className="role-card-icon" />
                <span className="badge admin">ADMIN</span>
              </div>
              <h4>Antigravity Admin</h4>
              <p>Full Read/Write, edit metadata, delete posts, and access the restricted Admin Panel route.</p>
              <div className="role-card-creds">
                <span>Credentials: </span>
                <code>admin</code> / <code>admin</code>
              </div>
              <div className="role-card-footer">
                <span>Select & Login</span>
                <ArrowRight size={14} className="hover-arrow" />
              </div>
            </div>

            <div className="role-card editor" onClick={() => handleQuickLogin('editor')}>
              <div className="role-card-header">
                <Edit3 size={20} className="role-card-icon" />
                <span className="badge editor">EDITOR</span>
              </div>
              <h4>Emily Editor</h4>
              <p>Read and Write permissions. Can create and modify posts. Restricted from deleting posts.</p>
              <div className="role-card-creds">
                <span>Credentials: </span>
                <code>editor</code> / <code>password123</code>
              </div>
              <div className="role-card-footer">
                <span>Select & Login</span>
                <ArrowRight size={14} className="hover-arrow" />
              </div>
            </div>

            <div className="role-card viewer" onClick={() => handleQuickLogin('viewer')}>
              <div className="role-card-header">
                <Eye size={20} className="role-card-icon" />
                <span className="badge viewer">VIEWER</span>
              </div>
              <h4>Victor Viewer</h4>
              <p>Read-only access. Can browse the dashboard. Blocked from creating, editing, or deleting posts.</p>
              <div className="role-card-creds">
                <span>Credentials: </span>
                <code>viewer</code> / <code>password123</code>
              </div>
              <div className="role-card-footer">
                <span>Select & Login</span>
                <ArrowRight size={14} className="hover-arrow" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
