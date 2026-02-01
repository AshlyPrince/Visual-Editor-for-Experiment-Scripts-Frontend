import api from '../lib/api';

export const sendChatMessage = async (message, options = {}, t = null) => {
  const {
    model,  
    temperature = 0.7,
    max_tokens = 512
  } = options;

  const requestBody = {
    messages: [
      { role: 'user', content: message }
    ],
    temperature,
    max_tokens
  };

  
  if (model) {
    requestBody.model = model;
  }

  try {
    const response = await api.post('/api/llm/chat', requestBody);
    
    return response.data;
  } catch (error) {
    const errorMsg = (key, fallback) => t ? t(key) : fallback;
    
    // Extract backend error message if available
    const backendError = error.response?.data?.error || error.response?.data?.details;
    
    if (error.response?.status === 503) {
      const defaultMsg = errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.');
      throw new Error(backendError || defaultMsg);
    } else if (error.response?.status === 500) {
      const defaultMsg = errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.');
      throw new Error(backendError || defaultMsg);
    } else if (error.response?.status === 404) {
      throw new Error(errorMsg('llm.errors.serviceNotAvailable', 'AI service is not available. Please contact support.'));
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(errorMsg('llm.errors.sessionExpired', 'Your session has expired. Please log in again.'));
    } else if (error.response?.status === 429) {
      throw new Error(errorMsg('llm.errors.tooManyRequests', 'Too many requests. Please wait a moment before trying again.'));
    } else if (!error.response) {
      console.log('No response from server:', error);
      throw new Error(errorMsg('llm.errors.connectionFailed', 'Unable to connect to AI service. Please check your internet connection.'));
    }
    
    throw new Error(backendError || errorMsg('llm.errors.generalError', 'AI assistance is temporarily unavailable. Please try again.'));
  }
};

export const sendChatConversation = async (messages, options = {}, t = null) => {
  const {
    model,  
    temperature = 0.7,
    max_tokens = 512
  } = options;

  const requestBody = {
    messages,
    temperature,
    max_tokens
  };

  
  if (model) {
    requestBody.model = model;
  }

  try {
    const response = await api.post('/api/llm/chat', requestBody);
    
    return response.data;
  } catch (error) {
    const errorMsg = (key, fallback) => t ? t(key) : fallback;
    
    // Extract backend error message if available
    const backendError = error.response?.data?.error || error.response?.data?.details;
    
    if (error.response?.status === 503) {
      const defaultMsg = errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.');
      throw new Error(backendError || defaultMsg);
    } else if (error.response?.status === 500) {
      const defaultMsg = errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.');
      throw new Error(backendError || defaultMsg);
    } else if (error.response?.status === 404) {
      throw new Error(errorMsg('llm.errors.serviceNotAvailable', 'AI service is not available. Please contact support.'));
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(errorMsg('llm.errors.sessionExpired', 'Your session has expired. Please log in again.'));
    } else if (error.response?.status === 429) {
      throw new Error(errorMsg('llm.errors.tooManyRequests', 'Too many requests. Please wait a moment before trying again.'));
    } else if (!error.response) {
      throw new Error(errorMsg('llm.errors.connectionFailed', 'Unable to connect to AI service. Please check your internet connection.'));
    }
    
    throw new Error(backendError || errorMsg('llm.errors.generalError', 'AI assistance is temporarily unavailable. Please try again.'));
  }
};

