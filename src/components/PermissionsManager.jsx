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

  const [visibility, setVisibility] = useState('public'); 
  const [allowDuplication, setAllowDuplication] = useState(true);

  const [allowViewDetails, setAllowViewDetails] = useState(true);
  const [allowExport, setAllowExport] = useState(true);
  const [allowVersionControl, setAllowVersionControl] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  const [allowSimplify, setAllowSimplify] = useState(false);
  const [allowDelete, setAllowDelete] = useState(false);

  useEffect(() => {
    if (currentPermissions) {
      setVisibility(currentPermissions.visibility || 'public');
      setAllowDuplication(currentPermissions.allowDuplication ?? true);
      setAllowViewDetails(currentPermissions.allowViewDetails ?? true);
      setAllowExport(currentPermissions.allowExport ?? true);
      setAllowVersionControl(currentPermissions.allowVersionControl ?? false);
      setAllowEdit(currentPermissions.allowEdit ?? false);
      setAllowSimplify(currentPermissions.allowSimplify ?? false);
      setAllowDelete(currentPermissions.allowDelete ?? false);
    }
  }, [currentPermissions]);

  const handleSave = () => {
    const permissionsData = {
      visibility,
      allowDuplication,
      
      allowViewDetails: visibility === 'private' ? false : allowViewDetails,
      allowExport: visibility === 'private' ? false : allowExport,
      allowVersionControl: visibility === 'private' ? false : allowVersionControl,
      allowEdit: visibility === 'private' ? false : allowEdit,
      allowSimplify: visibility === 'private' ? false : allowSimplify,
      allowDelete: visibility === 'private' ? false : allowDelete,
      
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
    
    console.log('[PermissionsManager] Saving permissions:', permissionsData);
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
          {}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
              Who can see your experiment?
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                {}
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

                {}
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
                          Everyone can discover this experiment
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                {}
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
                          Only people with the link can access
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>

          {}
          {(visibility === 'public' || visibility === 'restricted') && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 1 }}>
                Feature Permissions
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Control what actions others can perform on this experiment
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
                      checked={allowEdit}
                      onChange={(e) => setAllowEdit(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Edit experiment
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
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowSimplify}
                      onChange={(e) => setAllowSimplify(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Simplify language
                    </Typography>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowDelete}
                      onChange={(e) => setAllowDelete(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Delete experiment
                    </Typography>
                  }
                />
              </Stack>
            </Paper>
          )}
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
