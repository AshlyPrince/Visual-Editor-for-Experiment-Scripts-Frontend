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

  // Private: only owner has access
  if (permissions.visibility === 'private') {
    console.log('[Permissions] Experiment is private, denying access to non-owner');
    return false;
  }

  // Public: everyone has access to all features
  if (permissions.visibility === 'public') {
    console.log('[Permissions] Experiment is public, granting access');
    return true;
  }

  // Restricted: check specific permissions
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
      // Only owner can delete
      hasAccess = false;
      break;
    default:
      hasAccess = true;
  }
  
  console.log(`[Permissions] Feature '${feature}' access: ${hasAccess}`);
  return hasAccess;
}

// Check if current user is the owner of the experiment
export function isUserOwner(experiment, currentUser) {
  if (!experiment || !currentUser) {
    console.log('[Permissions] isUserOwner: Missing experiment or currentUser');
    return false;
  }

  const userName = currentUser.preferred_username || currentUser.id;
  
  if (!userName) {
    console.log('[Permissions] isUserOwner: No username found');
    return false;
  }

  const permissions = experiment.content?.permissions;
  
  // Check userPermissions array for owner (primary method)
  if (permissions && permissions.userPermissions && Array.isArray(permissions.userPermissions)) {
    const ownerPermission = permissions.userPermissions.find(up => up.isOwner === true);
    if (ownerPermission && ownerPermission.username) {
      const isMatch = ownerPermission.username === userName;
      console.log(`[Permissions] isUserOwner: ${isMatch ? 'TRUE' : 'FALSE'} - Checked username: ${userName} vs ${ownerPermission.username}`);
      return isMatch;
    }
  }

  // Fallback: check created_by field (legacy support)
  const createdBy = experiment.created_by || experiment.createdBy || experiment.owner_id;
  
  if (createdBy) {
    const isMatch = createdBy === userName;
    console.log(`[Permissions] isUserOwner: ${isMatch ? 'TRUE' : 'FALSE'} - Fallback check: ${userName} vs ${createdBy}`);
    return isMatch;
  }

  console.log('[Permissions] isUserOwner: FALSE - No ownership data found');
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

// Get user permissions by username (primary method for username-based matching)
export function getUserPermissionsByUsername(experimentPermissions, username) {
  if (!experimentPermissions || !experimentPermissions.userPermissions || !username) {
    return null;
  }
  
  return experimentPermissions.userPermissions.find(up => 
    up.username === username || up.userId === username
  );
}

// Check if user can view the experiment
export function canViewExperiment(experiment, currentUser) {
  if (!experiment || !currentUser) return false;
  
  const permissions = experiment.content?.permissions;
  
  // No permissions set - allow view (backward compatibility)
  if (!permissions) return true;
  
  const visibility = permissions.visibility || 'private';
  
  // Public: everyone can view
  if (visibility === 'public') return true;
  
  // Private: only owner can view
  if (visibility === 'private') {
    return isUserOwner(experiment, currentUser);
  }
  
  // Restricted: check if user has any permissions or is owner
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
    visibility: visibility, // 'private', 'public', or 'restricted'
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

  // Apply restricted settings if visibility is 'restricted'
  if (visibility === 'restricted') {
    permissions.allowEdit = restrictedSettings.allowEdit === true;
    permissions.allowExport = restrictedSettings.allowExport !== false;
    permissions.allowViewDetails = restrictedSettings.allowViewDetails !== false;
    permissions.allowVersionControl = restrictedSettings.allowVersionControl === true;
    permissions.allowSimplify = restrictedSettings.allowSimplify !== false;
  } else if (visibility === 'public') {
    // Public experiments allow all features
    permissions.allowEdit = true;
    permissions.allowExport = true;
    permissions.allowViewDetails = true;
    permissions.allowVersionControl = true;
    permissions.allowSimplify = true;
  }
  // Private experiments don't need these flags (owner has full access)

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

// Update experiment visibility/access level
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
    // Clear restricted flags
    delete permissions.allowDelete;
  } else if (newVisibility === 'private') {
    permissions.allowLinkSharing = false;
    // Clear restricted flags
    delete permissions.allowEdit;
    delete permissions.allowExport;
    delete permissions.allowViewDetails;
    delete permissions.allowVersionControl;
    delete permissions.allowSimplify;
    delete permissions.allowDelete;
  }
  
  return permissions;
}

// Add or update user permission
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
    // Don't allow changing owner status
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

// Remove user permission
export function removeUserPermissionByUsername(permissions, username) {
  if (!permissions.userPermissions) return permissions;

  permissions.userPermissions = permissions.userPermissions.filter(
    up => (up.username !== username && up.userId !== username) || up.isOwner === true
  );

  permissions.lastModified = new Date().toISOString();
  return permissions;
}

// Clone permissions for versioning (preserves all permissions)
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