export const polishText = async (text, context = '', t = null) => {
  
  const trimmedText = text?.trim() || '';
  
  const errorMsg = (key, fallback) => t ? t(key) : fallback;
  
  const MIN_LENGTH = 10;
  const MIN_WORDS = 2;
  const wordCount = trimmedText.split(/\s+/).filter(w => w.length > 0).length;
  
  
  const isInvalid = (
    !trimmedText || 
    trimmedText.length < MIN_LENGTH || 
    wordCount < MIN_WORDS ||
    /^[^a-zA-Z]*$/.test(trimmedText) || 
    /^(.)\1+$/.test(trimmedText) 
  );
  
  if (isInvalid) {
    
    if (!trimmedText) {
      return errorMsg('llm.feedback.noContent', 'No content provided to improve');
    } else if (trimmedText.length < MIN_LENGTH || wordCount < MIN_WORDS) {
      return errorMsg('llm.feedback.contentTooShort', 'Content too short - please add more detail before polishing');
    } else {
      return errorMsg('llm.feedback.invalidInput', 'Invalid input - please provide meaningful text');
    }
  }
  
  
  let prompt;
  
  if (context.includes('title')) {
    const p = t ? {
      role: t('llm.prompts.polishTitle.role'),
      userTitle: t('llm.prompts.polishTitle.userTitle'),
      task: t('llm.prompts.polishTitle.task'),
      guidelines: t('llm.prompts.polishTitle.guidelines'),
      instruction: t('llm.prompts.polishTitle.instruction')
    } : {
      role: 'You are a scientific writing assistant. Your role is to IMPROVE the teacher\'s existing text, not write new content.',
      userTitle: 'Teacher\'s experiment title:',
      task: 'Task: Polish this title for clarity and professionalism while keeping the same meaning and topic.',
      guidelines: '- Keep it concise (under 15 words)\n- Maintain the original subject and focus\n- Fix grammar, clarity, or phrasing issues\n- Do NOT invent new topics or change the fundamental content',
      instruction: 'Return ONLY the improved title with no explanations, no meta-commentary, and no additional text.'
    };
    
    prompt = `${p.role}

${p.userTitle}
"${trimmedText}"

${p.task}
${p.guidelines}

${p.instruction}`;
  } else if (context.includes('description')) {
    const p = t ? {
      role: t('llm.prompts.polishDescription.role'),
      userDescription: t('llm.prompts.polishDescription.userDescription'),
      task: t('llm.prompts.polishDescription.task'),
      guidelines: t('llm.prompts.polishDescription.guidelines'),
      instruction: t('llm.prompts.polishDescription.instruction')
    } : {
      role: 'You are a scientific writing assistant. Your role is to IMPROVE the teacher\'s existing text, not write new content.',
      userDescription: 'Teacher\'s description:',
      task: 'Task: Polish this description for clarity, grammar, and professionalism.',
      guidelines: '- Keep all key details and meaning\n- Maintain the teacher\'s voice and intent\n- Fix grammar, structure, and phrasing\n- Do NOT add new information or change the content significantly',
      instruction: 'Return ONLY the improved description with no explanations, no "Upon reviewing...", and no meta-commentary.'
    };
    
    prompt = `${p.role}

${p.userDescription}
${trimmedText}

${p.task}
${p.guidelines}

${p.instruction}`;
  } else {
    const p = t ? {
      role: t('llm.prompts.polishGeneric.role'),
      userContent: t('llm.prompts.polishGeneric.userContent', { context }),
      task: t('llm.prompts.polishGeneric.task'),
      guidelines: t('llm.prompts.polishGeneric.guidelines'),
      instruction: t('llm.prompts.polishGeneric.instruction')
    } : {
      role: 'You are a scientific writing assistant. Your role is to IMPROVE the teacher\'s existing text, not write new content.',
      userContent: `Teacher's ${context}:`,
      task: 'Task: Polish this text for clarity, grammar, and professionalism.',
      guidelines: '- Preserve the original meaning and content\n- Maintain the teacher\'s voice\n- Fix grammar, structure, and phrasing issues\n- Do NOT add new information or change the fundamental content',
      instruction: 'Return ONLY the improved text with no explanations or meta-commentary.'
    };
    
    prompt = `${p.role}

${p.userContent}
${trimmedText}

${p.task}
${p.guidelines}

${p.instruction}`;
  }

  try {
    const response = await sendChatMessage(prompt, {
      temperature: 0.5, 
      max_tokens: 1024
    });

    let improved = response.choices[0].message.content.trim();
    
    
    if ((improved.startsWith('"') && improved.endsWith('"')) || 
        (improved.startsWith("'") && improved.endsWith("'"))) {
      improved = improved.slice(1, -1).trim();
    }
    
    
    const isExplanation = (
      improved.toLowerCase().includes('upon reviewing') ||
      improved.toLowerCase().includes('it appears that') ||
      improved.toLowerCase().includes('could be as follows') ||
      improved.toLowerCase().includes('here is a revised') ||
      improved.toLowerCase().includes('here is an improved') ||
      improved.toLowerCase().includes('here is the improved') ||
      improved.toLowerCase().includes('here\'s a') ||
      improved.toLowerCase().includes('i\'ve improved') ||
      improved.toLowerCase().includes('i have improved') ||
      improved.toLowerCase().includes('the improved version') ||
      
      (improved.toLowerCase().startsWith('to improve') || improved.toLowerCase().startsWith('to enhance')) ||
      
      (improved.toLowerCase().includes('example:') || improved.toLowerCase().includes('sample:'))
    );
    
    if (isExplanation) {
      return errorMsg('llm.feedback.needsMoreDetail', 'Needs more detail before polishing');
    }
    
    return improved;
  } catch (error) {
    const errorMessage = errorMsg('llm.feedback.polishFailed', `Failed to polish text: ${error.message}`);
    throw new Error(errorMessage);
  }
};

