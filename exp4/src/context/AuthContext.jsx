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
      access = accessToken;
      refresh = refreshToken;
    }

    return { access, refresh };
  }, [storageStrategy, accessToken, refreshToken]);

  const saveTokensToStorage = useCallback((access, refresh, strategy = storageStrategy) => {
    if (strategy === 'localStorage') {
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    } else if (strategy === 'sessionStorage') {
      if (access) sessionStorage.setItem('access_token', access);
      if (refresh) sessionStorage.setItem('refresh_token', refresh);
    } else {
      if (access) setAccessTokenState(access);
      if (refresh) setRefreshTokenState(refresh);
    }
  }, [storageStrategy]);

  const clearTokensFromStorage = useCallback((strategy = storageStrategy) => {
    if (strategy === 'localStorage') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else if (strategy === 'sessionStorage') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    setAccessTokenState(null);
    setRefreshTokenState(null);
  }, [storageStrategy]);

  const handleSessionExpired = useCallback(() => {
    logToConsole('CLIENT-AUTH', 'Session expired. Logging out user.', 'error');
    clearTokensFromStorage();
    setUser(null);
  }, [clearTokensFromStorage]);

  const setStorageStrategy = useCallback((newStrategy) => {
    logToConsole('CLIENT-AUTH', `Migrating token storage strategy to "${newStrategy}"`, 'warning');
    const { access, refresh } = getTokensFromStorage();
    clearTokensFromStorage(storageStrategy);

    setStorageStrategyState(newStrategy);
    localStorage.setItem('auth_storage_strategy', newStrategy);

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

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const { access } = getTokensFromStorage();
        if (access) {
          const decoded = mockBackend.decodeClientToken(access);
          if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) {
            setUser({
              id: decoded.userId,
              username: decoded.username,
              role: decoded.role,
              name: decoded.name,
            });
            logToConsole('CLIENT-AUTH', `Restored active session for "${decoded.name}"`, 'success');
          } else {
            clearTokensFromStorage();
          }
        }
      } catch (err) {
        clearTokensFromStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [storageStrategy]);

  const login = async (username, password) => {
    logToConsole('CLIENT-AUTH', `Attempting login for "${username}"...`, 'info');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken: access, refreshToken: refresh, user: userData } = response.data;
      
      saveTokensToStorage(access, refresh);
      setUser(userData);
      logToConsole('CLIENT-AUTH', `Logged in as "${userData.name}" (${userData.role.toUpperCase()})`, 'success');
      return userData;
    } catch (err) {
      logToConsole('CLIENT-AUTH', `Login failed for "${username}"`, 'error');
      throw err;
    }
  };

  const logout = () => {
    logToConsole('CLIENT-AUTH', `User logged out.`, 'warning');
    clearTokensFromStorage();
    setUser(null);
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
