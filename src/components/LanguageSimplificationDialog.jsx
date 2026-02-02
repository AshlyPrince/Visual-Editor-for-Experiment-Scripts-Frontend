import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { simplifyLanguage } from '../services/llmService';

const LanguageSimplificationDialog = ({ 
  open, 
  onClose, 
  experimentData,
  onExport
}) => {
  const { t } = useTranslation();
  const [targetLevel, setTargetLevel] = useState('intermediate');
  const [simplifying, setSimplifying] = useState(false);
  const [error, setError] = useState(null);
  const [simplifiedData, setSimplifiedData] = useState(null);
  const [step, setStep] = useState('select'); // 'select', 'preview', 'export'

  const levels = [
    {
      value: 'beginner',
      label: t('simplification.beginner', 'Simple'),
      description: t('simplification.beginnerDescription', 'Very simple language with basic vocabulary and short sentences. Ideal for introductory education.'),
      icon: <SchoolIcon />,
      color: '#4CAF50'
    },
    {
      value: 'intermediate',
      label: t('simplification.intermediate', 'Intermediate'),
      description: t('simplification.intermediateDescription', 'Clear and accessible language with moderate technical vocabulary. Suitable for general education.'),
      icon: <PsychologyIcon />,
      color: '#2196F3'
    },
    {
      value: 'advanced',
      label: t('simplification.advanced', 'Advanced'),
      description: t('simplification.advancedDescription', 'Standard academic language with proper scientific terminology. Maintains original complexity.'),
      icon: <ScienceIcon />,
      color: '#9C27B0'
    }
  ];

  const handleSimplify = async () => {
    setSimplifying(true);
    setError(null);

    try {
      const simplified = await simplifyLanguage(experimentData, targetLevel, t);
      setSimplifiedData(simplified);
      setStep('preview'); // Move to preview step instead of closing
    } catch (err) {
      console.error('Simplification error:', err);
      setError(err.message || t('simplification.error', 'Failed to simplify language'));
    } finally {
      setSimplifying(false);
    }
  };

  const handleExport = (format) => {
    if (onExport && simplifiedData) {
      onExport(simplifiedData, format, targetLevel);
    }
    // Don't close immediately - let user see export is happening
  };

  const handleClose = () => {
    setStep('select');
    setSimplifiedData(null);
    setError(null);
    onClose();
  };

  const renderSelectStep = () => (
    <>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('simplification.info', 'Choose a target complexity level. AI will adapt the language while keeping all essential information and safety warnings.')}
        </Alert>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            {t('simplification.selectLevel', 'Select Target Complexity Level')}
          </FormLabel>
          <RadioGroup value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)}>
            <Stack spacing={2}>
              {levels.map((level) => (
                <Paper
                  key={level.value}
                  elevation={targetLevel === level.value ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: targetLevel === level.value ? level.color : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 3,
                      borderColor: level.color
                    }
                  }}
                  onClick={() => setTargetLevel(level.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Radio value={level.value} />
                    <Box sx={{ color: level.color, mt: 0.5 }}>
                      {level.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {level.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {level.description}
                      </Typography>
                    </Box>
                    {targetLevel === level.value && (
                      <Chip label={t('common.selected', 'Selected')} size="small" color="primary" />
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={simplifying}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSimplify}
          disabled={simplifying || !targetLevel}
          startIcon={simplifying ? <CircularProgress size={20} /> : <PsychologyIcon />}
        >
          {simplifying ? t('simplification.simplifying', 'Simplifying...') : t('simplification.simplify', 'Simplify Language')}
        </Button>
      </DialogActions>
    </>
  );

  const renderPreviewStep = () => {
    // Helper function to render content based on its type
    const renderContent = (content) => {
      if (!content) return null;
      
      if (typeof content === 'string') {
        // HTML or plain text content
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
      }
      
      if (typeof content === 'object' && !Array.isArray(content)) {
        // Object content (like {steps: [...], items: [...]})
        if (content.steps && Array.isArray(content.steps)) {
          return (
            <Box component="ol" sx={{ pl: 2 }}>
              {content.steps.map((step, i) => (
                <li key={i}>
                  <Typography variant="body2">
                    {step.text || step.instruction || 'Step'}
                  </Typography>
                </li>
              ))}
            </Box>
          );
        }
        
        if (content.items && Array.isArray(content.items)) {
          return (
            <Box component="ul" sx={{ pl: 2 }}>
              {content.items.map((item, i) => (
                <li key={i}>
                  <Typography variant="body2">
                    {typeof item === 'string' ? item : item.name || 'Item'}
                  </Typography>
                </li>
              ))}
            </Box>
          );
        }
        
        // Generic object content
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {Object.entries(content).map(([key, value]) => 
              typeof value === 'string' ? value : ''
            ).filter(Boolean).join('\n')}
          </Typography>
        );
      }
      
      if (Array.isArray(content)) {
        return (
          <Box component="ul" sx={{ pl: 2 }}>
            {content.map((item, i) => (
              <li key={i}>
                <Typography variant="body2">
                  {typeof item === 'string' ? item : item.text || item.name || 'Item'}
                </Typography>
              </li>
            ))}
          </Box>
        );
      }
      
      return null;
    };

    return (
      <>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('simplification.success', 'Language simplified successfully! Preview the changes below.')}
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Chip 
              label={levels.find(l => l.value === targetLevel)?.label} 
              color="primary" 
              sx={{ mb: 2 }}
            />
            
            <Paper elevation={2} sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                {simplifiedData?.title || simplifiedData?.content?.config?.title}
              </Typography>
              
              {(simplifiedData?.estimated_duration || simplifiedData?.content?.config?.duration) && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('experiment.duration', 'Duration')}: {simplifiedData.estimated_duration || simplifiedData.content?.config?.duration}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {(simplifiedData?.content?.sections || simplifiedData?.sections || []).map((section, idx) => (
                <Box key={section.id || idx} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {section.icon && <span>{section.icon} </span>}
                    {section.name || section.title || section.type}
                  </Typography>
                  {renderContent(section.content)}
                </Box>
              ))}
            </Paper>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {t('simplification.exportInfo', 'Choose how you want to export the simplified version:')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, px: 3, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleExport('pdf')}
            startIcon={<DownloadIcon />}
          >
            {t('simplification.exportPDF', 'Export as PDF')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleExport('html')}
            startIcon={<DownloadIcon />}
          >
            {t('simplification.exportHTML', 'Export as HTML')}
          </Button>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 1 }}>
            <Button onClick={() => setStep('select')} fullWidth>
              {t('common.back', 'Back')}
            </Button>
            <Button onClick={handleClose} fullWidth>
              {t('common.close', 'Close')}
            </Button>
          </Box>
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          {step === 'select' 
            ? t('simplification.title', 'Simplify Language for Different Audiences')
            : t('simplification.preview', 'Preview Simplified Version')
          }
        </Box>
      </DialogTitle>

      {step === 'select' ? renderSelectStep() : renderPreviewStep()}
    </Dialog>
  );
};

export default LanguageSimplificationDialog;
