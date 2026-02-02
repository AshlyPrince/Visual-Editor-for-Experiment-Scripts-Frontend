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
    return true;
  }

  const permissions = experiment.content.permissions;
  
  const isExperimentOwner = isUserOwner(experiment, currentUser);
  
  if (isExperimentOwner) {
    return true; 
  }

  if (permissions.visibility === 'private') {
    return false;
  }

  if (permissions.visibility === 'public') {
    return true;
  }

  const userName = currentUser?.preferred_username || currentUser?.id;
  let hasAccess = false; 
  
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
      hasAccess = false;
      break;
    default:
      hasAccess = true;
  }
  
  return hasAccess;
}

export function isUserOwner(experiment, currentUser) {
  if (!experiment || !currentUser) {
    return false;
  }

  const userSub = currentUser.sub;
  const userId = currentUser.id;
  const userName = currentUser.preferred_username;
  const userEmail = currentUser.email;
  
  if (!userSub && !userId && !userName && !userEmail) {
    return false;
  }

  const permissions = experiment.content?.permissions;
  
  if (permissions && permissions.userPermissions && Array.isArray(permissions.userPermissions)) {
    const ownerPermission = permissions.userPermissions.find(up => up.isOwner === true);
    if (ownerPermission) {
      const isMatch = 
        (ownerPermission.username && (ownerPermission.username === userName || ownerPermission.username === userId || ownerPermission.username === userSub)) ||
        (ownerPermission.userId && (ownerPermission.userId === userSub || ownerPermission.userId === userId || ownerPermission.userId === userName)) ||
        (ownerPermission.email && ownerPermission.email === userEmail);
      
      return isMatch;
    }
  }

  const createdBy = experiment.created_by || experiment.createdBy || experiment.owner_id;
  
  if (createdBy) {
    const isMatch = createdBy === userSub || createdBy === userId || createdBy === userName || createdBy === userEmail;
    return isMatch;
  }

  return false;
}

export function getUserPermissions(experimentPermissions, userId) {
  if (!experimentPermissions || !experimentPermissions.userPermissions || !userId) {
    return null;
  }
  
  return experimentPermissions.userPermissions.find(
    up => up.userId === userId || up.email === userId || up.username === userId
  ) || null;
}

export function getUserPermissionsByUsername(experimentPermissions, username) {
  if (!experimentPermissions || !experimentPermissions.userPermissions || !username) {
    return null;
  }
  
  return experimentPermissions.userPermissions.find(up => 
    up.username === username || up.userId === username
  );
}

export function canViewExperiment(experiment, currentUser) {
  if (!experiment || !currentUser) return false;
  
  const permissions = experiment.content?.permissions;
  
  if (!permissions) return true;
  
  const visibility = permissions.visibility || 'private';
  
  if (visibility === 'public') return true;
  
  if (visibility === 'private') {
    return isUserOwner(experiment, currentUser);
  }
  
  if (visibility === 'restricted') {
    if (isUserOwner(experiment, currentUser)) return true;
    
    const userName = currentUser.preferred_username || currentUser.id;
    const userPerms = getUserPermissionsByUsername(permissions, userName);
    return userPerms !== null;
  }
  
  return false;
}

