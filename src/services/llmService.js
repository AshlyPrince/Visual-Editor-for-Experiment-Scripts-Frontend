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

export const simplifyLanguage = async (experimentData, targetLevel = 'intermediate', t = null) => {
  const errorMsg = (key, fallback) => t ? t(key) : fallback;
  
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
        simplifiedSection.content = await simplifyText(section.content, targetLevel, t);
      }
      
      else if (hasObjectContent) {
        const simplifiedContent = {};
        for (const [key, value] of Object.entries(section.content)) {
          if (typeof value === 'string' && value.trim().length > 0) {
            
            simplifiedContent[key] = await simplifyText(value, targetLevel, t);
          } else if (Array.isArray(value)) {
            
            simplifiedContent[key] = await Promise.all(
              value.map(async (item) => {
                if (typeof item === 'string') {
                  return await simplifyText(item, targetLevel, t);
                } else if (typeof item === 'object' && item !== null) {

                  if (item.text || item.instruction || item.notes) {
                    return {
                      ...item, 
                      text: item.text ? await simplifyText(item.text, targetLevel, t) : item.text,
                      instruction: item.instruction ? await simplifyText(item.instruction, targetLevel, t) : item.instruction,
                      notes: item.notes ? await simplifyText(item.notes, targetLevel, t) : item.notes
                    };
                  } else if (item.name) {
                    return {
                      ...item, 
                      name: await simplifyText(item.name, targetLevel, t)
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
              return await simplifyText(item, targetLevel, t);
            } else if (typeof item === 'object' && item !== null) {
              
              if (item.text || item.instruction || item.notes) {
                return {
                  ...item, 
                  text: item.text ? await simplifyText(item.text, targetLevel, t) : item.text,
                  instruction: item.instruction ? await simplifyText(item.instruction, targetLevel, t) : item.instruction,
                  notes: item.notes ? await simplifyText(item.notes, targetLevel, t) : item.notes
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
              return await simplifyText(item, targetLevel, t);
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
                instruction: step.instruction ? await simplifyText(step.instruction, targetLevel, t) : step.instruction,
                text: step.text ? await simplifyText(step.text, targetLevel, t) : step.text,
                notes: step.notes ? await simplifyText(step.notes, targetLevel, t) : step.notes
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
};

const simplifyText = async (text, targetLevel, t) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  const preservedElements = [];
  let processedText = text;

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

  const containsHTML = /<[a-z][\s\S]*>/i.test(processedText);
  
  const levelInstructions = {
    'beginner': {
      system: 'You are a language simplification expert. Your ONLY job is to replace difficult words with simple everyday words while keeping everything else EXACTLY the same.',
      instruction: `Rewrite this text using ONLY simple, easy words that children (ages 8-12) can understand:

🚫 FORBIDDEN - DO NOT DO THESE:
- DO NOT translate to another language
- DO NOT make sentences shorter
- DO NOT break text into more paragraphs
- DO NOT remove any information
- DO NOT summarize or cut content
- DO NOT change the structure

✅ REQUIRED - YOU MUST DO THESE:
1. Keep text in the SAME LANGUAGE (German stays German, English stays English)
2. Keep the EXACT SAME number of sentences
3. Keep the EXACT SAME number of paragraphs
4. Keep the EXACT SAME text length and flow
5. ONLY replace hard/difficult words → simple everyday words
6. Use words children know from daily life (NOT academic or scientific words)
7. Keep ALL numbers, measurements, formulas, HTML tags exactly as written
8. Short sentences are better (8-12 words max per sentence when possible)

EXAMPLE FOR GERMAN:
❌ WRONG: "Der Apparat muss präzise kalibriert werden, bevor die experimentelle Prozedur kommenziert wird."
✅ CORRECT: "Das Gerät muss genau eingestellt werden, bevor das Experiment anfängt."

EXAMPLE FOR ENGLISH:  
❌ WRONG: "The apparatus requires precise calibration prior to experimental commencement."
✅ CORRECT: "The equipment needs to be set up exactly right before the experiment starts."

Remember: SAME language, SAME structure, SAME length - ONLY easier words!`
    },
    'intermediate': {
      system: 'You are a language simplification expert. Your ONLY job is to replace difficult words with clearer everyday words while keeping everything else EXACTLY the same.',
      instruction: `Rewrite this text using clearer, more accessible vocabulary for teenagers (ages 13-16):

🚫 FORBIDDEN - DO NOT DO THESE:
- DO NOT translate to another language
- DO NOT make sentences shorter
- DO NOT break text into more paragraphs
- DO NOT remove any information
- DO NOT summarize or cut content
- DO NOT change the structure

✅ REQUIRED - YOU MUST DO THESE:
1. Keep text in the SAME LANGUAGE (German stays German, English stays English)
2. Keep the EXACT SAME number of sentences
3. Keep the EXACT SAME number of paragraphs
4. Keep the EXACT SAME text length and flow
5. ONLY replace overly complex/technical words → clearer everyday words
6. Use vocabulary that high school students understand
7. Keep ALL numbers, measurements, formulas, HTML tags exactly as written
8. Sentences can be moderate length (15-20 words are okay)

EXAMPLE FOR GERMAN:
❌ WRONG: "Das Experiment erfordert eine akkurate Beobachtung sämtlicher Phänomene."
✅ CORRECT: "Das Experiment braucht eine genaue Beobachtung aller Vorgänge."

EXAMPLE FOR ENGLISH:
❌ WRONG: "The experiment necessitates meticulous observation of phenomena."
✅ CORRECT: "The experiment requires careful observation of all events."

Remember: SAME language, SAME structure, SAME length - ONLY clearer words!`
    },
    'advanced': {
      system: 'You are a language expert who maintains academic language while ensuring absolute clarity.',
      instruction: `Keep this text at its current academic level with minimal changes:

✅ REQUIRED - YOU MUST DO THESE:
1. Keep text in the EXACT SAME LANGUAGE (do NOT translate)
2. Keep ALL scientific and technical vocabulary
3. Keep the EXACT SAME structure and length
4. Keep ALL numbers, measurements, formulas, HTML tags exactly as written
5. Only fix obvious grammar errors if present

Return the text mostly unchanged in its ORIGINAL LANGUAGE.`
    }
  };
  
  const level = levelInstructions[targetLevel] || levelInstructions['intermediate'];

  const textLower = text.toLowerCase();
  let detectedLanguage = 'English';

  if (textLower.includes('die ') || textLower.includes('der ') || textLower.includes('das ') || 
      textLower.includes('und ') || textLower.includes('mit ') || textLower.includes('für ') ||
      textLower.includes('sie ') || textLower.includes('wie ') || textLower.includes('ist ') ||
      text.includes('ä') || text.includes('ö') || text.includes('ü') || text.includes('ß')) {
    detectedLanguage = 'German (Deutsch)';
  }
  
  try {
    const response = await sendChatConversation(
      [
        { role: 'system', content: level.system },
        { role: 'user', content: `${level.instruction}

🌍 DETECTED LANGUAGE: ${detectedLanguage}
⚠️ YOUR OUTPUT MUST BE IN: ${detectedLanguage}

CRITICAL REMINDERS:
- Same language as input (${detectedLanguage})
- Same number of sentences and paragraphs
- Same text length and structure
- ONLY replace difficult words with easier words
- NO translation, NO summarizing, NO restructuring
${containsHTML ? '- Keep all HTML tags exactly as they are' : ''}

TEXT TO SIMPLIFY:
${processedText}

NOW REWRITE THE ABOVE TEXT USING SIMPLER WORDS IN ${detectedLanguage}:` }
      ],
      { 
        temperature: 0.2,  // Lower temperature for more consistent adherence to instructions
        max_tokens: 4000   // Increased token limit for longer texts
      },
      t
    );
    
    let simplifiedText = response.choices[0].message.content.trim();

    const instructionPatterns = [
      /⚠️\s*IMPORTANT RULES[^]*?(?=\n\n[A-Z]|$)/gi,
      /⚠️\s*CRITICAL RULES[^]*?(?=\n\n[A-Z]|$)/gi,
      /⚠️\s*WARNING:[^]*?(?=\n\n[A-Z]|$)/gi,
      /🌍\s*LANGUAGE DETECTION:[^]*?(?=\n\n[A-Z]|$)/gi,
      /⚠️\s*YOU MUST[^]*?(?=\n\n[A-Z]|$)/gi,
      /IMPORTANT:[^]*?(?=Original text|$)/gi,
      /DO NOT translate[^]*?(?=\n\n[A-Z]|$)/gi,
      /- Return ONLY[^]*?(?=\n\n[A-Z]|Original text|$)/gi
    ];
    
    for (const pattern of instructionPatterns) {
      simplifiedText = simplifiedText.replace(pattern, '');
    }

    const metaPatterns = [
      /^here is the simplified version:?\s*/i,
      /^here is the rewritten version:?\s*/i,
      /^here's the rewritten version:?\s*/i,
      /^simplified version:?\s*/i,
      /^rewritten version:?\s*/i,
      /^here is the text:?\s*/i,
      /^here's the text:?\s*/i
    ];
    
    for (const pattern of metaPatterns) {
      simplifiedText = simplifiedText.replace(pattern, '');
    }

    for (let i = preservedElements.length - 1; i >= 0; i--) {
      const element = preservedElements[i];
      const placeholderName = element.includes('<table') ? 'TABLE' :
                              element.includes('<img') ? 'IMAGE' :
                              element.includes('<video') ? 'VIDEO' :
                              element.includes('<a') ? 'LINK' : 'TABLE';
      const placeholder = `___${placeholderName}_PLACEHOLDER_${i}___`;

      simplifiedText = simplifiedText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), element);
    }
    
    simplifiedText = simplifiedText.trim();

    if (!containsHTML) {
      simplifiedText = simplifiedText
        .replace(/\n\n+/g, '\n\n')
        .replace(/([.!?])\n(?=[A-Z])/g, '$1 ')
        .replace(/\n(?=[A-Z])/g, ' ');
    }

    if (!simplifiedText || simplifiedText.length < 10) {
      return text;
    }
    
    return simplifiedText;
  } catch (error) {
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