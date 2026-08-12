import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { logToConsole } from '../services/mockApi';
import { Shield, ArrowLeft, Users, Server, Database, Activity, RefreshCw } from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    logToConsole('CLIENT-UI', 'Requesting administrative system statistics...', 'info');
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
      logToConsole('CLIENT-UI', 'Administrative statistics fetched successfully.', 'success');
    } catch (err) {
      logToConsole('CLIENT-UI', `Failed to fetch admin statistics: ${err.message}`, 'error');
      setError(err.response?.data?.message || 'Access Forbidden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="admin-panel-page">
      <header className="navbar">
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <div className="logo-hex mini">
            <Shield size={16} />
          </div>
          <span>SecurityGuard Admin</span>
        </div>
        <div className="nav-profile">
          <span className="badge admin">{user?.role?.toUpperCase()}</span>
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

        <div className="hero-banner admin-theme">
          <div className="hero-text">
            <h2>System Administration Center</h2>
            <p>Protected endpoint. Verified via Client Route Guards & Server-side Authorization checks.</p>
          </div>
          <div className="hero-icon">
            <Shield size={64} className="glow-shield" />
          </div>
        </div>

        {error ? (
          <div className="alert alert-danger">
            <strong>Security Exception:</strong> {error}. Ensure your request headers possess valid Admin Bearer JWT signature.
          </div>
        ) : loading ? (
          <div className="card loading-card">
            <div className="spinner"></div>
            <p>Loading System Statistics...</p>
          </div>
        ) : (
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Database size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.totalPosts}</h3>
                <p>Simulated Posts DB Count</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.rolesRegistered?.length}</h3>
                <p>System Roles Authenticated</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Server size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.serverMemoryUsage}</h3>
                <p>Mock Heap Memory Allocated</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.connectedSessions}</h3>
                <p>Active Client Sessions</p>
              </div>
            </div>
          </div>
        )}

        <div className="card detailed-security-info">
          <h3>Guard Architecture Details</h3>
          <div className="security-flow">
            <div className="flow-step">
              <span className="step-num">1</span>
              <h4>Route Guard Validated</h4>
              <p>Router checks <code>allowedRoles={`['admin']`}</code> and verified user possesses the admin role.</p>
            </div>
            <div className="flow-step">
              <span className="step-num">2</span>
              <h4>Request Intercepted</h4>
              <p>Axios attached authorization token to header: <code>Bearer eyJhbGc...</code></p>
            </div>
            <div className="flow-step">
              <span className="step-num">3</span>
              <h4>Token Signature Checked</h4>
              <p>Mock backend decoded headers, verified signing keys, and checked expiry parameters before return.</p>
            </div>
          </div>
          <button onClick={fetchAdminStats} className="btn btn-secondary mt-3">
            <RefreshCw size={14} />
            <span>Reload Statistics</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
