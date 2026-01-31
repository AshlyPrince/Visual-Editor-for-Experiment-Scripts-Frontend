import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://visual-editor-backend.onrender.com",
  timeout: 30000,
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

api.interceptors.request.use(
  async (config) => {
    try {
      const ks = await getKeycloakService();
      const token = ks.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const ks = await getKeycloakService();
        
        const refreshed = await ks.refreshTokenIfNeeded();
        
        if (refreshed) {
          const newToken = ks.getToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          ks.login();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        try {
          const ks = await getKeycloakService();
          ks.login();
        } catch {
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
