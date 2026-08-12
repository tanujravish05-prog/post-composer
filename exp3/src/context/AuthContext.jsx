import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { registerStorageHandlers } from '../services/api';
import { mockBackend, logToConsole } from '../services/mockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [refreshToken, setRefreshTokenState] = useState(null);
  const [storageStrategy, setStorageStrategyState] = useState(() => {
    return localStorage.getItem('auth_storage_strategy') || 'localStorage';
  });
  const [loading, setLoading] = useState(true);

  // Helper to fetch tokens based on strategy
  const getTokensFromStorage = useCallback((strategy = storageStrategy) => {
    let access = null;
    let refresh = null;

    if (strategy === 'localStorage') {
      access = localStorage.getItem('access_token');
      refresh = localStorage.getItem('refresh_token');
    } else if (strategy === 'sessionStorage') {
      access = sessionStorage.getItem('access_token');
      refresh = sessionStorage.getItem('refresh_token');
    } else {
      // Memory state
      access = accessToken;
      refresh = refreshToken;
    }

    return { access, refresh };
  }, [storageStrategy, accessToken, refreshToken]);

  // Helper to save tokens based on strategy
  const saveTokensToStorage = useCallback((access, refresh, strategy = storageStrategy) => {
    if (strategy === 'localStorage') {
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    } else if (strategy === 'sessionStorage') {
      if (access) sessionStorage.setItem('access_token', access);
      if (refresh) sessionStorage.setItem('refresh_token', refresh);
    } else {
      // Memory strategy: save in state
      if (access) setAccessTokenState(access);
      if (refresh) setRefreshTokenState(refresh);
    }
  }, [storageStrategy]);

  // Helper to remove tokens from storage
  const clearTokensFromStorage = useCallback((strategy = storageStrategy) => {
    if (strategy === 'localStorage') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else if (strategy === 'sessionStorage') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    // Always clear states
    setAccessTokenState(null);
    setRefreshTokenState(null);
  }, [storageStrategy]);

  // Handle Session Expiry (invoked by Axios Response Interceptor)
  const handleSessionExpired = useCallback(() => {
    logToConsole('CLIENT-AUTH', 'Axios reported session expiry. Clearing credentials and logging out.', 'error');
    clearTokensFromStorage();
    setUser(null);
  }, [clearTokensFromStorage]);

  // Change Storage Strategy on-the-fly (Educational Feature)
  const setStorageStrategy = useCallback((newStrategy) => {
    logToConsole('CLIENT-AUTH', `Migrating token storage strategy from "${storageStrategy}" to "${newStrategy}"`, 'warning');
    const { access, refresh } = getTokensFromStorage();

    // 1. Clear old storage locations
    clearTokensFromStorage(storageStrategy);

    // 2. Set new strategy state & persist config choice
    setStorageStrategyState(newStrategy);
    localStorage.setItem('auth_storage_strategy', newStrategy);

    // 3. Write tokens to new storage locations
    if (access || refresh) {
      if (newStrategy === 'localStorage') {
        if (access) localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
      } else if (newStrategy === 'sessionStorage') {
        if (access) sessionStorage.setItem('access_token', access);
        if (refresh) sessionStorage.setItem('refresh_token', refresh);
      } else {
        setAccessTokenState(access);
        setRefreshTokenState(refresh);
      }
      logToConsole('CLIENT-AUTH', `Tokens migrated successfully to ${newStrategy}`, 'success');
    }
  }, [storageStrategy, getTokensFromStorage, clearTokensFromStorage]);

  // Register Handlers with Axios Instance
  useEffect(() => {
    registerStorageHandlers({
      getAccessToken: () => {
        const { access } = getTokensFromStorage();
        return access;
      },
      getRefreshToken: () => {
        const { refresh } = getTokensFromStorage();
        return refresh;
      },
      setAccessToken: (token) => {
        saveTokensToStorage(token, null);
        if (storageStrategy === 'memory') {
          setAccessTokenState(token);
        }
      },
      onSessionExpired: handleSessionExpired,
    });
  }, [getTokensFromStorage, saveTokensToStorage, storageStrategy, handleSessionExpired]);

  // Attempt to restore session on boot
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const { access } = getTokensFromStorage();
        if (access) {
          const decoded = mockBackend.decodeClientToken(access);
          if (decoded) {
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp > now) {
              setUser({
                id: decoded.userId,
                username: decoded.username,
                role: decoded.role,
                name: decoded.name,
              });
              logToConsole('CLIENT-AUTH', `Restored active session for "${decoded.name}" from ${storageStrategy}`, 'success');
            } else {
              logToConsole('CLIENT-AUTH', 'Stored token is already expired. Session cleared.', 'warning');
              clearTokensFromStorage();
            }
          }
        } else {
          logToConsole('CLIENT-AUTH', `No previous session found in ${storageStrategy}. Ready.`, 'info');
        }
      } catch (err) {
        logToConsole('CLIENT-AUTH', 'Failed to initialize session from storage.', 'error');
        clearTokensFromStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [storageStrategy]); // Run once at boot (triggered by storageStrategy setup)

  // Login action
  const login = async (username, password) => {
    logToConsole('CLIENT-AUTH', `Attempting login with credentials for "${username}"...`, 'info');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken: access, refreshToken: refresh, user: userData } = response.data;
      
      // Save based on current strategy
      saveTokensToStorage(access, refresh);
      setUser(userData);
      
      logToConsole('CLIENT-AUTH', `Logged in as "${userData.name}" with role "${userData.role.toUpperCase()}"`, 'success');
      return userData;
    } catch (err) {
      logToConsole('CLIENT-AUTH', `Login failed: ${err.response?.data?.message || err.message}`, 'error');
      throw err;
    }
  };

  // Logout action
  const logout = () => {
    logToConsole('CLIENT-AUTH', `User initiated log out. Clearing session.`, 'warning');
    clearTokensFromStorage();
    setUser(null);
  };

  const getDecodedAccessToken = () => {
    const { access } = getTokensFromStorage();
    return mockBackend.decodeClientToken(access);
  };

  const getDecodedRefreshToken = () => {
    const { refresh } = getTokensFromStorage();
    return mockBackend.decodeClientToken(refresh);
  };

  const value = {
    user,
    loading,
    storageStrategy,
    accessToken: getTokensFromStorage().access,
    refreshToken: getTokensFromStorage().refresh,
    login,
    logout,
    setStorageStrategy,
    getDecodedAccessToken,
    getDecodedRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
