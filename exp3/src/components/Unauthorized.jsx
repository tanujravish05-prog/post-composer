import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { logToConsole } from '../services/mockApi';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    logToConsole('CLIENT-UI', 'Redirecting user back to dashboard from unauthorized view.', 'info');
    navigate('/dashboard');
  };

  return (
    <div className="unauthorized-page">
      <div className="unauth-card">
        <div className="unauth-icon-container">
          <ShieldX size={48} className="unauth-icon" />
        </div>
        
        <h2>Access Forbidden</h2>
        <p className="unauth-desc">
          Your current user role <strong className={`badge ${user?.role}`}>{user?.role?.toUpperCase()}</strong> does not possess the credentials required to view this protected endpoint.
        </p>

        <div className="unauth-details">
          <div className="detail-row">
            <span>Identity:</span>
            <strong>{user?.name || 'Anonymous User'}</strong>
          </div>
          <div className="detail-row">
            <span>Permission Check:</span>
            <span style={{ color: '#ef4444' }}>FAIL (Least Privilege Enforced)</span>
          </div>
        </div>

        <button onClick={handleGoBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
