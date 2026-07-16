import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Smile, 
  Hash, 
  Send,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat
} from 'lucide-react';
import './App.css';

// Custom SVG Brand Icons since modern lucide-react does not bundle brand logos
function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" style={props.style} className={props.className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" style={props.style} className={props.className}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" style={props.style} className={props.className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Initial platform configuration
const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    color: '#1d9bf0',
    icon: TwitterIcon,
    maxChars: 280,
    hasLinkAdjust: true,
    rules: {
      media: 'Max 4 images OR 1 video. No mixing.',
      charLimit: '280 characters maximum.'
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877f2',
    icon: FacebookIcon,
    maxChars: 63206,
    hasLinkAdjust: false,
    rules: {
      media: 'Optional images or video.',
      charLimit: '63,206 characters maximum.'
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0a66c2',
    icon: LinkedInIcon,
    maxChars: 3000,
    hasLinkAdjust: false,
    rules: {
      media: 'Optional images or video.',
      charLimit: '3,000 characters maximum.'
    }
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: '#e1306c',
    icon: InstagramIcon,
    maxChars: 2200,
    hasLinkAdjust: false,
    rules: {
      media: 'Mandatory. At least 1 image or video.',
      charLimit: '2,200 characters max, limit 30 hashtags.'
    }
  }
};



// AI Rewriting mock presets
const AI_REWRITE_PRESETS = {
  professional: "Excited to share our latest milestone! We've designed a dynamic, multi-platform post composer dashboard featuring real-time constraint validation and platform-specific content overrides. Streamlining publishing workflows has never been easier. Try the live preview below!",
  hype: "OMG! 🚀 Content creators, this is for you! Say goodbye to formatting headaches. Compose once and customize overrides for X, Facebook, LinkedIn, & Instagram in one screen! Live previews + AI tone assist included. Check it out now! 🔥🎉 #SocialMedia #SaaS",
  brief: "Launched: Multi-platform social composer. Enforces platform rules, media constraints, and overrides in real-time. Try the live editor.",
  humor: "Write one post. Post it to 4 platforms. Realize you made a typo on all 4. Our new composer dashboard lets you write platform-specific overrides so you can fail uniquely and creatively on each platform. You're welcome. 💅 #Workflow"
};

