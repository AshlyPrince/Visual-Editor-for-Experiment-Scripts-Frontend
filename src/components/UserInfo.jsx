import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Check as CheckIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import keycloakService from '../services/keycloakService.js';

const UserInfo = ({ onHelpClick }) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const userInfo = keycloakService.getUserInfo();
  const isAuthenticated = keycloakService.isAuthenticated();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
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
      alert(t('auth.accountManagementUnavailable'));
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
        {t('auth.login')}
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
          {t('auth.welcome')}, {userInfo.given_name || userInfo.preferred_username}
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
        
        {languages.map((language) => (
          <MenuItem 
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 36 }}>
              {language.flag}
            </ListItemIcon>
            <ListItemText>{language.name}</ListItemText>
            {i18n.language === language.code && (
              <CheckIcon fontSize="small" sx={{ ml: 2, color: 'primary.main' }} />
            )}
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem onClick={() => { onHelpClick?.(); handleClose(); }}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {t('help.helpGuide', 'Help & User Guide')}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {t('auth.logout')}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserInfo;
