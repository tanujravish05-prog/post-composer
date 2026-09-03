import axios from 'axios';
import { mockBackend, logToConsole } from './mockApi';

const api = axios.create({
  baseURL: 'https://api.postpulse.local',
});

let storageHandlers = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setAccessToken: () => {},
  onSessionExpired: () => {},
};

export const registerStorageHandlers = (handlers) => {
  storageHandlers = { ...storageHandlers, ...handlers };
};

// Axios adapter targeting mockBackend
api.defaults.adapter = async (config) => {
  const { url, method, data } = config;
  const path = url.replace('https://api.postpulse.local', '');
  const parsedData = data ? JSON.parse(data) : null;

  try {
    let result;
    if (path === '/auth/login' && method === 'post') {
      result = await mockBackend.login(parsedData.username, parsedData.password);
    } else if (path === '/auth/refresh' && method === 'post') {
      result = await mockBackend.refresh(parsedData.refreshToken);
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
    if (error.response) throw error;
    throw {
      response: {
        status: 500,
        data: { message: error.message || 'Internal Server Error' },
      },
      config,
    };
  }
};

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

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (config.url.endsWith('/auth/login') || config.url.endsWith('/auth/refresh')) {
      logToConsole('AXIOS-REQ', `Request to ${config.url} (Public Auth Route)`);
      return config;
    }

    const token = storageHandlers.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logToConsole('AXIOS-REQ', `Attached Bearer Token (...${token.slice(-15)}) for ${config.url}`, 'info');
    } else {
      logToConsole('AXIOS-REQ', `No Access Token found for URL: ${config.url}`, 'warning');
    }
    return config;
  },
  (error) => {
    logToConsole('AXIOS-REQ-ERR', error.message, 'error');
    return Promise.reject(error);
  }
);

// Response Interceptor with Token Refresh Queue
api.interceptors.response.use(
  (response) => {
    logToConsole('AXIOS-RES', `Response from ${response.config.url} (Status: ${response.status})`, 'success');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      logToConsole('AXIOS-RES-ERR', `Intercepted 401 Unauthorized from ${originalRequest.url}. Retrying...`, 'warning');

      if (isRefreshing) {
        logToConsole('AXIOS-REFRESH', `Refresh in progress. Queueing request: ${originalRequest.url}`, 'info');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storageHandlers.getRefreshToken();
      if (!refreshToken) {
        logToConsole('AXIOS-REFRESH', 'No Refresh Token available. Session expired.', 'error');
        isRefreshing = false;
        storageHandlers.onSessionExpired();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = refreshResponse.data;

        logToConsole('AXIOS-REFRESH', 'Token refresh successful.', 'success');
        storageHandlers.setAccessToken(accessToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        logToConsole('AXIOS-REFRESH', 'Token refresh failed.', 'error');
        processQueue(refreshError, null);
        isRefreshing = false;
        storageHandlers.onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    logToConsole('AXIOS-RES-ERR', `Request failed: ${originalRequest.url}`, 'error');
    return Promise.reject(error);
  }
);

export default api;