export default function App() {
  // --- States ---
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin']);
  const [unifiedContent, setUnifiedContent] = useState('');
  
  // Platform specific overrides
  const [useOverride, setUseOverride] = useState({
    twitter: false,
    facebook: false,
    linkedin: false,
    instagram: false
  });
  const [overrides, setOverrides] = useState({
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: ''
  });
  
  // Active composer tab ('unified' or platform ids)
  const [activeTab, setActiveTab] = useState('unified');
  
  // Media Files list (each item: { id, name, type, url })
  const [mediaList, setMediaList] = useState([]);
  
  // Active Preview platform tab
  const [activePreviewPlatform, setActivePreviewPlatform] = useState('twitter');
  
  // AI rewrites states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSelectedTone, setAiSelectedTone] = useState('');
  
  // Scheduler state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Success publishing modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  // Posted History states
  const [postedHistory, setPostedHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('post_composer_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [selectedPostedPost, setSelectedPostedPost] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('post_composer_history', JSON.stringify(postedHistory));
    } catch (e) {
      console.error(e);
    }
  }, [postedHistory]);

  // Interactive mockup engagement states (Like counters)
  const [likes, setLikes] = useState({
    twitter: 42,
    facebook: 88,
    linkedin: 154,
    instagram: 201
  });
  const [liked, setLiked] = useState({
    twitter: false,
    facebook: false,
    linkedin: false,
    instagram: false
  });

  const fileInputRef = useRef(null);

  // --- Helper Calculations ---
  
  // Detect links and calculate length adjustment (Twitter t.co standard is 23 chars)
  const getCharacterCount = (text, platformId) => {
    if (!text) return 0;
    const platform = PLATFORMS[platformId];
    if (platform?.hasLinkAdjust) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = text.match(urlRegex) || [];
      const cleanText = text.replace(urlRegex, "");
      return cleanText.length + (urls.length * 23);
    }
    return text.length;
  };

  const getHashtagCount = (text) => {
    if (!text) return 0;
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags.length;
  };

  // Get active text content for a platform (returns override or unified)
  const getContentForPlatform = (platformId) => {
    if (useOverride[platformId]) {
      return overrides[platformId];
    }
    return unifiedContent;
  };

  // Run full validation validation check for a platform
  const validatePlatform = (platformId) => {
    const text = getContentForPlatform(platformId);
    const charCount = getCharacterCount(text, platformId);
    const hashtags = getHashtagCount(text);
    
    const errors = [];
    const warnings = [];

    // Character limit validations
    const maxChars = PLATFORMS[platformId].maxChars;
    if (charCount > maxChars) {
      errors.push(`Exceeds character limit by ${charCount - maxChars} chars (Limit: ${maxChars}).`);
    } else if (maxChars - charCount < 20 && maxChars > 280) {
      warnings.push(`Approaching character limit.`);
    }

    // Media validations
    const imageCount = mediaList.filter(m => m.type.startsWith('image/')).length;
    const videoCount = mediaList.filter(m => m.type.startsWith('video/')).length;
    const totalMedia = mediaList.length;

    if (platformId === 'twitter') {
      if (imageCount > 4) errors.push('Twitter allows a maximum of 4 images.');
      if (videoCount > 1) errors.push('Twitter allows a maximum of 1 video.');
      if (imageCount > 0 && videoCount > 0) errors.push('Twitter does not allow combining images and videos.');
    }
    
    if (platformId === 'instagram') {
      if (totalMedia === 0) {
        errors.push('Instagram requires at least one image or video file.');
      }
      if (hashtags > 30) {
        errors.push('Instagram allows a maximum of 30 hashtags.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Determine overall form validation state
  const isFormValid = () => {
    if (selectedPlatforms.length === 0) return false;
    return selectedPlatforms.every(p => validatePlatform(p).valid);
  };

  // --- Handlers ---
  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (activeTab === 'unified') {
      setUnifiedContent(val);
    } else {
      setOverrides({
        ...overrides,
        [activeTab]: val
      });
    }
  };

  const toggleOverride = (platformId) => {
    const nextVal = !useOverride[platformId];
    setUseOverride({
      ...useOverride,
      [platformId]: nextVal
    });
    
    // Copy unified content as base if enabling override
    if (nextVal && !overrides[platformId]) {
      setOverrides({
        ...overrides,
        [platformId]: unifiedContent
      });
    }

    // Switch tab to the platform if enabled
    if (nextVal) {
      setActiveTab(platformId);
    } else {
      setActiveTab('unified');
    }
  };

  // Media Management
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const newList = [...mediaList];
    files.forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      newList.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        url: fileUrl
      });
    });
    setMediaList(newList);
  };

  const removeMedia = (id) => {
    const item = mediaList.find(m => m.id === id);
    if (item) URL.revokeObjectURL(item.url);
    setMediaList(mediaList.filter(m => m.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // AI Content rewriting logic
  const handleAiRewrite = (tone) => {
    setIsAiLoading(true);
    setAiSelectedTone(tone);
    
    // Simulate AI thinking and typing latency
    setTimeout(() => {
      const text = AI_REWRITE_PRESETS[tone];
      if (activeTab === 'unified') {
        setUnifiedContent(text);
      } else {
        setOverrides({
          ...overrides,
          [activeTab]: text
        });
      }
      setIsAiLoading(false);
      setAiSelectedTone('');
    }, 1200);
  };

  // Quick Insertion Helpers
  const insertEmoji = (emoji) => {
    const currentText = activeTab === 'unified' ? unifiedContent : overrides[activeTab];
    const newText = currentText + ' ' + emoji;
    if (activeTab === 'unified') {
      setUnifiedContent(newText);
    } else {
      setOverrides({ ...overrides, [activeTab]: newText });
    }
  };

  const insertHashtag = (tag) => {
    const currentText = activeTab === 'unified' ? unifiedContent : overrides[activeTab];
    const newText = currentText + ' ' + tag;
    if (activeTab === 'unified') {
      setUnifiedContent(newText);
    } else {
      setOverrides({ ...overrides, [activeTab]: newText });
    }
  };

  // Toggle mockup like button
  const toggleLike = (platId) => {
    const hasLiked = liked[platId];
    setLiked({ ...liked, [platId]: !hasLiked });
    setLikes({
      ...likes,
      [platId]: hasLiked ? likes[platId] - 1 : likes[platId] + 1
    });
  };

  // Publish / Schedule click trigger
  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    if (isScheduled) {
      // Validate scheduler times
      if (!scheduleDate || !scheduleTime) {
        alert('Please specify both scheduling date and time!');
        return;
      }
    }

    // Construct a comprehensive log of the submitted post details
    const newPost = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      unifiedContent,
      platforms: [...selectedPlatforms],
      useOverride: { ...useOverride },
      overrides: { ...overrides },
      mediaList: [...mediaList],
      isScheduled,
      scheduleDate,
      scheduleTime,
    };

    // Prepend the new post details to the history log
    setPostedHistory(prev => [newPost, ...prev]);

    if (isScheduled) {
      setPublishMessage(`🎉 SUCCESS: Your posts have been scheduled for ${scheduleDate} at ${scheduleTime} across selected channels!`);
    } else {
      setPublishMessage(`🎉 SUCCESS: Your posts have been compiled, validated, and published across ${selectedPlatforms.length} social channels!`);
    }
    
    setShowSuccessModal(true);
  };

  // Delete a post from the history log
  const deletePostedPost = (id) => {
    setPostedHistory(prev => prev.filter(post => post.id !== id));
    if (selectedPostedPost && selectedPostedPost.id === id) {
      setSelectedPostedPost(null);
    }
  };

  // Load a historic post's parameters back into the editor as a new draft
  const loadAsDraft = (post) => {
    setSelectedPlatforms(post.platforms);
    setUnifiedContent(post.unifiedContent);
    setUseOverride(post.useOverride);
    setOverrides(post.overrides);
    setMediaList(post.mediaList);
    setIsScheduled(post.isScheduled);
    setScheduleDate(post.scheduleDate || '');
    setScheduleTime(post.scheduleTime || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back to the top of the workspace smoothly
  };

  const resetAll = () => {
    setUnifiedContent('');
    setOverrides({ twitter: '', facebook: '', linkedin: '', instagram: '' });
    setUseOverride({ twitter: false, facebook: false, linkedin: false, instagram: false });
    setMediaList([]);
    setIsScheduled(false);
    setScheduleDate('');
    setScheduleTime('');
    setShowSuccessModal(false);
    setActiveTab('unified');
  };

  // Switch preview tab when selected platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activePreviewPlatform)) {
      setActivePreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // --- Rendering helper functions ---
  // Highlight hashtags and links in live visual previews
  const formatPreviewText = (text) => {
    if (!text) return <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>Start typing your post details...</span>;
    
    // Split words to parse hashtags and urls
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      if (word.startsWith('#')) {
        return <span key={idx} style={{color: 'var(--twitter-blue)', fontWeight: 500}}>{word}</span>;
      }
      if (word.startsWith('http://') || word.startsWith('https://')) {
        return <span key={idx} style={{color: '#00ffff', textDecoration: 'underline', wordBreak: 'break-all'}}>{word}</span>;
      }
      return word;
    });
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
          <Sparkles size={26} style={{ color: 'var(--twitter-blue)', filter: 'drop-shadow(0 0 8px var(--twitter-blue))' }} />
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '1px', textTransform: 'uppercase' }}>OmniCompose</span>
        </div>
        <h1 className="glow-text" style={{ fontFamily: 'Outfit', fontSize: '2.6rem', fontWeight: 800, marginBottom: '0.4rem', background: 'linear-gradient(135deg, #fff 40%, #cdbaff 100%)', webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>
          Social Media Post Composer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 300 }}>
          Compose once, validate platform limits, apply custom overrides, and schedule posts.
        </p>
      </header>

      {/* MAIN CONTAINER */}
      <div className="app-grid">
        
        {/* LEFT COLUMN: COMPOSER & TOOLS */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--twitter-blue)' }} /> Post Composer
          </h2>

          <form onSubmit={handlePublishSubmit}>
            
            {/* 1. SELECT TARGET PLATFORMS */}
            <div className="form-group">
              <label class="form-label">Select Platforms</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                {Object.values(PLATFORMS).map(plat => {
                  const Icon = plat.icon;
                  const active = selectedPlatforms.includes(plat.id);
                  return (
                    <div 
                      key={plat.id}
                      onClick={() => togglePlatform(plat.id)}
                      className="glass-panel"
                      style={{
                        padding: '1rem 0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderColor: active ? plat.color : 'var(--panel-border)',
                        background: active ? `rgba(${parseInt(plat.color.slice(1,3),16)}, ${parseInt(plat.color.slice(3,5),16)}, ${parseInt(plat.color.slice(5,7),16)}, 0.08)` : 'rgba(255,255,255,0.02)',
                        boxShadow: active ? `0 0 12px ${plat.color}40` : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Icon size={24} style={{ color: active ? plat.color : 'var(--text-muted)', marginBottom: '0.4rem' }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: active ? '#fff' : 'var(--text-muted)' }}>
                        {plat.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. COMPOSER TABS BAR */}
            <div className="form-group" style={{ marginTop: '1.8rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.4rem', marginBottom: '1rem', overflowX: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('unified')}
                  className="tab-btn"
                  style={{
                    background: activeTab === 'unified' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderColor: activeTab === 'unified' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: activeTab === 'unified' ? '#fff' : 'var(--text-muted)',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Global Post
                </button>
                
                {selectedPlatforms.map(platId => {
                  const plat = PLATFORMS[platId];
                  const Icon = plat.icon;
                  const active = activeTab === platId;
                  const overrideActive = useOverride[platId];
                  return (
                    <button
                      key={platId}
                      type="button"
                      onClick={() => overrideActive && setActiveTab(platId)}
                      disabled={!overrideActive}
                      className="tab-btn"
                      style={{
                        background: active ? `${plat.color}15` : 'transparent',
                        borderColor: active ? plat.color : 'transparent',
                        color: overrideActive ? (active ? plat.color : '#fff') : 'var(--text-muted)',
                        opacity: overrideActive ? 1 : 0.45,
                        cursor: overrideActive ? 'pointer' : 'not-allowed',
                        border: '1px solid transparent',
                        borderRadius: '8px',
                        padding: '0.5rem 0.8rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Icon size={14} style={{ color: overrideActive ? plat.color : 'inherit' }} />
                      {plat.name} Custom
                    </button>
                  );
                })}
              </div>

              {/* Text Composer Box */}
              <div style={{ position: 'relative' }}>
                {isAiLoading && <div className="scan-indicator" />}
                <textarea
                  value={activeTab === 'unified' ? unifiedContent : overrides[activeTab]}
                  onChange={handleTextChange}
                  placeholder={activeTab === 'unified' ? "Draft your social post here... Select platforms above to check limits." : `Type your specific override text for ${PLATFORMS[activeTab].name}...`}
                  style={{
                    width: '100%',
                    height: '140px',
                    resize: 'none',
                    lineHeight: '1.5',
                    paddingRight: '2rem'
                  }}
                />
                
                {/* Textarea Bottom Tools Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                  
                  {/* Quick inserters */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => insertEmoji('🚀')} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                      title="Insert rocket"
                    >
                      🚀
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertEmoji('🔥')} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                      title="Insert fire"
                    >
                      🔥
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertEmoji('🎉')} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                      title="Insert party"
                    >
                      🎉
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertHashtag('#socialmedia')} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Hash size={12} /> socialmedia
                    </button>
                  </div>

                  {/* Character stats count indicators */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedPlatforms.map(p => {
                      const count = getCharacterCount(activeTab === 'unified' ? unifiedContent : overrides[activeTab], p);
                      const max = PLATFORMS[p].maxChars;
                      const hasErr = count > max;
                      return (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '3px', color: hasErr ? 'var(--color-error)' : 'inherit' }}>
                          <span style={{ fontWeight: 600 }}>{PLATFORMS[p].name.split(' ')[0]}:</span> {count}/{max}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PLATFORM OVERRIDES PANEL CONFIG */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label class="form-label">Customize Platform Overrides</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedPlatforms.map(platId => {
                  const plat = PLATFORMS[platId];
                  const isChecked = useOverride[platId];
                  return (
                    <div 
                      key={platId} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--panel-border)',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <plat.icon size={18} style={{ color: plat.color }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Override for {plat.name}</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => toggleOverride(platId)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. AI WRITER TOOLS TOOLBAR (WOW FEATURE) */}
            <div className="form-group" style={{ marginTop: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Sparkles size={16} style={{ color: 'var(--secondary-neon)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart AI Tone Adjuster</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleAiRewrite('professional')}
                  disabled={isAiLoading}
                  className="glass-panel"
                  style={{ padding: '0.6rem', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                >
                  👔 Professional
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite('hype')}
                  disabled={isAiLoading}
                  className="glass-panel"
                  style={{ padding: '0.6rem', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                >
                  🔥 Hype / Viral
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite('brief')}
                  disabled={isAiLoading}
                  className="glass-panel"
                  style={{ padding: '0.6rem', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                >
                  ⚡ Concise
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite('humor')}
                  disabled={isAiLoading}
                  className="glass-panel"
                  style={{ padding: '0.6rem', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                >
                  🃏 Humor
                </button>
              </div>
            </div>

            {/* 5. MEDIA UPLOAD ZONE */}
            <div className="form-group" style={{ marginTop: '1.8rem' }}>
              <label class="form-label">Attach Media</label>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                style={{
                  border: '2px dashed var(--panel-border)',
                  borderRadius: '14px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
              >
                <ImageIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Drag files or click to upload</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Supports JPG, PNG, WEBP, MP4</div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              {/* Uploaded media previews grid */}
              {mediaList.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginTop: '0.8rem' }}>
                  {mediaList.map(media => (
                    <div 
                      key={media.id} 
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid var(--panel-border)',
                        background: '#000'
                      }}
                    >
                      {media.type.startsWith('video/') ? (
                        <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={media.url} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      
                      {/* Delete Overlay */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeMedia(media.id); }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. POST SCHEDULER PANEL */}
            <div className="form-group" style={{ marginTop: '1.8rem' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--panel-border)',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  marginBottom: isScheduled ? '0.8rem' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={18} style={{ color: 'var(--secondary-neon)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Schedule this Post</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isScheduled}
                    onChange={() => setIsScheduled(!isScheduled)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {isScheduled && (
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="date" 
                      value={scheduleDate} 
                      onChange={e => setScheduleDate(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Clock size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="time" 
                      value={scheduleTime} 
                      onChange={e => setScheduleTime(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION SUBMIT BUTTON */}
            <button 
              type="submit" 
              className="btn-generate"
              disabled={!isFormValid()}
              style={{
                background: isFormValid() ? 'linear-gradient(135deg, var(--primary-neon), var(--secondary-neon))' : 'rgba(255,255,255,0.04)',
                boxShadow: isFormValid() ? '0 8px 24px rgba(255, 20, 147, 0.35)' : 'none',
                marginTop: '1rem'
              }}
            >
              <Send size={18} />
              {isScheduled ? 'Schedule Outbound Post' : 'Publish to Selected Channels'}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEWS & LIVE VALIDATION CHECKLISTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* A. PLATFORMS VALIDATION CHECKLIST PANEL */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-valid)' }} /> Live Validation Auditor
            </h2>

            {selectedPlatforms.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.9rem' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 0.5rem auto', color: 'var(--color-warning)' }} />
                No target channels selected. Check platforms in your composer to audit guidelines.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedPlatforms.map(platId => {
                  const plat = PLATFORMS[platId];
                  const { valid, errors, warnings } = validatePlatform(platId);
                  
                  return (
                    <div 
                      key={platId}
                      className="glass-panel"
                      style={{
                        padding: '1rem 1.2rem',
                        background: 'rgba(0,0,0,0.15)',
                        borderColor: valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Brand Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <plat.icon size={18} style={{ color: plat.color }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{plat.name} Audit</span>
                        </div>
                        <span 
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            background: valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: valid ? 'var(--color-valid)' : 'var(--color-error)'
                          }}
                        >
                          {valid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>

                      {/* Rule items */}
                      <ul style={{ listStyle: 'none', fontSize: '0.82rem', paddingLeft: '0.2rem' }}>
                        {errors.map((err, idx) => (
                          <li key={idx} style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.3rem' }}>
                            <AlertCircle size={12} style={{ marginTop: '3px', flexShrink: 0 }} />
                            <span>{err}</span>
                          </li>
                        ))}
                        {warnings.map((warn, idx) => (
                          <li key={idx} style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.3rem' }}>
                            <AlertCircle size={12} style={{ marginTop: '3px', flexShrink: 0 }} />
                            <span>{warn}</span>
                          </li>
                        ))}
                        {errors.length === 0 && warnings.length === 0 && (
                          <li style={{ color: 'var(--color-valid)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <CheckCircle size={12} />
                            <span>Adheres to all platform constraints.</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. LIVE MOCKUP PREVIEW DASHBOARD */}
          <div className="glass-panel" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
              <HelpCircle size={20} style={{ color: 'var(--secondary-neon)' }} /> Device Mock Preview
            </h2>

            {/* Platform Preview Selector tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
              {selectedPlatforms.map(platId => {
                const plat = PLATFORMS[platId];
                const active = activePreviewPlatform === platId;
                return (
                  <button
                    key={platId}
                    type="button"
                    onClick={() => setActivePreviewPlatform(platId)}
                    style={{
                      flex: 1,
                      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                      border: 'none',
                      color: active ? '#fff' : 'var(--text-muted)',
                      padding: '0.5rem 0.4rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <plat.icon size={14} style={{ color: active ? plat.color : 'var(--text-muted)' }} />
                    <span className="glow-text">{plat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* SOCIAL CARDS CONTAINER */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedPlatforms.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '2rem 0' }}>
                  Select platforms above to inspect visual cards.
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '440px' }} className="fade-in">
                  
                  {/* Twitter / X Mockup card */}
                  {activePreviewPlatform === 'twitter' && (
                    <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '1.2rem', fontSize: '0.9rem', color: '#e7e9ea' }}>
                      {/* Card Header */}
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#f7f9fa' }}>
                            OmniCompose Hub
                            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#1d9bf0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' }} title="Verified User">✓</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#71767b' }}>@omnicompose_app</div>
                        </div>
                      </div>
                      
                      {/* Card Body */}
                      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.8rem', wordBreak: 'break-word', lineHeight: '1.4' }}>
                        {formatPreviewText(getContentForPlatform('twitter'))}
                      </div>

                      {/* Attached Media preview */}
                      {mediaList.length > 0 && (
                        <div 
                          style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '0.8rem',
                            display: 'grid',
                            gridTemplateColumns: mediaList.length > 1 ? '1fr 1fr' : '1fr',
                            gap: '2px',
                            background: '#15181c'
                          }}
                        >
                          {mediaList.slice(0, 4).map(media => (
                            <div key={media.id} style={{ aspectRatio: '1.6', position: 'relative' }}>
                              {media.type.startsWith('video/') ? (
                                <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                              ) : (
                                <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Card Footer interaction */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem', color: '#71767b', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageCircle size={16} />
                          <span>4</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Repeat size={16} />
                          <span>12</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleLike('twitter')}
                          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: liked.twitter ? '#f91880' : '#71767b', cursor: 'pointer' }}
                        >
                          <ThumbsUp size={16} fill={liked.twitter ? '#f91880' : 'none'} />
                          <span>{likes.twitter}</span>
                        </button>
                        <Share2 size={16} />
                      </div>
                    </div>
                  )}

                  {/* Facebook Mockup card */}
                  {activePreviewPlatform === 'facebook' && (
                    <div style={{ background: '#242526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem', color: '#e4e6eb', fontSize: '0.88rem' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#e4e6eb' }}>OmniCompose App</div>
                          <div style={{ fontSize: '0.75rem', color: '#b0b3b8' }}>Sponsored • 🌎</div>
                        </div>
                      </div>
                      
                      {/* Body text */}
                      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                        {formatPreviewText(getContentForPlatform('facebook'))}
                      </div>

                      {/* Media */}
                      {mediaList.length > 0 && (
                        <div style={{ overflow: 'hidden', margin: '0 -1rem 0.8rem -1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {mediaList.slice(0, 1).map(media => (
                            <div key={media.id} style={{ width: '100%', maxHeight: '280px', overflow: 'hidden' }}>
                              {media.type.startsWith('video/') ? (
                                <video src={media.url} style={{ width: '100%', display: 'block' }} controls />
                              ) : (
                                <img src={media.url} alt="" style={{ width: '100%', display: 'block' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer engagement */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem', color: '#b0b3b8' }}>
                        <button 
                          type="button"
                          onClick={() => toggleLike('facebook')}
                          style={{ flex: 1, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: liked.facebook ? '#1877f2' : '#b0b3b8', cursor: 'pointer', padding: '0.4rem 0' }}
                        >
                          <ThumbsUp size={16} fill={liked.facebook ? '#1877f2' : 'none'} />
                          <span>Like ({likes.facebook})</span>
                        </button>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.4rem 0' }}>
                          <MessageCircle size={16} />
                          <span>Comment</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.4rem 0' }}>
                          <Share2 size={16} />
                          <span>Share</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Mockup card */}
                  {activePreviewPlatform === 'linkedin' && (
                    <div style={{ background: '#1d2226', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1.2rem', color: '#fff', fontSize: '0.88rem' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '4px', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>OmniCompose Software</div>
                          <div style={{ fontSize: '0.75rem', color: '#8f9193' }}>1,540 followers • Post Composer Expert</div>
                          <div style={{ fontSize: '0.75rem', color: '#8f9193' }}>2h • 🌎</div>
                        </div>
                      </div>
                      
                      {/* Text */}
                      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                        {formatPreviewText(getContentForPlatform('linkedin'))}
                      </div>

                      {/* Media */}
                      {mediaList.length > 0 && (
                        <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
                          {mediaList.slice(0, 1).map(media => (
                            <div key={media.id} style={{ width: '100%', maxHeight: '260px', overflow: 'hidden' }}>
                              {media.type.startsWith('video/') ? (
                                <video src={media.url} style={{ width: '100%', display: 'block' }} controls />
                              ) : (
                                <img src={media.url} alt="" style={{ width: '100%', display: 'block' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem', color: '#8f9193' }}>
                        <button 
                          type="button"
                          onClick={() => toggleLike('linkedin')}
                          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: liked.linkedin ? '#378fe9' : '#8f9193', cursor: 'pointer' }}
                        >
                          <ThumbsUp size={16} fill={liked.linkedin ? '#378fe9' : 'none'} />
                          <span>Like ({likes.linkedin})</span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageCircle size={16} />
                          <span>Comment</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Repeat size={16} />
                          <span>Repost</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Share2 size={16} />
                          <span>Send</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instagram Mockup card */}
                  {activePreviewPlatform === 'instagram' && (
                    <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', overflow: 'hidden', color: '#fff', fontSize: '0.85rem' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>omnicompose_studio</span>
                      </div>

                      {/* Primary Media (Mandatory) */}
                      <div style={{ background: '#111', aspectRatio: '1.1', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {mediaList.length > 0 ? (
                          mediaList.slice(0, 1).map(media => (
                            media.type.startsWith('video/') ? (
                              <video key={media.id} src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                            ) : (
                              <img key={media.id} src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )
                          ))
                        ) : (
                          <div style={{ color: 'var(--color-error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', textAlign: 'center' }}>
                            <AlertCircle size={32} />
                            <span>Instagram requires an image or video to render this preview card.</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                              type="button"
                              onClick={() => toggleLike('instagram')}
                              style={{ background: 'transparent', border: 'none', color: liked.instagram ? '#ff3040' : '#fff', cursor: 'pointer' }}
                            >
                              <ThumbsUp size={18} fill={liked.instagram ? '#ff3040' : 'none'} />
                            </button>
                            <MessageCircle size={18} />
                            <Share2 size={18} />
                          </div>
                          <span style={{ color: 'var(--text-muted)' }}>•••</span>
                        </div>

                        {/* Likes counter */}
                        <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>
                          {likes.instagram} likes
                        </div>

                        {/* Caption text */}
                        <div style={{ lineHeight: '1.4' }}>
                          <span style={{ fontWeight: 600, marginRight: '6px' }}>omnicompose_studio</span>
                          {formatPreviewText(getContentForPlatform('instagram'))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RECENTLY PUBLISHED & SCHEDULED POSTS HISTORY */}
      <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem', fontFamily: 'Outfit', fontWeight: 700 }}>
          <Clock size={22} style={{ color: 'var(--twitter-blue)' }} /> Published & Scheduled History
        </h2>

        {postedHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
            <Calendar size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem', fontWeight: 300 }}>No posts in your history yet. Compose and publish a post to see it here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {postedHistory.map(post => {
              return (
                <div 
                  key={post.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem', 
                    padding: '1.2rem 1.5rem', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    borderRadius: '12px',
                    transition: 'all 0.25s ease'
                  }}
                  className="history-item-row"
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Status badge */}
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          background: post.isScheduled ? 'rgba(234, 179, 8, 0.12)' : 'rgba(59, 130, 246, 0.12)', 
                          color: post.isScheduled ? '#eab308' : '#3b82f6',
                          border: post.isScheduled ? '1px solid rgba(234, 179, 8, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        {post.isScheduled ? 'Scheduled' : 'Published'}
                      </span>

                      {/* Timestamp */}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {post.timestamp}
                      </span>

                      {/* Scheduled info if exists */}
                      {post.isScheduled && (
                        <span style={{ color: '#eab308', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {post.scheduleDate} at <Clock size={14} /> {post.scheduleTime}
                        </span>
                      )}
                    </div>

                    {/* Platforms icons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {post.platforms.map(platId => {
                        const plat = PLATFORMS[platId];
                        if (!plat) return null;
                        return (
                          <div 
                            key={platId} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: 'rgba(255,255,255,0.05)', 
                              color: plat.color,
                              border: `1px solid ${plat.color}33`
                            }}
                            title={plat.name}
                          >
                            <plat.icon size={14} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Snippet of content */}
                  <div style={{ 
                    fontSize: '0.92rem', 
                    color: '#e2e8f0', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    background: 'rgba(0, 0, 0, 0.15)',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--twitter-blue)'
                  }}>
                    {post.unifiedContent || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>[Media only / Customized platform text]</span>}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.8rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {post.mediaList.length > 0 ? `📎 ${post.mediaList.length} media file(s)` : 'No media'}
                    </span>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPostedPost(post)}
                        className="btn-action-history"
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAsDraft(post)}
                        className="btn-action-history"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                      >
                        Load as Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePostedPost(post.id)}
                        className="btn-action-history"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POSTED POST DETAILS MODAL */}
      {selectedPostedPost && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#0e0b20', border: '1px solid rgba(0, 255, 255, 0.25)', boxShadow: '0 0 35px rgba(0, 255, 255, 0.2)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={24} style={{ color: 'var(--twitter-blue)' }} /> Post Details
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Created on {selectedPostedPost.timestamp} • Status: <span style={{ color: selectedPostedPost.isScheduled ? '#eab308' : '#34d399', fontWeight: 600 }}>{selectedPostedPost.isScheduled ? 'Scheduled' : 'Published'}</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedPostedPost(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="modal-content-grid">
              
              {/* Left Column: Platform break-downs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  Platform Content Breakdown
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedPostedPost.platforms.map(platId => {
                    const plat = PLATFORMS[platId];
                    if (!plat) return null;

                    const hasOverride = selectedPostedPost.useOverride[platId];
                    const content = hasOverride ? selectedPostedPost.overrides[platId] : selectedPostedPost.unifiedContent;
                    
                    return (
                      <div 
                        key={platId} 
                        style={{ 
                          padding: '1rem', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: `1px solid ${plat.color}22`, 
                          borderRadius: '8px',
                          borderLeft: `4px solid ${plat.color}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#f1f5f9' }}>
                            <plat.icon size={16} style={{ color: plat.color }} /> {plat.name}
                          </span>
                          {hasOverride && (
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              Customized
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.4', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px', margin: 0 }}>
                          {content || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>[Empty text / Media only]</span>}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Chars: {getCharacterCount(content, platId)}</span>
                          <span>Hashtags: {getHashtagCount(content)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Media Section */}
                {selectedPostedPost.mediaList.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.8rem' }}>
                      Media Attachments ({selectedPostedPost.mediaList.length})
                    </h4>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {selectedPostedPost.mediaList.map(media => (
                        <div key={media.id} style={{ width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                          {media.type.startsWith('video/') ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Video size={10} style={{ color: '#fff' }} />
                              </div>
                            </div>
                          ) : (
                            <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Platform Visual Mockup Mock Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  Live Preview Mockups
                </h4>
                
                {/* Embedded Mini-Mockup Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedPostedPost.platforms.map(platId => {
                    const plat = PLATFORMS[platId];
                    if (!plat) return null;
                    const content = selectedPostedPost.useOverride[platId] ? selectedPostedPost.overrides[platId] : selectedPostedPost.unifiedContent;

                    return (
                      <div key={platId} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', background: '#090715' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <plat.icon size={12} style={{ color: plat.color }} /> {plat.name} Mockup Card
                        </div>

                        {/* Rendering platform card specific layout */}
                        {platId === 'twitter' && (
                          <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem', fontSize: '0.85rem', color: '#e7e9ea' }}>
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#f7f9fa' }}>
                                  OmniCompose Hub
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#71767b' }}>@omnicompose_app</div>
                              </div>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.6rem', wordBreak: 'break-word', lineHeight: '1.4' }}>
                              {formatPreviewText(content)}
                            </div>
                            {selectedPostedPost.mediaList.length > 0 && (
                              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: selectedPostedPost.mediaList.length > 1 ? '1fr 1fr' : '1fr', gap: '2px', background: '#15181c', marginBottom: '0.6rem' }}>
                                {selectedPostedPost.mediaList.slice(0, 4).map(media => (
                                  <div key={media.id} style={{ aspectRatio: '1.6', position: 'relative' }}>
                                    {media.type.startsWith('video/') ? (
                                      <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {platId === 'facebook' && (
                          <div style={{ background: '#242526', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', color: '#e4e6eb', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 600, color: '#e4e6eb' }}>OmniCompose App</div>
                                <div style={{ fontSize: '0.7rem', color: '#b0b3b8' }}>Sponsored • 🌎</div>
                              </div>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                              {formatPreviewText(content)}
                            </div>
                            {selectedPostedPost.mediaList.length > 0 && (
                              <div style={{ overflow: 'hidden', margin: '0 -1rem 0.6rem -1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {selectedPostedPost.mediaList.slice(0, 1).map(media => (
                                  <div key={media.id} style={{ width: '100%', maxHeight: '200px', overflow: 'hidden' }}>
                                    {media.type.startsWith('video/') ? (
                                      <video src={media.url} style={{ width: '100%', display: 'block' }} />
                                    ) : (
                                      <img src={media.url} alt="" style={{ width: '100%', display: 'block' }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {platId === 'linkedin' && (
                          <div style={{ background: '#1d2226', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', color: '#fff', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 600 }}>OmniCompose Software</div>
                                <div style={{ fontSize: '0.7rem', color: '#8f9193' }}>1,540 followers • 2h • 🌎</div>
                              </div>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                              {formatPreviewText(content)}
                            </div>
                            {selectedPostedPost.mediaList.length > 0 && (
                              <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.6rem' }}>
                                {selectedPostedPost.mediaList.slice(0, 1).map(media => (
                                  <div key={media.id} style={{ width: '100%', maxHeight: '200px', overflow: 'hidden' }}>
                                    {media.type.startsWith('video/') ? (
                                      <video src={media.url} style={{ width: '100%', display: 'block' }} />
                                    ) : (
                                      <img src={media.url} alt="" style={{ width: '100%', display: 'block' }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {platId === 'instagram' && (
                          <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', color: '#fff', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 600 }}>omnicompose_studio</span>
                            </div>
                            <div style={{ background: '#111', aspectRatio: '1.2', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {selectedPostedPost.mediaList.length > 0 && (
                                selectedPostedPost.mediaList.slice(0, 1).map(media => (
                                  media.type.startsWith('video/') ? (
                                    <video key={media.id} src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <img key={media.id} src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  )
                                ))
                              )}
                            </div>
                            <div style={{ padding: '0.6rem 0.8rem' }}>
                              <div style={{ lineHeight: '1.4' }}>
                                <span style={{ fontWeight: 600, marginRight: '6px' }}>omnicompose_studio</span>
                                {formatPreviewText(content)}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => {
                  loadAsDraft(selectedPostedPost);
                  setSelectedPostedPost(null);
                }}
                className="btn-generate"
                style={{ width: 'auto', display: 'inline-flex', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
              >
                Load back to Composer
              </button>
              <button
                type="button"
                onClick={() => setSelectedPostedPost(null)}
                className="btn-action-history"
                style={{ width: 'auto', display: 'inline-flex', padding: '0.6rem 1.5rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PUBLISH/SCHEDULE SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', maxWidth: '500px', width: '100%', textAlign: 'center', background: '#120f26', border: '1px solid rgba(0, 255, 255, 0.2)', boxShadow: '0 0 30px rgba(0, 255, 255, 0.15)' }}>
            <CheckCircle size={56} style={{ color: 'var(--color-valid)', marginBottom: '1.2rem', filter: 'drop-shadow(0 0 10px var(--color-valid))' }} />
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.8rem' }}>Post Composer Successful</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.8rem' }}>
              {publishMessage}
            </p>
            <button
              type="button"
              onClick={resetAll}
              className="btn-generate"
              style={{ padding: '0.8rem 2rem', width: 'auto', display: 'inline-flex' }}
            >
              Compose New Post
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
