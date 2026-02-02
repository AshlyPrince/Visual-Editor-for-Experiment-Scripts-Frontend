

export const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  VIEW: 'view',
  COMMENT: 'comment',
  EDIT: 'edit',
  DELETE: 'delete',
  MANAGE_PERMISSIONS: 'manage_permissions',
  DUPLICATE: 'duplicate'
};

const PERMISSION_HIERARCHY = {
  [PERMISSION_LEVELS.VIEWER]: [PERMISSIONS.VIEW],
  [PERMISSION_LEVELS.COMMENTER]: [PERMISSIONS.VIEW, PERMISSIONS.COMMENT],
  [PERMISSION_LEVELS.EDITOR]: [PERMISSIONS.VIEW, PERMISSIONS.COMMENT, PERMISSIONS.EDIT, PERMISSIONS.DUPLICATE],
  [PERMISSION_LEVELS.ADMIN]: [
    PERMISSIONS.VIEW, 
    PERMISSIONS.COMMENT, 
    PERMISSIONS.EDIT, 
    PERMISSIONS.DELETE, 
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.DUPLICATE
  ]
};

export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !userPermissions.role) {
    return false;
  }
  
  const rolePermissions = PERMISSION_HIERARCHY[userPermissions.role] || [];
  return rolePermissions.includes(requiredPermission);
}

export function canView(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.VIEW);
}

export function canComment(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.COMMENT);
}

export function canEdit(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.EDIT);
}

export function canDelete(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.DELETE);
}

export function canManagePermissions(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_PERMISSIONS);
}

export function canDuplicate(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.DUPLICATE);
}

export function isOwner(userPermissions) {
  return userPermissions?.isOwner === true;
}

export function canAccessRestrictedFeature(experiment, feature, currentUser) {
  if (!experiment || !experiment.content || !experiment.content.permissions) {
    console.log('[Permissions] canAccessRestrictedFeature: No permissions set, allowing access');
    
    return true;
  }

  const permissions = experiment.content.permissions;
  
  console.log('[Permissions] canAccessRestrictedFeature:', {
    feature,
    currentUser: currentUser?.email || currentUser?.preferred_username,
    visibility: permissions.visibility,
    allowExport: permissions.allowExport,
    allowEdit: permissions.allowEdit,
    allowViewDetails: permissions.allowViewDetails,
    allowVersionControl: permissions.allowVersionControl,
    allowSimplify: permissions.allowSimplify
  });

  const isExperimentOwner = isUserOwner(experiment, currentUser);
  
  if (isExperimentOwner) {
    console.log('[Permissions] User is owner, granting full access');
    return true; 
  }

  if (permissions.visibility === 'private') {
    console.log('[Permissions] Experiment is private, denying access to non-owner');
    return false;
  }

  let hasAccess = true; 
  
  switch (feature) {
    case 'viewDetails':
      hasAccess = permissions.allowViewDetails !== false;
      break;
    case 'export':
      hasAccess = permissions.allowExport !== false;
      break;
    case 'versionControl':
      hasAccess = permissions.allowVersionControl === true;
      break;
    case 'edit':
      hasAccess = permissions.allowEdit === true;
      break;
    case 'simplify':
      hasAccess = permissions.allowSimplify !== false;
      break;
    case 'delete':
      hasAccess = permissions.allowDelete === true;
      break;
    default:
      hasAccess = true;
  }
  
  console.log(`[Permissions] Feature '${feature}' access: ${hasAccess}`);
  return hasAccess;
}

