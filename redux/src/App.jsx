import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addPost,
  updatePost,
  deletePost,
  setSimulatePublishError,
  clearActivityLogs,
  publishPostAsync,
  syncSocialMetrics,
  postsSelectors
} from './store/postsSlice';
import {
  Plus,
  Trash2,
  RefreshCw,
  Edit2,
  Share2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  FileText,
  Activity,
  Send,
  Sparkles,
  AlertTriangle,
  Terminal,
  Filter,
  TrendingUp,
  X
} from 'lucide-react';

// Custom Brand SVG Components for robust platform icons
const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

export default function App() {
  const dispatch = useDispatch();

  // Redux State
  const posts = useSelector(postsSelectors.selectAll);
  const isLoading = useSelector(state => state.posts.isLoading);
  const error = useSelector(state => state.posts.error);
  const simulatePublishError = useSelector(state => state.posts.simulatePublishError);
  const activityLogs = useSelector(state => state.posts.history);

  // Form State
  const [platform, setPlatform] = useState('twitter');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [scheduledTime, setScheduledTime] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);

  // Filters State
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simulation State
  const [liveSyncActive, setLiveSyncActive] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  // Live simulation effect
  useEffect(() => {
    let interval = null;
    if (liveSyncActive) {
      // Sync immediately on toggle
      dispatch(syncSocialMetrics());
      interval = setInterval(() => {
        dispatch(syncSocialMetrics());
        setSyncCount(c => c + 1);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveSyncActive, dispatch]);

  // Derived Analytics counts
  const analytics = useMemo(() => {
    let total = posts.length;
    let published = 0;
    let drafts = 0;
    let scheduled = 0;

    const platforms = {
      twitter: { total: 0, published: 0, draft: 0, scheduled: 0 },
      facebook: { total: 0, published: 0, draft: 0, scheduled: 0 },
      linkedin: { total: 0, published: 0, draft: 0, scheduled: 0 },
      instagram: { total: 0, published: 0, draft: 0, scheduled: 0 }
    };

    posts.forEach(post => {
      if (post.status === 'published') published++;
      else if (post.status === 'draft') drafts++;
      else if (post.status === 'scheduled') scheduled++;

      if (platforms[post.platform]) {
        platforms[post.platform].total++;
        if (post.status === 'published') platforms[post.platform].published++;
        else if (post.status === 'draft') platforms[post.platform].draft++;
        else if (post.status === 'scheduled') platforms[post.platform].scheduled++;
      }
    });

    return { total, published, drafts, scheduled, platforms };
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchPlatform = platformFilter === 'all' || post.platform === platformFilter;
      const matchStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchPlatform && matchStatus;
    });
  }, [posts, platformFilter, statusFilter]);

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (status === 'scheduled' && !scheduledTime) {
      alert('Please specify a scheduled time.');
      return;
    }

    if (editingPostId) {
      dispatch(updatePost({
        id: editingPostId,
        platform,
        content,
        status,
        scheduledTime: status === 'scheduled' ? scheduledTime : null
      }));
      setEditingPostId(null);
    } else {
      dispatch(addPost({
        platform,
        content,
        status,
        scheduledTime: status === 'scheduled' ? scheduledTime : null
      }));
    }

    setContent('');
    setScheduledTime('');
  };

  // Edit Click Handler
  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setPlatform(post.platform);
    setContent(post.content);
    setStatus(post.status);
    setScheduledTime(post.scheduledTime || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setContent('');
    setScheduledTime('');
  };

  const handleDeletePost = (id) => {
    dispatch(deletePost(id));
    if (editingPostId === id) {
      handleCancelEdit();
    }
  };

  const handlePublishNow = (id) => {
    dispatch(publishPostAsync(id));
  };

  const triggerMetricsSync = () => {
    dispatch(syncSocialMetrics());
  };

  // Icon Helper for Platform
  const getPlatformIcon = (plat, size = 16) => {
    switch (plat) {
      case 'twitter': return <TwitterIcon size={size} />;
      case 'facebook': return <FacebookIcon size={size} />;
      case 'linkedin': return <LinkedinIcon size={size} />;
      case 'instagram': return <InstagramIcon size={size} />;
      default: return null;
    }
  };

  // Color Helper for Platform
  const getPlatformColor = (plat) => {
    switch (plat) {
      case 'twitter': return '#18181b'; // Black
      case 'facebook': return '#1877f2'; // FB Blue
      case 'linkedin': return '#0077b5'; // LinkedIn Blue
      case 'instagram': return '#c13584'; // Instagram Pink
      default: return '#71717a';
    }
  };

  // Status Badge JSX Helper
  const renderStatusBadge = (postStatus) => {
    switch (postStatus) {
      case 'published':
        return (
          <span style={{ fontSize: '0.75rem', background: '#f4f4f5', color: '#16a34a', border: '1px solid #e4e4e7', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Published
          </span>
        );
      case 'draft':
        return (
          <span style={{ fontSize: '0.75rem', background: '#f4f4f5', color: '#71717a', border: '1px solid #e4e4e7', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span style={{ fontSize: '0.75rem', background: '#f4f4f5', color: '#2563eb', border: '1px solid #e4e4e7', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181b', letterSpacing: '-0.3px' }}>
            Redux Social Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '2px' }}>
            Manage and schedule posts across platform API mockups with real-time engagement growth simulations.
          </p>
        </div>

        {/* Global Loading / Error State Indication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <AlertTriangle size={12} /> {error}
            </div>
          )}
          {isLoading && (
            <div style={{ color: '#18181b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
              <RefreshCw size={12} className="animate-spin" /> Syncing...
            </div>
          )}
        </div>
      </div>

      {/* ANALYTICS SECTION (KPI CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        
        {/* Total Posts Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#71717a', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Total Posts</span>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: '#18181b' }}>{analytics.total}</div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>
            <span>X: {analytics.platforms.twitter.total}</span> • 
            <span>LN: {analytics.platforms.linkedin.total}</span> • 
            <span>IG: {analytics.platforms.instagram.total}</span> • 
            <span>FB: {analytics.platforms.facebook.total}</span>
          </div>
        </div>

        {/* Published Posts Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#71717a', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Published</span>
            <TrendingUp size={16} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: '#16a34a' }}>{analytics.published}</div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>
            <span>X: {analytics.platforms.twitter.published}</span> • 
            <span>LN: {analytics.platforms.linkedin.published}</span> • 
            <span>IG: {analytics.platforms.instagram.published}</span> • 
            <span>FB: {analytics.platforms.facebook.published}</span>
          </div>
        </div>

        {/* Drafts Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#71717a', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Drafts</span>
            <FileText size={16} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: '#ca8a04' }}>{analytics.drafts}</div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>
            <span>X: {analytics.platforms.twitter.draft}</span> • 
            <span>LN: {analytics.platforms.linkedin.draft}</span> • 
            <span>IG: {analytics.platforms.instagram.draft}</span> • 
            <span>FB: {analytics.platforms.facebook.draft}</span>
          </div>
        </div>

        {/* Scheduled Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#71717a', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Scheduled</span>
            <Clock size={16} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: '#2563eb' }}>{analytics.scheduled}</div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>
            <span>X: {analytics.platforms.twitter.scheduled}</span> • 
            <span>LN: {analytics.platforms.linkedin.scheduled}</span> • 
            <span>IG: {analytics.platforms.instagram.scheduled}</span> • 
            <span>FB: {analytics.platforms.facebook.scheduled}</span>
          </div>
        </div>

      </div>

      {/* CORE WORKSPACE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: CREATOR FORM & SIMULATOR / LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* POST CREATOR PANEL */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#18181b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <Plus size={16} />
              {editingPostId ? 'Edit Social Post' : 'Compose Social Post'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Select Platform */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Platform Target</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {['twitter', 'facebook', 'linkedin', 'instagram'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPlatform(plat)}
                      style={{
                        padding: '0.4rem',
                        borderRadius: '6px',
                        background: platform === plat ? '#f4f4f5' : '#ffffff',
                        border: `1px solid ${platform === plat ? '#18181b' : '#d4d4d8'}`,
                        color: platform === plat ? '#18181b' : '#71717a',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      {getPlatformIcon(plat, 14)}
                      {plat === 'twitter' ? 'X' : plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Post Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What would you like to share today?"
                  rows={4}
                  required
                  style={{ width: '100%', resize: 'none', fontSize: '0.85rem', lineHeight: '1.4' }}
                />
              </div>

              {/* Status Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Publishing State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <option value="published">Publish Immediately</option>
                  <option value="draft">Save as Draft</option>
                  <option value="scheduled">Schedule Post</option>
                </select>
              </div>

              {/* Scheduled Time (Conditioned) */}
              {status === 'scheduled' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Release Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required={status === 'scheduled'}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingPostId ? 'Save Changes' : 'Create Post'}
                </button>
                {editingPostId && (
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit} style={{ padding: '0.5rem' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* SIMULATION PANEL */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#18181b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} />
              Social Simulator Settings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Simulator Options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f4f5', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#18181b' }}>Mock API Error Toggle</h4>
                  <p style={{ fontSize: '0.7rem', color: '#71717a' }}>Forces async publishing thunk to fail.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={simulatePublishError}
                    onChange={(e) => dispatch(setSimulatePublishError(e.target.checked))}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f4f5', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#18181b' }}>Live Platform Sync {syncCount > 0 && `(Cycles: ${syncCount})`}</h4>
                  <p style={{ fontSize: '0.7rem', color: '#71717a' }}>Simulates organic views/likes every 5s.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={liveSyncActive}
                    onChange={(e) => setLiveSyncActive(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Sync Actions */}
              <button
                type="button"
                className="btn btn-outline"
                onClick={triggerMetricsSync}
                disabled={isLoading}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                Sync Platforms Manually
              </button>

            </div>
          </div>

          {/* ACTIVITY LOG TIMELINE */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#18181b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} style={{ color: '#71717a' }} />
                Platform Activity Log
              </h2>
              {activityLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(clearActivityLogs())}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '6px', height: '180px', overflowY: 'auto', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activityLogs.length === 0 ? (
                <div style={{ color: '#71717a', fontSize: '0.75rem', textAlign: 'center', padding: '1.5rem 0' }}>No activities logged.</div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderBottom: '1px solid #f4f4f5', paddingBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                      <span style={{
                        color: log.action.includes('FAILED') ? '#dc2626' : 
                               log.action.includes('SUCCESS') ? '#16a34a' : 
                               log.action.includes('PENDING') ? '#2563eb' : '#71717a',
                        fontWeight: 600
                      }}>
                        [{log.action}]
                      </span>
                      <span style={{ color: '#a1a1aa' }}>{log.time}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#27272a', wordBreak: 'break-word', marginTop: '1px' }}>
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: POST FEED & FILTERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* FILTER CONTROLS */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            {/* Filter Platform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Filter size={10} /> Platform:
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {['all', 'twitter', 'facebook', 'linkedin', 'instagram'].map(plat => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      textTransform: 'capitalize',
                      background: platformFilter === plat ? '#e4e4e7' : 'transparent',
                      color: platformFilter === plat ? '#18181b' : '#71717a',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {plat === 'all' ? 'All' : plat === 'twitter' ? 'X' : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Status:</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {['all', 'published', 'draft', 'scheduled'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      textTransform: 'capitalize',
                      background: statusFilter === st ? '#e4e4e7' : 'transparent',
                      color: statusFilter === st ? '#18181b' : '#71717a',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* POSTS LIST FEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fafafa', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justify: 'center', color: '#71717a' }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ fontSize: '0.9rem', color: '#18181b', fontWeight: 600 }}>No Posts Found</h3>
                <p style={{ fontSize: '0.78rem', color: '#71717a', maxWidth: '240px' }}>
                  There are no posts matching your selected filters.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderLeft: `3px solid ${getPlatformColor(post.platform)}`
                  }}
                >
                  
                  {/* Card Header Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        background: '#fafafa',
                        border: '1px solid #e4e4e7',
                        color: getPlatformColor(post.platform),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getPlatformIcon(post.platform, 14)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', color: '#18181b' }}>
                          {post.platform === 'twitter' ? 'X (Twitter)' : post.platform}
                        </h4>
                        <span style={{ fontSize: '0.65rem', color: '#71717a', fontWeight: 500 }}>
                          {post.status === 'published' && post.publishedTime && (
                            <span>Published {new Date(post.publishedTime).toLocaleTimeString()}</span>
                          )}
                          {post.status === 'scheduled' && post.scheduledTime && (
                            <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> Release: {new Date(post.scheduledTime).toLocaleString()}
                            </span>
                          )}
                          {post.status === 'draft' && (
                            <span>Draft mode</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {renderStatusBadge(post.status)}
                    </div>
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: '0.85rem', color: '#27272a', lineHeight: '1.45', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {post.content}
                  </p>

                  {/* Post Footer (Metrics / Actions) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e4e4e7', paddingTop: '0.6rem', marginTop: '0.1rem' }}>
                    
                    {/* Metrics */}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      {post.status === 'published' ? (
                        <>
                          <span style={{ fontSize: '0.72rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ThumbsUp size={10} /> {post.likes || 0}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Eye size={10} /> {post.views || 0}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Share2 size={10} /> {post.shares || 0}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageCircle size={10} /> {post.comments || 0}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontStyle: 'italic' }}>
                          Analytics inactive.
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      
                      {/* Publish Now */}
                      {post.status !== 'published' && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handlePublishNow(post.id)}
                          disabled={isLoading}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          <Send size={10} /> Publish
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleEditClick(post)}
                        style={{ padding: '0.25rem' }}
                        title="Edit Post"
                      >
                        <Edit2 size={10} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeletePost(post.id)}
                        style={{ padding: '0.25rem' }}
                        title="Delete Post"
                      >
                        <Trash2 size={10} />
                      </button>

                    </div>

                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