export const getSectionSuggestions = async (sectionType, currentContent, experimentContext = {}, t = null) => {
  const p = t ? {
    intro: t('llm.prompts.sectionSuggestions.intro'),
    sectionType: t('llm.prompts.sectionSuggestions.sectionType', { sectionType }),
    currentContent: t('llm.prompts.sectionSuggestions.currentContent', { content: currentContent || t('llm.prompts.empty') }),
    task: t('llm.prompts.sectionSuggestions.task'),
    format: t('llm.prompts.sectionSuggestions.format')
  } : {
    intro: 'You are assisting with a scientific experiment.',
    sectionType: `Section Type: ${sectionType}`,
    currentContent: `Current Content: ${currentContent || '(empty)'}`,
    task: 'Please provide:\n1. Improved version of the content\n2. Three specific suggestions for enhancing this section\n3. Any potential issues or missing elements',
    format: 'Respond in JSON format:\n{\n  "improved": "improved content here",\n  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],\n  "issues": ["issue 1", "issue 2"]\n}'
  };
  
  const prompt = `${p.intro}
${p.sectionType}
${p.currentContent}

${p.task}

${p.format}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.7,
    max_tokens: 1024
  }, t);

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    
    return {
      improved: response.choices[0].message.content,
      suggestions: [],
      issues: []
    };
  }
};

export const checkConsistency = async (sections, t = null) => {
  const p = t ? {
    intro: t('llm.prompts.checkConsistency.intro'),
    checkTitle: t('llm.prompts.checkConsistency.checkTitle'),
    checkMaterials: t('llm.prompts.checkConsistency.checkMaterials'),
    checkSafety: t('llm.prompts.checkConsistency.checkSafety'),
    checkHypothesis: t('llm.prompts.checkConsistency.checkHypothesis'),
    checkCompleteness: t('llm.prompts.checkConsistency.checkCompleteness'),
    checkCompliance: t('llm.prompts.checkConsistency.checkCompliance'),
    format: t('llm.prompts.checkConsistency.format'),
    instruction: t('llm.prompts.checkConsistency.instruction'),
    empty: t('llm.prompts.empty')
  } : {
    intro: 'You are reviewing a scientific experiment for consistency and completeness. Please analyze these sections carefully:',
    checkTitle: '1. **Title-Description Consistency**: Does the title accurately reflect the description?',
    checkMaterials: '2. **Materials-Procedures Alignment**: Are all materials mentioned in procedures actually listed in the materials section?',
    checkSafety: '3. **Safety-Materials Correlation**: Are safety precautions appropriate for the chemicals and materials being used?',
    checkHypothesis: '4. **Hypothesis-Methodology Alignment**: Does the methodology properly test the hypothesis?',
    checkCompleteness: '5. **Completeness**: Are any critical sections missing or incomplete?',
    checkCompliance: '6. **Safety Compliance**: Are hazardous materials properly addressed with safety equipment and procedures?',
    format: 'Respond in JSON format:\n{\n  "consistent": true/false,\n  "issues": ["specific issue 1", "specific issue 2", ...],\n  "recommendations": ["specific recommendation 1", "specific recommendation 2", ...]\n}',
    instruction: 'Be specific and actionable in your issues and recommendations.',
    empty: '(empty)'
  };
  
  const prompt = `${p.intro}

${Object.entries(sections).map(([key, value]) => `${key.toUpperCase()}:\n${value || p.empty}\n`).join('\n')}

Please check for:
${p.checkTitle}
${p.checkMaterials}
${p.checkSafety}
${p.checkHypothesis}
${p.checkCompleteness}
${p.checkCompliance}

${p.format}

${p.instruction}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.3,
    max_tokens: 1500
  }, t);

  try {
    
    const content = response.choices[0].message.content.trim();
    
    
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : content;
    
    
    const parsed = JSON.parse(jsonText);
    
    
    return {
      consistent: parsed.consistent !== false, 
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch (error) {
    
    const content = response.choices[0].message.content.trim();
    return {
      consistent: !content.toLowerCase().includes('issue') && !content.toLowerCase().includes('problem'),
      issues: [],
      recommendations: [content]
    };
  }
};

export const generateTitleSuggestions = async (description, t = null) => {
  const p = t ? {
    intro: t('llm.prompts.generateTitles.intro'),
    format: t('llm.prompts.generateTitles.format')
  } : {
    intro: 'Based on this experiment description, suggest 5 concise and descriptive titles (max 10 words each):',
    format: 'Respond with only a JSON array of strings: ["title 1", "title 2", "title 3", "title 4", "title 5"]'
  };
  
  const prompt = `${p.intro}

${description}

${p.format}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.8,
    max_tokens: 256
  }, t);

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    
    const content = response.choices[0].message.content;
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(0, 5);
  }
};

export const generateSafetyRecommendations = async (materials, procedures, t = null) => {
  const p = t ? {
    intro: t('llm.prompts.safetyRecommendations.intro'),
    materials: t('llm.prompts.safetyRecommendations.materials'),
    procedures: t('llm.prompts.safetyRecommendations.procedures'),
    task: t('llm.prompts.safetyRecommendations.task'),
    format: t('llm.prompts.safetyRecommendations.format')
  } : {
    intro: 'Based on these materials and procedures, provide safety recommendations:',
    materials: 'MATERIALS:',
    procedures: 'PROCEDURES:',
    task: 'Provide 3-5 specific safety recommendations. Respond in JSON format:',
    format: '{\n  "recommendations": ["recommendation 1", "recommendation 2", ...],\n  "hazards": ["hazard 1", "hazard 2", ...],\n  "ppe": ["PPE item 1", "PPE item 2", ...]\n}'
  };
  
  const prompt = `${p.intro}

${p.materials}
${materials}

${p.procedures}
${procedures}

${p.task}
${p.format}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.3,
    max_tokens: 1024
  }, t);

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return {
      recommendations: [response.choices[0].message.content],
      hazards: [],
      ppe: []
    };
  }
};

