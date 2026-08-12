// Base64 helper functions to generate real-looking JWTs
const base64Encode = (obj) => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return '';
  }
};

const base64Decode = (str) => {
  try {
    // Add back padding
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch (e) {
    return null;
  }
};

// Users Mock DB
const MOCK_USERS = {
  admin: { id: 'u-1', username: 'admin', password: 'admin', role: 'admin', name: 'Antigravity Admin' },
  editor: { id: 'u-2', username: 'editor', password: 'password123', role: 'editor', name: 'Emily Editor' },
  viewer: { id: 'u-3', username: 'viewer', password: 'password123', role: 'viewer', name: 'Victor Viewer' },
};

// Posts Mock DB
let postsDatabase = [
  { id: 1, title: 'Securing Frontend Route Guarding', content: 'Route guarding prevents unauthorized rendering of components on the client-side, redirecting users to appropriate landing pages based on their credentials.', author: 'Emily Editor', date: '2026-08-05' },
  { id: 2, title: 'Axios Interceptors: Best Practices', content: 'By utilizing request and response interceptors, applications can centralize authentication headers attachment and handle token refresh cycles globally.', author: 'Emily Editor', date: '2026-08-06' },
];

// Configuration
let config = {
  accessTokenExpirySeconds: 15, // short for testing refresh mechanism
  refreshTokenExpirySeconds: 120,
  latencyMs: 500,
};

// Event listener for console logging
const listeners = [];
export const subscribeToLogs = (listener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const logToConsole = (source, message, type = 'info') => {
  console.log(`[${source}] [${type}] ${message}`);
  listeners.forEach(fn => fn({ timestamp: new Date().toLocaleTimeString(), source, message, type }));
};

// Active refresh tokens (simulated database table)
const activeRefreshTokens = new Map();

// Helper to construct token
const generateJWT = (user, type = 'access') => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + (type === 'access' ? config.accessTokenExpirySeconds : config.refreshTokenExpirySeconds);
  
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    type,
    exp: expiry,
  };

  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(payload);
  const mockSignature = 'signature_hash_verified_by_server'; // Simple simulated secret signature
  
  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
};

// Validate token
const verifyToken = (token) => {
  if (!token) return { valid: false, error: 'Token is missing' };
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid JWT structure' };
  }

  const payload = base64Decode(parts[1]);
  if (!payload) {
    return { valid: false, error: 'Failed to decode payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { valid: false, error: 'Token expired', payload };
  }

  return { valid: true, payload };
};

