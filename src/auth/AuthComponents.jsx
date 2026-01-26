import {
  Box,
  Button,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Login,
  PersonAdd,
  Security,
  VpnKey,
  AccountCircle
} from '@mui/icons-material';
import { useKeycloak } from './KeycloakContext.jsx';

export const LoginCard = () => {
  const { login, register, loading, error } = useKeycloak();
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{
        p: 6,
        textAlign: 'center',
        maxWidth: 400,
        mx: 'auto',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        backdropFilter: 'blur(10px)'
      }}>
        <CircularProgress size={40} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Connecting to Authentication Service
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we verify your session...
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{
      p: 6,
      textAlign: 'center',
      maxWidth: 400,
      mx: 'auto',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
    }}>
      { }
      <Box sx={{ mb: 4 }}>
        <Avatar sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        }}>
          <Security fontSize="large" />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Visual Editor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Secure authentication powered by Keycloak
        </Typography>
      </Box>

      { }
      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      { }
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Login />}
          onClick={login}
          sx={{
            py: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            }
          }}
        >
          Sign In
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<PersonAdd />}
          onClick={register}
          sx={{ py: 1.5 }}
        >
          Create Account
        </Button>
      </Box>

      { }
      <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <VpnKey fontSize="inherit" />
          Secured by Keycloak
        </Typography>
      </Box>
    </Card>
  );
};

export const UserProfile = ({ user }) => {
  const theme = useTheme();

  if (!user) return null;

  return (
    <Card sx={{
      p: 3,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{
          width: 56,
          height: 56,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {user?.fullName || user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>

      { }
      {user?.roles && user.roles.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {user.roles.map((role, index) => (
            <Chip
              key={index}
              label={role}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      )}
    </Card>
  );
};

export const AuthStatus = () => {
  const { authenticated, loading, userInfo } = useKeycloak();
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: authenticated ? theme.palette.success.main : theme.palette.error.main
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {authenticated ? `Authenticated as ${userInfo?.username}` : 'Not authenticated'}
      </Typography>
    </Box>
  );
};