export function getDefaultPermissions(owner, visibility = 'private', restrictedSettings = {}) {
  const ownerId = owner?.id || owner?.sub || owner?.email;
  const ownerEmail = owner?.email;
  const ownerName = owner?.name || owner?.preferred_username || ownerEmail?.split('@')[0];
  const username = owner?.preferred_username || owner?.id;
  
  const permissions = {
    visibility: visibility,
    allowDuplication: true,
    requireApprovalForAccess: false,
    userPermissions: [
      {
        userId: ownerId,
        username: username,
        email: ownerEmail,
        name: ownerName,
        role: PERMISSION_LEVELS.ADMIN,
        isOwner: true,
        addedAt: new Date().toISOString()
      }
    ],
    groupPermissions: [],
    allowLinkSharing: visibility === 'public',
    linkPermissionLevel: PERMISSION_LEVELS.EDITOR,
    linkExpiryDays: 0,
    lastModified: new Date().toISOString(),
    modifiedBy: ownerId
  };

  if (visibility === 'restricted') {
    permissions.allowEdit = restrictedSettings.allowEdit === true;
    permissions.allowExport = restrictedSettings.allowExport !== false;
    permissions.allowViewDetails = restrictedSettings.allowViewDetails !== false;
    permissions.allowVersionControl = restrictedSettings.allowVersionControl === true;
    permissions.allowSimplify = restrictedSettings.allowSimplify !== false;
  } else if (visibility === 'public') {
    permissions.allowEdit = true;
    permissions.allowExport = true;
    permissions.allowViewDetails = true;
    permissions.allowVersionControl = true;
    permissions.allowSimplify = true;
  }

  return permissions;
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

export function updateExperimentVisibility(permissions, newVisibility, restrictedSettings = {}) {
  if (!permissions) return null;
  
  permissions.visibility = newVisibility;
  permissions.lastModified = new Date().toISOString();
  
  if (newVisibility === 'restricted') {
    permissions.allowEdit = restrictedSettings.allowEdit === true;
    permissions.allowExport = restrictedSettings.allowExport !== false;
    permissions.allowViewDetails = restrictedSettings.allowViewDetails !== false;
    permissions.allowVersionControl = restrictedSettings.allowVersionControl === true;
    permissions.allowSimplify = restrictedSettings.allowSimplify !== false;
    permissions.allowLinkSharing = false;
  } else if (newVisibility === 'public') {
    permissions.allowEdit = true;
    permissions.allowExport = true;
    permissions.allowViewDetails = true;
    permissions.allowVersionControl = true;
    permissions.allowSimplify = true;
    permissions.allowLinkSharing = true;
    delete permissions.allowDelete;
  } else if (newVisibility === 'private') {
    permissions.allowLinkSharing = false;
    delete permissions.allowEdit;
    delete permissions.allowExport;
    delete permissions.allowViewDetails;
    delete permissions.allowVersionControl;
    delete permissions.allowSimplify;
    delete permissions.allowDelete;
  }
  
  return permissions;
}

export function addOrUpdateUserPermission(permissions, username, email, role = PERMISSION_LEVELS.VIEWER) {
  if (!permissions.userPermissions) {
    permissions.userPermissions = [];
  }

  const existingIndex = permissions.userPermissions.findIndex(
    up => up.username === username || up.email === email
  );
  
  const userPermission = {
    username: username,
    email: email,
    role: role,
    isOwner: false,
    addedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    if (permissions.userPermissions[existingIndex].isOwner) {
      return permissions;
    }
    permissions.userPermissions[existingIndex] = {
      ...permissions.userPermissions[existingIndex],
      ...userPermission
    };
  } else {
    permissions.userPermissions.push(userPermission);
  }

  permissions.lastModified = new Date().toISOString();
  return permissions;
}

export function removeUserPermissionByUsername(permissions, username) {
  if (!permissions.userPermissions) return permissions;

  permissions.userPermissions = permissions.userPermissions.filter(
    up => (up.username !== username && up.userId !== username) || up.isOwner === true
  );

  permissions.lastModified = new Date().toISOString();
  return permissions;
}

export function clonePermissions(permissions) {
  if (!permissions) return null;
  
  return {
    ...permissions,
    userPermissions: permissions.userPermissions ? [...permissions.userPermissions] : [],
    groupPermissions: permissions.groupPermissions ? [...permissions.groupPermissions] : [],
    lastModified: new Date().toISOString()
  };
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
  getUserPermissionsByUsername,
  getDefaultPermissions,
  isPublic,
  allowsLinkSharing,
  requiresAccessRequest,
  getPermissionLevelLabel,
  getPermissionLevelDescription,
  validatePermissions,
  updateExperimentVisibility,
  addOrUpdateUserPermission,
  removeUserPermissionByUsername,
  clonePermissions,
  canViewExperiment,
  canAccessRestrictedFeature,
  isUserOwner
};
