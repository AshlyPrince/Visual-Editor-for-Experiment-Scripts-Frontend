 

import { getSectionDefinition } from '../schemas/experimentSchema.js';

export const toCanonical = (experiment) => {
  if (!experiment) return null;
  
  
  
  const actualContent = experiment.content?.content || experiment.content;
  
  
  const sectionsData = experiment.sections || actualContent?.sections || experiment.content?.sections || [];
  
  
  const normalizedSections = sectionsData.map(section => normalizeSection(section));
  
  
  
  
  const config = {
    duration: (experiment.content?.content?.config?.duration && experiment.content.content.config.duration.trim()) ||
              (experiment.content?.config?.duration && experiment.content.config.duration.trim()) || 
              (experiment.estimated_duration && experiment.estimated_duration.trim()) || 
              (experiment.duration && experiment.duration.trim()) || '',
    subject: (experiment.content?.content?.config?.subject && experiment.content.content.config.subject.trim()) ||
             (experiment.content?.config?.subject && experiment.content.config.subject.trim()) || 
             (experiment.course && experiment.course.trim()) || 
             (experiment.subject && experiment.subject.trim()) || '',
    gradeLevel: (experiment.content?.content?.config?.gradeLevel && experiment.content.content.config.gradeLevel.trim()) ||
                (experiment.content?.config?.gradeLevel && experiment.content.config.gradeLevel.trim()) || 
                (experiment.program && experiment.program.trim()) || 
                (experiment.gradeLevel && experiment.gradeLevel.trim()) || ''
  };
  
  // Extract permissions from various possible locations
  const permissions = experiment.content?.permissions || 
                     experiment.content?.content?.permissions || 
                     experiment.permissions;
  
  return {
    
    ...(experiment.id && { id: experiment.id }),
    ...(experiment.title && { title: experiment.title }),
    ...(experiment.description && { description: experiment.description }),
    ...(experiment.created_by && { created_by: experiment.created_by }),
    ...(experiment.created_at && { created_at: experiment.created_at }),
    ...(experiment.updated_at && { updated_at: experiment.updated_at }),
    ...(experiment.version_id && { version_id: experiment.version_id }),
    ...(experiment.version_number && { version_number: experiment.version_number }),
    
    
    content: {
      config,
      sections: normalizedSections,
      ...(permissions && { permissions })
    },
    
    
    ...(experiment.html_content && { html_content: experiment.html_content })
  };
};

export const normalizeSection = (section) => {
  if (!section || !section.id) {
    return null;
  }
  
  const schemaDef = getSectionDefinition(section.id);
  
  if (!schemaDef) {
    
    return {
      id: section.id,
      name: section.name || 'Custom Section',
      content: section.content || '',
      ...(section.media && section.media.length > 0 && { media: section.media })
    };
  }
  
  const normalized = {
    id: section.id,
    name: section.name || schemaDef.name
  };
  
  
  switch (schemaDef.type) {
    case 'rich-text':
      
      normalized.content = normalizeRichTextContent(section.content);
      break;
      
    case 'materials_with_media':
      
      normalized.content = normalizeMaterialsContent(section.content);
      break;
      
    case 'steps':
    case 'procedure-steps':
      
      normalized.content = normalizeStepsContent(section.content);
      break;
      
    case 'list':
      
      normalized.content = normalizeListContent(section.content);
      break;
      
    default:
      
      normalized.content = section.content || '';
  }
  
  
  if (section.media && Array.isArray(section.media) && section.media.length > 0) {
    normalized.media = section.media.filter(m => m && (m.data || m.url));
  }
  
  return normalized;
};

const normalizeRichTextContent = (content) => {
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object' && content !== null) {
    
    return content.text || content.html || content.content || content.purpose || '';
  }
  
  return '';
};

const normalizeMaterialsContent = (content) => {
  
  if (content && typeof content === 'object' && Array.isArray(content.items)) {
    return {
      items: content.items.map(item => {
        if (typeof item === 'string') {
          return { name: item, media: null };
        }
        return {
          name: item.name || '',
          ...(item.media && { media: item.media })
        };
      })
    };
  }
  
  
  if (Array.isArray(content)) {
    return {
      items: content.map(item => ({
        name: typeof item === 'string' ? item : (item.name || ''),
        media: null
      }))
    };
  }
  
  
  return { items: [] };
};

const normalizeStepsContent = (content) => {
  
  if (content && typeof content === 'object' && Array.isArray(content.steps)) {
    return {
      steps: content.steps.map((step, index) => {
        if (typeof step === 'string') {
          return { text: step };
        }
        return {
          text: step.text || step.step || step.instruction || `Step ${index + 1}`,
          ...(step.duration && { duration: step.duration }),
          ...(step.notes && { notes: step.notes }),
          ...(step.media && { media: step.media })
        };
      })
    };
  }
  
  
  if (Array.isArray(content)) {
    return {
      steps: content.map(step => ({
        text: typeof step === 'string' ? step : (step.text || step.step || step.instruction || '')
      }))
    };
  }
  
  
  return { steps: [] };
};

