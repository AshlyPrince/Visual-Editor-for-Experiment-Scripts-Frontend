 

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { polishText } from '../services/llmService';
import { useTranslation } from 'react-i18next';

const TextPolisher = ({ open, onClose, onApply, initialText = '', context = '', title = 'Polish Text' }) => {
  const [originalText, setOriginalText] = useState(initialText);
  const [polishedText, setPolishedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const { t } = useTranslation();

  const handlePolish = async () => {
    if (!originalText.trim()) {
      setError(t('llm.polish.enterText'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const improved = await polishText(originalText, context);
      setPolishedText(improved);
    } catch (err) {
      setError(err.message || t('llm.polish.failedToPolish'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (polishedText) {
      onApply(polishedText);
      onClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(polishedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(t('llm.polish.failedToCopy'));
    }
  };

  const handleReset = () => {
    setOriginalText(initialText);
    setPolishedText('');
    setError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {context && (
            <Chip 
              label={t('llm.polish.context', { context })}
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('llm.polish.original')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder={t('llm.polish.enterText')}
              variant="outlined"
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handlePolish}
              disabled={loading || !originalText.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
              size="large"
            >
              {loading ? t('llm.polish.polishing') : t('llm.polish.polish')}
            </Button>
          </Box>

          {polishedText && (
            <>
              <Divider>
                <Chip label={t('llm.polish.polished')} size="small" color="success" />
              </Divider>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">
                    {t('llm.polish.polished')}
                  </Typography>
                  <Tooltip title={copied ? t('llm.polish.copied') : t('common.copy')}>
                    <IconButton onClick={handleCopy} size="small">
                      {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'success.50', 
                    border: 1, 
                    borderColor: 'success.main',
                    maxHeight: 300,
                    overflowY: 'auto'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {polishedText}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Chip 
                  icon={<CompareArrowsIcon />}
                  label={t('llm.polish.originalChars', { count: originalText.length })}
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  icon={<CompareArrowsIcon />}
                  label={t('llm.polish.polishedChars', { count: polishedText.length })}
                  size="small" 
                  variant="outlined"
                  color="success"
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleReset} disabled={loading}>
          {t('llm.polish.reset')}
        </Button>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={!polishedText || loading}
          startIcon={<CheckIcon />}
        >
          {t('llm.polish.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextPolisher;