// Simulated Network delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated REST Server API Endpoints
export const mockBackend = {
  // Update Server settings from UI
  updateSettings: (expiry, latency) => {
    config.accessTokenExpirySeconds = expiry;
    config.latencyMs = latency;
    logToConsole('SERVER', `Configuration updated: Access Token Expiry = ${expiry}s, Network Delay = ${latency}ms`, 'warning');
  },

  getSettings: () => {
    return { ...config };
  },

  // Decode a JWT token in client side (utility for client)
  decodeClientToken: (token) => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return base64Decode(parts[1]);
  },

  // POST /auth/login
  login: async (username, password) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `Received login request for username: "${username}"`, 'info');

    const user = MOCK_USERS[username];
    if (!user || user.password !== password) {
      logToConsole('SERVER', `Invalid credentials for username: "${username}"`, 'error');
      throw { response: { status: 401, data: { message: 'Invalid username or password' } } };
    }

    const accessToken = generateJWT(user, 'access');
    const refreshToken = generateJWT(user, 'refresh');
    
    // Store refresh token
    activeRefreshTokens.set(refreshToken, user.id);
    
    logToConsole('SERVER', `Authentication successful. Issued tokens for "${user.name}" (${user.role})`, 'success');
    logToConsole('SERVER', `Access Token: ...${accessToken.slice(-20)} (exp: ${config.accessTokenExpirySeconds}s)`, 'debug');
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    };
  },

  // POST /auth/refresh
  refresh: async (refreshToken) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `Received token refresh request`, 'warning');

    const verification = verifyToken(refreshToken);
    if (!verification.valid) {
      logToConsole('SERVER', `Refresh failed: ${verification.error}`, 'error');
      throw { response: { status: 403, data: { message: 'Refresh token expired or invalid' } } };
    }

    const userId = activeRefreshTokens.get(refreshToken);
    const user = Object.values(MOCK_USERS).find(u => u.id === userId);
    
    if (!user) {
      logToConsole('SERVER', `Refresh failed: User not found`, 'error');
      throw { response: { status: 403, data: { message: 'User not found' } } };
    }

    // Generate new access token
    const newAccessToken = generateJWT(user, 'access');
    
    logToConsole('SERVER', `Token refreshed successfully. Issued new Access Token`, 'success');
    logToConsole('SERVER', `New Access Token: ...${newAccessToken.slice(-20)} (exp: ${config.accessTokenExpirySeconds}s)`, 'debug');

    return {
      accessToken: newAccessToken
    };
  },

  // GET /posts
  getPosts: async (authHeader) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `GET /posts requested`, 'info');

    const token = authHeader?.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
      logToConsole('SERVER', `Access Denied to GET /posts: ${verification.error}`, 'error');
      throw { response: { status: 401, data: { message: verification.error } } };
    }

    logToConsole('SERVER', `Authorized GET /posts for user "${verification.payload.username}" (role: ${verification.payload.role})`, 'success');
    return [...postsDatabase];
  },

  // POST /posts
  createPost: async (authHeader, postData) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `POST /posts requested`, 'info');

    const token = authHeader?.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
      logToConsole('SERVER', `Access Denied to POST /posts: ${verification.error}`, 'error');
      throw { response: { status: 401, data: { message: verification.error } } };
    }

    const { role, name } = verification.payload;
    if (role !== 'admin' && role !== 'editor') {
      logToConsole('SERVER', `Role protection failure: User "${verification.payload.username}" (role: ${role}) does not have write permissions.`, 'error');
      throw { response: { status: 403, data: { message: 'Forbidden: Insufficient privileges' } } };
    }

    const newPost = {
      id: postsDatabase.length + 1,
      title: postData.title,
      content: postData.content,
      author: name,
      date: new Date().toISOString().split('T')[0]
    };
    postsDatabase.unshift(newPost);

    logToConsole('SERVER', `Created post successfully: "${newPost.title}" by ${newPost.author}`, 'success');
    return newPost;
  },

  // PUT /posts/:id
  updatePost: async (authHeader, id, postData) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `PUT /posts/${id} requested`, 'info');

    const token = authHeader?.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
      logToConsole('SERVER', `Access Denied to PUT /posts/${id}: ${verification.error}`, 'error');
      throw { response: { status: 401, data: { message: verification.error } } };
    }

    const { role } = verification.payload;
    if (role !== 'admin' && role !== 'editor') {
      logToConsole('SERVER', `Role protection failure: User "${verification.payload.username}" (role: ${role}) does not have edit permissions.`, 'error');
      throw { response: { status: 403, data: { message: 'Forbidden: Insufficient privileges' } } };
    }

    const idx = postsDatabase.findIndex(p => p.id === Number(id));
    if (idx === -1) {
      logToConsole('SERVER', `Post with id ${id} not found`, 'error');
      throw { response: { status: 404, data: { message: 'Post not found' } } };
    }

    postsDatabase[idx] = {
      ...postsDatabase[idx],
      title: postData.title,
      content: postData.content
    };

    logToConsole('SERVER', `Updated post ${id} successfully: "${postsDatabase[idx].title}"`, 'success');
    return postsDatabase[idx];
  },

  // DELETE /posts/:id
  deletePost: async (authHeader, id) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `DELETE /posts/${id} requested`, 'info');

    const token = authHeader?.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
      logToConsole('SERVER', `Access Denied to DELETE /posts/${id}: ${verification.error}`, 'error');
      throw { response: { status: 401, data: { message: verification.error } } };
    }

    const { role } = verification.payload;
    // Admins only
    if (role !== 'admin') {
      logToConsole('SERVER', `Role protection failure: User "${verification.payload.username}" (role: ${role}) does not have delete permissions. Admin only.`, 'error');
      throw { response: { status: 403, data: { message: 'Forbidden: Admin access required' } } };
    }

    const idx = postsDatabase.findIndex(p => p.id === Number(id));
    if (idx === -1) {
      logToConsole('SERVER', `Post with id ${id} not found`, 'error');
      throw { response: { status: 404, data: { message: 'Post not found' } } };
    }

    const deleted = postsDatabase.splice(idx, 1)[0];
    logToConsole('SERVER', `Deleted post ${id} successfully: "${deleted.title}"`, 'success');
    return { success: true, deletedId: id };
  },

  // GET /admin/stats
  getAdminStats: async (authHeader) => {
    await delay(config.latencyMs);
    logToConsole('SERVER', `GET /admin/stats requested`, 'info');

    const token = authHeader?.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
      logToConsole('SERVER', `Access Denied to GET /admin/stats: ${verification.error}`, 'error');
      throw { response: { status: 401, data: { message: verification.error } } };
    }

    const { role } = verification.payload;
    if (role !== 'admin') {
      logToConsole('SERVER', `Role protection failure: User "${verification.payload.username}" (role: ${role}) does not have admin permissions.`, 'error');
      throw { response: { status: 403, data: { message: 'Forbidden: Requires Admin role' } } };
    }

    logToConsole('SERVER', `Authorized GET /admin/stats for admin "${verification.payload.username}"`, 'success');
    return {
      totalPosts: postsDatabase.length,
      rolesRegistered: ['admin', 'editor', 'viewer'],
      serverMemoryUsage: '42%',
      connectedSessions: activeRefreshTokens.size,
      storageBackend: 'In-Memory (Simulated)',
    };
  }
};