export const simplifyLanguage = async (experimentData, targetLevel = 'intermediate', t = null) => {
  const errorMsg = (key, fallback) => t ? t(key) : fallback;
  
  console.log('[SIMPLIFY] Starting simplification with level:', targetLevel);
  console.log('[SIMPLIFY] Experiment data:', experimentData);
  
  // Parse the experiment content
  const content = typeof experimentData.content === 'string' 
    ? JSON.parse(experimentData.content) 
    : experimentData.content;
  
  const actualContent = content?.content || content;
  const sections = actualContent?.sections || [];

  console.log('[SIMPLIFY] Found sections:', sections.length);

  // Process each section independently - simpler and more reliable
  const simplifiedSections = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`[SIMPLIFY] Processing section ${i}:`, section.id, section.type);
    
    const simplifiedSection = { ...section };
    
    try {
      // Only simplify text content, leave everything else untouched
      if (section.type === 'text' && section.content) {
        console.log(`[SIMPLIFY] Simplifying text content, length: ${section.content.length}`);
        simplifiedSection.content = await simplifyText(section.content, targetLevel, t);
        console.log(`[SIMPLIFY] Simplified text length: ${simplifiedSection.content.length}`);
      } else if (section.type === 'list' && section.items && Array.isArray(section.items)) {
        console.log(`[SIMPLIFY] Simplifying list with ${section.items.length} items`);
        simplifiedSection.items = await Promise.all(
          section.items.map(async (item, idx) => {
            if (typeof item === 'string') {
              console.log(`[SIMPLIFY] Simplifying list item ${idx}`);
              return await simplifyText(item, targetLevel, t);
            }
            return item;
          })
        );
      } else if (section.type === 'steps' && section.steps && Array.isArray(section.steps)) {
        console.log(`[SIMPLIFY] Simplifying steps with ${section.steps.length} steps`);
        simplifiedSection.steps = await Promise.all(
          section.steps.map(async (step, idx) => {
            if (step.instruction) {
              console.log(`[SIMPLIFY] Simplifying step ${idx} instruction`);
              return {
                ...step,
                instruction: await simplifyText(step.instruction, targetLevel, t)
              };
            }
            return step;
          })
        );
      }
    } catch (error) {
      console.error(`[SIMPLIFY] Failed to simplify section ${section.id}:`, error);
      // Keep original content if simplification fails
    }
    
    simplifiedSections.push(simplifiedSection);
  }
  
  console.log('[SIMPLIFY] Simplification complete. Sections processed:', simplifiedSections.length);
  
  return {
    ...experimentData,
    content: {
      ...actualContent,
      sections: simplifiedSections
    }
  };
};

