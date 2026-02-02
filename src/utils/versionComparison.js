import { diff } from 'deep-diff';
import { toCanonical } from './experimentCanonical.js';

const EXCLUDED_FIELDS = [
  'id',
  'experiment_id',
  'version_id',
  'current_version_id',
  'version_number',
  'current_version_number',
  'version_title',
  'versionTitle',
  'commit_message',
  'commitMessage',
  'created_at',
  'updated_at',
  'version_created_at',
  'created_by',
  'updated_by',
  'user_id',
  'is_deleted',
  'isDeleted',
  'is_current',
  'isCurrent',
  'created_with',
  'createdWith',
  'creation_method',
  'html_content',
  'htmlContent',
  'completed',
  'status',
  'subject',
  'gradeLevel',
  'grade_level',
  'course',
  'program',
  'icon',
  'emoji',
  'type',
  'contentFormat',
  'mediaAllowed',
  'mediaLocation',
  'required',
  'name',
  'description',
  'fields',
  'isCustom',
  'permissions',
  'userPermissions',
  'visibility',
  'allowViewDetails',
  'allowExport',
  'allowVersionControl',
  'allowEdit',
  'allowSimplify',
  'allowDelete',
];

const removeExcludedFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeExcludedFields(item));
  }
  
  const cleaned = { ...obj };
  
  if (cleaned.config && typeof cleaned.config === 'object') {
    Object.keys(cleaned.config).forEach(key => {
      if (!(key in cleaned)) {
        cleaned[key] = cleaned.config[key];
      }
    });
    delete cleaned.config;
  }
  
  if (cleaned.media && Array.isArray(cleaned.media) && cleaned.media.length === 0) {
    delete cleaned.media;
  }
  
  EXCLUDED_FIELDS.forEach(field => {
    if (field in cleaned) {
      delete cleaned[field];
    }
  });
  
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = removeExcludedFields(cleaned[key]);
      
      if (key === 'media' && Array.isArray(cleaned[key]) && cleaned[key].length === 0) {
        delete cleaned[key];
      }
      
      if (typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key]) && 
          Object.keys(cleaned[key]).length === 0) {
        delete cleaned[key];
      }
    }
  });
  
  return cleaned;
};

const isMetadataField = (fieldName) => {
  const metadataFields = ['duration', 'estimated_duration', 'course', 'program'];
  return metadataFields.includes(fieldName);
};

