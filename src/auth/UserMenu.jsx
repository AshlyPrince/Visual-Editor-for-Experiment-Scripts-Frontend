import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Typography,
  Chip,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  ExitToApp,
  VpnKey,
  Person,
  Security,
  AdminPanelSettings
} from '@mui/icons-material';
import { useKeycloak } from './KeycloakContext.jsx';

export const UserMenu = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const { userInfo, logout, updateProfile, hasRole } = useKeycloak();
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileUpdate = () => {
    updateProfile();
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const isAdmin = hasRole('admin') || hasRole('realm-admin');
  const isModerator = hasRole('moderator');

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          p: 0.5,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          '&:hover': {
            border: `2px solid ${theme.palette.primary.main}`,
          },
          transition: 'all 0.2s ease'
        }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {userInfo?.firstName?.[0] || userInfo?.username?.[0] || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 280,
            borderRadius: 3,
            mt: 1.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        { }
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              {userInfo?.firstName?.[0] || userInfo?.username?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {userInfo?.fullName || userInfo?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userInfo?.email}
              </Typography>
            </Box>
          </Box>

          { }
          {userInfo?.roles && userInfo.roles.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {userInfo.roles.slice(0, 3).map((role, index) => (
                <Chip
                  key={index}
                  label={role}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              ))}
              {userInfo.roles.length > 3 && (
                <Chip
                  label={t('auth.moreRoles', { count: userInfo.roles.length - 3 })}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              )}
            </Box>
          )}
        </Box>

        <Divider />

        { }
        <MenuItem onClick={handleProfileUpdate}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1">{t('auth.manageProfile')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.updateAccountSettings')}
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1">{t('auth.userPreferences')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.customizeExperience')}
            </Typography>
          </ListItemText>
        </MenuItem>

        { }
        {(isAdmin || isModerator) && [
          <Divider key="admin-divider" />,
          isAdmin && (
            <MenuItem key="admin-console" onClick={handleClose}>
              <ListItemIcon>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1">{t('auth.adminConsole')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('auth.systemAdministration')}
                </Typography>
              </ListItemText>
            </MenuItem>
          ),
          <MenuItem key="security-settings" onClick={handleClose}>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body1">{t('auth.securitySettings')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.manageSecurityPreferences')}
              </Typography>
            </ListItemText>
          </MenuItem>
        ]}

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1">{t('auth.signOut')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.securelyEndSession')}
            </Typography>
          </ListItemText>
        </MenuItem>

        { }
        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VpnKey fontSize="inherit" />
            {t('auth.securedByKeycloak')}
          </Typography>
        </Box>
      </Menu>
    </>
  );
};
