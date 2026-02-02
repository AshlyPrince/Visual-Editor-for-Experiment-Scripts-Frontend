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
  
  const content = typeof experimentData.content === 'string' 
    ? JSON.parse(experimentData.content) 
    : experimentData.content;
  
  const actualContent = content?.content || content;
  const sections = actualContent?.sections || [];

  const simplifiedSections = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    const simplifiedSection = { ...section };
    
    try {
      const hasTextContent = section.content && typeof section.content === 'string';
      const hasListItems = section.items && Array.isArray(section.items);
      const hasSteps = section.steps && Array.isArray(section.steps);
      
      if ((section.type === 'text' || hasTextContent) && section.content) {
        simplifiedSection.content = await simplifyText(section.content, targetLevel, t);
      } 
      else if ((section.type === 'list' || hasListItems) && section.items && Array.isArray(section.items)) {
        simplifiedSection.items = await Promise.all(
          section.items.map(async (item, idx) => {
            if (typeof item === 'string') {
              return await simplifyText(item, targetLevel, t);
            }
            return item;
          })
        );
      } 
      else if ((section.type === 'steps' || hasSteps) && section.steps && Array.isArray(section.steps)) {
        simplifiedSection.steps = await Promise.all(
          section.steps.map(async (step, idx) => {
            if (step.instruction) {
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
  
  // Extract and preserve tables, links, images, and other structured content
  const preservedElements = [];
  let processedText = text;
  
  // Preserve tables
  processedText = processedText.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    const placeholder = `___TABLE_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });
  
  // Preserve links (keep link text for simplification, but preserve the href)
  processedText = processedText.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi, (match, href, linkText) => {
    const placeholder = `___LINK_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push({ type: 'link', href, text: linkText, fullMatch: match });
    return linkText; // Keep link text for simplification
  });
  
  // Preserve images
  processedText = processedText.replace(/<img[^>]*>/gi, (match) => {
    const placeholder = `___IMAGE_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });
  
  // Preserve videos
  processedText = processedText.replace(/<video[\s\S]*?<\/video>/gi, (match) => {
    const placeholder = `___VIDEO_PLACEHOLDER_${preservedElements.length}___`;
    preservedElements.push(match);
    return placeholder;
  });
  
  // Check if there's still HTML after preserving structured elements
  const containsHTML = /<[a-z][\s\S]*>/i.test(processedText);
  
  const levelInstructions = {
    'beginner': {
      system: 'You are a science educator who simplifies scientific text for primary school children while preserving all original content structure and language.',
      instruction: `Simplify ONLY the language complexity of the following text for young children (ages 6-10):

⚠️ CRITICAL RULES - MUST FOLLOW:
1. KEEP THE SAME LANGUAGE - If the text is in German, your output MUST be in German. If English, stay in English. DO NOT TRANSLATE.
2. PRESERVE ALL original content - do not add or remove information
3. Keep the SAME meaning and facts - only make words simpler in the SAME language
4. Keep all HTML formatting tags (like <p>, <strong>, <em>, etc.) EXACTLY as they are
5. Keep all numbers, measurements, chemical formulas, and safety warnings EXACTLY as written
6. Keep any placeholder markers (like ___TABLE_PLACEHOLDER_0___) EXACTLY as they appear
7. Use very simple words in the SAME language (maximum 8-10 words per sentence)
8. Replace complex scientific terms with everyday words that children know IN THE SAME LANGUAGE

DO NOT translate. DO NOT write new content. DO NOT answer questions. ONLY simplify the existing text in its ORIGINAL LANGUAGE.`
    },
    'intermediate': {
      system: 'You are a science educator who makes scientific text clearer and more accessible while preserving all original content and language.',
      instruction: `Simplify ONLY the language complexity of the following text to make it easier to understand:

⚠️ CRITICAL RULES - MUST FOLLOW:
1. KEEP THE SAME LANGUAGE - If the text is in German, your output MUST be in German. If English, stay in English. DO NOT TRANSLATE.
2. PRESERVE ALL original content - do not add or remove information
3. Keep the SAME meaning and facts - only make the language clearer in the SAME language
4. Keep all HTML formatting tags (like <p>, <strong>, <em>, etc.) EXACTLY as they are
5. Keep all numbers, measurements, chemical formulas, and safety warnings EXACTLY as written
6. Keep any placeholder markers (like ___TABLE_PLACEHOLDER_0___) EXACTLY as they appear
7. Use clear, everyday language in the SAME language (maximum 15-20 words per sentence)
8. Explain or replace technical terms with simpler words IN THE SAME LANGUAGE

DO NOT translate. DO NOT write new content. DO NOT answer questions. ONLY simplify the existing text in its ORIGINAL LANGUAGE.`
    },
    'advanced': {
      system: 'You are a science educator who maintains academic rigor while ensuring clarity and preserving the original language.',
      instruction: `Keep the following text at its CURRENT academic level, only improving clarity if needed:

⚠️ CRITICAL RULES - MUST FOLLOW:
1. KEEP THE SAME LANGUAGE - If the text is in German, your output MUST be in German. If English, stay in English. DO NOT TRANSLATE.
2. PRESERVE ALL original content exactly - this is the original/advanced level
3. Keep all scientific terminology and academic language in the SAME language
4. Keep all HTML formatting tags EXACTLY as they are
5. Keep all numbers, measurements, chemical formulas, and safety warnings EXACTLY as written
6. Keep any placeholder markers (like ___TABLE_PLACEHOLDER_0___) EXACTLY as they appear
7. Only fix obvious grammar or clarity issues

DO NOT translate. DO NOT simplify the language. DO NOT write new content. Return the text mostly unchanged in its ORIGINAL LANGUAGE.`
    }
  };
  
  const level = levelInstructions[targetLevel] || levelInstructions['intermediate'];
  
  // Detect language by checking for common words
  const textLower = text.toLowerCase();
  let detectedLanguage = 'English';
  
  // German detection - check for common German words and characters
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

🌍 LANGUAGE DETECTION: This text appears to be in ${detectedLanguage}.
⚠️ YOU MUST RESPOND IN THE SAME LANGUAGE: ${detectedLanguage}
⚠️ DO NOT TRANSLATE TO ANY OTHER LANGUAGE!

IMPORTANT: 
- Return ONLY the simplified text in ${detectedLanguage}
- Do NOT add phrases like "Here is the simplified version"
- Do NOT add explanations or commentary
- Do NOT translate to English or any other language
- Keep all placeholder markers EXACTLY as they appear
${containsHTML ? '\n⚠️ WARNING: This text contains HTML formatting. You MUST preserve all HTML tags exactly as they appear!' : ''}

Original text (in ${detectedLanguage}):
${processedText}` }
      ],
      { 
        temperature: 0.3,  // Lower temperature for more consistent output
        max_tokens: 2000   // Increased for longer content
      },
      t
    );
    
    let simplifiedText = response.choices[0].message.content.trim();
    
    // Remove instruction blocks that might have been returned by mistake
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
    
    // Remove meta-commentary
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
    
    // Restore preserved elements (in reverse order for nested content)
    for (let i = preservedElements.length - 1; i >= 0; i--) {
      const element = preservedElements[i];
      const placeholder = element.type === 'link' 
        ? `___LINK_PLACEHOLDER_${i}___` 
        : element.type 
          ? `___${element.type.toUpperCase()}_PLACEHOLDER_${i}___`
          : `___TABLE_PLACEHOLDER_${i}___`;
      
      if (element.type === 'link') {
        // For links, check if the link text was simplified and wrap it back in the <a> tag
        const originalLinkText = element.text;
        // Find where the original link text appears in simplified text (it might have been simplified)
        simplifiedText = simplifiedText.replace(originalLinkText, element.fullMatch);
      } else {
        // For tables, images, videos - restore as-is
        simplifiedText = simplifiedText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), element);
      }
    }
    
    simplifiedText = simplifiedText.trim();
    
    // Only clean up spacing if NOT HTML
    if (!containsHTML) {
      simplifiedText = simplifiedText
        .replace(/\n\n+/g, '\n\n')
        .replace(/([.!?])\n(?=[A-Z])/g, '$1 ')
        .replace(/\n(?=[A-Z])/g, ' ');
    }
    
    // If result is too short or doesn't make sense, return original
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