import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config.js';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Stack,
  CircularProgress,
  Autocomplete,
  Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Science as ExperimentIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
  Lock as LockIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteOutline,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  NavigateBefore as BackIcon,
  NavigateNext as NextIcon,
  Info as InfoIcon,
  Chat as ChatIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import WizardStepper from '../components/ui/WizardStepper.jsx';
import { 
  PrimaryButton, 
  SecondaryButton, 
  ButtonGroup
} from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/Feedback';
import RichTextEditor from '../components/RichTextEditor';
import ListInput from '../components/ListInput';
import ProcedureStepsEditor from '../components/ProcedureStepsEditor';
import MediaUploader from '../components/MediaUploader';
import ContentReviewPanel from '../components/ContentReviewPanel';
import ChatAssistant from '../components/ChatAssistant';
import { experimentService } from '../services/exports.js';
import keycloakService from '../services/keycloakService.js';
import { toCanonical, toWizardState, fromWizardState } from '../utils/experimentCanonical.js';
import aiAssistantIcon from '../assets/icons/ai_assistant.png';

const WizardContainer = styled(Paper)(({ theme }) => ({
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  overflow: 'visible',
  boxShadow: theme.shadows[3]
}));

const StepContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(4)
}));

const SectionCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'locked'
})(({ theme, selected, locked }) => ({
  cursor: locked ? 'not-allowed' : 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected 
    ? theme.palette.action.selected 
    : theme.palette.background.paper,
  opacity: locked ? 0.7 : 1,
  '&:hover': {
    boxShadow: !locked && theme.shadows[4],
    transform: !locked && 'translateY(-2px)'
  }
}));

