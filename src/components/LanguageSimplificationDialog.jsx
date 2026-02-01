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
      label: t('simplification.levels.beginner', 'Elementary Level'),
      description: t('simplification.levels.beginnerDesc', 'Ages 8-11 - Very simple language, basic concepts'),
      icon: <SchoolIcon />,
      color: '#4CAF50'
    },
    {
      value: 'intermediate',
      label: t('simplification.levels.intermediate', 'Middle School Level'),
      description: t('simplification.levels.intermediateDesc', 'Ages 12-14 - Clear language with some technical terms'),
      icon: <PsychologyIcon />,
      color: '#2196F3'
    },
    {
      value: 'advanced',
      label: t('simplification.levels.advanced', 'High School Level'),
      description: t('simplification.levels.advancedDesc', 'Ages 15-18 - Standard academic language'),
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
      setStep('preview');
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
    handleClose();
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

  const renderPreviewStep = () => (
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
              {simplifiedData?.title}
            </Typography>
            
            {simplifiedData?.duration && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('experiment.duration', 'Duration')}: {simplifiedData.duration}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {simplifiedData?.sections?.map((section, idx) => (
              <Box key={idx} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {section.title || section.type}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {section.content}
                </Typography>
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
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
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
          {t('simplification.title', 'Simplify Language for Different Audiences')}
        </Box>
      </DialogTitle>

      {step === 'select' && renderSelectStep()}
      {step === 'preview' && renderPreviewStep()}
    </Dialog>
  );
};

export default LanguageSimplificationDialog;
