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

  async initialize(config = {}) {
    if (this.initializing) {
      return this.authenticated;
    }

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

      const Keycloak = (await import('keycloak-js')).default;
      
      this.keycloak = new Keycloak(keycloakConfig);

      const hasError = window.location.hash.includes('error=');
      const hasAuthParams = window.location.search.includes('code=') || 
                           window.location.hash.includes('code=') ||
                           window.location.search.includes('state=') || 
                           window.location.hash.includes('state=');
      
      if (hasError) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const initOptions = {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: true,
        checkLoginIframeInterval: 5,
        pkceMethod: 'S256',
        flow: 'standard',
        enableLogging: false,
        promiseType: 'native',

        token: sessionStorage.getItem('kc_token') || undefined,
        refreshToken: sessionStorage.getItem('kc_refreshToken') || undefined,
        idToken: sessionStorage.getItem('kc_idToken') || undefined,
      };

      const initPromise = this.keycloak.init(initOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Keycloak init timeout after 10 seconds')), 10000)
      );
      
      this.authenticated = await Promise.race([initPromise, timeoutPromise]);
      
      if (this.authenticated && hasAuthParams) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (this.authenticated) {
        this.extractUserInfo();
        this.setupTokenRefresh();
        
        sessionStorage.removeItem('keycloak_init_attempted');

        if (this.keycloak.token) {
          sessionStorage.setItem('kc_token', this.keycloak.token);
          sessionStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
          sessionStorage.setItem('kc_idToken', this.keycloak.idToken);
        }
      } else {
        
        sessionStorage.removeItem('kc_token');
        sessionStorage.removeItem('kc_refreshToken');
        sessionStorage.removeItem('kc_idToken');
      }

      return this.authenticated;
    } catch (error) {
      console.error('[Keycloak] Initialization error:', error);
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

  setupTokenRefresh() {
    if (this.keycloak) {
      
      setInterval(() => {
        this.keycloak.updateToken(60)
          .then((refreshed) => {
            if (refreshed) {
              this.extractUserInfo(); 

              sessionStorage.setItem('kc_token', this.keycloak.token);
              sessionStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
              sessionStorage.setItem('kc_idToken', this.keycloak.idToken);
            }
          })
          .catch((error) => {
            console.error('[Keycloak] Token refresh failed:', error);
            this.authenticated = false;
            
            sessionStorage.removeItem('kc_token');
            sessionStorage.removeItem('kc_refreshToken');
            sessionStorage.removeItem('kc_idToken');

          });
      }, 30000); 

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.keycloak) {
          this.keycloak.updateToken(60)
            .then((refreshed) => {
              if (refreshed) {
                
                sessionStorage.setItem('kc_token', this.keycloak.token);
                sessionStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
                sessionStorage.setItem('kc_idToken', this.keycloak.idToken);
              }
            })
            .catch((error) => {
              console.error('[Keycloak] Token refresh on visibility change failed:', error);
            });
        }
      });
    }
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getUserInfo() {
    return this.userInfo;
  }

  getAuthError() {
    return this.authError;
  }

  clearAuthError() {
    this.authError = null;
    this.initAttempted = false;
    sessionStorage.removeItem('keycloak_init_attempted');
  }

  getToken() {
    return this.keycloak?.token || null;
  }

  async login() {
    if (this.isLoggingIn) {
      return;
    }
    
    this.isLoggingIn = true;
    
    try {
      sessionStorage.setItem('keycloak_redirect_uri', window.location.pathname + window.location.search);
      
      if (this.keycloak) {
        await this.keycloak.login({
          redirectUri: window.location.origin
        });
      } else {
        const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://visual-editor-keycloak.onrender.com/';
        const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'myrealm';
        const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'visual-editor';
        
        const redirectUri = encodeURIComponent(window.location.origin);
        const loginUrl = `${keycloakUrl}realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
        
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoggingIn = false;
    }
  }

  logout() {
    
    sessionStorage.removeItem('kc_token');
    sessionStorage.removeItem('kc_refreshToken');
    sessionStorage.removeItem('kc_idToken');
    sessionStorage.removeItem('keycloak_redirect_uri');
    sessionStorage.removeItem('keycloak_init_attempted');
    
    if (this.keycloak) {
      this.keycloak.logout();
    }
  }

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
