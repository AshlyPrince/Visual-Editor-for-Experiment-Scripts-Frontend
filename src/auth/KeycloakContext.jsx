import { createContext, useContext, useEffect, useState } from 'react';
import i18next from 'i18next';
import keycloakService from '../services/keycloakService';

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await keycloakService.initialize();
        
        setKeycloak(keycloakService.keycloak);
        setAuthenticated(isAuthenticated);
        setUserInfo(keycloakService.userInfo);
        
        if (keycloakService.keycloak) {
          window.keycloak = keycloakService.keycloak;
        }
        
        if (isAuthenticated) {
          const savedRedirect = sessionStorage.getItem('keycloak_redirect_uri');
          if (savedRedirect && savedRedirect !== '/login' && savedRedirect !== '/') {
            sessionStorage.removeItem('keycloak_redirect_uri');
            window.location.href = savedRedirect;
          }
        }
        
        if (keycloakService.authError) {
          console.error('[KeycloakContext] Auth error:', keycloakService.authError);
          setError(keycloakService.authError.message);
        }
      } catch (err) {
        console.error('[KeycloakContext] Failed to initialize Keycloak:', err);
        setError(i18next.t('auth.authServiceUnavailable'));
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    keycloakService.login();
  };

  const logout = () => {
    keycloakService.logout();
  };

  const register = () => {
    keycloakService.register();
  };

  const getToken = () => {
    return keycloakService.getToken();
  };

  const hasRole = (role) => {
    return keycloakService.hasRole(role);
  };

  const hasAnyRole = (roles) => {
    return keycloakService.hasAnyRole(roles);
  };

  const updateProfile = () => {
    keycloakService.updateProfile();
  };

  const value = {
    keycloak,
    authenticated,
    loading,
    userInfo,
    error,
    login,
    logout,
    register,
    getToken,
    hasRole,
    hasAnyRole,
    updateProfile,
  };

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error(i18next.t('auth.useKeycloakError'));
  }
  return context;
};
