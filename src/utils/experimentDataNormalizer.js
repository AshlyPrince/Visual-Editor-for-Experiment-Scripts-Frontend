 

import { validateSection, VALID_SECTION_TYPES } from '../schemas/experimentSchema.js';

export function normalizeSectionContent(section, t = null) {
  if (!section) return null;

  const normalized = {
    id: section.id || '',
    name: section.name || (t ? t('experiment.unnamedSection') : 'Unnamed Section'),
    icon: section.icon || '📝',
    type: section.type || 'rich-text',
    content: null,
    media: []
  };

  if (section.media && Array.isArray(section.media) && section.media.length > 0) {
    normalized.media = section.media.filter(item => item && (item.data || item.url));
  } else if (section.content?.media && Array.isArray(section.content.media) && section.content.media.length > 0) {
    normalized.media = section.content.media.filter(item => item && (item.data || item.url));
  }

  let content = section.content;

  if (!content) {
    normalized.content = '';
    return normalized;
  }

  if (typeof content === 'string') {
    normalized.content = content;
    return normalized;
  }

  if (Array.isArray(content) && content.length === 1 && typeof content[0] === 'object') {
    content = content[0];
  }

  if (Array.isArray(content)) {
    const isProcedureSteps = content.length > 0 && 
      typeof content[0] === 'object' && 
      content[0] !== null &&
      ('text' in content[0] || 'notes' in content[0] || 'media' in content[0]);

    if (isProcedureSteps) {
      normalized.type = 'procedure-steps';
      normalized.content = { steps: content };
      return normalized;
    }

    const isMaterialsWithMedia = content.length > 0 &&
      typeof content[0] === 'object' &&
      content[0] !== null &&
      'name' in content[0];

    if (isMaterialsWithMedia) {
      normalized.type = 'materials_with_media';
      normalized.content = { items: content };
      return normalized;
    }

    normalized.type = 'list';
    normalized.content = { items: content };
    return normalized;
  }

  if (typeof content === 'object' && content !== null) {
    if (content.steps && Array.isArray(content.steps)) {
      normalized.type = 'procedure-steps';
      normalized.content = content;
      return normalized;
    }

    if (content.items && Array.isArray(content.items)) {
      const firstItem = content.items[0];
      if (firstItem && typeof firstItem === 'object' && 'name' in firstItem) {
        normalized.type = 'materials_with_media';
      } else {
        normalized.type = 'list';
      }
      normalized.content = content;
      return normalized;
    }

    if (content.text || content.theory || content.introduction || content.content) {
      normalized.type = 'rich-text';
      normalized.content = content.text || content.theory || content.introduction || content.content || '';
      return normalized;
    }

    const arrayFields = Object.entries(content).filter(([key, value]) => 
      Array.isArray(value) && value.length > 0 && key !== 'media'
    );

    if (arrayFields.length > 0) {
      
      const allItems = arrayFields.flatMap(([key, value]) => value);

      if (allItems[0] && typeof allItems[0] === 'object' && 'name' in allItems[0]) {
        normalized.type = 'materials_with_media';
        normalized.content = { items: allItems };
      } else {
        normalized.type = 'list';
        normalized.content = { items: allItems };
      }
      return normalized;
    }

    normalized.content = content;
    return normalized;
  }

  normalized.content = '';

  const errors = validateSection(normalized);
  if (errors.length > 0) {
  }
  
  return normalized;
}

export function normalizeExperiment(experiment, t = null) {
  if (!experiment) return null;

  const actualContent = experiment.content?.content || experiment.content || {};
  const config = actualContent.config || {};

  const normalized = {
    id: experiment.id,
    title: experiment.title || (t ? t('experiment.untitledExperiment') : 'Untitled Experiment'),
    
    estimated_duration: (config.duration && config.duration.trim()) || experiment.estimated_duration || '',
    course: (config.subject && config.subject.trim()) || experiment.course || '',
    program: (config.gradeLevel && config.gradeLevel.trim()) || experiment.program || '',
    version: experiment.version || 1,
    created_at: experiment.created_at,
    updated_at: experiment.updated_at,
    current_version_id: experiment.current_version_id,
    current_version_number: experiment.current_version_number,
    
    content: {
      config: config
    },
    sections: []
  };

  let sectionsData = null;
  if (experiment.sections && Array.isArray(experiment.sections)) {
    sectionsData = experiment.sections;
  } else if (actualContent.sections && Array.isArray(actualContent.sections)) {
    sectionsData = actualContent.sections;
  } else if (experiment.content?.sections && Array.isArray(experiment.content.sections)) {
    sectionsData = experiment.content.sections;
  }

  if (sectionsData && sectionsData.length > 0) {
    normalized.sections = sectionsData
      .filter(section => {
        
        const sectionId = section.id || '';
        const sectionName = section.name?.toLowerCase() || '';
        return sectionId !== 'title_header' && 
               !sectionName.includes('title') && 
               !sectionName.includes('header info');
      })
      .map(section => normalizeSectionContent(section, t));
  }

  return normalized;
}

export function denormalizeSection(section) {
  
  const denormalized = {
    id: section.id,
    name: section.name,
    content: section.content
  };

  if (section.description) {
    denormalized.description = section.description;
  }
  
  if (section.emoji) {
    denormalized.emoji = section.emoji;
  }
  
  if (section.fields) {
    denormalized.fields = section.fields;
  }
  
  if (section.isCustom) {
    denormalized.isCustom = section.isCustom;
  }

  if (section.media && Array.isArray(section.media) && section.media.length > 0) {
    denormalized.media = section.media;
  }

  return denormalized;
};

export function denormalizeExperiment(experiment, sections) {
  return {
    id: experiment.id,
    title: experiment.title,
    estimated_duration: experiment.estimated_duration,
    course: experiment.course,
    program: experiment.program,
    content: {
      
      ...(experiment.content || {}),
      config: {
        
        ...(experiment.content?.config || {}),
        
        duration: experiment.estimated_duration || experiment.content?.config?.duration || '',
        subject: experiment.course || experiment.content?.config?.subject || '',
        gradeLevel: experiment.program || experiment.content?.config?.gradeLevel || ''
      },
      
      sections: sections.map(section => denormalizeSection(section)),
      
      permissions: experiment.content?.permissions || experiment.permissions
    },
    
    sections: sections.map(section => denormalizeSection(section))
  };
}

export function getContentSummary(section) {
  if (typeof section.content === 'string') {
    return `String (${section.content.length} chars)`;
  }

  if (!section.content) {
    return 'Empty';
  }

  if (section.content.steps) {
    return `Procedure: ${section.content.steps.length} steps`;
  }

  if (section.content.items) {
    return `List: ${section.content.items.length} items`;
  }

  const keys = Object.keys(section.content);
  return `Object: {${keys.join(', ')}}`;
}

export default {
  normalizeSectionContent,
  normalizeExperiment,
  denormalizeSection,
  denormalizeExperiment,
  validateSection,
  getContentSummary
};
