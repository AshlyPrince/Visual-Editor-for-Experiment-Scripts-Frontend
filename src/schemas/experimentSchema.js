 

export const DATABASE_EXPERIMENT_SCHEMA = {
  
  id: "number",                      
  title: "string",                   
  estimated_duration: "string",      
  course: "string",                  
  program: "string",                 
  version: "number",                 
  created_at: "timestamp",           
  updated_at: "timestamp",           
  created_by: "uuid",                
  
  
  sections: [
    {
      id: "string",                  
      name: "string",                
      icon: "string",                
      type: "string",                
      
      
      content: "string | object",    
      
      
      media: [
        {
          data: "string (base64)",   
          url: "string",             
          type: "string",            
          name: "string",            
          size: "number",            
          caption: "string",         
          displaySize: "number"      
        }
      ]
    }
  ]
};

export const CONTENT_FORMATS = {
  
  
  
  'rich-text': {
    
    content: "<p>HTML content here...</p>",
    
    
    media: [ ]
  },
  
  
  
  'list': {
    
    content: {
      items: ["item 1", "item 2", "item 3"]
    },
    
    media: [ ]
  },
  
  
  
  'materials_with_media': {
    
    content: {
      items: [
        {
          name: "string",            
          media: {                   
            data: "string (base64)",
            name: "string",
            type: "string",
            size: "number"
          }
        }
      ]
    },
    
    
    media: [ ]
  },
  
  
  
  'procedure-steps': {
    
    content: {
      steps: [
        {
          text: "string",            
          notes: "string (HTML)",    
          media: [                   
            {
              data: "string (base64)",
              name: "string",
              type: "string",
              size: "number"
            }
          ]
        }
      ]
    },
    
    
    media: [ ]
  }
};

export const CANONICAL_EXPERIMENT = {
  
  id: 0,
  title: "",
  estimated_duration: "",
  course: "",
  program: "",
  version: 1,
  created_at: "",
  updated_at: "",
  
  
  sections: [
    {
      id: "",                        
      name: "",                      
      icon: "",                      
      type: "",                      
      
      
      content: null,                 
      
      
      media: []
    }
  ]
};

/**
 * Get section definitions with translated names and descriptions.
 * @param {Function} t - The i18next translation function
 * @returns {Object} Section definitions with translated strings
 */
