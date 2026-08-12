import axios from 'axios';
import { mockBackend, logToConsole } from './mockApi';

// Create the Axios client instance
const api = axios.create({
  baseURL: 'https://api.securityguard.local',
});

// Placeholders for storage handlers set dynamically by AuthContext
let storageHandlers = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setAccessToken: () => {},
  onSessionExpired: () => {},
};

export const registerStorageHandlers = (handlers) => {
  storageHandlers = { ...storageHandlers, ...handlers };
};

// Custom adapter to run Axios calls against mockBackend in-memory
api.defaults.adapter = async (config) => {
  const { url, method, data, headers } = config;
  const path = url.replace('https://api.securityguard.local', '');
  const parsedData = data ? JSON.parse(data) : null;
  const authHeader = headers.Authorization;

  try {
    let result;
    if (path === '/auth/login' && method === 'post') {
      result = await mockBackend.login(parsedData.username, parsedData.password);
    } else if (path === '/auth/refresh' && method === 'post') {
      result = await mockBackend.refresh(parsedData.refreshToken);
    } else if (path === '/posts' && method === 'get') {
      result = await mockBackend.getPosts(authHeader);
    } else if (path === '/posts' && method === 'post') {
      result = await mockBackend.createPost(authHeader, parsedData);
    } else if (path.startsWith('/posts/') && method === 'put') {
      const id = path.split('/').pop();
      result = await mockBackend.updatePost(authHeader, id, parsedData);
    } else if (path.startsWith('/posts/') && method === 'delete') {
      const id = path.split('/').pop();
      result = await mockBackend.deletePost(authHeader, id);
    } else if (path === '/admin/stats' && method === 'get') {
      result = await mockBackend.getAdminStats(authHeader);
    } else {
      throw { response: { status: 404, data: { message: 'Not Found' } } };
    }

    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  } catch (error) {
    if (error.response) {
      throw error;
    }
    // Fallback for standard error formats
    throw {
      response: {
        status: 500,
        data: { message: error.message || 'Internal Server Error' },
      },
      config,
    };
  }
};

// Variables for managing the concurrent token refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Avoid appending token to login or refresh calls
    if (config.url.endsWith('/auth/login') || config.url.endsWith('/auth/refresh')) {
      logToConsole('AXIOS-REQ', `Request out to: ${config.url} (No Auth Header needed)`);
      return config;
    }

    const token = storageHandlers.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logToConsole(
        'AXIOS-REQ', 
        `Attached Access Token (...${token.slice(-15)}) to header for URL: ${config.url}`, 
        'info'
      );
    } else {
      logToConsole('AXIOS-REQ', `No Access Token found in storage for URL: ${config.url}`, 'warning');
    }
    return config;
  },
  (error) => {
    logToConsole('AXIOS-REQ-ERR', error.message, 'error');
    return Promise.reject(error);
  }
);

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => {
    logToConsole(
      'AXIOS-RES', 
      `Successful response from ${response.config.url} (Status: ${response.status})`, 
      'success'
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized (implies token expired or invalid)
    // and that we haven't already retried this request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      logToConsole(
        'AXIOS-RES-ERR', 
        `Intercepted 401 Unauthorized from ${originalRequest.url}. Checking token refresh...`, 
        'warning'
      );

      if (isRefreshing) {
        logToConsole('AXIOS-REFRESH', `Refresh in progress. Queueing request: ${originalRequest.url}`, 'info');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storageHandlers.getRefreshToken();
      if (!refreshToken) {
        logToConsole('AXIOS-REFRESH', 'No Refresh Token available. Redirecting to login.', 'error');
        isRefreshing = false;
        storageHandlers.onSessionExpired();
        return Promise.reject(error);
      }

      logToConsole('AXIOS-REFRESH', 'Initiating token refresh request with refresh token...', 'warning');

      try {
        // We use direct axios / api instance to bypass adding auth headers of expired access token
        const refreshResponse = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = refreshResponse.data;

        logToConsole('AXIOS-REFRESH', 'Refresh token accepted. Updating access token storage.', 'success');
        storageHandlers.setAccessToken(accessToken);

        // Process all queued requests with the new token
        processQueue(null, accessToken);

        // Retry the original request
        logToConsole('AXIOS-REFRESH', `Retrying original request: ${originalRequest.url}`, 'success');
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        logToConsole('AXIOS-REFRESH', 'Token refresh failed (Session Expired/Invalid). Logging out.', 'error');
        processQueue(refreshError, null);
        isRefreshing = false;
        storageHandlers.onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    logToConsole(
      'AXIOS-RES-ERR', 
      `Request failed: ${originalRequest.url} (Status: ${error.response ? error.response.status : 'Network error'})`, 
      'error'
    );
    return Promise.reject(error);
  }
);

export default api;
