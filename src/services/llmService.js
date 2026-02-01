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
  
  const levelDescriptions = {
    'beginner': 'elementary school (ages 8-11) - use very simple words, short sentences, and basic concepts',
    'intermediate': 'middle school (ages 12-14) - use clear language with some technical terms explained simply',
    'advanced': 'high school (ages 15-18) - use standard academic language with proper scientific terminology'
  };

  const levelDescription = levelDescriptions[targetLevel] || levelDescriptions['intermediate'];

  const prompt = `You are an educational content adapter. Your task is to simplify the language of this scientific experiment to make it appropriate for ${levelDescription}.

ORIGINAL EXPERIMENT:
Title: ${experimentData.title || 'Untitled'}
Duration: ${experimentData.duration || 'Not specified'}
${experimentData.course ? `Course: ${experimentData.course}` : ''}
${experimentData.program ? `Program: ${experimentData.program}` : ''}

SECTIONS:
${experimentData.sections?.map(section => `
${section.title || section.type}:
${section.content || 'No content'}
`).join('\n') || 'No sections'}

INSTRUCTIONS:
1. Simplify all technical language to match the target level
2. Break down complex concepts into simpler explanations
3. Use shorter sentences and clearer structure
4. Keep all essential information and safety warnings
5. Maintain the scientific accuracy
6. Do NOT remove any important content, just make it easier to understand

Return the simplified experiment in the EXACT same JSON structure with these fields:
{
  "title": "simplified title",
  "duration": "same duration",
  "course": "same course",
  "program": "same program",
  "sections": [
    {
      "type": "same type",
      "title": "same title",
      "content": "simplified content"
    }
  ]
}

Return ONLY valid JSON, no explanations or markdown formatting.`;

  try {
    const response = await sendChatConversation(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5, max_tokens: 2000 },
      t
    );

    const content = response.choices[0].message.content.trim();
    
    let jsonStr = content;
    if (content.startsWith('```json')) {
      jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (content.startsWith('```')) {
      jsonStr = content.replace(/```\n?/g, '').trim();
    }

    const simplifiedData = JSON.parse(jsonStr);
    return simplifiedData;
  } catch (error) {
    console.error('Language simplification error:', error);
    throw new Error(errorMsg('llm.errors.simplificationFailed', 'Failed to simplify language. Please try again.'));
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
