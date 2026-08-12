import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit3, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { logToConsole } from '../services/mockApi';

const EditorSpace = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="editor-space-page">
      <header className="navbar">
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <div className="logo-hex mini editor-theme">
            <Edit3 size={16} />
          </div>
          <span>SecurityGuard Editor Workspace</span>
        </div>
        <div className="nav-profile">
          <span className="badge editor">{user?.role?.toUpperCase()}</span>
          <span className="profile-name">{user?.name}</span>
          <button onClick={logout} className="logout-btn">Log Out</button>
        </div>
      </header>

      <main className="dashboard-content container">
        <div className="back-nav">
          <button onClick={() => navigate('/dashboard')} className="btn-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="hero-banner editor-theme">
          <div className="hero-text">
            <h2>Shared Editor Workspace</h2>
            <p>Protected endpoint. Accessible to roles: <code>['admin', 'editor']</code>.</p>
          </div>
          <div className="hero-icon">
            <Edit3 size={64} className="glow-shield" />
          </div>
        </div>

        <div className="card detailed-security-info">
          <h3>Verification Details</h3>
          <p className="mb-4">
            This route validates access using a compound check. It ensures the user is logged in, and that their role belongs in the allowed list:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="role-check-card passed">
              <CheckCircle size={20} className="check-icon" />
              <h4>Admin Role Status</h4>
              <p>Allowed. Verified with full permissions.</p>
            </div>

            <div className="role-check-card passed">
              <CheckCircle size={20} className="check-icon" />
              <h4>Editor Role Status</h4>
              <p>Allowed. Verified with write/edit permissions.</p>
            </div>

            <div className="role-check-card failed">
              <Shield size={20} className="check-icon" />
              <h4>Viewer Role Status</h4>
              <p>Blocked. Redirected automatically to <code>/unauthorized</code>.</p>
            </div>
          </div>

          <div className="mt-4 p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid #6366f1' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>
              <strong>Least Privilege Principle:</strong> Access control must be configured on a need-to-know basis. Viewers can view content inside components on the main dashboard, but should never be allowed to access editor-specific page files.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorSpace;
