import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Divider,
  Stack,
  Paper,
  IconButton,
  Checkbox
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Public as PublicIcon,
  VisibilityOff as RestrictedIcon
} from '@mui/icons-material';
import keycloakService from '../services/keycloakService';

const PermissionsManager = ({ 
  open, 
  onClose, 
  experimentId, 
  currentPermissions = null,
  isNewExperiment = false,
  onSave 
}) => {
  const currentUser = keycloakService.getUserInfo();
  
  // Simple settings
  const [visibility, setVisibility] = useState('public'); // private, public, restricted
  const [allowDuplication, setAllowDuplication] = useState(true);
  
  // Restricted mode permissions (only shown when visibility is 'restricted')
  const [allowViewDetails, setAllowViewDetails] = useState(true);
  const [allowExport, setAllowExport] = useState(true);
  const [allowVersionControl, setAllowVersionControl] = useState(false);

  useEffect(() => {
    if (currentPermissions) {
      setVisibility(currentPermissions.visibility || 'public');
      setAllowDuplication(currentPermissions.allowDuplication ?? true);
      setAllowViewDetails(currentPermissions.allowViewDetails ?? true);
      setAllowExport(currentPermissions.allowExport ?? true);
      setAllowVersionControl(currentPermissions.allowVersionControl ?? false);
    }
  }, [currentPermissions]);

  const handleSave = () => {
    const permissionsData = {
      visibility,
      allowDuplication,
      // Restricted mode settings
      allowViewDetails: visibility === 'restricted' ? allowViewDetails : true,
      allowExport: visibility === 'restricted' ? allowExport : true,
      allowVersionControl: visibility === 'restricted' ? allowVersionControl : false,
      // Owner info
      requireApprovalForAccess: false,
      userPermissions: [{
        userId: currentUser?.id || currentUser?.sub || currentUser?.email,
        email: currentUser?.email,
        name: currentUser?.name || currentUser?.preferred_username,
        role: 'admin',
        isOwner: true,
        addedAt: new Date().toISOString()
      }],
      groupPermissions: [],
      allowLinkSharing: visibility !== 'private',
      linkPermissionLevel: 'viewer',
      linkExpiryDays: 0,
      lastModified: new Date().toISOString(),
      modifiedBy: currentUser?.id || currentUser?.sub || currentUser?.email
    };
    
    onSave(permissionsData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="600">
            Sharing Settings
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Control who can access your experiment
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* Visibility Setting */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
              Who can see your experiment?
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                {/* Private Option */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 1.5,
                    border: visibility === 'private' ? '2px solid' : '1px solid',
                    borderColor: visibility === 'private' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setVisibility('private')}
                >
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LockIcon fontSize="small" />
                          <Typography variant="body1" fontWeight="600">
                            Private
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Only you can access this experiment
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                {/* Public Option */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    mb: 1.5,
                    border: visibility === 'public' ? '2px solid' : '1px solid',
                    borderColor: visibility === 'public' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setVisibility('public')}
                >
                  <FormControlLabel
                    value="public"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PublicIcon fontSize="small" />
                          <Typography variant="body1" fontWeight="600">
                            Public
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Everyone can view and access all features
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                {/* Restricted Option */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    border: visibility === 'restricted' ? '2px solid' : '1px solid',
                    borderColor: visibility === 'restricted' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setVisibility('restricted')}
                >
                  <FormControlLabel
                    value="restricted"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <RestrictedIcon fontSize="small" />
                          <Typography variant="body1" fontWeight="600">
                            Restricted
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          You control specific features others can access
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Restricted Mode Options */}
          {visibility === 'restricted' && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                What can others do?
              </Typography>
              
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowViewDetails}
                      onChange={(e) => setAllowViewDetails(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      View experiment details
                    </Typography>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowExport}
                      onChange={(e) => setAllowExport(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Export experiment
                    </Typography>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowVersionControl}
                      onChange={(e) => setAllowVersionControl(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Access version history
                    </Typography>
                  }
                />
              </Stack>
            </Paper>
          )}

          <Divider />

          {/* Duplication Setting */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 1.5 }}>
              Additional Options
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={allowDuplication}
                  onChange={(e) => setAllowDuplication(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    Allow others to make a copy
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Users can duplicate this experiment to their own workspace
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} size="large">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionsManager;
