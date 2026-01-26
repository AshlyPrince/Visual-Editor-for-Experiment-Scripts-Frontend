import { createContext, useContext, useEffect, useState } from 'react';

const KeycloakContext = createContext();

const isDevelopmentMode = import.meta.env.VITE_DEVELOPMENT_MODE !== 'false';

const mockUserInfo = {
  id: 'dev-user-123',
  username: 'developer',
  email: 'developer@example.com',
  firstName: 'John',
  lastName: 'Developer',
  fullName: 'John Developer',
  roles: ['user', 'researcher', 'admin'], 
};

export const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(isDevelopmentMode);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(isDevelopmentMode ? mockUserInfo : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isDevelopmentMode) {
          
          setAuthenticated(true);
          setUserInfo(mockUserInfo);
          
          
          const mockKeycloak = {
            token: 'mock-jwt-token-for-development',
            logout: () => {
              setAuthenticated(false);
              setUserInfo(null);
            },
            updateToken: () => Promise.resolve(true),
          };
          setKeycloak(mockKeycloak);
          
          
          window.keycloak = mockKeycloak;
        } else {
          
          
          setAuthenticated(false);
          setUserInfo(null);
        }
      } catch {
        // Error is stored in error state and handled by parent components
        setError('Authentication service unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    if (isDevelopmentMode) {
      setAuthenticated(true);
      setUserInfo(mockUserInfo);
    } else {
      keycloak?.login();
    }
  };

  const logout = () => {
    if (isDevelopmentMode) {
      setAuthenticated(false);
      setUserInfo(null);
    } else {
      keycloak?.logout();
    }
  };

  const register = () => {
    if (isDevelopmentMode) {
      
      login();
    } else {
      keycloak?.register();
    }
  };

  const getToken = () => {
    return keycloak?.token || (isDevelopmentMode ? 'mock-development-token' : null);
  };

  const hasRole = (role) => {
    return userInfo?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  const updateProfile = () => {
    if (isDevelopmentMode) {
      alert('Profile management would open here in production');
    } else {
      keycloak?.accountManagement();
    }
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
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};
