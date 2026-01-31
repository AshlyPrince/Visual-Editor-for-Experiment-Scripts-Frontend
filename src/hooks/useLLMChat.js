 

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { sendChatConversation } from '../services/llmService';

export const useLLMChat = (initialOptions = {}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultOptions = {
    model: 'meta-llama-3.3-70b-instruct',
    temperature: 0.7,
    max_tokens: 512,
    ...initialOptions
  };

  
  const sendMessage = useCallback(async (content, options = {}) => {
    setLoading(true);
    setError(null);
    
    
    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      
      const response = await sendChatConversation(
        updatedMessages,
        { ...defaultOptions, ...options },
        t
      );
      
      
      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content
      };
      
      
      setMessages(prev => [...prev, assistantMessage]);
      
      return assistantMessage;
    } catch (err) {
      const errorMessage = err.message || t('llm.chat.error', 'Failed to get response. Please try again.');
      setError(errorMessage);
      
      
      setMessages(messages);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages, defaultOptions, t]);

  
  const sendWithSystemPrompt = useCallback(async (systemPrompt, userContent, options = {}) => {
    setLoading(true);
    setError(null);

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    try {
      const response = await sendChatConversation(
        conversationMessages,
        { ...defaultOptions, ...options },
        t
      );
      
      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content
      };
      
      
      setMessages(prev => [...prev, 
        { role: 'user', content: userContent },
        assistantMessage
      ]);
      
      return assistantMessage;
    } catch (err) {
      const errorMessage = err.message || t('llm.chat.error', 'Failed to get response. Please try again.');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [defaultOptions, t]);

  
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  
  const removeLastMessage = useCallback(() => {
    setMessages(prev => prev.slice(0, -1));
  }, []);

  
  const setConversation = useCallback((newMessages) => {
    setMessages(newMessages);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendWithSystemPrompt,
    clearMessages,
    removeLastMessage,
    setConversation
  };
};

export default useLLMChat;
