import React, { useState, useCallback, useEffect } from 'react';
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
  Autocomplete
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
  Info as InfoIcon
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
import LLMPolishCheck from '../components/LLMPolishCheck';
import { experimentService } from '../services/exports.js';
import keycloakService from '../services/keycloakService.js';
import { toCanonical, toWizardState, fromWizardState } from '../utils/experimentCanonical.js';

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
  
  
  
  
  
  
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('wizardState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Failed to load saved state - user will start fresh
    }
    return null;
  };

  const savedState = loadSavedState();

  
  
  
  
  const wizardSteps = [
    { id: 'basic_info', label: 'Basic Information', description: 'Title, duration, course details' },
    { id: 'sections', label: 'Select Sections', description: 'Choose which sections to include' },
    { id: 'content', label: 'Fill Content', description: 'Add content to each section' },
    { id: 'ai_polish', label: 'AI Polish', description: 'Review and improve with AI' },
    { id: 'preview', label: 'Preview & Create', description: 'Final review and creation' }
  ];

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 0);
  const [completedSteps, setCompletedSteps] = useState(new Set(savedState?.completedSteps || []));

  
  
  
  
  
  const availableSections = React.useMemo(() => [
    
    { 
      id: 'objectives', 
      name: 'Learning Objectives', 
      description: 'Purpose and learning objectives of the experiment',
      emoji: '🎯',
      category: 'optional',
      required: false,
      locked: false,
      fields: [
        { id: 'purpose', label: 'Purpose and learning objectives of the experiment', type: 'richtext', required: true },
        { id: 'media', label: 'Supporting Media', type: 'media', required: false, help: 'Add images or videos to illustrate learning objectives' }
      ],
      defaultContent: {
        purpose: '',
        media: []
      }
    },
    { 
      id: 'background', 
      name: 'Background Theory', 
      description: 'Scientific principles and theoretical foundation',
      emoji: '🧠',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'content', label: 'Theoretical background, key principles, and biological/chemical context', type: 'richtext', required: true },
        { id: 'media', label: 'Workflow Diagrams & Illustrations', type: 'media', required: false, 
          accept: 'image/*,video/*', 
          help: 'Upload workflow diagrams, concept illustrations, or explanatory videos' }
      ],
      defaultContent: {
        content: '',
        media: []
      }
    },
    { 
      id: 'materials', 
      name: 'Materials & Equipment', 
      description: 'Lab equipment and materials (separate from chemicals)',
      emoji: '🧰',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true,
      fields: [
        { id: 'items', label: 'Materials and Equipment', type: 'materials_with_media', required: true, 
          help: 'Add each material or equipment item. You can attach a photo to each item.' }
      ],
      defaultContent: {
        items: []
      }
    },
    { 
      id: 'chemicals', 
      name: 'Chemicals & Reagents', 
      description: 'Chemical substances, concentrations, kits, primers',
      emoji: '☣️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true,
      fields: [
        { id: 'items', label: 'Chemicals, reagents, concentrations, and kits', type: 'list', required: true }
      ],
      defaultContent: {
        items: []
      }
    },
    { 
      id: 'safety', 
      name: 'Safety Measures', 
      description: 'Safety briefing and visual safety guides',
      emoji: '⚠️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'safety_briefing', label: 'Safety Briefing Notes', type: 'richtext', required: true },
        { id: 'media', label: 'Safety Visuals', type: 'media', required: false,
          accept: 'image/*,video/*',
          help: 'Upload safety icons, demonstration videos, or pictograms' }
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
      name: 'Potential Hazards', 
      description: 'Identify hazards, H-statements, and danger pictograms',
      emoji: '🚫',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'hazard_description', label: 'Hazard Information', type: 'richtext', required: true,
          help: 'Describe identified hazards, H-statements, and danger pictograms' },
        { id: 'media', label: 'Hazard Pictograms', type: 'media', required: false,
          accept: 'image/*',
          help: 'Add GHS pictograms or hazard warning icons' }
      ],
      defaultContent: {
        hazard_description: '',
        media: []
      }
    },
    { 
      id: 'procedure', 
      name: 'Step-by-Step Procedure', 
      description: 'Numbered steps with substeps and checkboxes',
      emoji: '📝',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      stepLevelMedia: true, 
      fields: [
        { id: 'steps', label: 'Procedure Steps', type: 'steps', required: true,
          supportsMedia: true,
          help: 'Add step-by-step instructions. Each step can include images/videos for visual guidance, and additional notes with tables and formatted text.' }
      ],
      defaultContent: {
        steps: []
      }
    },
    { 
      id: 'disposal', 
      name: 'Disposal Instructions', 
      description: 'Waste disposal and cleanup procedures',
      emoji: '♻️',
      category: 'optional',
      required: false,
      locked: false,
      supportsMedia: true, 
      fields: [
        { id: 'disposal_instructions', label: 'Disposal and Cleanup Instructions', type: 'richtext', required: true,
          help: 'Describe waste disposal procedures, waste categories, and cleanup steps' },
        { id: 'media', label: 'Waste Container Symbols & Disposal Diagrams', type: 'media', required: false,
          accept: 'image/*',
          help: 'Upload waste container symbols or disposal process diagrams' }
      ],
      defaultContent: {
        disposal_instructions: '',
        media: []
      }
    }
  ], []); 

  
  
  

  const [basicInfo, setBasicInfo] = useState(savedState?.basicInfo || {
    title: '',
    duration: '',
    course: '',
    program: ''
  });

  const [selectedSections, setSelectedSections] = useState(() => {
    if (savedState?.selectedSections) {
      return savedState.selectedSections;
    }
    
    return [];
  });

  const [customSections, setCustomSections] = useState(savedState?.customSections || []);
  const [sectionContent, setSectionContent] = useState(savedState?.sectionContent || {});
  const [touched, setTouched] = useState({});
  
  
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const [createdExperiment, setCreatedExperiment] = useState(null);

  
  const [customSectionDialog, setCustomSectionDialog] = useState(false);
  const [newCustomSectionName, setNewCustomSectionName] = useState('');
  const [newCustomSectionDescription, setNewCustomSectionDescription] = useState('');
  const [discardDialog, setDiscardDialog] = useState(false);

  
  useEffect(() => {
    // Auto-save wizard state to localStorage (except when editing existing experiment)
    if (!existingExperiment && (basicInfo.title || selectedSections.length > 0)) {
      const stateToSave = {
        basicInfo,
        selectedSections,
        customSections,
        sectionContent,
        currentStep,
        completedSteps: Array.from(completedSteps), 
        timestamp: Date.now()
      };
      try {
        localStorage.setItem('wizardState', JSON.stringify(stateToSave));
      } catch (error) {
        // Failed to save - continue without auto-save
      }
    }
  }, [basicInfo, selectedSections, customSections, sectionContent, currentStep, completedSteps, existingExperiment]);

  
  const clearSavedState = () => {
    try {
      localStorage.removeItem('wizardState');
    } catch (error) {
      // Failed to clear saved state - not critical
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
      
      
      const loadedSections = canonical.content.sections.map(section => {
        const template = availableSections.find(s => s.id === section.id);
        return template || { 
          id: section.id, 
          name: section.name, 
          isCustom: true 
        };
      });
      setSelectedSections(loadedSections);
    }
  }, [existingExperiment, availableSections]);

  
  
  
  
  const toggleSection = useCallback((section) => {
    if (section.locked) return; 
    
    setSelectedSections(prev => {
      const exists = prev.find(s => s.id === section.id);
      if (exists) {
        return prev.filter(s => s.id !== section.id);
      } else {
        return [...prev, { ...section, content: { ...section.defaultContent } }];
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
    setSelectedSections(prev => [...prev, customSection]);
    
    
    setNewCustomSectionName('');
    setNewCustomSectionDescription('');
    setCustomSectionDialog(false);
  }, [newCustomSectionName, newCustomSectionDescription]);

  const deleteCustomSection = useCallback((sectionId) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId));
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
          return 'Please enter an experiment title to continue';
        }
        return '';
      
      case 1: 
        if (selectedSections.length === 0) {
          return 'Please select at least one section to continue';
        }
        return '';
      
      case 2: 
        const hasAnyContent = selectedSections.some(section => {
          const content = sectionContent[section.id] || section.defaultContent;
          return hasContent(content);
        });
        if (!hasAnyContent) {
          return 'Please add content to at least one section to continue';
        }
        return '';
      
      default:
        return '';
    }
  }, [basicInfo, selectedSections, sectionContent, hasContent]);

  
  
  
  
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

      
      const canonicalSections = fromWizardState(sectionContent, selectedSections);

      
      const experimentData = {
        name: basicInfo.title.trim(),
        description: basicInfo.description?.trim() || '',
        duration: basicInfo.duration.trim() || '',
        subject: basicInfo.course.trim() || '',
        gradeLevel: basicInfo.program.trim() || '',
        sections: canonicalSections  
      };

      let result;
      if (existingExperiment) {
        
        result = await experimentService.updateFromWizard(existingExperiment.id, experimentData);
      } else {
        
        result = await experimentService.createFromWizard(experimentData);
      }
      
      
      setCreatedExperiment(result);
      setIsCreating(false);
      
      
      clearSavedState();
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      setCreationError(error.message || `Failed to ${existingExperiment ? 'update' : 'create'} experiment`);
      setIsCreating(false);
    }
  }, [basicInfo, selectedSections, sectionContent, existingExperiment, onComplete]);

  
  const handleCancel = useCallback(() => {
    
    if (basicInfo.title || selectedSections.length > 0) {
      setDiscardDialog(true);
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  }, [basicInfo.title, selectedSections.length, onCancel]);

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
        📋 Basic Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter the fundamental details about your lab experiment.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Experiment Title"
            value={basicInfo.title}
            onChange={(e) => updateBasicInfo('title', e.target.value)}
            error={touched.title && !basicInfo.title.trim()}
            helperText={touched.title && !basicInfo.title.trim() ? 'Title is required' : ''}
            placeholder="e.g., DNA Extraction from Strawberries"
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
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={basicInfo.duration}
                  onChange={(e) => updateBasicInfo('duration', e.target.value)}
                  placeholder="e.g., 90 minutes"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course"
                  value={basicInfo.course}
                  onChange={(e) => updateBasicInfo('course', e.target.value)}
                  placeholder="e.g., Modul 13 – Biology"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Program"
                  value={basicInfo.program}
                  onChange={(e) => updateBasicInfo('program', e.target.value)}
                  placeholder="e.g., Sommersemester 2025"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> This information will appear in the header of your experiment document.
        </Typography>
      </Alert>
    </Box>
  );

  const renderSectionsStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        📚 Select Sections
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose which sections to include in your experiment. You can select any combination of sections that fit your needs, or create custom ones.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Sections
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
            📋 Selected Sections (Drag to Reorder)
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Drag sections to reorder them. This order will be used in the final experiment.
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
                    const newSections = [...selectedSections];
                    const [movedSection] = newSections.splice(fromIndex, 1);
                    newSections.splice(toIndex, 0, movedSection);
                    setSelectedSections(newSections);
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
            ✨ Custom Sections
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCustomSectionDialog(true)}
          >
            Add Custom Section
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
                          {section.description || 'Custom section'}
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
            No custom sections added yet. Click "Add Custom Section" to create one.
          </Alert>
        )}
      </Box>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{selectedSections.length} sections</strong> selected for your experiment.
        </Typography>
      </Alert>
    </Box>
  );

  const renderContentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        ✍️ Fill in Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Complete the content for each section. Required fields are marked with *.
      </Typography>

      <Stack spacing={4} sx={{ mt: 3 }}>
        {selectedSections.map(section => (
          <Paper key={section.id} sx={{ p: 3, borderLeft: 4, borderColor: 'primary.main' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h4">{section.emoji}</Typography>
              <Typography variant="h6">{section.name}</Typography>
              {section.id === 'title_header' && (
                <Chip 
                  label="Auto-filled from Step 1" 
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
                These fields are automatically filled from your Basic Information. You can edit them if needed.
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
                          List all materials students need. You can optionally add a photo to help with recognition.
                        </Typography>
                      </Alert>
                      
                      <Stack spacing={2}>
                        {(sectionContent[section.id]?.[field.id] || []).map((item, index) => (
                          <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Material {index + 1}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={2}>
                              <TextField
                                fullWidth
                                label="Material name"
                                placeholder="e.g., Beaker (250ml), Safety goggles, pH meter"
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
                                    Reference photo
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
                                        Replace photo
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
                                        Remove photo
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
                                  + Add reference photo (optional)
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
                                  Remove material
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
                          Add Material
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

  const renderAIPolishStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        🤖 AI Polish & Review
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use AI to review, improve, and ensure consistency across all sections.
      </Typography>

      <LLMPolishCheck
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
          👁️ Preview & Create
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is how students will see your experiment. Review carefully before creating.
        </Typography>

        {!keycloakService.isAuthenticated() && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>⚠️ You are not logged in</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              You need to log in with your Keycloak account to create experiments.
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => keycloakService.login()}
              sx={{ mt: 1 }}
            >
              Login Now
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
            📖 STUDENT VIEW PREVIEW
          </Typography>
          
          <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {previewData.title || 'Untitled Experiment'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, justifyContent: 'center' }}>
              {previewData.duration && (
                <Chip label={`Duration: ${previewData.duration}`} variant="outlined" />
              )}
              {previewData.course && (
                <Chip label={`Course: ${previewData.course}`} variant="outlined" />
              )}
              {previewData.program && (
                <Chip label={`Program: ${previewData.program}`} variant="outlined" />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {previewData.sections.length === 0 ? (
            <Alert severity="info">
              No sections added yet. Go back to select and fill sections.
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
                    Login
                  </Button>
                )
              }
            >
              {creationError}
              {creationError.includes('not authenticated') && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Please log in with your Keycloak account to create experiments.
                </Typography>
              )}
            </Alert>
          )}
        
        {createdExperiment ? (
          <Alert severity="success">
            <Typography variant="body2">
              ✅ Experiment created successfully! ID: {createdExperiment.id}
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
              ? (existingExperiment ? 'Updating Experiment...' : 'Creating Experiment...') 
              : (existingExperiment ? 'Update Experiment' : 'Create Experiment')
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
      case 3: return renderAIPolishStep();
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
            <strong>Draft restored!</strong> Your previous work has been loaded. Last saved: {new Date(savedState.timestamp).toLocaleString()}
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
            Back
          </SecondaryButton>

          <Box display="flex" gap={2}>
            {onCancel && (
              <SecondaryButton onClick={handleCancel}>
                Cancel
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
                    Next
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
        <DialogTitle>Add Custom Section</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              required
              label="Section Name"
              value={newCustomSectionName}
              onChange={(e) => setNewCustomSectionName(e.target.value)}
              placeholder="e.g., Risk Assessment"
            />
            <TextField
              fullWidth
              label="Description"
              value={newCustomSectionDescription}
              onChange={(e) => setNewCustomSectionDescription(e.target.value)}
              placeholder="Brief description of this section"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomSectionDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustomSection}
            disabled={!newCustomSectionName.trim()}
          >
            Add Section
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
              Discard Draft?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You have unsaved changes in your draft. What would you like to do?
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
              Keep Draft: Save your progress and return later
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>✕</Box>
              Discard: Permanently delete all unsaved changes
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
            Keep Draft
          </Button>
          <Button 
            onClick={handleDiscardConfirm} 
            variant="contained" 
            color="error"
            size="large"
            startIcon={<DeleteOutline />}
            sx={{ minWidth: 120 }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModularExperimentWizard;