const normalizeListContent = (content) => {
  
  if (content && typeof content === 'object' && Array.isArray(content.items)) {
    return {
      items: content.items.filter(item => typeof item === 'string' && item.trim())
    };
  }
  
  
  if (Array.isArray(content)) {
    return {
      items: content.filter(item => typeof item === 'string' && item.trim())
    };
  }
  
  
  return { items: [] };
};

export const toWizardState = (sections) => {
  if (!sections || !Array.isArray(sections)) return {};
  
  
  const wizardState = {};
  
  sections.forEach(section => {
    const schemaDef = getSectionDefinition(section.id);
    
    if (!schemaDef) {
      return;
    }
    
    wizardState[section.id] = {};
    
    
    switch (schemaDef.type) {
      case 'rich-text':
        
        const richtextFieldId = schemaDef.fields?.find(f => f.type === 'richtext')?.id || 'content';
        wizardState[section.id][richtextFieldId] = section.content || '';
        
        
        if (section.media) {
          wizardState[section.id].media = section.media;
        }
        break;
        
      case 'materials_with_media':
      case 'steps':
      case 'procedure-steps':
      case 'list':
        
        wizardState[section.id] = section.content || {};
        
        
        if (section.media) {
          wizardState[section.id].media = section.media;
        }
        break;
        
      default:
        
        wizardState[section.id].content = section.content;
        if (section.media) {
          wizardState[section.id].media = section.media;
        }
    }
  });
  
  return wizardState;
};

export const fromWizardState = (wizardState, selectedSections) => {
  if (!wizardState || !selectedSections) return [];
  
  console.log('[fromWizardState] Input wizardState:', wizardState);
  console.log('[fromWizardState] Input selectedSections:', selectedSections);
  
  return selectedSections.map(sectionDef => {
    const fieldValues = wizardState[sectionDef.id] || {};
    const schemaDef = getSectionDefinition(sectionDef.id);
    
    console.log(`[fromWizardState] Processing section: ${sectionDef.id}`);
    console.log(`[fromWizardState] Field values for ${sectionDef.id}:`, fieldValues);
    console.log(`[fromWizardState] Schema definition for ${sectionDef.id}:`, schemaDef);
    
    if (!schemaDef) {
      return {
        id: sectionDef.id,
        name: sectionDef.name,
        content: fieldValues.content || ''
      };
    }
    
    const canonical = {
      id: sectionDef.id,
      name: sectionDef.name
    };
    
    
    switch (schemaDef.type) {
      case 'rich-text':
        
        const richtextField = sectionDef.fields?.find(f => f.type === 'richtext');
        const richtextFieldId = richtextField?.id || 'content';
        
        
        
        canonical.content = fieldValues[richtextFieldId] || '';
        
        
        if (fieldValues.media && Array.isArray(fieldValues.media) && fieldValues.media.length > 0) {
          canonical.media = fieldValues.media;
        }
        break;
        
      case 'materials_with_media':
        
        canonical.content = {
          items: fieldValues.items || []
        };
        break;
        
      case 'steps':
      case 'procedure-steps':
        
        console.log(`[fromWizardState] Processing procedure-steps for ${sectionDef.id}, steps:`, fieldValues.steps);
        canonical.content = {
          steps: fieldValues.steps || []
        };
        
        
        if (fieldValues.media && Array.isArray(fieldValues.media) && fieldValues.media.length > 0) {
          canonical.media = fieldValues.media;
        }
        break;
        
      case 'list':
        
        canonical.content = {
          items: fieldValues.items || []
        };
        break;
        
      default:
        
        canonical.content = fieldValues.content || '';
        if (fieldValues.media) {
          canonical.media = fieldValues.media;
        }
    }
    
    console.log(`[fromWizardState] Canonical output for ${sectionDef.id}:`, canonical);
    return canonical;
  }).filter(section => section !== null);
};

export const validateCanonical = (experiment) => {
  const errors = [];
  
  if (!experiment) {
    return { valid: false, errors: ['Experiment is null or undefined'] };
  }
  
  if (!experiment.content) {
    errors.push('Missing content object');
  } else {
    if (!experiment.content.config) {
      errors.push('Missing content.config');
    }
    
    if (!experiment.content.sections || !Array.isArray(experiment.content.sections)) {
      errors.push('Missing or invalid content.sections array');
    } else {
      experiment.content.sections.forEach((section, index) => {
        if (!section.id) {
          errors.push(`Section ${index} missing id`);
        }
        if (!section.name) {
          errors.push(`Section ${index} missing name`);
        }
        if (section.content === undefined) {
          errors.push(`Section ${section.id || index} missing content`);
        }
        
        
        const schemaDef = getSectionDefinition(section.id);
        if (schemaDef) {
          const expectedType = schemaDef.contentFormat?.type;
          const actualType = typeof section.content;
          
          if (expectedType === 'string' && actualType !== 'string') {
            errors.push(`Section ${section.id}: Expected string content, got ${actualType}`);
          }
          if (expectedType === 'object' && actualType !== 'object') {
            errors.push(`Section ${section.id}: Expected object content, got ${actualType}`);
          }
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  toCanonical,
  normalizeSection,
  toWizardState,
  fromWizardState,
  validateCanonical
};
