import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import keycloakService from '../services/keycloakService.js';

const UserInfo = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const userInfo = keycloakService.getUserInfo();
  const isAuthenticated = keycloakService.isAuthenticated();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    keycloakService.logout();
    handleClose();
  };

  const handleManageAccount = () => {
    const accountUrl = keycloakService.getAccountManagementUrl();
    
    if (accountUrl && accountUrl !== '#') {
      window.open(accountUrl, '_blank');
    } else {
      alert('Unable to open account management. Please check Keycloak configuration.');
    }
    handleClose();
  };

  if (!isAuthenticated || !userInfo) {
    return (
      <Button 
        variant="outlined" 
        onClick={() => keycloakService.login()}
        startIcon={<AccountIcon />}
      >
        Login
      </Button>
    );
  }

  
  const getInitials = (user) => {
    if (user.given_name && user.family_name) {
      return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
    }
    if (user.name) {
      const names = user.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
    return user.preferred_username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Welcome, {userInfo.given_name || userInfo.preferred_username}
        </Typography>
        
        <Avatar
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'primary.main',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={handleClick}
        >
          {getInitials(userInfo)}
        </Avatar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 24,
              height: 24,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {userInfo.name || userInfo.preferred_username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userInfo.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserInfo;