// Helper function to simplify a single text string
const simplifyText = async (text, targetLevel, t) => {
  if (!text || text.trim().length === 0) {
    console.log('[SIMPLIFY TEXT] Empty text, returning as-is');
    return text;
  }
  
  const levelInstructions = {
    'beginner': {
      system: 'You are a science educator who explains scientific concepts to elementary school children (ages 8-11).',
      instruction: 'Rewrite the following text in VERY SIMPLE language:\n- Use only simple, everyday words a child would know\n- Keep sentences SHORT (maximum 10-12 words each)\n- Replace ALL scientific/technical terms with simple explanations\n- Break complex ideas into multiple simple sentences\n- Keep all numbers, measurements, and safety information'
    },
    'intermediate': {
      system: 'You are a science educator who explains scientific concepts to middle school students (ages 12-14).',
      instruction: 'Rewrite the following text in CLEAR, ACCESSIBLE language:\n- Use everyday words whenever possible\n- When using technical terms, add a brief simple explanation in parentheses\n- Use moderate sentence length (15-20 words max)\n- Keep all numbers, measurements, and safety information'
    },
    'advanced': {
      system: 'You are a science educator who explains scientific concepts to high school students (ages 15-18).',
      instruction: 'Rewrite the following text in STANDARD ACADEMIC language:\n- Use proper scientific terminology\n- Ensure clarity while maintaining technical accuracy\n- Use well-structured sentences\n- Keep all numbers, measurements, and safety information'
    }
  };
  
  const level = levelInstructions[targetLevel] || levelInstructions['intermediate'];
  
  console.log('[SIMPLIFY TEXT] ========================================');
  console.log('[SIMPLIFY TEXT] SENDING TO AI:');
  console.log('[SIMPLIFY TEXT] Level:', targetLevel);
  console.log('[SIMPLIFY TEXT] Original length:', text.length);
  console.log('[SIMPLIFY TEXT] Original text (first 200 chars):\n', text.substring(0, 200));
  console.log('[SIMPLIFY TEXT] ========================================');

  try {
    const response = await sendChatConversation(
      [
        { role: 'system', content: level.system },
        { role: 'user', content: `${level.instruction}

IMPORTANT: Return ONLY the rewritten text. Do NOT include phrases like "Here is the rewritten version" or any explanations.

Original text:
${text}` }
      ],
      { 
        temperature: 0.7,  // Higher temperature for more creative rephrasing
        max_tokens: 1000   // More tokens for longer texts
      },
      t
    );
    
    let simplifiedText = response.choices[0].message.content.trim();
    console.log('[SIMPLIFY TEXT] ========================================');
    console.log('[SIMPLIFY TEXT] RECEIVED FROM AI:');
    console.log('[SIMPLIFY TEXT] Simplified length:', simplifiedText.length);
    console.log('[SIMPLIFY TEXT] Simplified text (first 200 chars):\n', simplifiedText.substring(0, 200));
    console.log('[SIMPLIFY TEXT] ========================================');
    
    // Remove common meta-commentary patterns
    const metaPatterns = [
      /^here is the rewritten version:?\s*/i,
      /^here is the simplified version:?\s*/i,
      /^here's the rewritten version:?\s*/i,
      /^rewritten version:?\s*/i,
      /^simplified version:?\s*/i,
      /^here is the text rewritten:?\s*/i
    ];
    
    for (const pattern of metaPatterns) {
      simplifiedText = simplifiedText.replace(pattern, '');
    }
    
    simplifiedText = simplifiedText.trim();
    
    // Safety check: if result is too short or empty, return original
    if (!simplifiedText || simplifiedText.length < 10) {
      console.warn('[SIMPLIFY TEXT] Result too short, returning original');
      return text;
    }
    
    return simplifiedText;
  } catch (error) {
    console.error('[SIMPLIFY TEXT] Error simplifying text:', error);
    return text; // Return original on error
  }
};

export default {
  sendChatMessage,
  sendChatConversation,
  polishText,
  getSectionSuggestions,
  checkConsistency,
  generateTitleSuggestions,
  generateSafetyRecommendations,
  simplifyLanguage
};