const isEffectivelyEmpty = (value) => {
  if (value === null || value === undefined || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

const areSemanticallySame = (val1, val2) => {
  if (isEffectivelyEmpty(val1) && isEffectivelyEmpty(val2)) return true;
  
  if (typeof val1 === 'string' && typeof val2 === 'string') {
    return val1.trim() === val2.trim();
  }
  
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    if (val1.length === 0 && val2.length === 0) return true;
    return JSON.stringify(val1) === JSON.stringify(val2);
  }
  
  return false;
};

const filterSignificantChanges = (differences) => {
  if (!differences) return [];
  
  return differences.filter(change => {
    const fieldName = change.path ? change.path[change.path.length - 1] : null;
    const fullPath = change.path ? change.path.join('.') : '';
    
    if (change.path && change.path.length === 1 && change.path[0] === 'content') {
      return false;
    }
    
    const pathContainsStructuralMetadata = /\b(subject|gradeLevel|course|program)\b/.test(fullPath);
    if (pathContainsStructuralMetadata) {
      return false;
    }
    
    if (fieldName && isMetadataField(fieldName)) {
      if (change.kind === 'E') {
        if (areSemanticallySame(change.lhs, change.rhs)) {
          return false;
        }
      }
      
      if (change.kind === 'N' || change.kind === 'D') {
        return false;
      }
    }
    
    const structuralFields = [
      'icon', 'emoji', 'type', 'fields', 'isCustom', 'description',
      'contentFormat', 'mediaAllowed', 'mediaLocation', 'required',
      'name'
    ];
    
    if (fieldName && structuralFields.includes(fieldName)) {
      return false;
    }
    
    if (fieldName === 'media') {
      if (change.kind === 'N') {
        if (!change.rhs || (Array.isArray(change.rhs) && change.rhs.length === 0)) {
          return false;
        }
      }
      
      if (change.kind === 'D') {
        if (!change.lhs || (Array.isArray(change.lhs) && change.lhs.length === 0)) {
          return false;
        }
      }
      
      if (change.kind === 'E') {
        const lhsEmpty = isEffectivelyEmpty(change.lhs);
        const rhsEmpty = isEffectivelyEmpty(change.rhs);
        if (lhsEmpty && rhsEmpty) {
          return false;
        }
      }
      
      if (change.kind === 'A') {
        const item = change.item;
        if (item.kind === 'N' && isEffectivelyEmpty(item.rhs)) {
          return false;
        }
        if (item.kind === 'D' && isEffectivelyEmpty(item.lhs)) {
          return false;
        }
      }
    }
    
    if (fullPath.includes('media')) {
      if (change.kind === 'N' && isEffectivelyEmpty(change.rhs)) {
        return false;
      }
      
      if (change.kind === 'D' && isEffectivelyEmpty(change.lhs)) {
        return false;
      }
    }
    
    if (change.kind === 'E') {
      if (areSemanticallySame(change.lhs, change.rhs)) {
        return false;
      }
    }
    
    if (change.kind === 'N') {
      if (isEffectivelyEmpty(change.rhs)) {
        return false;
      }
      
      if (fieldName === 'content' && typeof change.rhs === 'object') {
        const contentKeys = Object.keys(change.rhs).filter(k => !['config', 'sections'].includes(k));
        
        if (contentKeys.length === 0) {
          return false;
        }
      }
    }
    
    if (change.kind === 'D') {
      if (isEffectivelyEmpty(change.lhs)) {
        return false;
      }
      
      if (fieldName === 'content' && typeof change.lhs === 'object') {
        const contentKeys = Object.keys(change.lhs).filter(k => !['config', 'sections'].includes(k));
        if (contentKeys.length === 0) {
          return false;
        }
      }
    }
    
    if (change.kind === 'A') {
      const item = change.item;
      if (item.kind === 'N' && isEffectivelyEmpty(item.rhs)) {
        return false;
      }
      if (item.kind === 'D' && isEffectivelyEmpty(item.lhs)) {
        return false;
      }
    }
    
    return true;
  });
};

export const compareVersions = (version1, version2) => {
  const canonical1 = toCanonical(version1);
  const canonical2 = toCanonical(version2);
  
  const cleanV1 = removeExcludedFields(canonical1.content);
  const cleanV2 = removeExcludedFields(canonical2.content);
  
  const allDifferences = diff(cleanV1, cleanV2);
  const differences = filterSignificantChanges(allDifferences);
  
  return {
    version1: canonical1,
    version2: canonical2,
    differences: differences || [],
    hasChanges: differences && differences.length > 0,
  };
};

export const getChangeType = (change, t = null) => {
  const fallback = {
    'N': 'Added',
    'D': 'Deleted',
    'E': 'Edited',
    'A': 'Array changed',
    'default': 'Changed'
  };
  
  if (!t) {
    return fallback[change.kind] || fallback.default;
  }
  
  switch (change.kind) {
    case 'N': return t('versionComparison.changeTypes.added');
    case 'D': return t('versionComparison.changeTypes.deleted');
    case 'E': return t('versionComparison.changeTypes.edited');
    case 'A': return t('versionComparison.changeTypes.arrayChanged');
    default: return t('versionComparison.changeTypes.changed');
  }
};

export const getChangePath = (change, version1 = null, version2 = null, t = null) => {
  if (!change.path || change.path.length === 0) {
    return t ? t('versionComparison.paths.root') : 'root';
  }
  
  const path = [...change.path];
  const readableParts = [];
  
  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    
    if (part === 'sections' && i + 1 < path.length && typeof path[i + 1] === 'number') {
      const sectionIndex = path[i + 1];

      let section = null;

      if (change.kind === 'A' && change.item) {
        if (change.item.rhs) {
          section = change.item.rhs;
        } else if (change.item.lhs) {
          section = change.item.lhs;
        }
      } else {
        
        section = version2?.content?.sections?.[sectionIndex] || 
                 version1?.content?.sections?.[sectionIndex];
      }
      
      if (section?.name) {
        const icon = section.icon || '📝';
        readableParts.push(`${icon} ${section.name}`);
        i++;
        continue;
      } else if (section?.title) {
        readableParts.push(section.title);
        i++;
        continue;
      }
    }
    
    if (typeof part === 'number') {
      readableParts.push(t ? t('versionComparison.paths.item', { number: part + 1 }) : `Item ${part + 1}`);
    } else if (part === 'content') {
      readableParts.push(t ? t('versionComparison.paths.content') : 'Content');
    } else if (part === 'media') {
      readableParts.push(t ? t('versionComparison.paths.media') : 'Media');
    } else if (part === 'config') {
      readableParts.push(t ? t('versionComparison.paths.settings') : 'Settings');
    } else {
      const formatted = part.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      readableParts.push(formatted);
    }
  }
  
  return readableParts.join(' → ');
};

export const getChangeColor = (change) => {
  switch (change.kind) {
    case 'N': return '#4caf50';
    case 'D': return '#f44336';
    case 'E': return '#ff9800';
    case 'A': return '#2196f3';
    default: return '#9e9e9e';
  }
};

export const getChangeBgColor = (change) => {
  switch (change.kind) {
    case 'N': return '#e8f5e9';
    case 'D': return '#ffebee';
    case 'E': return '#fff3e0';
    case 'A': return '#e3f2fd';
    default: return '#f5f5f5';
  }
};