export function isUserOwner(experiment, currentUser) {
  if (!experiment || !currentUser) {
    console.log('[Permissions] isUserOwner: Missing experiment or currentUser');
    return false;
  }

  const userEmail = currentUser.email;
  const userName = currentUser.preferred_username || currentUser.id;
  const userSub = currentUser.sub;
  
  if (!userEmail && !userName && !userSub) {
    console.log('[Permissions] isUserOwner: No user identifiers found');
    return false;
  }

  const permissions = experiment.content?.permissions;
  if (permissions && permissions.userPermissions && Array.isArray(permissions.userPermissions)) {
    const ownerPermission = permissions.userPermissions.find(up => up.isOwner === true);
    if (ownerPermission) {
      const permUserId = ownerPermission.userId;
      const permEmail = ownerPermission.email;
      
      if (permEmail && userEmail && permEmail === userEmail) {
        console.log('[Permissions] isUserOwner: TRUE - Matched via userPermissions email');
        return true;
      }
      
      if (permUserId && (permUserId === userName || permUserId === userSub || permUserId === currentUser.id)) {
        console.log('[Permissions] isUserOwner: TRUE - Matched via userPermissions userId');
        return true;
      }
    }
  }

  const ownerId = experiment.created_by || experiment.createdBy || experiment.owner_id;
  
  if (ownerId) {
    if (ownerId === userSub || ownerId === userName || ownerId === userEmail || ownerId === currentUser.id) {
      console.log('[Permissions] isUserOwner: TRUE - Matched via created_by field');
      return true;
    }
  }

  console.log('[Permissions] isUserOwner: FALSE - No match found');
  return false;
}

export function getUserPermissions(experimentPermissions, userId) {
  if (!experimentPermissions || !experimentPermissions.userPermissions || !userId) {
    return null;
  }
  
  return experimentPermissions.userPermissions.find(
    up => up.userId === userId || up.email === userId
  ) || null;
}

export function getDefaultPermissions(owner) {
  const ownerId = owner?.id || owner?.sub || owner?.email;
  const ownerEmail = owner?.email;
  const ownerName = owner?.name || owner?.preferred_username || ownerEmail?.split('@')[0];
  
  return {
    visibility: 'public',
    allowDuplication: true,
    requireApprovalForAccess: false,
    userPermissions: [
      {
        userId: ownerId,
        email: ownerEmail,
        name: ownerName,
        role: PERMISSION_LEVELS.ADMIN,
        isOwner: true,
        addedAt: new Date().toISOString()
      }
    ],
    groupPermissions: [],
    allowLinkSharing: true,
    linkPermissionLevel: PERMISSION_LEVELS.EDITOR,
    linkExpiryDays: 0,
    lastModified: new Date().toISOString(),
    modifiedBy: ownerId
  };
}

export function isPublic(experimentPermissions) {
  return experimentPermissions?.visibility === 'public';
}

export function allowsLinkSharing(experimentPermissions) {
  return experimentPermissions?.allowLinkSharing === true;
}

export function requiresAccessRequest(experimentPermissions, userId) {
  if (!experimentPermissions) return true;

  if (isPublic(experimentPermissions) || allowsLinkSharing(experimentPermissions)) {
    return false;
  }

  const userPerms = getUserPermissions(experimentPermissions, userId);
  if (userPerms) {
    return false;
  }

  return true;
}

export function getPermissionLevelLabel(level) {
  const labels = {
    [PERMISSION_LEVELS.VIEWER]: 'Viewer',
    [PERMISSION_LEVELS.COMMENTER]: 'Commenter',
    [PERMISSION_LEVELS.EDITOR]: 'Editor',
    [PERMISSION_LEVELS.ADMIN]: 'Admin'
  };
  
  return labels[level] || level;
}

export function getPermissionLevelDescription(level) {
  const descriptions = {
    [PERMISSION_LEVELS.VIEWER]: 'Can view the experiment',
    [PERMISSION_LEVELS.COMMENTER]: 'Can view and comment on the experiment',
    [PERMISSION_LEVELS.EDITOR]: 'Can view, edit, and comment on the experiment',
    [PERMISSION_LEVELS.ADMIN]: 'Full control including deletion and permission management'
  };
  
  return descriptions[level] || '';
}

export function validatePermissions(permissions) {
  if (!permissions) return false;

  if (!permissions.visibility || !permissions.userPermissions) {
    return false;
  }

  if (!['private', 'restricted', 'public'].includes(permissions.visibility)) {
    return false;
  }

  const hasOwner = permissions.userPermissions.some(up => up.isOwner === true);
  if (!hasOwner) {
    return false;
  }
  
  return true;
}

export default {
  PERMISSION_LEVELS,
  PERMISSIONS,
  hasPermission,
  canView,
  canComment,
  canEdit,
  canDelete,
  canManagePermissions,
  canDuplicate,
  isOwner,
  getUserPermissions,
  getDefaultPermissions,
  isPublic,
  allowsLinkSharing,
  requiresAccessRequest,
  getPermissionLevelLabel,
  getPermissionLevelDescription,
  validatePermissions
};
