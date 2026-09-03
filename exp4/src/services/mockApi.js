// In-Memory Security Audit Logger & Mock JWT Authentication Backend

export const consoleLogs = [];
let logListeners = [];

export const subscribeConsoleLogs = (listener) => {
  logListeners.push(listener);
  return () => {
    logListeners = logListeners.filter(l => l !== listener);
  };
};

export const logToConsole = (category, message, level = 'info') => {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString(),
    category,
    message,
    level, // 'info' | 'success' | 'warning' | 'error'
  };
  consoleLogs.unshift(newLog);
  if (consoleLogs.length > 100) consoleLogs.pop();
  logListeners.forEach(listener => listener([...consoleLogs]));
};

// Preset Users for Quick Login
export const MOCK_USERS = [
  { id: 'usr-admin-1', username: 'admin', password: 'password123', role: 'admin', name: 'Tanuj (Admin)' },
  { id: 'usr-editor-1', username: 'editor', password: 'password123', role: 'editor', name: 'Sarah (Editor)' },
  { id: 'usr-viewer-1', username: 'viewer', password: 'password123', role: 'viewer', name: 'Alex (Viewer)' },
];

export const mockBackend = {
  // Decode JWT payload simulation
  decodeClientToken(token) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  },

  // Login Handler
  async login(username, password) {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!user) {
      logToConsole('SERVER-AUTH', `Failed login attempt for username: "${username}"`, 'error');
      throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
    }

    const now = Math.floor(Date.now() / 1000);
    const accessPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      exp: now + 300, // 5 min access token
    };

    const refreshPayload = {
      userId: user.id,
      exp: now + 86400, // 24 hour refresh token
    };

    const accessToken = `header.${btoa(JSON.stringify(accessPayload))}.signature`;
    const refreshToken = `header.${btoa(JSON.stringify(refreshPayload))}.signature`;

    logToConsole('SERVER-AUTH', `User "${user.name}" authenticated. Issued Access & Refresh tokens.`, 'success');

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role, name: user.name }
    };
  },

  // Token Refresh Handler
  async refresh(refreshToken) {
    const payload = this.decodeClientToken(refreshToken);
    if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
      logToConsole('SERVER-AUTH', 'Refresh token expired or invalid.', 'error');
      throw { response: { status: 401, data: { message: 'Invalid refresh token' } } };
    }

    const user = MOCK_USERS.find(u => u.id === payload.userId);
    if (!user) {
      throw { response: { status: 401, data: { message: 'User no longer exists' } } };
    }

    const now = Math.floor(Date.now() / 1000);
    const newAccessPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      exp: now + 300,
    };

    const newAccessToken = `header.${btoa(JSON.stringify(newAccessPayload))}.signature`;
    logToConsole('SERVER-AUTH', `Refreshed Access Token for user "${user.name}".`, 'success');

    return { accessToken: newAccessToken };
  }
};