export const formatValue = (value, t = null) => {
  const msg = (key, fallback, params = {}) => t ? t(key, params) : fallback;
  
  if (value === null) return msg('versionComparison.values.empty', '(empty)');
  if (value === undefined) return msg('versionComparison.values.notSet', '(not set)');
  if (value === '') return msg('versionComparison.values.blank', '(blank)');
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return msg('versionComparison.values.noItems', '(no items)');
      
      if (value.every(item => typeof item === 'string')) {
        return value.join(', ');
      }
      
      if (value.length > 0 && typeof value[0] === 'object') {
        if (value[0].step || value[0].instruction || value[0].text) {
          return value.map((step, i) => 
            `${i + 1}. ${step.step || step.instruction || step.text || ''}`
          ).join('\n');
        }
        
        if (value[0].url || value[0].data || value[0].type) {
          return value.map(item => 
            item.caption || item.filename || item.type || msg('versionComparison.values.mediaItem', 'Media item')
          ).join(', ');
        }
        
        return value.slice(0, 3).map(item => 
          JSON.stringify(item)
        ).join(',\n') + (value.length > 3 ? `\n${msg('versionComparison.values.andMore', '... and {{count}} more', { count: value.length - 3 })}` : '');
      }
      
      return msg('versionComparison.values.items', '{{count}} items', { count: value.length });
    }
    
    if ((value.name || value.title) && ('content' in value || 'type' in value || 'id' in value)) {
      const sectionName = value.name || value.title || 'Unnamed Section';
      const icon = value.icon || value.emoji || '📝';
      let preview = '';
      
      if (value.content) {
        if (typeof value.content === 'string') {
          const stripped = value.content
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
          preview = stripped.length > 100 ? stripped.substring(0, 100) + '...' : stripped;
        } else if (Array.isArray(value.content) && value.content.length > 0) {
          preview = `${value.content.length} items`;
        } else if (typeof value.content === 'object' && !Array.isArray(value.content)) {
          const contentKeys = Object.keys(value.content).filter(k => 
            !['config', 'type', 'format'].includes(k) && 
            value.content[k] !== null && 
            value.content[k] !== undefined && 
            value.content[k] !== ''
          );
          if (contentKeys.length > 0) {
            preview = `${contentKeys.length} field${contentKeys.length > 1 ? 's' : ''}`;
          }
        }
      }
      
      return `${icon} ${sectionName}${preview ? ' (' + preview + ')' : ''}`;
    }
    
    if (value.config) {
      return msg('versionComparison.values.configHidden', '(configuration metadata - hidden)');
    }
    
    if (value.steps && Array.isArray(value.steps)) {
      return value.steps.map((step, i) => 
        `${i + 1}. ${step.step || step.instruction || step.text || step}`
      ).join('\n');
    }
    
    if (value.items && Array.isArray(value.items)) {
      if (value.items.every(item => typeof item === 'string')) {
        return value.items.join('\n• ');
      }
      return value.items.map(item => 
        item.name || item.label || item.text || JSON.stringify(item)
      ).join('\n• ');
    }
    
    const metadataFields = ['duration', 'subject', 'gradeLevel', 'course', 'program', 'estimated_duration'];
    const entries = Object.entries(value).filter(([key, val]) => 
      val !== null && val !== undefined && val !== '' && !metadataFields.includes(key)
    );
    
    if (entries.length === 0) return msg('versionComparison.values.emptyObject', '(empty object)');
    
    if (entries.length <= 5) {
      return entries.map(([key, val]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (typeof val === 'object') {
          return `${formattedKey}: ${msg('versionComparison.values.nestedData', '[nested data]')}`;
        }
        return `${formattedKey}: ${val}`;
      }).join('\n');
    }
    
    return msg('versionComparison.values.objectWithFields', 'Object with {{count}} fields', { count: entries.length });
  }
  
  if (typeof value === 'string' && value.includes('<')) {
    const strippedValue = value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    return strippedValue || msg('versionComparison.values.empty', '(empty)');
  }
  
  return String(value);
};

export const groupDifferences = (differences) => {
  const grouped = {};
  const seen = new Set();
  
  differences.forEach((change) => {
    if (change.path && change.path.length > 0) {
      const fieldName = change.path[change.path.length - 1];
      const topLevelFields = ['title', 'duration', 'subject', 'gradeLevel', 'name'];
      
      if (topLevelFields.includes(fieldName) && change.path.length <= 2) {
        const groupKey = fieldName;
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(change);
        return;
      }
      
      if (change.path[0] === 'sections') {
        const groupKey = 'sections';
        
        const changeSignature = `${groupKey}-${change.kind}-${JSON.stringify(change.path.slice(2))}`;
        if (seen.has(changeSignature)) {
          return;
        }
        seen.add(changeSignature);
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(change);
        return;
      }
      
      const parentPath = change.path.filter(p => typeof p !== 'number');
      if (parentPath.length < change.path.length) {
        const groupKey = parentPath.join('.') || 'root';
        
        const changeKey = `${groupKey}-${change.kind}`;
        if (seen.has(changeKey)) {
          return;
        }
        seen.add(changeKey);
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(change);
        return;
      }
    }
    
    const topLevel = change.path ? change.path[0] : 'root';
    if (!grouped[topLevel]) {
      grouped[topLevel] = [];
    }
    grouped[topLevel].push(change);
  });
  
  return grouped;
};
