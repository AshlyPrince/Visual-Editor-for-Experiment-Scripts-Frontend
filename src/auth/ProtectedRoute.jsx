import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKeycloak } from './KeycloakContext.jsx';
import { LoginCard } from './AuthComponents.jsx';

export const ProtectedRoute = ({
  children,
  roles = [],
  fallback = null,
  showLoginCard = true
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { authenticated, loading, hasAnyRole, userInfo } = useKeycloak();

  useEffect(() => {
    if (!loading && !authenticated && location.pathname !== '/login') {
      sessionStorage.setItem('keycloak_redirect_uri', location.pathname + location.search);
    }
  }, [authenticated, loading, location]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          {t('auth.authenticating')}
        </Typography>
      </Container>
    );
  }

  if (!authenticated) {
    if (!showLoginCard && fallback) {
      return fallback;
    }
    
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <LoginCard />
      </Container>
    );
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          {t('auth.accessDenied')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('auth.noPermissionResource')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.currentUser')}: {userInfo?.fullName || userInfo?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.requiredRoles')}: {roles.join(', ')}
        </Typography>
      </Container>
    );
  }

  return children;
};

export const RequireRole = ({ roles, children, fallback = null }) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useKeycloak();
  
  if (!hasAnyRole(roles)) {
    return fallback || (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('auth.insufficientPermissions')}
        </Typography>
      </Box>
    );
  }
  
  return children;
};
