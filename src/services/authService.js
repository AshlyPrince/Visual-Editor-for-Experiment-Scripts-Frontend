import api from '../lib/api.js';

class AuthService {

  async checkAuth() {
    try {
      const response = await api.get('/auth/check');
      return response.data; 
    } catch {
      return {
        authenticated: false,
        protection_enabled: true,
        user: null
      };
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user');
      return response.data; 
    } catch {
      return null;
    }
  }

  async testAuth() {
    try {
      const response = await api.get('/test-auth');
      return response.data;
    } catch {
      return null;
    }
  }

  async getAuthStatus() {
    try {
      const [authCheck, userInfo] = await Promise.allSettled([
        this.checkAuth(),
        this.getCurrentUser()
      ]);

      return {
        authenticated: authCheck.status === 'fulfilled' ? authCheck.value.authenticated : false,
        protectionEnabled: authCheck.status === 'fulfilled' ? authCheck.value.protection_enabled : true,
        user: userInfo.status === 'fulfilled' ? userInfo.value : null,
        error: authCheck.status === 'rejected' ? authCheck.reason : null
      };
    } catch {
      return {
        authenticated: false,
        protectionEnabled: true,
        user: null,
        error: error
      };
    }
  }
}

const authService = new AuthService();

export default authService;
