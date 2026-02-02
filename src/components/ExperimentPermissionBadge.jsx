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
import { canEdit, canDelete, getUserPermissions, isOwner, isUserOwner } from '../utils/permissions';
import keycloakService from '../services/keycloakService';

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
  
  // Check if user is owner using the comprehensive isUserOwner function
  const isExpOwner = experiment ? isUserOwner(experiment, currentUser) : false;
  
  // If no permissions object but user is owner, show owner badge
  if (!experiment?.content?.permissions) {
    if (isExpOwner) {
      return (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip
            label={t('permissions.owner') || 'Owner'}
            size="small"
            color="primary"
            variant="outlined"
          />
          {onManagePermissions && (
            <Tooltip title={t('permissions.manage') || 'Manage Permissions'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePermissions(experiment);
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    }
    return null;
  }
  
  const permissions = experiment.content.permissions;
  const userPermissions = getUserPermissions(permissions, userId);
  const hasEditAccess = canEdit(userPermissions);
  const hasDeleteAccess = canDelete(userPermissions);

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

  let accessLabel = null;
  if (isExpOwner) {
    // User is owner - determined by isUserOwner check
    accessLabel = t('permissions.owner') || 'Owner';
  } else if (userPermissions) {
    // User has explicit permissions
    const role = userPermissions.role;
    if (role === 'admin') {
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
