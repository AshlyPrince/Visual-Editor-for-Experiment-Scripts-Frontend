 

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useLLMChat } from '../../hooks/useLLMChat';
import { useTranslation } from 'react-i18next';

const LLMChatComponent = ({
  title,
  placeholder,
  systemPrompt = null,
  onResponse = null,
  initialMessages = [],
  maxHeight = 500,
  showHeader = true
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, loading, error, sendMessage, sendWithSystemPrompt, clearMessages, setConversation } = useLLMChat();
  
  const { t } = useTranslation();
  
  // Use translated defaults if not provided
  const displayTitle = title || t('llm.chat.title');
  const displayPlaceholder = placeholder || t('llm.chat.placeholder');

  
  useEffect(() => {
    if (initialMessages.length > 0) {
      setConversation(initialMessages);
    }
  }, [initialMessages, setConversation]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput('');

    try {
      let response;
      if (systemPrompt && messages.length === 0) {
        
        response = await sendWithSystemPrompt(systemPrompt, userInput);
      } else {
        
        response = await sendMessage(userInput);
      }

      
      if (onResponse) {
        onResponse(response.content, userInput);
      }
    } catch (err) {
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon color="primary" />
              <Typography variant="h6">{displayTitle}</Typography>
            </Box>
            <Tooltip title={t('llm.chat.clearConversation')}>
              <IconButton onClick={clearMessages} size="small" disabled={loading || messages.length === 0}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider />
        </>
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          maxHeight: maxHeight,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {t('llm.chat.placeholder')}
            </Typography>
          </Box>
        )}

        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                color: 'white',
                flexShrink: 0
              }}
            >
              {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Box>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: msg.role === 'user' ? 'primary.50' : 'background.paper',
                borderRadius: 2
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'secondary.main',
                color: 'white'
              }}
            >
              <SmartToyIcon fontSize="small" />
            </Box>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  {t('common.loading')}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={displayPlaceholder}
            disabled={loading}
            variant="outlined"
            size="small"
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={loading || !input.trim()}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default LLMChatComponent;
