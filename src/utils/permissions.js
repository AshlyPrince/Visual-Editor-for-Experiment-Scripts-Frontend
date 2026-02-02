/**
 * Permission utility functions for experiment access control
 */

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

/**
 * Permission hierarchy mapping
 */
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

/**
 * Check if a user has a specific permission
 * @param {Object} userPermissions - User's permission object from experiment
 * @param {string} requiredPermission - Permission to check (e.g., 'edit', 'delete')
 * @returns {boolean}
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !userPermissions.role) {
    return false;
  }
  
  const rolePermissions = PERMISSION_HIERARCHY[userPermissions.role] || [];
  return rolePermissions.includes(requiredPermission);
}

/**
 * Check if user can view experiment
 */
export function canView(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.VIEW);
}

/**
 * Check if user can comment on experiment
 */
export function canComment(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.COMMENT);
}

/**
 * Check if user can edit experiment
 */
export function canEdit(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.EDIT);
}

/**
 * Check if user can delete experiment
 */
export function canDelete(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.DELETE);
}

/**
 * Check if user can manage permissions
 */
export function canManagePermissions(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_PERMISSIONS);
}

/**
 * Check if user can duplicate experiment
 */
export function canDuplicate(userPermissions) {
  return hasPermission(userPermissions, PERMISSIONS.DUPLICATE);
}

/**
 * Check if user is the owner
 */
export function isOwner(userPermissions) {
  return userPermissions?.isOwner === true;
}

/**
 * Check if a user can access a restricted feature based on experiment permissions
 * @param {Object} experiment - The experiment object with permissions
 * @param {string} feature - Feature to check ('viewDetails', 'export', 'versionControl')
 * @param {Object} currentUser - Current user info
 * @returns {boolean}
 */
export function canAccessRestrictedFeature(experiment, feature, currentUser) {
  if (!experiment || !experiment.content || !experiment.content.permissions) {
    // No permissions set, allow access (backward compatibility)
    return true;
  }

  const permissions = experiment.content.permissions;
  
  // If experiment is private or public, check ownership first
  if (permissions.visibility === 'private') {
    // Only owner can access private experiments
    const isExperimentOwner = isUserOwner(experiment, currentUser);
    return isExperimentOwner;
  }
  
  if (permissions.visibility === 'public') {
    // Public experiments allow all features
    return true;
  }
  
  if (permissions.visibility === 'restricted') {
    // Check if user is owner
    const isExperimentOwner = isUserOwner(experiment, currentUser);
    if (isExperimentOwner) {
      return true; // Owner always has access
    }
    
    // For non-owners, check specific feature permissions
    switch (feature) {
      case 'viewDetails':
        return permissions.allowViewDetails !== false;
      case 'export':
        return permissions.allowExport !== false;
      case 'versionControl':
        return permissions.allowVersionControl !== false;
      default:
        return true;
    }
  }
  
  // Default: allow access
  return true;
}

/**
 * Check if current user is the owner of the experiment
 * @param {Object} experiment - The experiment object
 * @param {Object} currentUser - Current user info from keycloak
 * @returns {boolean}
 */
export function isUserOwner(experiment, currentUser) {
  if (!experiment || !currentUser) {
    return false;
  }

  const permissions = experiment.content?.permissions;
  if (!permissions || !permissions.userPermissions) {
    // Check legacy owner field
    const ownerId = experiment.created_by || experiment.createdBy || experiment.owner_id;
    const currentUserId = currentUser.id || currentUser.sub || currentUser.email;
    return ownerId === currentUserId;
  }

  // Check in userPermissions array for owner
  const ownerPermission = permissions.userPermissions.find(up => up.isOwner === true);
  if (!ownerPermission) {
    return false;
  }

  const currentUserId = currentUser.id || currentUser.sub || currentUser.email;
  return ownerPermission.userId === currentUserId || ownerPermission.email === currentUser.email;
}

/**
 * Get user's permission level from experiment's permissions structure
 * @param {Object} experimentPermissions - Experiment's permissions object
 * @param {string} userId - User ID to check
 * @returns {Object|null} - User's permission object or null
 */
export function getUserPermissions(experimentPermissions, userId) {
  if (!experimentPermissions || !experimentPermissions.userPermissions || !userId) {
    return null;
  }
  
  return experimentPermissions.userPermissions.find(
    up => up.userId === userId || up.email === userId
  ) || null;
}

/**
 * Get default permissions structure for new experiments
 * @param {Object} owner - Owner user info
 * @returns {Object}
 */
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

/**
 * Check if experiment is publicly accessible
 */
export function isPublic(experimentPermissions) {
  return experimentPermissions?.visibility === 'public';
}

/**
 * Check if experiment allows link sharing
 */
export function allowsLinkSharing(experimentPermissions) {
  return experimentPermissions?.allowLinkSharing === true;
}

/**
 * Check if user needs to request access
 */
export function requiresAccessRequest(experimentPermissions, userId) {
  if (!experimentPermissions) return true;
  
  // If public or allows link sharing, no request needed
  if (isPublic(experimentPermissions) || allowsLinkSharing(experimentPermissions)) {
    return false;
  }
  
  // Check if user already has permissions
  const userPerms = getUserPermissions(experimentPermissions, userId);
  if (userPerms) {
    return false;
  }
  
  // Private or restricted - needs request
  return true;
}

/**
 * Get permission level label
 */
export function getPermissionLevelLabel(level) {
  const labels = {
    [PERMISSION_LEVELS.VIEWER]: 'Viewer',
    [PERMISSION_LEVELS.COMMENTER]: 'Commenter',
    [PERMISSION_LEVELS.EDITOR]: 'Editor',
    [PERMISSION_LEVELS.ADMIN]: 'Admin'
  };
  
  return labels[level] || level;
}

/**
 * Get permission level description
 */
export function getPermissionLevelDescription(level) {
  const descriptions = {
    [PERMISSION_LEVELS.VIEWER]: 'Can view the experiment',
    [PERMISSION_LEVELS.COMMENTER]: 'Can view and comment on the experiment',
    [PERMISSION_LEVELS.EDITOR]: 'Can view, edit, and comment on the experiment',
    [PERMISSION_LEVELS.ADMIN]: 'Full control including deletion and permission management'
  };
  
  return descriptions[level] || '';
}

/**
 * Validate permissions data structure
 */
export function validatePermissions(permissions) {
  if (!permissions) return false;
  
  // Check required fields
  if (!permissions.visibility || !permissions.userPermissions) {
    return false;
  }
  
  // Check visibility value
  if (!['private', 'restricted', 'public'].includes(permissions.visibility)) {
    return false;
  }
  
  // Check that there's at least one owner
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
