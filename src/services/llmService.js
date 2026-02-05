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

    const normalizeToStrings = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          
          return item.text || item.message || item.description || JSON.stringify(item);
        }
        return String(item);
      });
    };

    return {
      consistent: parsed.consistent !== false, 
      issues: normalizeToStrings(parsed.issues),
      recommendations: normalizeToStrings(parsed.recommendations)
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

export const simplifyLanguage = async (experimentData, targetLevel = 'intermediate', t = null, uiLanguage = 'en') => {
  const errorMsg = (key, fallback) => t ? t(key) : fallback;
  
  try {
    const content = typeof experimentData.content === 'string' 
      ? JSON.parse(experimentData.content) 
      : experimentData.content;
    
    const actualContent = content?.content || content;
    const sections = actualContent?.sections || [];

    // Sections that should NOT be simplified (technical/specific content that must remain exact)
    const skipSimplificationSections = [
      'materials',
      'equipment',
      'chemicals',
      'reagents',
      'materials_equipment',
      'chemicals_reagents'
    ];

    const simplifiedSections = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Check if this section should be skipped (materials, equipment, chemicals, reagents only)
      const shouldSkip = skipSimplificationSections.some(skipId => 
        section.id === skipId || 
        section.type === skipId ||
        section.name?.toLowerCase().includes('material') ||
        section.name?.toLowerCase().includes('equipment') ||
        section.name?.toLowerCase().includes('chemical') ||
        section.name?.toLowerCase().includes('reagent')
      );

      // If section should be skipped, keep it as-is without simplification
      if (shouldSkip) {
        console.log(`[LLM Service] Skipping section: ${section.name || section.id}`);
        simplifiedSections.push({ ...section });
        continue;
      }
    
    const simplifiedSection = { ...section };
    
    try {
      const hasTextContent = section.content && typeof section.content === 'string';
      const hasObjectContent = section.content && typeof section.content === 'object' && !Array.isArray(section.content);
      const hasArrayContent = Array.isArray(section.content);
      const hasListItems = section.items && Array.isArray(section.items);
      const hasSteps = section.steps && Array.isArray(section.steps);

      if (hasTextContent && section.content) {
        simplifiedSection.content = await simplifyText(section.content, targetLevel, t, uiLanguage);
      }
      
      else if (hasObjectContent) {
        const simplifiedContent = {};
        for (const [key, value] of Object.entries(section.content)) {
          if (typeof value === 'string' && value.trim().length > 0) {
            
            simplifiedContent[key] = await simplifyText(value, targetLevel, t, uiLanguage);
          } else if (Array.isArray(value)) {
            
            simplifiedContent[key] = await Promise.all(
              value.map(async (item) => {
                if (typeof item === 'string') {
                  return await simplifyText(item, targetLevel, t, uiLanguage);
                } else if (typeof item === 'object' && item !== null) {

                  if (item.text || item.instruction || item.notes) {
                    return {
                      ...item, 
                      text: item.text ? await simplifyText(item.text, targetLevel, t, uiLanguage) : item.text,
                      instruction: item.instruction ? await simplifyText(item.instruction, targetLevel, t, uiLanguage) : item.instruction,
                      notes: item.notes ? await simplifyText(item.notes, targetLevel, t, uiLanguage) : item.notes
                    };
                  } else if (item.name) {
                    return {
                      ...item, 
                      name: await simplifyText(item.name, targetLevel, t, uiLanguage)
                    };
                  }
                }
                return item;
              })
            );
          } else {
            simplifiedContent[key] = value;
          }
        }
        simplifiedSection.content = simplifiedContent;
      }
      
      else if (hasArrayContent) {
        simplifiedSection.content = await Promise.all(
          section.content.map(async (item) => {
            if (typeof item === 'string') {
              return await simplifyText(item, targetLevel, t, uiLanguage);
            } else if (typeof item === 'object' && item !== null) {
              
              if (item.text || item.instruction || item.notes) {
                return {
                  ...item, 
                  text: item.text ? await simplifyText(item.text, targetLevel, t, uiLanguage) : item.text,
                  instruction: item.instruction ? await simplifyText(item.instruction, targetLevel, t, uiLanguage) : item.instruction,
                  notes: item.notes ? await simplifyText(item.notes, targetLevel, t, uiLanguage) : item.notes
                };
              }
            }
            return item;
          })
        );
      }
      
      else if (hasListItems) {
        simplifiedSection.items = await Promise.all(
          section.items.map(async (item, idx) => {
            if (typeof item === 'string') {
              return await simplifyText(item, targetLevel, t, uiLanguage);
            }
            return item;
          })
        );
      } 
      
      else if (hasSteps) {
        simplifiedSection.steps = await Promise.all(
          section.steps.map(async (step, idx) => {
            
            if (step.instruction || step.text || step.notes) {
              return {
                ...step, 
                instruction: step.instruction ? await simplifyText(step.instruction, targetLevel, t, uiLanguage) : step.instruction,
                text: step.text ? await simplifyText(step.text, targetLevel, t, uiLanguage) : step.text,
                notes: step.notes ? await simplifyText(step.notes, targetLevel, t, uiLanguage) : step.notes
              };
            }
            return step;
          })
        );
      }
    } catch (error) {
      console.error('[LLM Service] Error simplifying section:', error);
    }
    
    simplifiedSections.push(simplifiedSection);
  }
  
  return {
    ...experimentData,
    content: {
      ...actualContent,
      sections: simplifiedSections
    }
  };
  
  } catch (error) {
    console.error('[LLM Service] Error in simplifyLanguage:', error);
    // Return original data if simplification fails
    return experimentData;
  }
};

