import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useKeycloak } from './KeycloakContext.jsx';
import { LoginCard } from './AuthComponents.jsx';

export const ProtectedRoute = ({
  children,
  roles = [],
  fallback = null,
  showLoginCard = true
}) => {
  const { authenticated, loading, hasAnyRole, userInfo } = useKeycloak();

  
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Authenticating...
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
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this resource.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current user: {userInfo?.fullName || userInfo?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required roles: {roles.join(', ')}
        </Typography>
      </Container>
    );
  }

  // Render protected content
  return children;
};

export const RequireRole = ({ roles, children, fallback = null }) => {
  const { hasAnyRole } = useKeycloak();
  
  if (!hasAnyRole(roles)) {
    return fallback || (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Insufficient permissions
        </Typography>
      </Box>
    );
  }
  
  return children;
};
