import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let keycloakService = null;

const getKeycloakService = async () => {
  if (!keycloakService) {
    const { keycloakService: ks } = await import('../services/exports.js');
    keycloakService = ks;
  }
  return keycloakService;
};

// Request interceptor - adds authentication token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const ks = await getKeycloakService();
      const token = ks.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Token fetch failed - request will proceed without auth header
      // Backend will return 401 if authentication is required
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh on 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const ks = await getKeycloakService();
        
        // Try to refresh the token
        const refreshed = await ks.refreshTokenIfNeeded();
        
        if (refreshed) {
          // Token refreshed successfully, retry the original request
          const newToken = ks.getToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Token refresh failed, redirect to login
          ks.login();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh error, redirect to login
        try {
          const ks = await getKeycloakService();
          ks.login();
        } catch {
          // Unable to redirect to login
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
