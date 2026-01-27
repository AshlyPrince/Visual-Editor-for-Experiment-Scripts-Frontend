class KeycloakService {
  constructor() {
    this.keycloak = null;
    this.authenticated = false;
    this.userInfo = null;
    this.initializing = false;
    this.isLoggingIn = false;
    this.authError = null;
    this.initAttempted = false;
  }

  /**
   * Initialize Keycloak authentication
   */
  async initialize(config = {}) {
    // Prevent multiple simultaneous initializations
    if (this.initializing) {
      return this.authenticated;
    }
    
    // Prevent infinite retry loops - only attempt once per session
    const lastAttempt = sessionStorage.getItem('keycloak_init_attempted');
    if (this.initAttempted && this.authError && lastAttempt === 'true') {
      return false;
    }
    
    this.initializing = true;
    this.initAttempted = true;
    sessionStorage.setItem('keycloak_init_attempted', 'true');
    
    try {
      const keycloakConfig = {
        url: config.url || import.meta.env.VITE_KEYCLOAK_URL || 'https://visual-editor-keycloak.onrender.com/',
        realm: config.realm || import.meta.env.VITE_KEYCLOAK_REALM || 'myrealm',
        clientId: config.clientId || import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'visual-editor'
      };

      // Dynamically import Keycloak
      const Keycloak = (await import('keycloak-js')).default;
      
      this.keycloak = new Keycloak(keycloakConfig);

      // Check for error or auth params in URL
      const hasError = window.location.hash.includes('error=');
      const hasAuthParams = window.location.search.includes('code=') || 
                           window.location.hash.includes('code=') ||
                           window.location.search.includes('state=') || 
                           window.location.hash.includes('state=');
      
      // Clean up error from URL
      if (hasError) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Universal configuration for manual login
      // Don't use check-sso to avoid silent authentication attempts
      const initOptions = {
        onLoad: this.keycloak ? 'check-sso' : 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
        flow: 'standard',
        enableLogging: false,
        promiseType: 'native'
      };

      // Initialize Keycloak with shorter timeout - fail fast on mobile
      const initPromise = this.keycloak.init(initOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Keycloak init timeout after 5 seconds')), 5000)
      );
      
      this.authenticated = await Promise.race([initPromise, timeoutPromise]);
      
      // Clean up auth params from URL after successful authentication
      if (this.authenticated && hasAuthParams) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (this.authenticated) {
        this.extractUserInfo();
        this.setupTokenRefresh();
      }

      return this.authenticated;
    } catch (error) {
      // Store the error and return false - prevent retry loops
      this.authError = {
        message: 'Authentication service unavailable',
        details: error.message || 'Unable to connect to authentication server.',
        timestamp: new Date().toISOString()
      };
      this.authenticated = false;
      return false;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Extract user information from Keycloak token
   */
  extractUserInfo() {
    if (this.keycloak?.tokenParsed) {
      const token = this.keycloak.tokenParsed;
      this.userInfo = {
        id: token.sub || token.preferred_username || token.email,
        sub: token.sub,
        preferred_username: token.preferred_username,
        email: token.email,
        name: token.name,
        given_name: token.given_name,
        family_name: token.family_name
      };
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    if (this.keycloak) {
      setInterval(() => {
        this.keycloak.updateToken(60).then((refreshed) => {
          if (refreshed) {
            // Token was refreshed successfully
          }
        }).catch(() => {
          // Token refresh failed - user needs to re-authenticate
          this.authenticated = false;
        });
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Get user information
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Get authentication error if any occurred
   */
  getAuthError() {
    return this.authError;
  }

  /**
   * Clear authentication error
   */
  clearAuthError() {
    this.authError = null;
    this.initAttempted = false;
    sessionStorage.removeItem('keycloak_init_attempted');
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.keycloak?.token || null;
  }

  /**
   * Initiate login flow
   */
  async login() {
    // Prevent multiple login attempts
    if (this.isLoggingIn) {
      return;
    }
    
    this.isLoggingIn = true;
    
    try {
      // Initialize Keycloak if not already done, with login-required
      if (!this.keycloak) {
        const keycloakConfig = {
          url: import.meta.env.VITE_KEYCLOAK_URL || 'https://visual-editor-keycloak.onrender.com/',
          realm: import.meta.env.VITE_KEYCLOAK_REALM || 'myrealm',
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'visual-editor'
        };

        // Dynamically import Keycloak
        const Keycloak = (await import('keycloak-js')).default;
        this.keycloak = new Keycloak(keycloakConfig);
        
        // Initialize with login-required to force redirect
        await this.keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          flow: 'standard'
        });
      } else {
        // If already initialized, just trigger login
        this.keycloak.login();
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoggingIn = false;
    }
  }

  /**
   * Logout user
   */
  logout() {
    if (this.keycloak) {
      this.keycloak.logout();
    }
  }

  /**
   * Get account management URL
   */
  getAccountManagementUrl() {
    if (this.keycloak) {
      try {
        const accountUrl = this.keycloak.createAccountUrl();
        return accountUrl;
      } catch {
        return '#';
      }
    }
    
    return '#';
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    if (this.keycloak) {
      try {
        return await this.keycloak.updateToken(30);
      } catch {
        return false;
      }
    }
    return false;
  }
}

const keycloakService = new KeycloakService();

export default keycloakService;
