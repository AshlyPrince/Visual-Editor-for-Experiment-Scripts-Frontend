import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Public as PublicIcon,
  VpnKey as RequestAccessIcon,
  NotificationsActive as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { canEdit, canDelete, getUserPermissions, isOwner } from '../utils/permissions';
import keycloakService from '../services/keycloakService';

/**
 * Component to display experiment permission status and actions
 */
const ExperimentPermissionBadge = ({ 
  experiment, 
  onRequestAccess, 
  onManagePermissions,
  pendingRequestsCount = 0,
  compact = false 
}) => {
  const { t } = useTranslation();
  const currentUser = keycloakService.getUserInfo();
  const userId = currentUser?.id || currentUser?.sub || currentUser?.email;
  
  if (!experiment?.content?.permissions) {
    return null;
  }
  
  const permissions = experiment.content.permissions;
  const userPermissions = getUserPermissions(permissions, userId);
  const isExpOwner = isOwner(userPermissions);
  const hasEditAccess = canEdit(userPermissions);
  const hasDeleteAccess = canDelete(userPermissions);
  
  // Determine visibility icon and color
  let visibilityIcon = <LockIcon />;
  let visibilityColor = 'default';
  let visibilityLabel = t('permissions.private') || 'Private';
  
  if (permissions.visibility === 'public') {
    visibilityIcon = <PublicIcon />;
    visibilityColor = 'success';
    visibilityLabel = t('permissions.public') || 'Public';
  } else if (permissions.visibility === 'restricted') {
    visibilityIcon = <LockOpenIcon />;
    visibilityColor = 'warning';
    visibilityLabel = t('permissions.restricted') || 'Restricted';
  }
  
  // Determine user's access level
  let accessLabel = null;
  if (userPermissions) {
    const role = userPermissions.role;
    if (isExpOwner) {
      accessLabel = t('permissions.owner') || 'Owner';
    } else if (role === 'admin') {
      accessLabel = t('permissions.admin') || 'Admin';
    } else if (role === 'editor') {
      accessLabel = t('permissions.editor') || 'Editor';
    } else if (role === 'commenter') {
      accessLabel = t('permissions.commenter') || 'Commenter';
    } else if (role === 'viewer') {
      accessLabel = t('permissions.viewer') || 'Viewer';
    }
  }
  
  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Tooltip title={visibilityLabel}>
          <Chip
            icon={visibilityIcon}
            label={visibilityLabel}
            size="small"
            color={visibilityColor}
          />
        </Tooltip>
        
        {accessLabel && (
          <Chip
            label={accessLabel}
            size="small"
            color={isExpOwner ? 'primary' : 'default'}
            variant="outlined"
          />
        )}
        
        {isExpOwner && onManagePermissions && (
          <Tooltip title={t('permissions.manage') || 'Manage Permissions'}>
            <Badge badgeContent={pendingRequestsCount} color="error">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePermissions(experiment);
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Badge>
          </Tooltip>
        )}
        
        {!userPermissions && onRequestAccess && (
          <Tooltip title={t('permissions.requestAccess') || 'Request Access'}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onRequestAccess(experiment);
              }}
            >
              <RequestAccessIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }
  
  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <Chip
        icon={visibilityIcon}
        label={visibilityLabel}
        size="small"
        color={visibilityColor}
      />
      
      {accessLabel && (
        <Chip
          label={`${t('permissions.yourRole')}: ${accessLabel}`}
          size="small"
          color={isExpOwner ? 'primary' : 'default'}
        />
      )}
      
      {hasEditAccess && (
        <Chip
          label={t('permissions.canEdit') || 'Can Edit'}
          size="small"
          variant="outlined"
          color="info"
        />
      )}
      
      {hasDeleteAccess && (
        <Chip
          label={t('permissions.canDelete') || 'Can Delete'}
          size="small"
          variant="outlined"
          color="warning"
        />
      )}
      
      {isExpOwner && onManagePermissions && (
        <Tooltip title={t('permissions.managePermissions') || 'Manage Permissions'}>
          <Badge badgeContent={pendingRequestsCount} color="error">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onManagePermissions(experiment);
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Tooltip>
      )}
      
      {!userPermissions && onRequestAccess && (
        <Tooltip title={t('permissions.requestAccessTooltip') || 'You don\'t have access. Click to request.'}>
          <IconButton
            size="small"
            color="primary"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onRequestAccess(experiment);
            }}
          >
            <RequestAccessIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ExperimentPermissionBadge;
