 

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  MenuItem
} from '@mui/material';
import {
  AutoFixHigh as PolishIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { polishText, checkConsistency } from '../services/llmService';

const LLMPolishCheck = ({ experimentData, onUpdate, onApprove, showPolishSection = true }) => {
  const { t } = useTranslation();
  const [polishing, setPolishing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [polishedFields, setPolishedFields] = useState({});
  const [consistencyResults, setConsistencyResults] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [approvedFields, setApprovedFields] = useState({});
  const [error, setError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedFieldForCustom, setSelectedFieldForCustom] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); 

  
  const getPolishableFields = () => {
    const fields = [];
    
    
    if (experimentData.title) {
      fields.push({ 
        key: 'title', 
        label: t('llm.polish.experimentTitle'), 
        value: experimentData.title,
        context: t('llm.polish.scientificExperimentTitle')
      });
    }
    
    

    
    if (experimentData.sections && Array.isArray(experimentData.sections)) {
      experimentData.sections.forEach((section, index) => {
        if (section.content) {
          
          Object.entries(section.content).forEach(([contentKey, contentValue]) => {
            if (typeof contentValue === 'string' && contentValue.trim().length > 0) {
              const fieldKey = `section_${section.id}_${contentKey}`;
              fields.push({
                key: fieldKey,
                label: `${section.name} - ${contentKey.charAt(0).toUpperCase() + contentKey.slice(1)}`,
                value: contentValue,
                context: `${section.name} section`,
                sectionId: section.id,
                contentKey: contentKey
              });
            }
          });
        }
      });
    }
    
    return fields;
  };

  const polishableFields = getPolishableFields();

  
  const getGuidanceMessage = (fieldKey, fieldLabel) => {
    const messages = {
      title: {
        guidance: t('llm.polish.guidanceTitle'),
        example: t('llm.polish.exampleTitle')
      },
      purpose: {
        guidance: t('llm.polish.guidancePurpose'),
        example: t('llm.polish.examplePurpose')
      },
      default: {
        guidance: t('llm.polish.guidanceDefault', { field: fieldLabel.toLowerCase() }),
        example: t('llm.polish.exampleDefault')
      }
    };
    
    
    const baseKey = fieldKey.includes('_') ? fieldKey.split('_').pop() : fieldKey;
    return messages[baseKey] || messages.default;
  };

  
  const handlePolishField = async (field, customPromptText = '') => {
    const currentValue = field.value;
    
    if (!currentValue || currentValue.trim().length === 0) {
      setError(t('llm.polish.fieldEmpty', { field: field.label }));
      return;
    }

    setPolishing(true);
    setError(null);

    try {
      let promptContext;
      if (customPromptText) {
        promptContext = customPromptText;
      } else {
        
        if (field.key === 'title') {
          promptContext = t('llm.polish.improveTitlePrompt');
        } else {
          promptContext = t('llm.polish.improveContentPrompt', { context: field.context });
        }
      }
      
      const improved = await polishText(currentValue, promptContext);
      
      
      
      const isFeedbackMessage = improved && (
        improved.toLowerCase().includes('no content provided') ||
        improved.toLowerCase().includes('content too short') ||
        improved.toLowerCase().includes('invalid input') ||
        improved.toLowerCase().includes('please add more detail') ||
        improved.toLowerCase().includes('please provide') ||
        improved.toLowerCase().includes('needs more detail before polishing') ||
        improved.toLowerCase().includes('kein inhalt') ||
        improved.toLowerCase().includes('zu kurz') ||
        improved.toLowerCase().includes('ungültige eingabe') ||
        improved.toLowerCase().includes('bitte weitere details') ||
        improved.toLowerCase().includes('mehr details erforderlich')
      );
      
      
      if (isFeedbackMessage) {
        
        setFieldErrors(prev => ({
          ...prev,
          [field.key]: improved
        }));
        return;
      }
      
      
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.key];
        return newErrors;
      });
      
      setPolishedFields(prev => ({
        ...prev,
        [field.key]: {
          original: currentValue,
          polished: improved,
          label: field.label,
          sectionId: field.sectionId,
          contentKey: field.contentKey
        }
      }));
    } catch (err) {
      setError(t('llm.polish.failedToPolish', { field: field.label, error: err.message }));
    } finally {
      setPolishing(false);
      setSelectedFieldForCustom(null);
      setCustomPrompt('');
    }
  };

  
  const handleCustomPromptPolish = () => {
    if (selectedFieldForCustom && customPrompt.trim()) {
      handlePolishField(selectedFieldForCustom, customPrompt);
    }
  };

  
  const handlePolishAll = async () => {
    setPolishing(true);
    setError(null);
    const newPolishedFields = {};

    for (const field of polishableFields) {
      if (field.value && field.value.trim().length > 0) {
        try {
          
          let promptContext;
          if (field.key === 'title') {
            promptContext = t('llm.polish.improveTitlePrompt');
          } else {
            promptContext = t('llm.polish.improveContentPrompt', { context: field.context });
          }
          
          const improved = await polishText(field.value, promptContext);
          
          
          
          const isFeedbackMessage = improved && (
            improved.toLowerCase().includes('no content provided') ||
            improved.toLowerCase().includes('content too short') ||
            improved.toLowerCase().includes('invalid input') ||
            improved.toLowerCase().includes('please add more detail') ||
            improved.toLowerCase().includes('please provide') ||
            improved.toLowerCase().includes('needs more detail before polishing') ||
            improved.toLowerCase().includes('kein inhalt') ||
            improved.toLowerCase().includes('zu kurz') ||
            improved.toLowerCase().includes('ungültige eingabe') ||
            improved.toLowerCase().includes('bitte weitere details') ||
            improved.toLowerCase().includes('mehr details erforderlich')
          );
          
          if (!isFeedbackMessage) {
            newPolishedFields[field.key] = {
              original: field.value,
              polished: improved,
              label: field.label,
              sectionId: field.sectionId,
              contentKey: field.contentKey
            };
          } else {
            
            setFieldErrors(prev => ({
              ...prev,
              [field.key]: improved
            }));
          }
        } catch (err) {
          setError(t('llm.polish.unableToImprove', { field: field.label, error: err.message }));
        }
      }
    }

    setPolishedFields(newPolishedFields);
    setPolishing(false);
  };

  
  const handleConsistencyCheck = async () => {
    setChecking(true);
    setError(null);

    try {
      
      const sectionsToCheck = {
        title: experimentData.title || ''
        
      };

      
      if (experimentData.sections && Array.isArray(experimentData.sections)) {
        experimentData.sections.forEach(section => {
          if (section.content) {
            Object.entries(section.content).forEach(([key, value]) => {
              if (typeof value === 'string' && value.trim().length > 0) {
                sectionsToCheck[`${section.name}_${key}`] = value;
              } else if (Array.isArray(value) && value.length > 0) {
                sectionsToCheck[`${section.name}_${key}`] = value.join(', ');
              }
            });
          }
        });
      }

      
      const hasContent = Object.values(sectionsToCheck).some(v => v && v.trim().length > 0);
      
      if (!hasContent) {
        setConsistencyResults({
          overall: 'warning',
          score: 0,
          issues: [{
            type: 'warning',
            message: t('llm.polish.allSectionsEmpty')
          }]
        });
        setChecking(false);
        return;
      }

      const results = await checkConsistency(sectionsToCheck);
      setConsistencyResults(results);
    } catch (err) {
      setError(t('llm.polish.unableToCheckConsistency', { error: err.message }));
    } finally {
      setChecking(false);
    }
  };

  
  const handleApplyPolished = (fieldKey) => {
    const polished = polishedFields[fieldKey];
    
    if (polished && onUpdate) {
      
      if (polished.sectionId && polished.contentKey) {
        
        const updatedSections = experimentData.sections.map(section => {
          if (section.id === polished.sectionId) {
            return {
              ...section,
              content: {
                ...section.content,
                [polished.contentKey]: polished.polished
              }
            };
          }
          return section;
        });
        
        onUpdate({ sections: updatedSections });
      } else {
        
        onUpdate({ [fieldKey]: polished.polished });
      }
      setApprovedFields(prev => ({ ...prev, [fieldKey]: true }));
    }
  };

  
  const handleApplyAll = () => {
    if (!onUpdate) return;
    
    const updates = {};
    const sectionUpdates = experimentData.sections ? [...experimentData.sections] : [];
    
    Object.entries(polishedFields).forEach(([key, value]) => {
      if (value.sectionId && value.contentKey) {
        
        const sectionIndex = sectionUpdates.findIndex(s => s.id === value.sectionId);
        if (sectionIndex !== -1) {
          sectionUpdates[sectionIndex] = {
            ...sectionUpdates[sectionIndex],
            content: {
              ...sectionUpdates[sectionIndex].content,
              [value.contentKey]: value.polished
            }
          };
        }
      } else {
        
        updates[key] = value.polished;
      }
      setApprovedFields(prev => ({ ...prev, [key]: true }));
    });
    
    onUpdate({ ...updates, sections: sectionUpdates });
  };

  
  const handleKeepOriginal = (fieldKey) => {
    setApprovedFields(prev => ({ ...prev, [fieldKey]: true }));
    
    setPolishedFields(prev => {
      const updated = { ...prev };
      delete updated[fieldKey];
      return updated;
    });
  };

  
  const handleStartEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey);
    setTempEditValue(currentValue);
  };

  const handleSaveEdit = (fieldKey) => {
    setPolishedFields(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        polished: tempEditValue
      }
    }));
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempEditValue('');
  };

  
  const allFieldsReviewed = Object.keys(polishedFields).length === 0 || 
    Object.keys(polishedFields).every(key => approvedFields[key]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {showPolishSection && (
        <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PolishIcon color="primary" />
            {t('llm.polish.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('llm.polish.description')}
          </Typography>
        </Paper>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showPolishSection && (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{t('llm.polish.textPolishing')}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={polishing ? <CircularProgress size={20} /> : <PolishIcon />}
              onClick={handlePolishAll}
              disabled={polishing || polishableFields.length === 0}
            >
              {polishing ? t('llm.polish.polishing') : t('llm.polish.polishAllFields')}
            </Button>
          </Box>
        </Box>

        {polishableFields.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('llm.polish.noContentAvailable')}
            </Typography>
          </Box>
        ) : (
          <>
            {Object.keys(polishedFields).length === 0 && Object.keys(fieldErrors).length === 0 ? (
              <>
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('llm.polish.clickPolishAll')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {t('llm.polish.orPolishIndividual')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
                    {polishableFields.map(field => (
                      <Chip
                        key={field.key}
                        label={t('llm.polish.polishField', { field: field.label })}
                        onClick={() => handlePolishField(field)}
                        disabled={polishing}
                        clickable
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('llm.polish.customPromptPolish')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('llm.polish.customPromptDescription')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      select
                      label={t('llm.polish.selectField')}
                      value={selectedFieldForCustom?.key || ''}
                      onChange={(e) => {
                        const field = polishableFields.find(f => f.key === e.target.value);
                        setSelectedFieldForCustom(field);
                      }}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">
                        <em>{t('llm.polish.selectFieldPlaceholder')}</em>
                      </MenuItem>
                      {polishableFields.map(field => (
                        <MenuItem key={field.key} value={field.key}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label={t('llm.polish.customPrompt')}
                      placeholder={t('llm.polish.customPromptPlaceholder')}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                      disabled={!selectedFieldForCustom}
                    />
                    <Button
                      variant="contained"
                      startIcon={<PolishIcon />}
                      onClick={handleCustomPromptPolish}
                      disabled={!selectedFieldForCustom || !customPrompt.trim() || polishing}
                      fullWidth
                    >
                      {t('llm.polish.applyCustomPolish')}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
          <>
            {polishableFields.filter(field => 
              !polishedFields[field.key] && !fieldErrors[field.key]
            ).length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {t('llm.polish.fieldsAvailableToPolish')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {polishableFields
                    .filter(field => !polishedFields[field.key] && !fieldErrors[field.key])
                    .map(field => (
                      <Chip
                        key={field.key}
                        label={field.label}
                        onClick={() => handlePolishField(field)}
                        disabled={polishing}
                        clickable
                        size="small"
                        color="primary"
                        variant="outlined"
                        icon={<PolishIcon />}
                      />
                    ))}
                </Box>
              </Box>
            )}
            
            {Object.entries(fieldErrors).map(([key, errorMessage]) => {
              const field = polishableFields.find(f => f.key === key);
              if (!field) return null;
              
              return (
                <Accordion key={key} defaultExpanded sx={{ mb: 1, borderLeft: 3, borderColor: 'warning.main' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography sx={{ flexGrow: 1 }}>{field.label}</Typography>
                      <Chip
                        icon={<InfoIcon />}
                        label={t('llm.polish.cannotImproveYet')}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EditIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                            {t('llm.polish.editYourContentHere')}
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          value={field.value}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            
                            if (key === 'title') {
                              onUpdate({ title: newValue });
                            } else if (field.sectionId && field.contentKey) {
                              onUpdate({
                                sectionId: field.sectionId,
                                contentKey: field.contentKey,
                                value: newValue
                              });
                            }
                          }}
                          variant="outlined"
                          placeholder={t('llm.polish.addMoreDetail', { field: field.label.toLowerCase() })}
                          helperText={t('llm.polish.typeAndTryAgain')}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Alert severity="warning" icon={<InfoIcon />} sx={{ bgcolor: '#fff9f0', border: '1px solid', borderColor: 'warning.light' }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'warning.dark' }}>
                            ⚠️ {errorMessage.includes('short') || errorMessage.includes('detail') || errorMessage.includes('kurz') || errorMessage.includes('detail') ? t('llm.polish.needsMoreDetail') : t('llm.polish.cannotImproveYet')}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                            {getGuidanceMessage(key, field.label).guidance}
                          </Typography>
                          <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                              {t('llm.polish.example')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {getGuidanceMessage(key, field.label).example}
                            </Typography>
                          </Box>
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<PolishIcon />}
                            onClick={() => {
                              
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[key];
                                return newErrors;
                              });
                              handlePolishField(field);
                            }}
                          >
                            {t('llm.polish.tryPolishAgain')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[key];
                                return newErrors;
                              });
                            }}
                          >
                            {t('llm.polish.dismiss')}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
            
            {Object.entries(polishedFields).map(([key, value]) => (
              <Accordion key={key} defaultExpanded sx={{ mb: 1 }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    '& .MuiAccordionSummary-content': { 
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>{value.label}</Typography>
                    {approvedFields[key] ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          icon={<DoneIcon />}
                          label={t('llm.polish.approved')}
                          color="success"
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            
                            const field = polishableFields.find(f => f.key === key);
                            if (field) {
                              
                              setApprovedFields(prev => {
                                const newApproved = { ...prev };
                                delete newApproved[key];
                                return newApproved;
                              });
                              
                              handlePolishField(field);
                            }
                          }}
                          title={t('llm.polish.rePolishTooltip')}
                          sx={{ color: 'primary.main' }}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKeepOriginal(key);
                          }}
                          sx={{ minWidth: 'auto', px: 1.5 }}
                        >
                          {t('llm.polish.keepOriginal')}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPolished(key);
                          }}
                          sx={{ minWidth: 'auto', px: 1.5 }}
                        >
                          {t('llm.polish.useSuggestion')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1, height: '32px', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('llm.polish.original')}
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50', minHeight: 200, maxHeight: 200, overflow: 'auto' }}>
                        <Typography variant="body2">{value.original}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, height: '32px' }}>
                        <Typography variant="subtitle2" color="success.main">
                          {t('llm.polish.suggestedImprovement')}
                        </Typography>
                        {!approvedFields[key] && (
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(key, value.polished)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {editingField === key ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            value={tempEditValue}
                            onChange={(e) => setTempEditValue(e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<DoneIcon />}
                              onClick={() => handleSaveEdit(key)}
                            >
                              {t('common.save')}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CloseIcon />}
                              onClick={handleCancelEdit}
                            >
                              {t('common.cancel')}
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', minHeight: 200, maxHeight: 200, overflow: 'auto' }}>
                          <Typography variant="body2">{value.polished}</Typography>
                        </Paper>
                      )}
                    </Grid>

                    {!approvedFields[key] && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', fontStyle: 'italic' }}>
                            {t('llm.polish.canUndoLater')}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleKeepOriginal(key)}
                          >
                            {t('llm.polish.keepOriginal')}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<DoneIcon />}
                            onClick={() => handleApplyPolished(key)}
                          >
                            {t('llm.polish.useSuggestedVersion')}
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            {!allFieldsReviewed && Object.keys(polishedFields).length > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DoneIcon />}
                  onClick={handleApplyAll}
                >
                  {t('llm.polish.useAllSuggestions')}
                </Button>
              </Box>
            )}
          </>
            )}
          </>
        )}
      </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{t('llm.polish.consistencyCheck')}</Typography>
          <Button
            variant="outlined"
            startIcon={checking ? <CircularProgress size={20} /> : <CheckIcon />}
            onClick={handleConsistencyCheck}
            disabled={checking}
          >
            {checking ? t('llm.polish.checking') : t('llm.polish.runConsistencyCheck')}
          </Button>
        </Box>

        {!consistencyResults ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('llm.polish.checkConsistencyDescription')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Alert 
              severity={consistencyResults.consistent ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              {consistencyResults.consistent
                ? t('llm.polish.sectionsConsistent')
                : t('llm.polish.inconsistenciesFound')}
            </Alert>

            {consistencyResults.issues && consistencyResults.issues.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('llm.polish.issuesFound')}:
                </Typography>
                <List dense>
                  {consistencyResults.issues.map((issue, idx) => {
                    
                    const issueText = typeof issue === 'string' ? issue : JSON.stringify(issue);
                    
                    return (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={issueText}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: { whiteSpace: 'pre-wrap' }
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {consistencyResults.recommendations && consistencyResults.recommendations.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('llm.polish.recommendations')}:
                </Typography>
                <List dense>
                  {consistencyResults.recommendations.map((rec, idx) => {
                    
                    const recText = typeof rec === 'string' ? rec : JSON.stringify(rec);
                    
                    return (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckIcon color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={recText}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: { whiteSpace: 'pre-wrap' }
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleConsistencyCheck}
                disabled={checking}
              >
                {t('llm.polish.reCheck')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          {t('llm.polish.readyToCreate')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {allFieldsReviewed && consistencyResults
            ? t('llm.polish.allReviewedComplete')
            : t('llm.polish.pleaseReviewAll')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {Object.keys(polishedFields).length > 0 && (
            <Chip
              icon={allFieldsReviewed ? <CheckIcon /> : <WarningIcon />}
              label={t('llm.polish.textReviewStatus', { 
                approved: Object.keys(polishedFields).filter(k => approvedFields[k]).length, 
                total: Object.keys(polishedFields).length 
              })}
              color={allFieldsReviewed ? 'success' : 'warning'}
              size="small"
            />
          )}
          {consistencyResults && (
            <Chip
              icon={<CheckIcon />}
              label={t('llm.polish.consistencyCheckComplete')}
              color="success"
              size="small"
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LLMPolishCheck;