export function getSectionDefinitions(t) {
  return {
    
  'objectives': {
    id: 'objectives',
    name: t('sections.objectives.name'),
    icon: '🎯',
    type: 'rich-text',
    description: t('sections.objectives.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Students will learn to...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',  
    required: false
  },
  
  
  'background': {
    id: 'background',
    name: t('sections.background.name'),
    icon: '📚',
    type: 'rich-text',
    description: t('sections.background.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>The theory behind this experiment...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',
    required: false
  },
  
  
  'materials': {
    id: 'materials',
    name: t('sections.materials.name'),
    icon: '🧪',
    type: 'materials_with_media',
    description: t('sections.materials.description'),
    contentFormat: {
      type: 'object',
      structure: {
        items: [
          {
            name: 'string (required)',
            media: 'MediaItem | null (optional)'
          }
        ]
      },
      example: {
        items: [
          { name: 'Beaker (250ml)', media: { data: '...', type: 'image/png', name: 'beaker.png' } },
          { name: 'Safety goggles', media: null }
        ]
      }
    },
    mediaAllowed: true,
    mediaLocation: 'content.items[].media (inline)',  
    required: false
  },
  
  
  'chemicals': {
    id: 'chemicals',
    name: t('sections.chemicals.name'),
    icon: '⚗️',
    type: 'materials_with_media',
    description: t('sections.chemicals.description'),
    contentFormat: {
      type: 'object',
      structure: {
        items: [
          {
            name: 'string (required)',
            media: 'MediaItem | null (optional)'
          }
        ]
      },
      example: {
        items: [
          { name: 'Sodium chloride (NaCl)', media: null },
          { name: 'Hydrochloric acid (HCl)', media: null }
        ]
      }
    },
    mediaAllowed: true,
    mediaLocation: 'content.items[].media (inline)',
    required: false
  },
  
  
  'safety': {
    id: 'safety',
    name: t('sections.safety.name'),
    icon: '🦺',
    type: 'rich-text',
    description: t('sections.safety.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Wear safety goggles and gloves...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',  
    required: false
  },
  
  
  'hazards': {
    id: 'hazards',
    name: t('sections.hazards.name'),
    icon: '⚠️',
    type: 'rich-text',
    description: t('sections.hazards.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Corrosive chemicals present...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',  
    required: false
  },
  
  
  'procedure': {
    id: 'procedure',
    name: t('sections.procedure.name'),
    icon: '📋',
    type: 'procedure-steps',
    description: t('sections.procedure.description'),
    contentFormat: {
      type: 'object',
      structure: {
        steps: [
          {
            text: 'string (required)',
            notes: 'string HTML (optional)',
            media: 'MediaItem[] (optional)'
          }
        ]
      },
      example: {
        steps: [
          {
            text: 'Prepare the solution',
            notes: '<table><tr><td>Temperature</td><td>25°C</td></tr></table>',
            media: []
          },
          {
            text: 'Add reagent',
            notes: '',
            media: [{ data: '...', type: 'image/png', name: 'step2.png' }]
          }
        ]
      }
    },
    mediaAllowed: true,
    mediaLocation: 'content.steps[].media (per-step)',  
    required: true  
  },
  
  
  'observations': {
    id: 'observations',
    name: t('sections.observations.name'),
    icon: '🔬',
    type: 'rich-text',
    description: t('sections.observations.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Record the following observations...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',  
    required: false
  },
  
  
  'analysis': {
    id: 'analysis',
    name: t('sections.analysis.name'),
    icon: '📊',
    type: 'rich-text',
    description: t('sections.analysis.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Calculate the concentration using...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',
    required: false
  },
  
  
  'conclusions': {
    id: 'conclusions',
    name: t('sections.conclusions.name'),
    icon: '🎓',
    type: 'rich-text',
    description: t('sections.conclusions.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Students should conclude that...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',
    required: false
  },
  
  
  'references': {
    id: 'references',
    name: t('sections.references.name'),
    icon: '📖',
    type: 'list',
    description: t('sections.references.description'),
    contentFormat: {
      type: 'object',
      structure: {
        items: ['string', 'string', '...']
      },
      example: {
        items: [
          'Smith, J. (2024). Laboratory Methods. Science Press.',
          'Johnson, A. (2023). Chemical Analysis. Tech Publishers.'
        ]
      }
    },
    mediaAllowed: false,
    mediaLocation: null,
    required: false
  },
  
  
  'disposal': {
    id: 'disposal',
    name: t('sections.disposal.name'),
    icon: '♻️',
    type: 'rich-text',
    description: t('sections.disposal.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Dispose of chemicals in designated container...</p>'
    },
    mediaAllowed: false,
    mediaLocation: null,
    required: false
  },
  
  
  'risk_assessment': {
    id: 'risk_assessment',
    name: t('sections.risk_assessment.name'),
    icon: '📋',
    type: 'rich-text',
    description: t('sections.risk_assessment.description'),
    contentFormat: {
      type: 'string',
      format: 'HTML',
      example: '<p>Risk level: Medium. Mitigation: ...</p>'
    },
    mediaAllowed: true,
    mediaLocation: 'section.media',
    required: false
  },
  
  
  'questions': {
    id: 'questions',
    name: t('sections.questions.name'),
    icon: '❓',
    type: 'list',
    description: t('sections.questions.description'),
    contentFormat: {
      type: 'object',
      structure: {
        items: ['string', 'string', '...']
      },
      example: {
        items: [
          'What would happen if you doubled the concentration?',
          'Why is temperature control important?'
        ]
      }
    },
    mediaAllowed: false,
    mediaLocation: null,
    required: false
  }
  };
}

/**
 * Get section definition with optional translation support.
 * @param {string} sectionId - The section ID
 * @param {Function} t - Optional i18next translation function. If not provided, returns English defaults.
 * @returns {Object|null} Section definition or null if not found
 */
export function getSectionDefinition(sectionId, t) {
  
  const baseId = sectionId.replace(/_\d+$/, '');
  
  // If no translation function provided, use English defaults for backward compatibility
  if (!t) {
    t = (key) => {
      const fallbacks = {
        'sections.objectives.name': 'Learning Objectives',
        'sections.objectives.description': 'What students will learn from this experiment',
        'sections.background.name': 'Background Theory',
        'sections.background.description': 'Theoretical background and scientific context',
        'sections.materials.name': 'Materials & Equipment',
        'sections.materials.description': 'List of materials needed with optional photos',
        'sections.chemicals.name': 'Chemicals',
        'sections.chemicals.description': 'Chemical substances used in the experiment',
        'sections.safety.name': 'Safety Measures',
        'sections.safety.description': 'Safety precautions and protective equipment',
        'sections.hazards.name': 'Potential Hazards',
        'sections.hazards.description': 'Potential dangers and warning information',
        'sections.procedure.name': 'Step-by-Step Procedure',
        'sections.procedure.description': 'Detailed experimental procedure with steps',
        'sections.observations.name': 'Observations & Data',
        'sections.observations.description': 'What to observe and how to record data',
        'sections.analysis.name': 'Analysis & Calculations',
        'sections.analysis.description': 'How to analyze results and perform calculations',
        'sections.conclusions.name': 'Conclusions',
        'sections.conclusions.description': 'Expected conclusions and learning outcomes',
        'sections.references.name': 'References',
        'sections.references.description': 'Citations and references',
        'sections.disposal.name': 'Disposal Instructions',
        'sections.disposal.description': 'How to properly dispose of chemicals and materials',
        'sections.risk_assessment.name': 'Risk Assessment',
        'sections.risk_assessment.description': 'Formal risk assessment documentation',
        'sections.questions.name': 'Questions & Discussion',
        'sections.questions.description': 'Questions for students to consider'
      };
      return fallbacks[key] || key;
    };
  }
  
  const definitions = getSectionDefinitions(t);
  return definitions[baseId] || null;
}

export function validateSectionAgainstDefinition(section, t = null) {
  const definition = getSectionDefinition(section.id, t);
  const errors = [];
  
  if (!definition) {
    errors.push(`Unknown section ID: ${section.id}`);
    return errors;
  }
  
  
  if (section.type !== definition.type) {
    errors.push(`Section "${section.name}" type mismatch: expected "${definition.type}", got "${section.type}"`);
  }
  
  
  if (definition.contentFormat.type === 'string' && typeof section.content !== 'string') {
    errors.push(`Section "${section.name}" content must be string (HTML)`);
  }
  
  if (definition.contentFormat.type === 'object') {
    if (typeof section.content !== 'object') {
      errors.push(`Section "${section.name}" content must be object`);
    } else {
      const requiredKeys = Object.keys(definition.contentFormat.structure);
      requiredKeys.forEach(key => {
        if (!(key in section.content)) {
          errors.push(`Section "${section.name}" content missing required key: ${key}`);
        }
      });
    }
  }
  
  
  if (!definition.mediaAllowed && section.media && section.media.length > 0) {
    errors.push(`Section "${section.name}" does not allow media`);
  }
  
  return errors;
}

/**
 * Get available section templates with optional translation support.
 * @param {Function} t - Optional i18next translation function. If not provided, returns English defaults.
 * @returns {Array} Array of section template objects
 */
export function getAvailableSectionTemplates(t = null) {
  const definitions = getSectionDefinitions(t || ((key) => key));
  return Object.values(definitions).map(def => ({
    id: def.id,
    name: def.name,
    icon: def.icon,
    type: def.type,
    description: def.description,
    required: def.required
  }));
}

export const VALID_SECTION_TYPES = [
  'rich-text',
  'list',
  'materials_with_media',
  'procedure-steps'
];

export const MEDIA_ITEM_SCHEMA = {
  
  data: "string (base64) | undefined",
  url: "string | undefined",
  
  
  type: "string (MIME type)",
  name: "string",
  
  
  size: "number | undefined",
  caption: "string | undefined",
  displaySize: "number (1-100) | undefined"
};

export const PROCEDURE_STEP_SCHEMA = {
  text: "string",                    
  notes: "string (HTML) | undefined", 
  media: "MediaItem[] | undefined"    
};

export const MATERIAL_ITEM_SCHEMA = {
  name: "string",                     
  media: "MediaItem | null"           
};

export const CONVERSION_RULES = {
  
  
  loading: {
    description: "When loading from database, normalize all content to canonical format",
    rules: [
      "Always move media to top-level section.media array",
      "Wrap procedure steps in content.steps if direct array",
      "Wrap materials in content.items if direct array",
      "Convert string content to HTML if needed",
      "Ensure all required fields exist with defaults"
    ]
  },
  
  
  saving: {
    description: "When saving to database, denormalize to consistent storage format",
    rules: [
      "Keep media at top-level section.media array",
      "Wrap procedure steps in content.steps object",
      "Wrap materials in content.items object",
      "Keep rich-text as HTML string",
      "Remove any temporary UI state"
    ]
  }
};

export const EXAMPLE_EXPERIMENT = {
  id: 52,
  title: "Agarose-Gelelektrophorese",
  estimated_duration: "90 minutes",
  course: "Molecular Biology",
  program: "Bachelor of Science",
  version: 2,
  created_at: "2026-01-24T10:00:00Z",
  updated_at: "2026-01-24T14:30:00Z",
  
  sections: [
    
    {
      id: "objectives",
      name: "Learning Objectives",
      icon: "🎯",
      type: "rich-text",
      content: "<p>Students will learn about gel electrophoresis...</p>",
      media: [
        {
          data: "data:image/png;base64,iVBORw0KGgoAAAANS...",
          type: "image/png",
          name: "gel_setup.png",
          size: 45678,
          caption: "Gel electrophoresis setup"
        }
      ]
    },
    
    
    {
      id: "procedure",
      name: "Step-by-Step Procedure",
      icon: "📋",
      type: "procedure-steps",
      content: {
        steps: [
          {
            text: "Prepare the agarose gel solution",
            notes: "<table><tr><td>Concentration</td><td>1%</td></tr></table>",
            media: []
          },
          {
            text: "Load samples into wells",
            notes: "",
            media: [
              {
                data: "data:image/png;base64,iVBORw0KGgoAAAANS...",
                type: "image/png",
                name: "loading_samples.png",
                size: 34567
              }
            ]
          }
        ]
      },
      media: []
    },
    
    
    {
      id: "materials",
      name: "Materials & Equipment",
      icon: "🧪",
      type: "materials_with_media",
      content: {
        items: [
          {
            name: "Agarose powder",
            media: {
              data: "data:image/png;base64,iVBORw0KGgoAAAANS...",
              type: "image/png",
              name: "agarose.png",
              size: 23456
            }
          },
          {
            name: "Electrophoresis chamber",
            media: null
          }
        ]
      },
      media: []
    }
  ]
};

export function validateExperiment(experiment) {
  const errors = [];
  
  if (!experiment.id) errors.push("Missing experiment.id");
  if (!experiment.title) errors.push("Missing experiment.title");
  if (!Array.isArray(experiment.sections)) errors.push("experiment.sections must be array");
  
  return errors;
}

export function validateSection(section) {
  const errors = [];
  
  if (!section.id) errors.push("Missing section.id");
  if (!section.name) errors.push("Missing section.name");
  if (!section.type) errors.push("Missing section.type");
  if (!VALID_SECTION_TYPES.includes(section.type)) {
    errors.push(`Invalid section.type: ${section.type}`);
  }
  
  
  if (section.type === 'procedure-steps') {
    if (!section.content?.steps || !Array.isArray(section.content.steps)) {
      errors.push("procedure-steps must have content.steps array");
    }
  }
  
  if (section.type === 'materials_with_media') {
    if (!section.content?.items || !Array.isArray(section.content.items)) {
      errors.push("materials_with_media must have content.items array");
    }
  }
  
  
  if (section.media && !Array.isArray(section.media)) {
    errors.push("section.media must be array");
  }
  
  return errors;
}

export function validateMediaItem(media) {
  const errors = [];
  
  if (!media.data && !media.url) {
    errors.push("MediaItem must have either data or url");
  }
  if (!media.type) errors.push("Missing media.type");
  if (!media.name) errors.push("Missing media.name");
  
  return errors;
}

export function getExpectedContentFormat(sectionType) {
  return CONTENT_FORMATS[sectionType];
}

export function isValidSectionType(type) {
  return VALID_SECTION_TYPES.includes(type);
}

export function getRequiredFields(sectionType) {
  const base = ['id', 'name', 'icon', 'type', 'content', 'media'];
  
  switch (sectionType) {
    case 'procedure-steps':
      return [...base, 'content.steps'];
    case 'materials_with_media':
      return [...base, 'content.items'];
    default:
      return base;
  }
}

export default {
  DATABASE_EXPERIMENT_SCHEMA,
  CONTENT_FORMATS,
  CANONICAL_EXPERIMENT,
  VALID_SECTION_TYPES,
  MEDIA_ITEM_SCHEMA,
  PROCEDURE_STEP_SCHEMA,
  MATERIAL_ITEM_SCHEMA,
  CONVERSION_RULES,
  EXAMPLE_EXPERIMENT,
  validateExperiment,
  validateSection,
  validateMediaItem,
  getExpectedContentFormat,
  isValidSectionType,
  getRequiredFields
};
