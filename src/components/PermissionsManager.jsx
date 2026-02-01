import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Switch,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Stack,
  Autocomplete,
  Avatar,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import keycloakService from '../services/keycloakService';

const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

const PERMISSION_DETAILS = {
  viewer: {
    label: 'Viewer',
    description: 'Can view the experiment',
    permissions: ['view'],
    icon: <VisibilityIcon />
  },
  commenter: {
    label: 'Commenter',
    description: 'Can view and request changes',
    permissions: ['view', 'comment'],
    icon: <ShareIcon />
  },
  editor: {
    label: 'Editor',
    description: 'Can view and edit the experiment',
    permissions: ['view', 'edit', 'comment'],
    icon: <EditIcon />
  },
  admin: {
    label: 'Admin',
    description: 'Full control including deletion and permission management',
    permissions: ['view', 'edit', 'delete', 'manage_permissions', 'comment'],
    icon: <AdminIcon />
  }
};

const PermissionsManager = ({ 
  open, 
  onClose, 
  experimentId, 
  currentPermissions = null,
  isNewExperiment = false,
  onSave 
}) => {
  const { t } = useTranslation();
  const currentUser = keycloakService.getUserInfo();
  
  const [tabValue, setTabValue] = useState(0);
  
  // Access control settings
  const [visibility, setVisibility] = useState('private'); // private, restricted, public
  const [allowDuplication, setAllowDuplication] = useState(false);
  const [requireApprovalForAccess, setRequireApprovalForAccess] = useState(true);
  
  // User permissions
  const [userPermissions, setUserPermissions] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedPermissionLevel, setSelectedPermissionLevel] = useState(PERMISSION_LEVELS.VIEWER);
  
  // Group permissions (optional feature)
  const [groupPermissions, setGroupPermissions] = useState([]);
  
  // Link sharing
  const [allowLinkSharing, setAllowLinkSharing] = useState(false);
  const [linkPermissionLevel, setLinkPermissionLevel] = useState(PERMISSION_LEVELS.VIEWER);
  const [linkExpiryDays, setLinkExpiryDays] = useState(7);

  useEffect(() => {
    if (currentPermissions) {
      setVisibility(currentPermissions.visibility || 'private');
      setAllowDuplication(currentPermissions.allowDuplication || false);
      setRequireApprovalForAccess(currentPermissions.requireApprovalForAccess ?? true);
      setUserPermissions(currentPermissions.userPermissions || []);
      setGroupPermissions(currentPermissions.groupPermissions || []);
      setAllowLinkSharing(currentPermissions.allowLinkSharing || false);
      setLinkPermissionLevel(currentPermissions.linkPermissionLevel || PERMISSION_LEVELS.VIEWER);
      setLinkExpiryDays(currentPermissions.linkExpiryDays || 7);
    } else if (isNewExperiment) {
      // Set owner as admin
      const ownerId = currentUser?.id || currentUser?.sub || currentUser?.email;
      if (ownerId) {
        setUserPermissions([{
          userId: ownerId,
          email: currentUser?.email,
          name: currentUser?.name || currentUser?.preferred_username,
          role: PERMISSION_LEVELS.ADMIN,
          isOwner: true,
          addedAt: new Date().toISOString()
        }]);
      }
    }
  }, [currentPermissions, isNewExperiment, currentUser]);

  const handleAddUser = () => {
    if (!searchEmail || !searchEmail.trim()) return;
    
    const email = searchEmail.trim().toLowerCase();
    
    // Check if user already exists
    if (userPermissions.some(u => u.email === email)) {
      alert(t('permissions.userAlreadyAdded') || 'This user already has permissions');
      return;
    }
    
    const newPermission = {
      userId: email, // In real scenario, you'd look up the actual user ID
      email: email,
      name: email.split('@')[0], // Placeholder name
      role: selectedPermissionLevel,
      isOwner: false,
      addedAt: new Date().toISOString()
    };
    
    setUserPermissions([...userPermissions, newPermission]);
    setSearchEmail('');
  };

  const handleUpdateUserRole = (userId, newRole) => {
    setUserPermissions(userPermissions.map(user => 
      user.userId === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleRemoveUser = (userId) => {
    // Don't allow removing the owner
    const user = userPermissions.find(u => u.userId === userId);
    if (user?.isOwner) {
      alert(t('permissions.cannotRemoveOwner') || 'Cannot remove the experiment owner');
      return;
    }
    
    setUserPermissions(userPermissions.filter(user => user.userId !== userId));
  };

  const handleSave = () => {
    const permissionsData = {
      visibility,
      allowDuplication,
      requireApprovalForAccess,
      userPermissions,
      groupPermissions,
      allowLinkSharing,
      linkPermissionLevel,
      linkExpiryDays,
      lastModified: new Date().toISOString(),
      modifiedBy: currentUser?.id || currentUser?.sub || currentUser?.email
    };
    
    onSave(permissionsData);
  };

  const getShareableLink = () => {
    if (!experimentId) return '';
    return `${window.location.origin}/experiments/${experimentId}/view?share=true`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon />
            <Typography variant="h6">
              {t('permissions.title') || 'Experiment Permissions & Access'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label={t('permissions.generalAccess') || 'General Access'} />
          <Tab label={t('permissions.userPermissions') || 'User Permissions'} />
          <Tab label={t('permissions.linkSharing') || 'Link Sharing'} />
        </Tabs>

        {/* Tab 0: General Access Settings */}
        {tabValue === 0 && (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('permissions.visibility') || 'Experiment Visibility'}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('permissions.private') || 'Private'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('permissions.privateDesc') || 'Only you and users you specifically share with can access'}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="restricted"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('permissions.restricted') || 'Restricted'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('permissions.restrictedDesc') || 'Anyone with the link can view, but editing requires approval'}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="public"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('permissions.public') || 'Public'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('permissions.publicDesc') || 'Anyone can view this experiment in the public catalog'}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('permissions.additionalSettings') || 'Additional Settings'}
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
                      {t('permissions.allowDuplication') || 'Allow others to duplicate this experiment'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('permissions.allowDuplicationDesc') || 'Users with view access can make their own copy'}
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={requireApprovalForAccess}
                    onChange={(e) => setRequireApprovalForAccess(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      {t('permissions.requireApproval') || 'Require approval for access requests'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('permissions.requireApprovalDesc') || 'You must approve before others can access'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Alert severity="info">
              {t('permissions.generalAccessInfo') || 'These settings control who can discover and access your experiment. You can grant specific permissions to individual users in the next tab.'}
            </Alert>
          </Stack>
        )}

        {/* Tab 1: User Permissions */}
        {tabValue === 1 && (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('permissions.addUser') || 'Add User'}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  size="small"
                  label={t('permissions.emailAddress') || 'Email Address'}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                  placeholder="user@example.com"
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <TextField
                    select
                    size="small"
                    value={selectedPermissionLevel}
                    onChange={(e) => setSelectedPermissionLevel(e.target.value)}
                    label={t('permissions.role') || 'Role'}
                  >
                    {Object.entries(PERMISSION_DETAILS).map(([key, details]) => (
                      <MenuItem key={key} value={key}>
                        {details.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddUser}
                  disabled={!searchEmail.trim()}
                >
                  {t('permissions.add') || 'Add'}
                </Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('permissions.currentUsers') || 'Users with Access'}
              </Typography>
              
              {userPermissions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('permissions.noUsers') || 'No users added yet'}
                </Typography>
              ) : (
                <List>
                  {userPermissions.map((user) => (
                    <ListItem key={user.userId} divider>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {user.name || user.email}
                            </Typography>
                            {user.isOwner && (
                              <Chip 
                                label={t('permissions.owner') || 'Owner'} 
                                size="small" 
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {t('permissions.permissions')}: {PERMISSION_DETAILS[user.role]?.permissions.join(', ')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {!user.isOwner && (
                            <>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <TextField
                                  select
                                  size="small"
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.userId, e.target.value)}
                                >
                                  {Object.entries(PERMISSION_DETAILS).map(([key, details]) => (
                                    <MenuItem key={key} value={key}>
                                      {details.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </FormControl>
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveUser(user.userId)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('permissions.permissionLevels') || 'Permission Levels Explained'}
              </Typography>
              <Stack spacing={1}>
                {Object.entries(PERMISSION_DETAILS).map(([key, details]) => (
                  <Box key={key} display="flex" gap={1}>
                    {details.icon}
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {details.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {details.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* Tab 2: Link Sharing */}
        {tabValue === 2 && (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowLinkSharing}
                    onChange={(e) => setAllowLinkSharing(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {t('permissions.enableLinkSharing') || 'Enable link sharing'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('permissions.enableLinkSharingDesc') || 'Anyone with the link can access this experiment'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {allowLinkSharing && (
              <>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('permissions.shareableLink') || 'Shareable Link'}
                  </Typography>
                  
                  <TextField
                    fullWidth
                    size="small"
                    value={getShareableLink()}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(getShareableLink());
                            alert(t('permissions.linkCopied') || 'Link copied to clipboard!');
                          }}
                        >
                          {t('permissions.copy') || 'Copy'}
                        </Button>
                      )
                    }}
                  />
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('permissions.linkSettings') || 'Link Settings'}
                  </Typography>
                  
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <TextField
                        select
                        size="small"
                        label={t('permissions.linkPermissionLevel') || 'Permission Level'}
                        value={linkPermissionLevel}
                        onChange={(e) => setLinkPermissionLevel(e.target.value)}
                      >
                        <MenuItem value={PERMISSION_LEVELS.VIEWER}>
                          {t('permissions.viewer') || 'Viewer - Can only view'}
                        </MenuItem>
                        <MenuItem value={PERMISSION_LEVELS.COMMENTER}>
                          {t('permissions.commenter') || 'Commenter - Can view and comment'}
                        </MenuItem>
                        <MenuItem value={PERMISSION_LEVELS.EDITOR}>
                          {t('permissions.editor') || 'Editor - Can view and edit'}
                        </MenuItem>
                      </TextField>
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={t('permissions.linkExpiryDays') || 'Link Expiry (days)'}
                      value={linkExpiryDays}
                      onChange={(e) => setLinkExpiryDays(parseInt(e.target.value) || 7)}
                      helperText={t('permissions.linkExpiryHelp') || 'Link will expire after this many days (0 for no expiry)'}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Stack>
                </Paper>

                <Alert severity="warning">
                  {t('permissions.linkSharingWarning') || 'Anyone with this link will be able to access the experiment with the specified permission level. Be careful when sharing!'}
                </Alert>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {t('common.save') || 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionsManager;
