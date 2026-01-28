 

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
  } catch {
    const errorMsg = (key, fallback) => t ? t(key) : fallback;
    
    if (error.response?.status === 500) {
      throw new Error(errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.'));
    } else if (error.response?.status === 404) {
      throw new Error(errorMsg('llm.errors.serviceNotAvailable', 'AI service is not available. Please contact support.'));
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(errorMsg('llm.errors.sessionExpired', 'Your session has expired. Please log in again.'));
    } else if (error.response?.status === 429) {
      throw new Error(errorMsg('llm.errors.tooManyRequests', 'Too many requests. Please wait a moment before trying again.'));
    } else if (!error.response) {
      throw new Error(errorMsg('llm.errors.connectionFailed', 'Unable to connect to AI service. Please check your internet connection.'));
    }
    
    throw new Error(errorMsg('llm.errors.generalError', 'AI assistance is temporarily unavailable. Please try again.'));
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
  } catch {
    const errorMsg = (key, fallback) => t ? t(key) : fallback;
    
    if (error.response?.status === 500) {
      throw new Error(errorMsg('llm.errors.serviceUnavailable', 'AI service is temporarily unavailable. Please try again in a moment.'));
    } else if (error.response?.status === 404) {
      throw new Error(errorMsg('llm.errors.serviceNotAvailable', 'AI service is not available. Please contact support.'));
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(errorMsg('llm.errors.sessionExpired', 'Your session has expired. Please log in again.'));
    } else if (error.response?.status === 429) {
      throw new Error(errorMsg('llm.errors.tooManyRequests', 'Too many requests. Please wait a moment before trying again.'));
    } else if (!error.response) {
      throw new Error(errorMsg('llm.errors.connectionFailed', 'Unable to connect to AI service. Please check your internet connection.'));
    }
    
    throw new Error(errorMsg('llm.errors.generalError', 'AI assistance is temporarily unavailable. Please try again.'));
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
    prompt = `You are a scientific writing assistant. Your role is to IMPROVE the teacher's existing text, not write new content.

Teacher's experiment title:
"${trimmedText}"

Task: Polish this title for clarity and professionalism while keeping the same meaning and topic.
- Keep it concise (under 15 words)
- Maintain the original subject and focus
- Fix grammar, clarity, or phrasing issues
- Do NOT invent new topics or change the fundamental content

Return ONLY the improved title with no explanations, no meta-commentary, and no additional text.`;
  } else if (context.includes('description')) {
    prompt = `You are a scientific writing assistant. Your role is to IMPROVE the teacher's existing text, not write new content.

Teacher's description:
${trimmedText}

Task: Polish this description for clarity, grammar, and professionalism.
- Keep all key details and meaning
- Maintain the teacher's voice and intent
- Fix grammar, structure, and phrasing
- Do NOT add new information or change the content significantly

Return ONLY the improved description with no explanations, no "Upon reviewing...", and no meta-commentary.`;
  } else {
    prompt = `You are a scientific writing assistant. Your role is to IMPROVE the teacher's existing text, not write new content.

Teacher's ${context}:
${trimmedText}

Task: Polish this text for clarity, grammar, and professionalism.
- Preserve the original meaning and content
- Maintain the teacher's voice
- Fix grammar, structure, and phrasing issues
- Do NOT add new information or change the fundamental content

Return ONLY the improved text with no explanations or meta-commentary.`;
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
  } catch {
    const errorMessage = errorMsg('llm.feedback.polishFailed', `Failed to polish text: ${error.message}`);
    throw new Error(errorMessage);
  }
};

export const getSectionSuggestions = async (sectionType, currentContent, experimentContext = {}) => {
  const prompt = `You are assisting with a scientific experiment. 
Section Type: ${sectionType}
Current Content: ${currentContent || '(empty)'}

Please provide:
1. Improved version of the content
2. Three specific suggestions for enhancing this section
3. Any potential issues or missing elements

Respond in JSON format:
{
  "improved": "improved content here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "issues": ["issue 1", "issue 2"]
}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.7,
    max_tokens: 1024
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    
    return {
      improved: response.choices[0].message.content,
      suggestions: [],
      issues: []
    };
  }
};

export const checkConsistency = async (sections) => {
  const prompt = `You are reviewing a scientific experiment for consistency and completeness. Please analyze these sections carefully:

${Object.entries(sections).map(([key, value]) => `${key.toUpperCase()}:\n${value || '(empty)'}\n`).join('\n')}

Please check for:
1. **Title-Description Consistency**: Does the title accurately reflect the description?
2. **Materials-Procedures Alignment**: Are all materials mentioned in procedures actually listed in the materials section?
3. **Safety-Materials Correlation**: Are safety precautions appropriate for the chemicals and materials being used?
4. **Hypothesis-Methodology Alignment**: Does the methodology properly test the hypothesis?
5. **Completeness**: Are any critical sections missing or incomplete?
6. **Safety Compliance**: Are hazardous materials properly addressed with safety equipment and procedures?

Respond in JSON format:
{
  "consistent": true/false,
  "issues": ["specific issue 1", "specific issue 2", ...],
  "recommendations": ["specific recommendation 1", "specific recommendation 2", ...]
}

Be specific and actionable in your issues and recommendations.`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.3,
    max_tokens: 1500
  });

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
  } catch {
    
    const content = response.choices[0].message.content.trim();
    return {
      consistent: !content.toLowerCase().includes('issue') && !content.toLowerCase().includes('problem'),
      issues: [],
      recommendations: [content]
    };
  }
};

export const generateTitleSuggestions = async (description) => {
  const prompt = `Based on this experiment description, suggest 5 concise and descriptive titles (max 10 words each):

${description}

Respond with only a JSON array of strings: ["title 1", "title 2", "title 3", "title 4", "title 5"]`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.8,
    max_tokens: 256
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    
    const content = response.choices[0].message.content;
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(0, 5);
  }
};

export const generateSafetyRecommendations = async (materials, procedures) => {
  const prompt = `Based on these materials and procedures, provide safety recommendations:

MATERIALS:
${materials}

PROCEDURES:
${procedures}

Provide 3-5 specific safety recommendations. Respond in JSON format:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "hazards": ["hazard 1", "hazard 2", ...],
  "ppe": ["PPE item 1", "PPE item 2", ...]
}`;

  const response = await sendChatMessage(prompt, {
    temperature: 0.3,
    max_tokens: 1024
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      recommendations: [response.choices[0].message.content],
      hazards: [],
      ppe: []
    };
  }
};

export default {
  sendChatMessage,
  sendChatConversation,
  polishText,
  getSectionSuggestions,
  checkConsistency,
  generateTitleSuggestions,
  generateSafetyRecommendations
};