const simplifyText = async (text, targetLevel, t, uiLanguage = 'en') => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  const preservedElements = [];
  let processedText = text;

  // Step 1: Protect HTML elements (tables, images, videos, links)
  processedText = processedText.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    const placeholder = `___TABLE_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });

  processedText = processedText.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi, (match) => {
    const placeholder = `___LINK_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });

  processedText = processedText.replace(/<img[^>]*>/gi, (match) => {
    const placeholder = `___IMAGE_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });

  processedText = processedText.replace(/<video[\s\S]*?<\/video>/gi, (match) => {
    const placeholder = `___VIDEO_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });

  // Step 2: Protect measurements, numbers with units, chemical formulas, ratios
  const protectedTokens = [];
  
  // Protect numbers with units: 10 ml, 37°C, 5%, 2 min, etc.
  processedText = processedText.replace(/\b(\d+(?:[.,]\d+)?)\s*(ml|mg|g|kg|l|°C|°F|mmHg|cm|mm|m|min|sec|h|%|pH)\b/gi, (match) => {
    const placeholder = `___TOKEN_${protectedTokens.length}___`;
    protectedTokens.push(match);
    return placeholder;
  });
  
  // Protect ratios: 120/80, 1/2, etc.
  processedText = processedText.replace(/\b(\d+)\/(\d+)\b/g, (match) => {
    const placeholder = `___TOKEN_${protectedTokens.length}___`;
    protectedTokens.push(match);
    return placeholder;
  });
  
  // Protect chemical formulas: H2O, NaCl, CO2, etc.
  processedText = processedText.replace(/\b([A-Z][a-z]?\d*)+\b/g, (match) => {
    // Only protect if it looks like a chemical formula (has numbers or multiple caps)
    if (/\d/.test(match) || /[A-Z].*[A-Z]/.test(match)) {
      const placeholder = `___TOKEN_${protectedTokens.length}___`;
      protectedTokens.push(match);
      return placeholder;
    }
    return match;
  });
  
  // Protect standalone numbers that might be measurements
  processedText = processedText.replace(/\b(\d+(?:[.,]\d+)?)\b/g, (match) => {
    const placeholder = `___TOKEN_${protectedTokens.length}___`;
    protectedTokens.push(match);
    return placeholder;
  });

  const containsHTML = /<[a-z][\s\S]*>/i.test(processedText);
  
  // Determine output language from UI (not auto-detection)
  const outputLanguage = uiLanguage === 'de' ? 'German' : 'English';
  const outputLanguageNative = uiLanguage === 'de' ? 'Deutsch' : 'English';
  
  const levelInstructions = {
    'beginner': {
      system: `You are a text simplification expert. Output MUST be valid JSON format only.`,
      instruction: `Simplify this ${outputLanguage} text for children (ages 8-12, A2-B1 level).

RULES:
1. Output language: ${outputLanguage} (${outputLanguageNative})
2. You MAY split long sentences into shorter ones
3. You MAY use simpler sentence structures
4. Replace difficult words with everyday words
5. Keep the SAME meaning and all facts
6. Keep numbered steps in order (1, 2, 3...)
7. Do NOT invent new information
8. Preserve ALL placeholders (___TOKEN_X___, ___IMAGE_PLACEHOLDER_X___, etc.) EXACTLY

OUTPUT FORMAT - RESPOND ONLY WITH THIS JSON:
{"simplified":"<your simplified text here>"}

Text to simplify:
${processedText}`
    },
    'intermediate': {
      system: `You are a text simplification expert. Output MUST be valid JSON format only.`,
      instruction: `Simplify this ${outputLanguage} text for teenagers (ages 13-16, B1-B2 level).

RULES:
1. Output language: ${outputLanguage} (${outputLanguageNative})
2. Use clearer, more accessible vocabulary
3. You MAY shorten overly complex sentences
4. Keep the SAME meaning and all facts
5. Keep numbered steps in order (1, 2, 3...)
6. Do NOT invent new information
7. Preserve ALL placeholders (___TOKEN_X___, ___IMAGE_PLACEHOLDER_X___, etc.) EXACTLY

OUTPUT FORMAT - RESPOND ONLY WITH THIS JSON:
{"simplified":"<your simplified text here>"}

Text to simplify:
${processedText}`
    },
    'advanced': {
      system: `You are a text clarity expert. Output MUST be valid JSON format only.`,
      instruction: `Keep this ${outputLanguage} text at academic level, only improve clarity if needed.

RULES:
1. Output language: ${outputLanguage} (${outputLanguageNative})
2. Keep academic/scientific terminology
3. Only fix obvious grammar or clarity issues
4. Preserve ALL placeholders (___TOKEN_X___, ___IMAGE_PLACEHOLDER_X___, etc.) EXACTLY

OUTPUT FORMAT - RESPOND ONLY WITH THIS JSON:
{"simplified":"<your simplified text here>"}

Text to simplify:
${processedText}`
    }
  };
  
  const level = levelInstructions[targetLevel] || levelInstructions['intermediate'];
  
  try {
    const response = await sendChatConversation(
      [
        { role: 'system', content: level.system },
        { role: 'user', content: level.instruction }
      ],
      { 
        temperature: 0.2,  // Lower temperature for more consistent adherence to instructions
        max_tokens: 4000   // Increased token limit for longer texts
      },
      t
    );
    
    let simplifiedText = response.choices[0].message.content.trim();

    // Try to parse as JSON
    let parsedResponse;
    try {
      // First try direct JSON parse
      parsedResponse = JSON.parse(simplifiedText);
    } catch (jsonError) {
      // Try to extract JSON from wrapped text
      const jsonMatch = simplifiedText.match(/\{[^{}]*"simplified"[^{}]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('[LLM Service] Failed to parse extracted JSON, using original text');
          return text;
        }
      } else {
        // Fallback: treat the whole response as simplified text (strip meta commentary)
        simplifiedText = simplifiedText.replace(/^here is[^:]*:\s*/i, '');
        simplifiedText = simplifiedText.replace(/^simplified[^:]*:\s*/i, '');
        parsedResponse = { simplified: simplifiedText };
      }
    }

    // Extract simplified text from JSON
    simplifiedText = parsedResponse.simplified || text;
    
    // Sanity check: if output is too short, return original
    if (simplifiedText.trim().length < text.trim().length * 0.3) {
      console.warn('[LLM Service] Simplified text too short, returning original');
      return text;
    }

    // Remove inline explanatory notes that might have slipped through
    const notePatterns = [
      /\(Note:\s*[^)]+\)/gi,
      /\(Hinweis:\s*[^)]+\)/gi,
      /\[Note:\s*[^\]]+\]/gi,
      /\[Hinweis:\s*[^\]]+\]/gi,
      /\(I replaced[^)]+\)/gi,
      /\(I changed[^)]+\)/gi,
      /\(Ich habe[^)]+\)/gi,
      /\.\s*Ich habe[^.]+\./gi,
      /\.\s*I made[^.]+\./gi,
      /\.\s*I kept[^.]+\./gi
    ];
    
    for (const pattern of notePatterns) {
      simplifiedText = simplifiedText.replace(pattern, '');
    }

    // Clean up any double spaces or punctuation left by note removal
    simplifiedText = simplifiedText.replace(/\s{2,}/g, ' ');
    simplifiedText = simplifiedText.replace(/\.\s*\./g, '.');
    simplifiedText = simplifiedText.replace(/\s+([.,;:!?])/g, '$1');
    simplifiedText = simplifiedText.trim();

    // Restore protected tokens (numbers, units, formulas)
    for (let i = protectedTokens.length - 1; i >= 0; i--) {
      const placeholder = `___TOKEN_${i}___`;
      simplifiedText = simplifiedText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), protectedTokens[i]);
    }

    // Restore preserved HTML elements
    for (let i = preservedElements.length - 1; i >= 0; i--) {
      const element = preservedElements[i];
      const placeholderName = element.includes('<table') ? 'TABLE' :
                              element.includes('<img') ? 'IMAGE' :
                              element.includes('<video') ? 'VIDEO' :
                              element.includes('<a') ? 'LINK' : 'TABLE';
      const placeholder = `___${placeholderName}_PLACEHOLDER_${i}___`;
      simplifiedText = simplifiedText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), element);
    }

    return simplifiedText;
    
  } catch (error) {
    console.error('[LLM Service] Error simplifying text:', error);
    // Return original text on error
    return text;
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