const ModularExperimentWizard = ({ 
  selectedTemplate = null, 
  existingExperiment = null,
  onComplete, 
  onCancel 
}) => {
  const { t, ready } = useTranslation();
  
  if (!ready || !i18n.isInitialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('wizardState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
    }
    return null;
  };

  const savedState = loadSavedState();

  const wizardSteps = [
    { id: 'basic_info', label: t('wizard.basicInformation'), description: t('wizard.basicInformationDesc') },
    { id: 'sections', label: t('wizard.selectSections'), description: t('wizard.selectSectionsDesc') },
    { id: 'content', label: t('wizard.fillContent'), description: t('wizard.fillContentDesc') },
    { id: 'content_review', label: t('wizard.contentReview'), description: t('wizard.contentReviewDesc') },
    { id: 'preview', label: t('wizard.previewCreate'), description: t('wizard.previewCreateDesc') }
  ];

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 0);
  const [completedSteps, setCompletedSteps] = useState(new Set(savedState?.completedSteps || []));
  const availableSections = [
    
    { 
      id: 'objectives', 
      name: t('wizard.sectionDefinitions.objectives.name'),
      description: t('wizard.sectionDefinitions.objectives.description'),
      emoji: '🎯',
      category: 'optional',
      required: false,
      locked: false,
      fields: [
        { id: 'purpose', label: t('wizard.sectionDefinitions.objectives.fields.purpose'), type: 'richtext', required: true },
        { id: 'media', label: t('wizard.sectionDefinitions.objectives.fields.media'), type: 'media', required: false, help: t('wizard.sectionDefinitions.objectives.fields.mediaHelp') }
      ],
      defaultContent: {
        purpose: '',
        media: []
      }
    },
    { 
      id: 'background', 
      name: t('wizard.sectionDefinitions.background.name'),
      description: t('wizard.sectionDefinitions.background.description'),
      emoji: '🧠',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'content', label: t('wizard.sectionDefinitions.background.fields.content'), type: 'richtext', required: true },
        { id: 'media', label: t('wizard.sectionDefinitions.background.fields.media'), type: 'media', required: false, 
          accept: 'image/*,video/*', 
          help: t('wizard.sectionDefinitions.background.fields.mediaHelp') }
      ],
      defaultContent: {
        content: '',
        media: []
      }
    },
    { 
      id: 'materials', 
      name: t('wizard.sectionDefinitions.materials.name'),
      description: t('wizard.sectionDefinitions.materials.description'),
      emoji: '🧰',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true,
      fields: [
        { id: 'items', label: t('wizard.sectionDefinitions.materials.fields.items'), type: 'materials_with_media', required: true, 
          help: t('wizard.sectionDefinitions.materials.fields.itemsHelp') }
      ],
      defaultContent: {
        items: []
      }
    },
    { 
      id: 'chemicals', 
      name: t('wizard.sectionDefinitions.chemicals.name'),
      description: t('wizard.sectionDefinitions.chemicals.description'),
      emoji: '☣️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true,
      fields: [
        { id: 'items', label: t('wizard.sectionDefinitions.chemicals.fields.items'), type: 'list', required: true }
      ],
      defaultContent: {
        items: []
      }
    },
    { 
      id: 'safety', 
      name: t('wizard.sectionDefinitions.safety.name'),
      description: t('wizard.sectionDefinitions.safety.description'),
      emoji: '⚠️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'safety_briefing', label: t('wizard.sectionDefinitions.safety.fields.safety_briefing'), type: 'richtext', required: true },
        { id: 'media', label: t('wizard.sectionDefinitions.safety.fields.media'), type: 'media', required: false,
          accept: 'image/*,video/*',
          help: t('wizard.sectionDefinitions.safety.fields.mediaHelp') }
      ],
      defaultContent: {
        ppe: [],
        safety_briefing: '',
        precautions: [],
        media: []
      }
    },
    { 
      id: 'hazards', 
      name: t('wizard.sectionDefinitions.hazards.name'),
      description: t('wizard.sectionDefinitions.hazards.description'),
      emoji: '🚫',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'hazard_description', label: t('wizard.sectionDefinitions.hazards.fields.hazard_description'), type: 'richtext', required: true,
          help: t('wizard.sectionDefinitions.hazards.fields.hazardHelp') },
        { id: 'media', label: t('wizard.sectionDefinitions.hazards.fields.media'), type: 'media', required: false,
          accept: 'image/*',
          help: t('wizard.sectionDefinitions.hazards.fields.mediaHelp') }
      ],
      defaultContent: {
        hazard_description: '',
        media: []
      }
    },
    { 
      id: 'procedure', 
      name: t('wizard.sectionDefinitions.procedure.name'),
      description: t('wizard.sectionDefinitions.procedure.description'),
      emoji: '📝',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      stepLevelMedia: true, 
      fields: [
        { id: 'steps', label: t('wizard.sectionDefinitions.procedure.fields.steps'), type: 'steps', required: true,
          supportsMedia: true,
          help: t('wizard.sectionDefinitions.procedure.fields.stepsHelp') }
      ],
      defaultContent: {
        steps: []
      }
    },
    { 
      id: 'disposal', 
      name: t('wizard.sectionDefinitions.disposal.name'),
      description: t('wizard.sectionDefinitions.disposal.description'),
      emoji: '♻️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'disposal_instructions', label: t('wizard.sectionDefinitions.disposal.fields.disposal_instructions'), type: 'richtext', required: true,
          help: t('wizard.sectionDefinitions.disposal.fields.disposalHelp') },
        { id: 'media', label: t('wizard.sectionDefinitions.disposal.fields.media'), type: 'media', required: false,
          accept: 'image/*',
          help: t('wizard.sectionDefinitions.disposal.fields.mediaHelp') }
      ],
      defaultContent: {
        disposal_instructions: '',
        media: []
      }
    }
  ];

  const [basicInfo, setBasicInfo] = useState(savedState?.basicInfo || {
    title: '',
    duration: '',
    course: '',
    program: ''
  });

  const [selectedSectionIds, setSelectedSectionIds] = useState(() => {
    if (savedState?.selectedSectionIds) {
      return savedState.selectedSectionIds;
    }
    
    if (savedState?.selectedSections) {
      return savedState.selectedSections.map(s => s.id);
    }
    
    return [];
  });

  const [customSections, setCustomSections] = useState(savedState?.customSections || []);

  const selectedSections = selectedSectionIds
    .map(id => {
      const available = availableSections.find(s => s.id === id);
      if (available) return available;
      
      const custom = customSections.find(s => s.id === id);
      if (custom) return custom;
      
      return null;
    })
    .filter(Boolean);
  const [sectionContent, setSectionContent] = useState(savedState?.sectionContent || {});
  const [touched, setTouched] = useState({});
  
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const [createdExperiment, setCreatedExperiment] = useState(null);

  const [customSectionDialog, setCustomSectionDialog] = useState(false);
  const [newCustomSectionName, setNewCustomSectionName] = useState('');
  const [newCustomSectionDescription, setNewCustomSectionDescription] = useState('');
  const [discardDialog, setDiscardDialog] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const wizardSessionId = `wizard_${Date.now()}`;
    const savedHistory = localStorage.getItem(`chat_history_${wizardSessionId}`);
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to load wizard chat history:', err);
        setChatHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    const wizardSessionId = 'wizard_current';
    if (chatHistory.length > 0) {
      localStorage.setItem(`chat_history_${wizardSessionId}`, JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem(`chat_history_${wizardSessionId}`);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!existingExperiment && (basicInfo.title || selectedSectionIds.length > 0)) {
      const stateToSave = {
        basicInfo,
        selectedSectionIds,
        customSections,
        sectionContent,
        currentStep,
        completedSteps: Array.from(completedSteps),
        timestamp: Date.now()
      };
      try {
        localStorage.setItem('wizardState', JSON.stringify(stateToSave));
      } catch (error) {
      }
    }
  }, [basicInfo, selectedSectionIds, customSections, sectionContent, currentStep, completedSteps, existingExperiment]);

  const clearSavedState = () => {
    try {
      localStorage.removeItem('wizardState');
    } catch (error) {
    }
  };

  useEffect(() => {
    if (existingExperiment) {
      const canonical = toCanonical(existingExperiment);
      
      setBasicInfo({
        title: canonical.title || '',
        duration: canonical.content?.config?.duration || '',
        course: canonical.content?.config?.subject || '',
        program: canonical.content?.config?.gradeLevel || ''
      });

      const wizardState = toWizardState(canonical.content.sections);
      setSectionContent(wizardState);
      
      const sectionIds = canonical.content.sections.map(section => section.id);
      setSelectedSectionIds(sectionIds);
      
      const customSecs = canonical.content.sections
        .filter(section => {
          const isStandard = availableSections.find(s => s.id === section.id);
          return !isStandard;
        })
        .map(section => ({
          id: section.id,
          name: section.name,
          isCustom: true,
          emoji: '📝',
          category: 'custom',
          required: false,
          locked: false,
          fields: [
            { id: 'content', label: 'Content', type: 'richtext', required: false }
          ],
          defaultContent: { content: '' }
        }));
      
      if (customSecs.length > 0) {
        setCustomSections(customSecs);
      }
    }
  }, [existingExperiment, availableSections]);

  const toggleSection = useCallback((section) => {
    if (section.locked) return;
    
    setSelectedSectionIds(prev => {
      const exists = prev.includes(section.id);
      if (exists) {
        return prev.filter(id => id !== section.id);
      } else {
        return [...prev, section.id];
      }
    });
  }, []);

  const handleAddCustomSection = useCallback(() => {
    if (!newCustomSectionName.trim()) return;
    
    const customId = `custom_${Date.now()}`;
    const customSection = {
      id: customId,
      name: newCustomSectionName.trim(),
      description: newCustomSectionDescription.trim(),
      emoji: '📝',
      category: 'custom',
      required: false,
      locked: false,
      isCustom: true,
      fields: [
        { id: 'content', label: 'Content', type: 'richtext', required: false }
      ],
      defaultContent: { content: '' }
    };
    
    setCustomSections(prev => [...prev, customSection]);
    setSelectedSectionIds(prev => [...prev, customId]);
    
    setNewCustomSectionName('');
    setNewCustomSectionDescription('');
    setCustomSectionDialog(false);
  }, [newCustomSectionName, newCustomSectionDescription]);

  const deleteCustomSection = useCallback((sectionId) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setSelectedSectionIds(prev => prev.filter(id => id !== sectionId));
    setSectionContent(prev => {
      const newContent = { ...prev };
      delete newContent[sectionId];
      return newContent;
    });
  }, []);

  const updateSectionContent = useCallback((sectionId, fieldId, value) => {
    setSectionContent(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value
      }
    }));
  }, []);

  const updateBasicInfo = useCallback((field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      setSectionContent(prev => ({
        ...prev,
        title_header: {
          ...prev.title_header,
          title: basicInfo.title || prev.title_header?.title || '',
          duration: basicInfo.duration || prev.title_header?.duration || '',
          course: basicInfo.course || prev.title_header?.course || '',
          program: basicInfo.program || prev.title_header?.program || ''
        }
      }));
    }
  }, [currentStep, basicInfo]);

  const hasContent = useCallback((content) => {
    if (typeof content === 'string') {
      return content.trim().length > 0;
    }
    
    
    if (Array.isArray(content)) {
      return content.length > 0 && content.some(item => 
        typeof item === 'string' ? item.trim().length > 0 : true
      );
    }
    
    
    if (typeof content === 'object' && content !== null) {
      return Object.values(content).some(value => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return value.length > 0 && value.some(item => 
            typeof item === 'string' ? item.trim().length > 0 : true
          );
        }
        return value !== null && value !== undefined;
      });
    }
    
    return false;
  }, []);
  
  const validateStep = useCallback((step) => {
    switch (step) {
      case 0: 
        return basicInfo.title.trim();
      
      case 1: 
        return selectedSections.length > 0;
      
      case 2: 
        const hasAnyContent = selectedSections.some(section => {
          const content = sectionContent[section.id] || section.defaultContent;
          return hasContent(content);
        });
        return hasAnyContent;
      
      case 3: 
        return true;
      
      case 4: 
        return true;
      
      default:
        return true;
    }
  }, [basicInfo, selectedSections, sectionContent, hasContent]);

  const getValidationMessage = useCallback((step) => {
    switch (step) {
      case 0:
        if (!basicInfo.title.trim()) {
          return t('wizard.validation.titleRequired');
        }
        return '';
      
      case 1:
        if (selectedSections.length === 0) {
          return t('wizard.validation.sectionRequired');
        }
        return '';
      
      case 2:
        const hasAnyContent = selectedSections.some(section => {
          const content = sectionContent[section.id] || section.defaultContent;
          return hasContent(content);
        });
        if (!hasAnyContent) {
          return t('wizard.validation.contentRequired');
        }
        return '';
      
      default:
        return '';
    }
  }, [basicInfo, selectedSections, sectionContent, hasContent, t]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (!completedSteps.has(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
    }
  }, [currentStep, completedSteps, validateStep, wizardSteps.length]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleCreateExperiment = useCallback(async () => {
    try {
      setIsCreating(true);
      setCreationError(null);

      console.log('[Wizard] Section content before conversion:', sectionContent);
      console.log('[Wizard] Selected sections:', selectedSections);

      const canonicalSections = fromWizardState(sectionContent, selectedSections);

      console.log('[Wizard] Canonical sections after conversion:', canonicalSections);

      const experimentData = {
        name: basicInfo.title.trim(),
        description: basicInfo.description?.trim() || '',
        duration: basicInfo.duration.trim() || '',
        subject: basicInfo.course.trim() || '',
        gradeLevel: basicInfo.program.trim() || '',
        sections: canonicalSections
      };

      console.log('[Wizard] Final experiment data being sent:', experimentData);

      let result;
      if (existingExperiment) {
        result = await experimentService.updateFromWizard(existingExperiment.id, experimentData);
      } else {
        result = await experimentService.createFromWizard(experimentData);
      }
      
      console.log('[Wizard] Server response:', result);
      
      setCreatedExperiment(result);
      setIsCreating(false);
      
      clearSavedState();
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('[Wizard] Error creating/updating experiment:', error);
      setCreationError(error.message || `Failed to ${existingExperiment ? 'update' : 'create'} experiment`);
      setIsCreating(false);
    }
  }, [basicInfo, selectedSections, sectionContent, existingExperiment, onComplete]);

  const handleCancel = useCallback(() => {
    if (basicInfo.title || selectedSectionIds.length > 0) {
      setDiscardDialog(true);
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  }, [basicInfo.title, selectedSectionIds.length, onCancel]);

  const handleDiscardConfirm = () => {
    clearSavedState();
    setDiscardDialog(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleDiscardCancel = () => {
    setDiscardDialog(false);
    if (onCancel) {
      onCancel();
    }
  };

  const renderBasicInfoStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.steps.basicInfo')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('wizard.steps.basicInfoDesc')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('wizard.basicInfo.experimentTitle')}
            value={basicInfo.title}
            onChange={(e) => updateBasicInfo('title', e.target.value)}
            error={touched.title && !basicInfo.title.trim()}
            helperText={touched.title && !basicInfo.title.trim() ? t('wizard.basicInfo.titleRequired') : ''}
            placeholder={t('wizard.basicInfo.titlePlaceholder')}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            mt: 2, 
            p: 2.5, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'grey.300'
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mb: 2, 
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {t('wizard.basicInfo.additionalDetails')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('wizard.basicInfo.duration')}
                  value={basicInfo.duration}
                  onChange={(e) => updateBasicInfo('duration', e.target.value)}
                  placeholder={t('wizard.basicInfo.durationPlaceholder')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('wizard.basicInfo.course')}
                  value={basicInfo.course}
                  onChange={(e) => updateBasicInfo('course', e.target.value)}
                  placeholder={t('wizard.basicInfo.coursePlaceholder')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('wizard.basicInfo.program')}
                  value={basicInfo.program}
                  onChange={(e) => updateBasicInfo('program', e.target.value)}
                  placeholder={t('wizard.basicInfo.programPlaceholder')}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{t('wizard.basicInfo.tip')}</strong> {t('wizard.basicInfo.tipMessage')}
        </Typography>
      </Alert>
    </Box>
  );

  const renderSectionsStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.steps.selectSections')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('wizard.steps.selectSectionsDesc')}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('wizard.sections.availableSections')}
        </Typography>
        <Grid container spacing={2}>
          {availableSections
            .filter(section => section.category === 'optional')
            .map(section => {
              const isSelected = selectedSections.some(s => s.id === section.id);
              return (
                <Grid item xs={12} md={6} key={section.id}>
                  <SectionCard 
                    selected={isSelected} 
                    locked={false}
                    onClick={() => toggleSection(section)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h4">{section.emoji}</Typography>
                        <Box flex={1}>
                          <Typography variant="h6">{section.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.description}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          icon={<UncheckIcon />}
                          checkedIcon={<CheckIcon />}
                        />
                      </Box>
                    </CardContent>
                  </SectionCard>
                </Grid>
              );
            })}
        </Grid>
      </Box>

      {selectedSections.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('wizard.sections.selectedSectionsDrag')}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t('wizard.sections.dragInfo')}
            </Typography>
          </Alert>
          <Stack spacing={1}>
            {selectedSections.map((section, index) => (
              <Paper
                key={section.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  const toIndex = index;
                  if (fromIndex !== toIndex) {
                    const newIds = [...selectedSectionIds];
                    const [movedId] = newIds.splice(fromIndex, 1);
                    newIds.splice(toIndex, 0, movedId);
                    setSelectedSectionIds(newIds);
                  }
                }}
                sx={{
                  p: 2,
                  cursor: 'move',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <DragIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="h5">{section.emoji}</Typography>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {section.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>
                <Chip label={`#${index + 1}`} size="small" />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => toggleSection(section)}
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('wizard.sections.customSections')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCustomSectionDialog(true)}
          >
            {t('wizard.sections.addCustomSection')}
          </Button>
        </Box>

        {customSections.length > 0 ? (
          <Grid container spacing={2}>
            {customSections.map(section => (
              <Grid item xs={12} md={6} key={section.id}>
                <SectionCard selected={true} locked={false}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h4">{section.emoji}</Typography>
                      <Box flex={1}>
                        <Typography variant="h6">{section.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description || t('wizard.sections.customSectionDefault')}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteCustomSection(section.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </SectionCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            {t('wizard.sections.noCustomSections')}
          </Alert>
        )}
      </Box>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          {t('wizard.sections.sectionsSelectedCount', { count: selectedSections.length })}
        </Typography>
      </Alert>
    </Box>
  );

  const renderContentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.steps.fillContent')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('wizard.steps.fillContentDesc')}
      </Typography>

      <Stack spacing={4} sx={{ mt: 3 }}>
        {selectedSections.map(section => (
          <Paper key={section.id} sx={{ p: 3, borderLeft: 4, borderColor: 'primary.main' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h4">{section.emoji}</Typography>
              <Typography variant="h6">{section.name}</Typography>
              {section.id === 'title_header' && (
                <Chip 
                  label={t('wizard.content.autoFilled')}
                  size="small" 
                  color="success" 
                  variant="outlined"
                  icon={<CheckIcon />}
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {section.description}
            </Typography>

            {section.id === 'title_header' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('wizard.content.autoFilledInfo')}
              </Alert>
            )}

            <Stack spacing={3}>
              {section.fields?.map(field => (
                <Box key={field.id}>
                  {field.type === 'text' && (
                    <TextField
                      fullWidth
                      required={field.required}
                      label={field.label}
                      value={sectionContent[section.id]?.[field.id] || ''}
                      onChange={(e) => updateSectionContent(section.id, field.id, e.target.value)}
                      multiline={field.multiline}
                      rows={field.rows || 1}
                    />
                  )}
                  
                  {field.type === 'richtext' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label} {field.required && '*'}
                      </Typography>
                      <RichTextEditor
                        value={sectionContent[section.id]?.[field.id] || ''}
                        onChange={(value) => updateSectionContent(section.id, field.id, value)}
                      />
                    </Box>
                  )}
                  
                  {field.type === 'list' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label} {field.required && '*'}
                      </Typography>
                      <ListInput
                        items={sectionContent[section.id]?.[field.id] || []}
                        onChange={(items) => updateSectionContent(section.id, field.id, items)}
                        placeholder={`Add ${field.label.toLowerCase()}...`}
                      />
                    </Box>
                  )}

                  {field.type === 'steps' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label} {field.required && '*'}
                      </Typography>
                      {field.help && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="caption">{field.help}</Typography>
                        </Alert>
                      )}
                      <ProcedureStepsEditor
                        steps={sectionContent[section.id]?.[field.id] || []}
                        onChange={(steps) => updateSectionContent(section.id, field.id, steps)}
                      />
                    </Box>
                  )}

                  {field.type === 'media' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label} {field.required && '*'}
                      </Typography>
                      {field.help && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <Typography variant="caption">{field.help}</Typography>
                        </Alert>
                      )}
                      <MediaUploader
                        media={sectionContent[section.id]?.[field.id] || []}
                        onChange={(media) => updateSectionContent(section.id, field.id, media)}
                        acceptImages={!field.accept || field.accept.includes('image')}
                        acceptVideos={!field.accept || field.accept.includes('video')}
                        maxFiles={10}
                        maxSize={10}
                        showSafetyIcons={section.id === 'safety'}
                        showHazardIcons={section.id === 'hazards'}
                      />
                    </Box>
                  )}
                  
                  {field.type === 'materials_with_media' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label} {field.required && '*'}
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          {t('wizard.content.materialInfo')}
                        </Typography>
                      </Alert>
                      
                      <Stack spacing={2}>
                        {(sectionContent[section.id]?.[field.id] || []).map((item, index) => (
                          <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {t('wizard.content.materialNumber', { number: index + 1 })}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={2}>
                              <TextField
                                fullWidth
                                label={t('wizard.content.materialName')}
                                placeholder={t('wizard.content.materialPlaceholder')}
                                value={item.name || ''}
                                onChange={(e) => {
                                  const items = [...(sectionContent[section.id]?.[field.id] || [])];
                                  items[index] = { ...items[index], name: e.target.value };
                                  updateSectionContent(section.id, field.id, items);
                                }}
                                required
                              />
                              
                              {item.media && item.media.data ? (
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    {t('wizard.content.referencePhoto')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Box
                                      component="img"
                                      src={item.media.data}
                                      alt={item.media.name || 'Material photo'}
                                      sx={{
                                        width: 120,
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                      }}
                                    />
                                    <Stack spacing={1}>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        component="label"
                                      >
                                        {t('wizard.content.replacePhoto')}
                                        <input
                                          type="file"
                                          hidden
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                const items = [...(sectionContent[section.id]?.[field.id] || [])];
                                                items[index] = {
                                                  ...items[index],
                                                  media: {
                                                    data: reader.result,
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size
                                                  }
                                                };
                                                updateSectionContent(section.id, field.id, items);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="text"
                                        color="error"
                                        onClick={() => {
                                          const items = [...(sectionContent[section.id]?.[field.id] || [])];
                                          items[index] = { ...items[index], media: null };
                                          updateSectionContent(section.id, field.id, items);
                                        }}
                                      >
                                        {t('wizard.content.removePhoto')}
                                      </Button>
                                    </Stack>
                                  </Box>
                                </Box>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  component="label"
                                  sx={{ alignSelf: 'flex-start' }}
                                >
                                  {t('wizard.content.addPhoto')}
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const items = [...(sectionContent[section.id]?.[field.id] || [])];
                                          items[index] = {
                                            ...items[index],
                                            media: {
                                              data: reader.result,
                                              name: file.name,
                                              type: file.type,
                                              size: file.size
                                            }
                                          };
                                          updateSectionContent(section.id, field.id, items);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </Button>
                              )}
                              
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const items = (sectionContent[section.id]?.[field.id] || []).filter((_, i) => i !== index);
                                    updateSectionContent(section.id, field.id, items);
                                  }}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {t('wizard.content.removeMaterial')}
                                </Button>
                              </Box>
                            </Stack>
                          </Card>
                        ))}
                        
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            const items = [...(sectionContent[section.id]?.[field.id] || []), { name: '', media: null }];
                            updateSectionContent(section.id, field.id, items);
                          }}
                        >
                          {t('wizard.content.addMaterial')}
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  const renderContentReviewStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.steps.contentReview')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('wizard.steps.contentReviewDesc')}
      </Typography>

      <ContentReviewPanel
        experimentData={{
          title: basicInfo.title,
          duration: basicInfo.duration,
          course: basicInfo.course,
          program: basicInfo.program,
          sections: selectedSections.map(section => ({
            ...section,
            content: sectionContent[section.id] || section.defaultContent
          }))
        }}
        showPolishSection={false}
        onUpdate={(updates) => {
          
          if (updates.title !== undefined) {
            setBasicInfo(prev => ({ ...prev, title: updates.title }));
          }
          
          
          if (updates.sections) {
            updates.sections.forEach(updatedSection => {
              if (updatedSection.content) {
                setSectionContent(prev => ({
                  ...prev,
                  [updatedSection.id]: {
                    ...(prev[updatedSection.id] || {}),
                    ...updatedSection.content
                  }
                }));
              }
            });
          }
        }}
      />
    </Box>
  );

  const renderPreviewStep = () => {
    
    const previewData = {
      title: basicInfo.title,
      duration: basicInfo.duration,
      course: basicInfo.course,
      program: basicInfo.program,
      sections: selectedSections.map(section => ({
        id: section.id,
        name: section.name,
        type: section.type,
        content: sectionContent[section.id] || {}
      }))
    };

    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {t('wizard.steps.preview')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('wizard.steps.previewDesc')}
        </Typography>

        {!keycloakService.isAuthenticated() && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>{t('wizard.preview.notLoggedIn')}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              {t('wizard.preview.needLogin')}
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => keycloakService.login()}
              sx={{ mt: 1 }}
            >
              {t('wizard.preview.loginNow')}
            </Button>
          </Alert>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 3, 
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 2
          }}
        >
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            {t('wizard.preview.studentViewPreview')}
          </Typography>
          
          <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {previewData.title || t('wizard.preview.untitledExperiment')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, justifyContent: 'center' }}>
              {previewData.duration && (
                <Chip label={t('wizard.preview.durationLabel', { duration: previewData.duration })} variant="outlined" />
              )}
              {previewData.course && (
                <Chip label={t('wizard.preview.courseLabel', { course: previewData.course })} variant="outlined" />
              )}
              {previewData.program && (
                <Chip label={t('wizard.preview.programLabel', { program: previewData.program })} variant="outlined" />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {previewData.sections.length === 0 ? (
            <Alert severity="info">
              {t('wizard.preview.noSections')}
            </Alert>
          ) : (
            <Stack spacing={4}>
              {previewData.sections.map((section, index) => {
                const sectionDef = availableSections.find(s => s.id === section.id);
                
                
                const hasContent = Object.entries(section.content).some(([key, value]) => {
                  if (!value) return false;
                  if (Array.isArray(value) && value.length === 0) return false;
                  if (typeof value === 'string' && value.trim() === '') return false;
                  return true;
                });
                
                
                if (!hasContent) return null;
                
                return (
                  <Box key={section.id}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      {sectionDef?.emoji} {section.name}
                    </Typography>
                    
                    <Box sx={{ pl: 2 }}>
                      {section.content.media && Array.isArray(section.content.media) && section.content.media.length > 0 && section.id !== 'safety' && section.id !== 'hazards' && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            alignItems: 'center'
                          }}>
                            {section.content.media.map((mediaItem, mediaIndex) => (
                              <Box 
                                key={mediaIndex} 
                                sx={{ 
                                  textAlign: 'center',
                                  maxWidth: '700px',
                                  width: '100%'
                                }}
                              >
                                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Size:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[50, 75, 100].map((size) => (
                                      <Button
                                        key={size}
                                        size="small"
                                        variant={mediaItem.displaySize === size || (!mediaItem.displaySize && size === 100) ? 'contained' : 'outlined'}
                                        onClick={() => {
                                          const updatedMedia = [...section.content.media];
                                          updatedMedia[mediaIndex] = { ...mediaItem, displaySize: size };
                                          updateSectionContent(section.id, 'media', updatedMedia);
                                        }}
                                        sx={{ minWidth: 'auto', px: 1.5, py: 0.5 }}
                                      >
                                        {size}%
                                      </Button>
                                    ))}
                                  </Box>
                                </Box>
                                
                                {mediaItem.type?.startsWith('image') ? (
                                  <Box sx={{ 
                                    width: `${mediaItem.displaySize || 100}%`,
                                    mx: 'auto'
                                  }}>
                                    <Box
                                      component="img"
                                      src={mediaItem.data}
                                      alt={mediaItem.caption || mediaItem.name || `Figure ${mediaIndex + 1}`}
                                      sx={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 1,
                                        objectFit: 'cover',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        mb: 1.5,
                                        transition: 'all 0.3s ease'
                                      }}
                                    />
                                  </Box>
                                ) : mediaItem.type?.startsWith('video') ? (
                                  <Box sx={{ 
                                    width: `${mediaItem.displaySize || 100}%`,
                                    mx: 'auto'
                                  }}>
                                    <Box
                                      component="video"
                                      controls
                                      sx={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        mb: 1.5
                                      }}
                                    >
                                      <source src={mediaItem.data} type={mediaItem.type} />
                                      Your browser does not support the video tag.
                                    </Box>
                                  </Box>
                                ) : null}
                                
                                {mediaItem.caption && (
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      color: 'text.primary',
                                      fontSize: '0.95rem',
                                      lineHeight: 1.6,
                                      textAlign: 'center',
                                      maxWidth: '600px',
                                      mx: 'auto'
                                    }}
                                  >
                                    <Box component="span" sx={{ fontWeight: 600 }}>
                                      Figure {mediaIndex + 1}:
                                    </Box>{' '}
                                    {mediaItem.caption}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {section.content.steps && Array.isArray(section.content.steps) ? (
                          <Box>
                            {section.content.steps.map((step, stepIndex) => (
                              <Box 
                                key={stepIndex} 
                                sx={{ 
                                  display: 'flex', 
                                  gap: 2, 
                                  mb: 3,
                                  pb: 2,
                                  borderBottom: stepIndex < section.content.steps.length - 1 ? '1px solid' : 'none',
                                  borderColor: 'divider'
                                }}
                              >
                                <Box
                                  sx={{
                                    minWidth: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    flexShrink: 0
                                  }}
                                >
                                  {stepIndex + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {typeof step === 'string' ? step : step.text || '(Empty step)'}
                                  </Typography>
                                  {typeof step === 'object' && step.notes && (
                                    <Box 
                                      sx={{ 
                                        mt: 2, 
                                        p: 2, 
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                        borderLeft: '3px solid',
                                        borderColor: 'primary.light'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: step.notes }}
                                    />
                                  )}
                                  {typeof step === 'object' && step.media && step.media.length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                      {step.media.map((mediaItem, mediaIndex) => (
                                        <Box key={mediaIndex} sx={{ maxWidth: 300 }}>
                                          {mediaItem.type?.startsWith('image/') ? (
                                            <img
                                              src={mediaItem.data}
                                              alt={mediaItem.caption || `Media ${mediaIndex + 1}`}
                                              style={{
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                              }}
                                            />
                                          ) : mediaItem.type?.startsWith('video/') ? (
                                            <video
                                              controls
                                              style={{
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px'
                                              }}
                                            >
                                              <source src={mediaItem.data} type={mediaItem.type} />
                                              Your browser does not support the video tag.
                                            </video>
                                          ) : null}
                                          {mediaItem.caption && (
                                            <Typography 
                                              variant="caption" 
                                              sx={{ 
                                                display: 'block', 
                                                mt: 1, 
                                                color: 'text.secondary',
                                                fontStyle: 'italic'
                                              }}
                                            >
                                              {mediaItem.caption}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          
                          (() => {
                            
                            const nonMediaFields = Object.entries(section.content).filter(([key, value]) => {
                              if (key === 'media') return false;
                              if (!value) return false;
                              if (Array.isArray(value) && value.length === 0) return false;
                              if (typeof value === 'string' && value.trim() === '') return false;
                              return true;
                            });
                            
                            const hasOnlyOneField = nonMediaFields.length === 1;
                            
                            return Object.entries(section.content).map(([key, value]) => {
                              
                              if (!value) return null;
                              
                              
                              if (Array.isArray(value) && value.length === 0) return null;
                              
                              
                              if (typeof value === 'string' && value.trim() === '') return null;
                              
                              
                              if (key === 'media') return null;
                              
                              return (
                                <Box key={key} sx={{ mb: 2 }}>
                                  {!hasOnlyOneField && (
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                                      {key.replace(/_/g, ' ')}
                                    </Typography>
                                  )}
                                  {Array.isArray(value) ? (
                                    
                                    value.length > 0 && typeof value[0] === 'object' && 'name' in value[0] ? (
                                      <Stack spacing={2}>
                                        {value.map((item, i) => (
                                          <Box key={i}>
                                            <Typography variant="body2" sx={{ fontSize: '1.05rem', mb: 1 }}>
                                              • {item.name || '(Unnamed item)'}
                                            </Typography>
                                            {item.media && item.media.data && (
                                              <Box
                                                component="img"
                                                src={item.media.data}
                                                alt={item.name || `Item ${i + 1}`}
                                                sx={{
                                                  width: 150,
                                                  height: 150,
                                                  objectFit: 'cover',
                                                  borderRadius: 1,
                                                  border: '1px solid',
                                                  borderColor: 'divider',
                                                  ml: 2
                                                }}
                                              />
                                            )}
                                          </Box>
                                        ))}
                                      </Stack>
                                    ) : (
                                      
                                      <List dense>
                                        {value.map((item, i) => (
                                          <ListItem key={i} sx={{ py: 0.5 }}>
                                            <Typography variant="body2">
                                              • {typeof item === 'string' ? item : JSON.stringify(item)}
                                            </Typography>
                                          </ListItem>
                                        ))}
                                      </List>
                                    )
                                  ) : typeof value === 'string' ? (
                                    /<[a-z][\s\S]*>/i.test(value) ? (
                                      <Box dangerouslySetInnerHTML={{ __html: value }} sx={{ fontSize: '1.05rem' }} />
                                    ) : (
                                      <Typography variant="body2">{value}</Typography>
                                    )
                                  ) : typeof value === 'object' ? (
                                    <Typography variant="body2" color="text.secondary">(Complex data)</Typography>
                                ) : (
                                  <Typography variant="body2">{String(value)}</Typography>
                                )}
                              </Box>
                            );
                          });
                        })()
                        )}
                        
                        {section.content.media && Array.isArray(section.content.media) && section.content.media.length > 0 && section.id === 'safety' && (
                          <Box sx={{ mt: 3 }}>
                            <Box sx={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                              gap: 1.5,
                              maxWidth: '600px'
                            }}>
                              {section.content.media.map((mediaItem, mediaIndex) => (
                                <Box 
                                  key={mediaIndex} 
                                  sx={{ 
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                  }}
                                >
                                  {mediaItem.type?.startsWith('image') ? (
                                    <Box
                                      component="img"
                                      src={mediaItem.data}
                                      alt={mediaItem.caption || mediaItem.name || `Safety icon ${mediaIndex + 1}`}
                                      sx={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: 0,
                                        objectFit: 'contain',
                                        mb: 0.5
                                      }}
                                    />
                                  ) : null}
                                  
                                  {mediaItem.caption && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        display: 'block',
                                        color: 'text.secondary',
                                        fontSize: '0.7rem',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {mediaItem.caption}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {section.content.media && Array.isArray(section.content.media) && section.content.media.length > 0 && section.id === 'hazards' && (
                          <Box sx={{ mt: 3 }}>
                            <Box sx={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                              gap: 1.5,
                              maxWidth: '600px'
                            }}>
                              {section.content.media.map((mediaItem, mediaIndex) => (
                                <Box 
                                  key={mediaIndex} 
                                  sx={{ 
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                  }}
                                >
                                  {mediaItem.type?.startsWith('image') ? (
                                    <Box
                                      component="img"
                                      src={mediaItem.data}
                                      alt={mediaItem.caption || mediaItem.name || `Hazard pictogram ${mediaIndex + 1}`}
                                      sx={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: 0,
                                        objectFit: 'contain',
                                        mb: 0.5
                                      }}
                                    />
                                  ) : null}
                                  
                                  {mediaItem.caption && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        display: 'block',
                                        color: 'text.secondary',
                                        fontSize: '0.7rem',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {mediaItem.caption}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Paper>

        <Box sx={{ mt: 4 }}>
          {creationError && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                creationError.includes('not authenticated') && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => keycloakService.login()}
                  >
                    {t('wizard.preview.loginNow')}
                  </Button>
                )
              }
            >
              {creationError}
              {creationError.includes('not authenticated') && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {t('wizard.preview.needLogin')}
                </Typography>
              )}
            </Alert>
          )}
        
        {createdExperiment ? (
          <Alert severity="success">
            <Typography variant="body2">
              {t('wizard.preview.experimentCreatedId', { id: createdExperiment.id })}
            </Typography>
          </Alert>
        ) : (
          <PrimaryButton
            fullWidth
            size="large"
            onClick={handleCreateExperiment}
            disabled={isCreating || !keycloakService.isAuthenticated()}
            startIcon={isCreating ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isCreating 
              ? (existingExperiment ? t('wizard.preview.updatingExperiment') : t('wizard.preview.creatingExperiment')) 
              : (existingExperiment ? t('wizard.preview.updateExperiment') : t('wizard.preview.createExperiment'))
            }
          </PrimaryButton>
        )}
        </Box>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfoStep();
      case 1: return renderSectionsStep();
      case 2: return renderContentStep();
      case 3: return renderContentReviewStep();
      case 4: return renderPreviewStep();
      default: return null;
    }
  };

  
  
  
  
  return (
    <>
      <WizardContainer>
        {savedState && !existingExperiment && (
          <Alert 
            severity="info" 
            sx={{ m: 3, mb: 0 }}
            action={
              <Button color="inherit" size="small" onClick={clearSavedState}>
                Clear Draft
              </Button>
            }
          >
          </Alert>
        )}

        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <WizardStepper
            steps={wizardSteps}
            activeStep={currentStep}
            completedSteps={completedSteps}
          />
        </Box>

        <StepContent>
          {renderStepContent()}
        </StepContent>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <SecondaryButton
            onClick={handleBack}
            disabled={currentStep === 0}
            startIcon={<BackIcon />}
          >
            {t('wizard.navigation.back')}
          </SecondaryButton>

          <Box display="flex" gap={2}>
            {onCancel && (
              <SecondaryButton onClick={handleCancel}>
                {t('wizard.navigation.cancel')}
              </SecondaryButton>
            )}
            
            {currentStep < wizardSteps.length - 1 && (
              <Tooltip 
                title={!validateStep(currentStep) ? getValidationMessage(currentStep) : ''}
                arrow
                placement="top"
              >
                <span>
                  <PrimaryButton
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    endIcon={<NextIcon />}
                  >
                    {t('wizard.navigation.next')}
                  </PrimaryButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </WizardContainer>

      <Dialog
        open={customSectionDialog}
        onClose={() => setCustomSectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('wizard.sections.addCustomDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              required
              label={t('wizard.sections.addCustomDialog.sectionName')}
              value={newCustomSectionName}
              onChange={(e) => setNewCustomSectionName(e.target.value)}
              placeholder={t('wizard.sections.addCustomDialog.namePlaceholder')}
            />
            <TextField
              fullWidth
              label={t('wizard.sections.addCustomDialog.description')}
              value={newCustomSectionDescription}
              onChange={(e) => setNewCustomSectionDescription(e.target.value)}
              placeholder={t('wizard.sections.addCustomDialog.descriptionPlaceholder')}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomSectionDialog(false)}>
            {t('wizard.sections.addCustomDialog.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustomSection}
            disabled={!newCustomSectionName.trim()}
          >
            {t('wizard.sections.addCustomDialog.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={discardDialog} 
        onClose={() => setDiscardDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'warning.main'
            }}
          >
            <DeleteOutline sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {t('wizard.draft.discardTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('wizard.draft.discardSubtitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('wizard.draft.unsavedChanges')}
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>✓</Box>
              {t('wizard.draft.keepDraft')}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>✕</Box>
              {t('wizard.draft.discardDraft')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={handleDiscardCancel} 
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            {t('wizard.draft.keepButton')}
          </Button>
          <Button 
            onClick={handleDiscardConfirm} 
            variant="contained" 
            color="error"
            size="large"
            startIcon={<DeleteOutline />}
            sx={{ minWidth: 120 }}
          >
            {t('wizard.draft.discardButton')}
          </Button>
        </DialogActions>
      </Dialog>

      <Tooltip title={t('llm.chat.openAssistant', 'Open AI Assistant')} placement="left">
        <Fab
          color="secondary"
          aria-label="ai assistant"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '700px',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={aiAssistantIcon}
              alt="AI Assistant"
              sx={{ width: 28, height: 28, objectFit: 'contain' }}
            />
            <Typography variant="h6">{t('llm.chat.title', 'AI Assistant')}</Typography>
          </Box>
          <IconButton onClick={() => setChatOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <ChatAssistant
            title=""
            placeholder={t('llm.chat.placeholder', 'Ask me anything about your experiment...')}
            initialMessages={chatHistory}
            onMessagesChange={setChatHistory}
            systemPrompt={`You are an AI assistant helping with scientific experiment design. You have access to the current experiment draft and should provide specific, relevant advice.

IMPORTANT RESTRICTIONS:
- ONLY answer questions related to scientific experiments, laboratory procedures, and experiment design
- DO NOT answer questions about math, homework, general knowledge, programming, or any non-experiment topics
- If asked about unrelated topics, politely decline and redirect to experiment creation help
- Example refusal: "I'm specifically designed to help with experiment design and creation. I can only answer questions related to your scientific experiment. How can I help you with your experiment?"

CURRENT EXPERIMENT DRAFT:
Title: ${basicInfo.title || '(not set yet)'}
Duration: ${basicInfo.duration || '(not set yet)'}
Course: ${basicInfo.course || '(not set yet)'}
Program: ${basicInfo.program || '(not set yet)'}

Selected Sections: ${selectedSectionIds.length > 0 ? selectedSectionIds.join(', ') : '(none selected yet)'}

Section Content:
${selectedSectionIds.map(sectionId => {
  const section = availableSections.find(s => s.id === sectionId) || customSections.find(s => s.id === sectionId);
  const sectionName = section?.name || sectionId;
  const content = sectionContent[sectionId];
  
  let summary = '(empty)';
  if (content) {
    if (typeof content === 'string') {
      summary = content.substring(0, 150) + (content.length > 150 ? '...' : '');
    } else if (Array.isArray(content)) {
      summary = `${content.length} items: ${content.slice(0, 3).join(', ')}${content.length > 3 ? '...' : ''}`;
    } else if (typeof content === 'object') {
      const keys = Object.keys(content);
      summary = `${keys.length} fields: ${keys.join(', ')}`;
    }
  }
  
  return `- ${sectionName}: ${summary}`;
}).join('\n')}

Current Step: ${currentStep + 1} of 3

INSTRUCTIONS:
1. Reference the specific experiment details above when answering questions
2. Provide practical, actionable advice tailored to this experiment
3. Suggest what sections to add based on the experiment type
4. Help fill out incomplete sections with relevant content
5. Point out inconsistencies or missing information
6. Recommend safety precautions based on mentioned materials
7. Guide through best practices for scientific experiments
8. STRICTLY stay within the scope of experiment design and laboratory procedures

Be specific to THIS experiment - help the user build it step by step. If they're stuck, suggest what to add next. Remember: ONLY discuss experiment-related topics.`}
            showHeader={false}
            maxHeight="100%"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModularExperimentWizard;
