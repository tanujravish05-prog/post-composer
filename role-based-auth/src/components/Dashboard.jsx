import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { mockBackend, logToConsole } from '../services/mockApi';
import ConsoleLog from './ConsoleLog';
import { 
  Shield, User, Settings, Database, ExternalLink, 
  Trash2, Edit, Plus, RefreshCw, AlertCircle, CheckCircle, Flame
} from 'lucide-react';

const Dashboard = () => {
  const { 
    user, logout, storageStrategy, setStorageStrategy, 
    accessToken, refreshToken, getDecodedAccessToken, getDecodedRefreshToken 
  } = useAuth();
  
  const navigate = useNavigate();

  // App States
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  
  // Settings States
  const [tokenExpiry, setTokenExpiry] = useState(15);
  const [networkDelay, setNetworkDelay] = useState(500);

  // Form States (Create / Edit Post)
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Decoded Token Live States (polling countdown)
  const [decodedAccess, setDecodedAccess] = useState(null);
  const [decodedRefresh, setDecodedRefresh] = useState(null);
  const [timeToExpiry, setTimeToExpiry] = useState(0);

  // Sync settings with mockBackend settings initially
  useEffect(() => {
    const settings = mockBackend.getSettings();
    setTokenExpiry(settings.accessTokenExpirySeconds);
    setNetworkDelay(settings.latencyMs);
  }, []);

  // Fetch posts on mount
  const fetchPosts = async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    logToConsole('CLIENT-UI', 'Dispatching request to fetch posts list...', 'info');
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
      logToConsole('CLIENT-UI', `Fetched ${response.data.length} posts successfully.`, 'success');
    } catch (err) {
      logToConsole('CLIENT-UI', `Fetch posts failed: ${err.message}`, 'error');
      setErrorPosts(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Poll token decoded payload and expiry countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const accessPayload = getDecodedAccessToken();
      const refreshPayload = getDecodedRefreshToken();
      
      setDecodedAccess(accessPayload);
      setDecodedRefresh(refreshPayload);

      if (accessPayload) {
        const now = Math.floor(Date.now() / 1000);
        const diff = accessPayload.exp - now;
        setTimeToExpiry(diff > 0 ? diff : 0);
      } else {
        setTimeToExpiry(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getDecodedAccessToken, getDecodedRefreshToken, accessToken]);

  // Handle settings change
  const handleSettingsUpdate = (expiry, delayMs) => {
    mockBackend.updateSettings(Number(expiry), Number(delayMs));
    setTokenExpiry(expiry);
    setNetworkDelay(delayMs);
  };

  // Simulate token expiry by mutating stored token timestamp directly in storage
  const handleForceExpiry = () => {
    logToConsole('CLIENT-UI', 'Simulating manual token expiry...', 'warning');
    const strategy = storageStrategy;
    
    let activeToken = null;
    if (strategy === 'localStorage') {
      activeToken = localStorage.getItem('access_token');
    } else if (strategy === 'sessionStorage') {
      activeToken = sessionStorage.getItem('access_token');
    } else {
      activeToken = accessToken;
    }

    if (!activeToken) {
      logToConsole('CLIENT-UI', 'Cannot expire token: No access token is present.', 'error');
      return;
    }

    try {
      // Modify access token payload exp parameter
      const parts = activeToken.split('.');
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
      
      // Set expiry to 10 seconds ago
      payload.exp = Math.floor(Date.now() / 1000) - 10;
      
      const newPayloadEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      const expiredToken = `${parts[0]}.${newPayloadEncoded}.${parts[2]}`;

      // Write back to appropriate storage location
      if (strategy === 'localStorage') {
        localStorage.setItem('access_token', expiredToken);
      } else if (strategy === 'sessionStorage') {
        sessionStorage.setItem('access_token', expiredToken);
      } else {
        // We trigger mock storage update
        api.defaults.headers.common['Authorization'] = `Bearer ${expiredToken}`;
      }
      
      logToConsole('CLIENT-UI', 'Access Token payload mutated: Expiration set to 10 seconds ago.', 'success');
      logToConsole('CLIENT-UI', 'Next HTTP request will trigger a 401 refresh sequence.', 'warning');
      
      // Force trigger state update
      setDecodedAccess(payload);
      setTimeToExpiry(0);
    } catch (e) {
      logToConsole('CLIENT-UI', 'Error mutating token expiry: ' + e.message, 'error');
    }
  };

  // Corrupt access token (test validation fail)
  const handleCorruptToken = () => {
    logToConsole('CLIENT-UI', 'Corrupting active access token in storage...', 'warning');
    const strategy = storageStrategy;
    const garbageToken = 'invalid_header.corrupted_payload_data.bad_signature_hash';

    if (strategy === 'localStorage') {
      localStorage.setItem('access_token', garbageToken);
    } else if (strategy === 'sessionStorage') {
      sessionStorage.setItem('access_token', garbageToken);
    } else {
      // Memory strategy update
      api.defaults.headers.common['Authorization'] = `Bearer ${garbageToken}`;
    }

    logToConsole('CLIENT-UI', 'Access Token replaced with malformed payload.', 'success');
    logToConsole('CLIENT-UI', 'Next HTTP request will be rejected by backend signature verification.', 'error');
  };

  // Create / Edit Post Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Title and content are required.');
      setFormSubmitting(false);
      return;
    }

    const payload = { title: formTitle, content: formContent };

    try {
      if (editingPost) {
        logToConsole('CLIENT-UI', `Sending PUT request to edit post ID: ${editingPost.id}`, 'info');
        const res = await api.put(`/posts/${editingPost.id}`, payload);
        logToConsole('CLIENT-UI', 'Post edited successfully.', 'success');
        setPosts(posts.map(p => p.id === editingPost.id ? res.data : p));
      } else {
        logToConsole('CLIENT-UI', 'Sending POST request to create new post...', 'info');
        const res = await api.post('/posts', payload);
        logToConsole('CLIENT-UI', 'Post created successfully.', 'success');
        setPosts([res.data, ...posts]);
      }
      // Reset Form
      setFormTitle('');
      setFormContent('');
      setShowForm(false);
      setEditingPost(null);
    } catch (err) {
      logToConsole('CLIENT-UI', `CRUD operation failed: ${err.message}`, 'error');
      setFormError(err.response?.data?.message || 'Operation failed. Verify role permissions.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    logToConsole('CLIENT-UI', `Sending DELETE request for post ID: ${id}`, 'info');
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
      logToConsole('CLIENT-UI', `Deleted post ID: ${id} successfully.`, 'success');
    } catch (err) {
      logToConsole('CLIENT-UI', `Delete failed: ${err.message}`, 'error');
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper check for role permission conditions
  const canCreateOrEdit = user && (user.role === 'admin' || user.role === 'editor');
  const canDelete = user && user.role === 'admin';

  return (
    <div className="dashboard-page">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="logo-hex mini">
            <Shield size={16} />
          </div>
          <span>RoleSecurityGuard</span>
        </div>
        <div className="nav-profile">
          <div className="user-profile-badge">
            <User size={14} />
            <span className={`badge ${user?.role}`}>{user?.role?.toUpperCase()}</span>
          </div>
          <span className="profile-name">{user?.name}</span>
          <button onClick={logout} className="logout-btn">Log Out</button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid container">
        
        {/* Left Hand side column: Controls, Token metadata */}
        <div className="dashboard-sidebar">
          
          {/* Storage & Expiry Simulation Panel */}
          <div className="card control-card">
            <div className="card-title">
              <Settings size={18} />
              <h3>Simulator Parameters</h3>
            </div>
            
            <div className="control-item">
              <label>Storage Strategy</label>
              <div className="strategy-toggle">
                <button 
                  onClick={() => setStorageStrategy('localStorage')}
                  className={`strategy-btn ${storageStrategy === 'localStorage' ? 'active' : ''}`}
                >
                  localStorage
                </button>
                <button 
                  onClick={() => setStorageStrategy('sessionStorage')}
                  className={`strategy-btn ${storageStrategy === 'sessionStorage' ? 'active' : ''}`}
                >
                  sessionStorage
                </button>
                <button 
                  onClick={() => setStorageStrategy('memory')}
                  className={`strategy-btn ${storageStrategy === 'memory' ? 'active' : ''}`}
                >
                  In-Memory
                </button>
              </div>
              <p className="helper-text">
                {storageStrategy === 'localStorage' && 'Tokens persist across page reloads & tabs (Vulnerable to XSS).'}
                {storageStrategy === 'sessionStorage' && 'Tokens clear when tab is closed.'}
                {storageStrategy === 'memory' && 'Tokens clear immediately on page refresh (Secure, non-persistent).'}
              </p>
            </div>

            <div className="control-item">
              <div className="slider-header">
                <label>Token Expiry (sec)</label>
                <span className="val-badge">{tokenExpiry}s</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="60" 
                value={tokenExpiry} 
                onChange={(e) => handleSettingsUpdate(e.target.value, networkDelay)}
              />
            </div>

            <div className="control-item">
              <div className="slider-header">
                <label>Server Latency (ms)</label>
                <span className="val-badge">{networkDelay}ms</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="100" 
                value={networkDelay} 
                onChange={(e) => handleSettingsUpdate(tokenExpiry, e.target.value)}
              />
            </div>

            <div className="simulation-actions">
              <button onClick={handleForceExpiry} className="btn-sim expiry">
                <Flame size={14} />
                <span>Simulate Token Expiry</span>
              </button>
              <button onClick={handleCorruptToken} className="btn-sim corrupt">
                <AlertCircle size={14} />
                <span>Corrupt Access Token</span>
              </button>
            </div>
          </div>

          {/* Token Inspector Panel */}
          <div className="card token-card">
            <div className="card-title">
              <Database size={18} />
              <h3>JWT Token Inspector</h3>
            </div>
            
            <div className="token-meta-section">
              <div className="meta-header">
                <span>Access Token</span>
                {timeToExpiry > 0 ? (
                  <span className="expiry-counter success">Active ({timeToExpiry}s left)</span>
                ) : (
                  <span className="expiry-counter expired">Expired / Missing</span>
                )}
              </div>
              
              {decodedAccess ? (
                <div className="token-json-box">
                  <div className="json-title">Decoded JWT Payload</div>
                  <pre>
                    {JSON.stringify(decodedAccess, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="token-empty-state">No Access Token parsed.</div>
              )}
            </div>

            <div className="token-meta-section">
              <div className="meta-header">
                <span>Refresh Token</span>
                {decodedRefresh ? (
                  <span className="expiry-counter active">Stored</span>
                ) : (
                  <span className="expiry-counter expired">Missing</span>
                )}
              </div>
              
              {decodedRefresh ? (
                <div className="token-json-box">
                  <div className="json-title">Decoded JWT Payload</div>
                  <pre>
                    {JSON.stringify(decodedRefresh, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="token-empty-state">No Refresh Token parsed.</div>
              )}
            </div>
          </div>

          {/* Nav Links Panel (Route Guards Demo) */}
          <div className="card route-demo-card">
            <div className="card-title">
              <Shield size={18} />
              <h3>Demo Route Guards</h3>
            </div>
            <p className="helper-text mb-3">Test client-side route access control permissions:</p>
            <div className="links-stack">
              <Link to="/admin-panel" className="nav-demo-link admin">
                <span>Admin Panel</span>
                <div className="link-badge-row">
                  <span className="badge admin">Admin Only</span>
                  <ExternalLink size={14} />
                </div>
              </Link>
              <Link to="/editor-space" className="nav-demo-link editor">
                <span>Editor Workspace</span>
                <div className="link-badge-row">
                  <span className="badge editor">Editor/Admin</span>
                  <ExternalLink size={14} />
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Hand side column: Posts DB UI & Activity Logs Console */}
        <div className="dashboard-main">
          
          {/* Posts Database Mock CRUD */}
          <div className="card posts-card">
            <div className="posts-card-header">
              <div className="posts-card-title">
                <Database size={20} />
                <h2>Simulated Posts Feed</h2>
              </div>
              <div className="posts-card-actions">
                <button onClick={fetchPosts} className="btn-circle" title="Refresh Posts">
                  <RefreshCw size={16} />
                </button>
                {canCreateOrEdit && (
                  <button 
                    onClick={() => {
                      setEditingPost(null);
                      setFormTitle('');
                      setFormContent('');
                      setFormError(null);
                      setShowForm(!showForm);
                    }} 
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                    <span>Create Post</span>
                  </button>
                )}
              </div>
            </div>

            {/* Creation Form */}
            {showForm && (
              <form onSubmit={handleFormSubmit} className="post-form-card">
                <h3>{editingPost ? 'Edit Post' : 'Write New Post'}</h3>
                {formError && (
                  <div className="alert alert-danger py-2">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="input-group">
                  <label htmlFor="post-title">Title</label>
                  <input
                    type="text"
                    id="post-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter post topic..."
                    disabled={formSubmitting}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="post-content">Body Content</label>
                  <textarea
                    id="post-content"
                    value={formContent}
                    rows="3"
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Enter markdown or text contents..."
                    disabled={formSubmitting}
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? 'Submitting...' : editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            )}

            {/* Posts Content */}
            {errorPosts ? (
              <div className="alert alert-danger my-3">
                <AlertCircle size={18} />
                <span>Error loading posts: {errorPosts}</span>
              </div>
            ) : loadingPosts && posts.length === 0 ? (
              <div className="posts-empty-state">
                <div className="spinner"></div>
                <p>Retrieving Posts Feed...</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-header">
                      <h3>{post.title}</h3>
                      <div className="post-meta-badges">
                        <span className="post-date">{post.date}</span>
                        <span className="post-author">By: {post.author}</span>
                      </div>
                    </div>
                    <p className="post-body">{post.content}</p>
                    
                    {/* Conditionally Render Edit / Delete actions based on RBAC */}
                    <div className="post-actions">
                      {canCreateOrEdit ? (
                        <button onClick={() => handleEditClick(post)} className="post-action-btn edit" title="Edit Post">
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button disabled className="post-action-btn disabled" title="Requires Editor role">
                          <Edit size={14} />
                          <span>Edit (Blocked)</span>
                        </button>
                      )}

                      {canDelete ? (
                        <button onClick={() => handleDeleteClick(post.id)} className="post-action-btn delete" title="Delete Post">
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <button disabled className="post-action-btn disabled" title="Requires Admin role">
                          <Trash2 size={14} />
                          <span>Delete (Blocked)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Embedded Real-time Terminal Logs */}
          <ConsoleLog />

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
