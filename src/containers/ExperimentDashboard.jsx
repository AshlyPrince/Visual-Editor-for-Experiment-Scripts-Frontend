import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Science as ExperimentIcon,
  Description as TemplateIcon,
  Settings as ConfigIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import WizardStepper from '../components/ui/WizardStepper.jsx';
import { 
  PrimaryButton,
  SecondaryButton,
  ButtonGroup
} from '../components/ui/Button';
import { LoadingOverlay, AlertMessage } from '../components/ui/Feedback';
import { 
  FormSection,
  TextInput,
  SelectInput,
  FormGroup
} from '../components/ui/FormInputs';
import { 
  useWizardSteps, 
  useExperimentTemplate, 
  useExperimentCreation,
  useAsyncOperation 
} from '../hooks/exports.js';
import { experimentService } from '../services/exports.js';
import { createCardStyles } from '../styles/components.js';

const WizardContainer = styled(Paper)(({ theme }) => ({
  ...createCardStyles(theme, 'elevated'),
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column'
}));

const StepContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column'
}));

const ExperimentWizard = ({ 
  selectedTemplate = null, 
  onComplete, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const wizardSteps = [
    { id: 'sections', label: t('wizard.selectSections'), description: t('wizard.selectSectionsDesc') },
    { id: 'configure', label: t('wizard.configure'), description: t('wizard.configureDesc') },
    { id: 'customize', label: t('wizard.customizeSections'), description: t('wizard.customizeSectionsDesc') },
    { id: 'review', label: t('wizard.review'), description: t('wizard.reviewDesc') },
    { id: 'create', label: t('wizard.create'), description: t('wizard.createDesc') }
  ];

  const {
    currentStep,
    completedSteps,
    nextStep,
    previousStep,
    markStepComplete,
    updateStepData,
    stepData,
    canProceedToNext,
    canGoBack
  } = useWizardSteps(wizardSteps);

  const {
    template,
    setTemplate,
    updateTemplate,
    validateTemplate,
    loading: templateLoading
  } = useExperimentTemplate(selectedTemplate);

  const {
    experiment,
    initializeExperiment,
    updateExperiment,
    createExperiment,
    creating,
    createError
  } = useExperimentCreation();

  const {
    execute: loadTemplates,
    loading: templatesLoading,
    data: availableTemplatesData = []
  } = useAsyncOperation();

  
  const availableTemplates = availableTemplatesData || [];

  
  const availableSections = [
    { 
      id: 'title', 
      name: t('wizard.sections.title'), 
      description: t('wizard.sections.titleDesc'),
      icon: '📝',
      required: true,
      defaultContent: { text: t('wizard.placeholders.experimentTitle') }
    },
    { 
      id: 'background', 
      name: t('wizard.sections.backgroundTheory'), 
      description: t('wizard.sections.backgroundTheoryDesc'),
      icon: '🔬',
      required: false,
      defaultContent: { 
        theory: '',
        concepts: [],
        vocabulary: []
      }
    },
    { 
      id: 'materials', 
      name: t('wizard.sections.materialsEquipment'), 
      description: t('wizard.sections.materialsEquipmentDesc'),
      icon: '🧪',
      required: true,
      defaultContent: { 
        materials: [],
        equipment: [],
        safetyEquipment: []
      }
    },
    { 
      id: 'hypothesis', 
      name: t('wizard.sections.hypothesis'), 
      description: t('wizard.sections.hypothesisDesc'),
      icon: '💭',
      required: false,
      defaultContent: { 
        prediction: '',
        reasoning: ''
      }
    },
    { 
      id: 'procedure', 
      name: t('wizard.sections.procedure'), 
      description: t('wizard.sections.procedureDesc'),
      icon: '📋',
      required: true,
      defaultContent: { 
        steps: [],
        tips: [],
        estimatedTime: ''
      }
    },
    { 
      id: 'safety', 
      name: t('wizard.sections.safetyGuidelines'), 
      description: t('wizard.sections.safetyGuidelinesDesc'),
      icon: '⚠️',
      required: true,
      defaultContent: { 
        precautions: [],
        emergencyProcedures: [],
        warnings: []
      }
    }
  ];

  
  React.useEffect(() => {
    const requiredSections = availableSections.filter(section => section.required);
    setSelectedSections(requiredSections.map(section => ({ 
      ...section, 
      content: section.defaultContent 
    })));
  }, []); 

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplate(selectedTemplate);
      markStepComplete(0);
    }
  }, [selectedTemplate, setTemplate, markStepComplete]);

  const handleNext = async () => {
    const currentStepId = wizardSteps[currentStep].id;
    
    switch (currentStepId) {
      case 'sections':
        if (selectedSections.length === 0) {
          return;
        }
        markStepComplete(currentStep);
        break;
        
      case 'configure':
        const validation = validateExperimentConfig();
        if (!validation.isValid) {
          return;
        }
        markStepComplete(currentStep);
        break;

      case 'customize':
        markStepComplete(currentStep);
        break;
        
      case 'review':
        markStepComplete(currentStep);
        break;
        
      case 'create':
        try {
          const wizardData = {
            sections: selectedSections,
            config: stepData[1] || {}
          };
          
          const createdExperiment = await experimentService.createFromWizard(wizardData);
          
          if (onComplete) {
            onComplete(createdExperiment);
          }
          return;
        } catch (error) {
          return;
        }
    }
    
    nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const validateExperimentConfig = () => {
    const errors = [];
    const config = stepData[1] || {};
    
    if (!config.name?.trim()) errors.push(t('validation.experimentNameRequired'));
    if (!config.description?.trim()) errors.push(t('validation.descriptionRequired'));
    if (!config.gradeLevel) errors.push(t('validation.gradeLevelRequired'));
    if (!config.duration) errors.push(t('validation.durationRequired'));
    if (!config.subject) errors.push(t('validation.subjectRequired'));
    
    return { isValid: errors.length === 0, errors };
  };

  const updateExperimentConfig = (field, value) => {
    updateStepData(1, { [field]: value });
    updateExperiment({ [field]: value });
  };

  const renderStepContent = () => {
    const currentStepId = wizardSteps[currentStep].id;
    
    switch (currentStepId) {
      case 'sections':
        return renderTemplateSelection();
      case 'configure':
        return renderConfiguration();
      case 'customize':
        return renderCustomization();
      case 'review':
        return renderReview();
      case 'create':
        return renderCreation();
      default:
        return null;
    }
  };

  const [selectedSections, setSelectedSections] = React.useState([]);
  const [customSections, setCustomSections] = React.useState([]);
  
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState({});

  const renderTemplateSelection = () => {
    const toggleSection = (section) => {
      setSelectedSections(prev => {
        const exists = prev.find(s => s.id === section.id);
        if (exists) {
          return prev.filter(s => s.id !== section.id);
        } else {
          return [...prev, { ...section, content: section.defaultContent }];
        }
      });
    };

    const addCustomSection = () => {
      const customId = `custom_${Date.now()}`;
      const customSection = {
        id: customId,
        name: t('wizard.customSection'),
        description: t('wizard.customSectionDesc'),
        icon: '✏️',
        required: false,
        isCustom: true,
        defaultContent: { text: '' }
      };
      setCustomSections(prev => [...prev, customSection]);
    };

    const isSelected = (sectionId) => selectedSections.some(s => s.id === sectionId);
    
    return (
      <FormSection title={t('wizard.buildExperiment')}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('wizard.selectSectionsInfo')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('wizard.standardSections')}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {availableSections.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.id}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: isSelected(section.id) ? 2 : 1,
                  borderColor: isSelected(section.id) ? 'primary.main' : 'divider',
                  backgroundColor: isSelected(section.id) ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={() => toggleSection(section)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {section.icon}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {section.name}
                      </Typography>
                      {section.required && (
                        <Chip label={t('common.required')} size="small" color="error" sx={{ height: 16, fontSize: '0.65rem' }} />
                      )}
                      {isSelected(section.id) && (
                        <Chip label="✓" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {section.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('wizard.customSections')}
          </Typography>
          <SecondaryButton 
            onClick={addCustomSection}
            startIcon={<EditIcon />}
            size="small"
          >
            {t('wizard.addCustomSection')}
          </SecondaryButton>
        </Box>

        {customSections.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {customSections.map((section) => (
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: isSelected(section.id) ? 2 : 1,
                    borderColor: isSelected(section.id) ? 'primary.main' : 'divider',
                    backgroundColor: isSelected(section.id) ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => toggleSection(section)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>
                      {section.icon}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {section.name}
                        </Typography>
                        <Chip label={t('wizard.custom')} size="small" color="secondary" sx={{ height: 16, fontSize: '0.65rem' }} />
                        {isSelected(section.id) && (
                          <Chip label="✓" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {section.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            backgroundColor: 'action.hover',
            textAlign: 'center',
            mb: 3
          }}>
            <Typography variant="body2" color="text.secondary">
              {t('wizard.noCustomSections')}
            </Typography>
          </Box>
        )}

        {selectedSections.length > 0 && (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
              {t('wizard.selectedSections', { count: selectedSections.length })}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedSections.map((section) => (
                <Chip
                  key={section.id}
                  label={`${section.icon} ${section.name}`}
                  onDelete={() => toggleSection(section)}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </FormSection>
    );
  };

  const renderConfiguration = () => {
    const config = stepData[1] || {};
    
    return (
      <FormSection title={t('wizard.experimentDetails')}>
        <FormGroup columns={1}>
          <TextInput
            label={t('fields.experimentName')}
            value={config.name || ''}
            onChange={(e) => updateExperimentConfig('name', e.target.value)}
            required
            placeholder={t('wizard.placeholders.experimentNameExample')}
          />
          
          <TextInput
            label={t('fields.descriptionLearningGoals')}
            value={config.description || ''}
            onChange={(e) => updateExperimentConfig('description', e.target.value)}
            required
            multiline
            rows={4}
            placeholder={t('wizard.placeholders.descriptionExample')}
          />
        </FormGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <FormGroup columns={2}>
          <SelectInput
            label={t('fields.gradeLevel')}
            value={config.gradeLevel || ''}
            onChange={(e) => updateExperimentConfig('gradeLevel', e.target.value)}
            options={[
              { value: 'elementary', label: t('fields.gradeLevels.elementary') },
              { value: 'middle', label: t('fields.gradeLevels.middle') },
              { value: 'high', label: t('fields.gradeLevels.high') },
              { value: 'college', label: t('fields.gradeLevels.college') }
            ]}
          />
          
          <SelectInput
            label={t('fields.estimatedDuration')}
            value={config.duration || ''}
            onChange={(e) => updateExperimentConfig('duration', e.target.value)}
            options={[
              { value: '30-min', label: t('fields.durations.30min') },
              { value: '1-hour', label: t('fields.durations.1hour') },
              { value: '90-min', label: t('fields.durations.90min') },
              { value: '2-hours', label: t('fields.durations.2hours') },
              { value: 'multi-day', label: t('fields.durations.multiDay') }
            ]}
          />
        </FormGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <FormGroup columns={2}>
          <SelectInput
            label={t('fields.subjectArea')}
            value={config.subject || ''}
            onChange={(e) => updateExperimentConfig('subject', e.target.value)}
            options={[
              { value: 'biology', label: t('fields.subjects.biology') },
              { value: 'chemistry', label: t('fields.subjects.chemistry') },
              { value: 'physics', label: t('fields.subjects.physics') },
              { value: 'earth-science', label: t('fields.subjects.earthScience') },
              { value: 'general-science', label: t('fields.subjects.generalScience') },
              { value: 'environmental', label: t('fields.subjects.environmental') }
            ]}
          />
          
          <SelectInput
            label={t('fields.complexityLevel')}
            value={config.complexity || ''}
            onChange={(e) => updateExperimentConfig('complexity', e.target.value)}
            options={[
              { value: 'beginner', label: t('fields.complexity.beginner') },
              { value: 'intermediate', label: t('fields.complexity.intermediate') },
              { value: 'advanced', label: t('fields.complexity.advanced') }
            ]}
          />
        </FormGroup>
      </FormSection>
    );
  };

  const renderCustomization = () => {
    const updateSectionContent = (sectionId, content) => {
      setSelectedSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, content: { ...section.content, ...content } }
            : section
        )
      );
    };

    const updateCustomSectionName = (sectionId, name, description) => {
      setSelectedSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, name, description }
            : section
        )
      );
      
      setCustomSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, name, description }
            : section
        )
      );
    };

    return (
      <FormSection title={t('wizard.customizeYourSections')}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('wizard.customizeInfo')}
        </Typography>

        {selectedSections.length === 0 ? (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: 'warning.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.200'
          }}>
            <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
              {t('wizard.noSectionsSelected')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('wizard.goBackToSelectSections')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedSections.map((section, index) => (
              <Paper key={section.id} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {section.icon}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {section.isCustom ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, alignItems: 'start' }}>
                        <TextInput
                          label="Section Name"
                          value={section.name}
                          onChange={(e) => updateCustomSectionName(section.id, e.target.value, section.description)}
                          size="small"
                        />
                        <TextInput
                          label="Description"
                          value={section.description}
                          onChange={(e) => updateCustomSectionName(section.id, section.name, e.target.value)}
                          size="small"
                        />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {section.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Chip 
                    label={section.isCustom ? t('wizard.custom') : t('wizard.standard')} 
                    size="small" 
                    color={section.isCustom ? 'secondary' : 'primary'}
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {section.id === 'title' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.titleObjectivesConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.defaultTitleTemplate')}
                        value={section.content?.title || ''}
                        onChange={(e) => updateSectionContent(section.id, { title: e.target.value })}
                        placeholder={t('wizard.placeholders.titleTemplate')}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.objectiveTemplate')}
                        value={section.content?.objective || ''}
                        onChange={(e) => updateSectionContent(section.id, { objective: e.target.value })}
                        placeholder={t('wizard.placeholders.objectiveTemplate')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.learningGoalsCommaSeparated')}
                        value={section.content?.learningGoals?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          learningGoals: e.target.value.split(',').map(goal => goal.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.learningGoals')}
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'background' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.backgroundTheoryConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.theoryTemplate')}
                        value={section.content?.theory || ''}
                        onChange={(e) => updateSectionContent(section.id, { theory: e.target.value })}
                        placeholder={t('wizard.placeholders.theory')}
                        multiline
                        rows={3}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.keyConceptsCommaSeparated')}
                        value={section.content?.concepts?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          concepts: e.target.value.split(',').map(concept => concept.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.concepts')}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.vocabularyTermsCommaSeparated')}
                        value={section.content?.vocabulary?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          vocabulary: e.target.value.split(',').map(term => term.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.vocabulary')}
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'materials' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.materialsEquipmentConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.materialsListCommaSeparated')}
                        value={section.content?.materials?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          materials: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.materials')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.equipmentNeededCommaSeparated')}
                        value={section.content?.equipment?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          equipment: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.equipment')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.safetyEquipmentCommaSeparated')}
                        value={section.content?.safetyEquipment?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          safetyEquipment: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.safetyEquipment')}
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'hypothesis' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.hypothesisConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.predictionTemplate')}
                        value={section.content?.prediction || ''}
                        onChange={(e) => updateSectionContent(section.id, { prediction: e.target.value })}
                        placeholder={t('wizard.placeholders.prediction')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.reasoningTemplate')}
                        value={section.content?.reasoning || ''}
                        onChange={(e) => updateSectionContent(section.id, { reasoning: e.target.value })}
                        placeholder={t('wizard.placeholders.reasoning')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'procedure' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.procedureConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.defaultStepsTemplate')}
                        value={section.content?.steps?.join('\n') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          steps: e.target.value.split('\n').filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.steps')}
                        multiline
                        rows={4}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.teachingTipsCommaSeparated')}
                        value={section.content?.tips?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          tips: e.target.value.split(',').map(tip => tip.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.tips')}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.estimatedTime')}
                        value={section.content?.estimatedTime || ''}
                        onChange={(e) => updateSectionContent(section.id, { estimatedTime: e.target.value })}
                        placeholder={t('wizard.placeholders.estimatedTime')}
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'safety' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.safetyGuidelinesConfig')}
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label={t('wizard.safetyPrecautionsCommaSeparated')}
                        value={section.content?.precautions?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          precautions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.precautions')}
                        multiline
                        rows={3}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.emergencyProceduresCommaSeparated')}
                        value={section.content?.emergencyProcedures?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          emergencyProcedures: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.emergencyProcedures')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label={t('wizard.importantWarningsCommaSeparated')}
                        value={section.content?.warnings?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          warnings: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder={t('wizard.placeholders.warnings')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.isCustom && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('wizard.customSectionContent')}
                    </Typography>
                    <TextInput
                      label={t('wizard.defaultContent')}
                      value={section.content?.text || ''}
                      onChange={(e) => updateSectionContent(section.id, { text: e.target.value })}
                      multiline
                      rows={3}
                      fullWidth
                      placeholder={t('wizard.placeholders.customContent')}
                    />
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </FormSection>
    );
  };

  
  React.useEffect(() => {
    const config = stepData[1] || {};
    setEditValues(config);
  }, [stepData]);

  const renderReview = () => {
    const config = stepData[1] || {};
    
    const handleEditToggle = () => {
      if (isEditing) {
        
        updateStepData(1, editValues);
        updateExperiment(editValues);
      }
      setIsEditing(!isEditing);
    };

    const handleEditChange = (field, value) => {
      setEditValues(prev => ({ ...prev, [field]: value }));
    };

    return (
      <FormSection title={t('wizard.reviewPreviewExperiment')}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('wizard.reviewInfo')}
          </Typography>
          <SecondaryButton
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            variant={isEditing ? "contained" : "outlined"}
          >
            {isEditing ? t('common.saveChanges') : t('wizard.editConfiguration')}
          </SecondaryButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TemplateIcon sx={{ mr: 1, color: 'primary.main' }} />
                {t('wizard.experimentStructure')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('wizard.educationalExperimentTemplate')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('wizard.customExperimentBuilt')}
                </Typography>
                <Chip 
                  label={config.subject || t('fields.subjects.generalScience')} 
                  size="small" 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                {t('wizard.selectedSections', { count: selectedSections.length })}
              </Typography>
              {selectedSections.map((section, index) => (
                <Box key={section.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: section.required ? 'error.main' : 'success.main',
                    mr: 1 
                  }} />
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{section.icon}</span>
                    {section.name}
                    {section.required && (
                      <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                        *
                      </Typography>
                    )}
                  </Typography>
                </Box>
              ))}
              
              {selectedSections.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t('wizard.noSectionsSelected')}
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <ConfigIcon sx={{ mr: 1, color: 'primary.main' }} />
                {t('wizard.experimentConfiguration')}
              </Typography>
              
              {isEditing ? (
                <FormGroup columns={1}>
                  <TextInput
                    label={t('fields.experimentName')}
                    value={editValues.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    required
                    fullWidth
                  />
                  
                  <TextInput
                    label={t('fields.description')}
                    value={editValues.description || ''}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    required
                    multiline
                    rows={3}
                    fullWidth
                  />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <SelectInput
                      label={t('fields.gradeLevel')}
                      value={editValues.gradeLevel || ''}
                      onChange={(e) => handleEditChange('gradeLevel', e.target.value)}
                      options={[
                        { value: 'elementary', label: t('fields.gradeLevels.elementary') },
                        { value: 'middle', label: t('fields.gradeLevels.middle') },
                        { value: 'high', label: t('fields.gradeLevels.high') },
                        { value: 'college', label: t('fields.gradeLevels.college') }
                      ]}
                      fullWidth
                    />
                    
                    <SelectInput
                      label={t('fields.subjectArea')}
                      value={editValues.subject || ''}
                      onChange={(e) => handleEditChange('subject', e.target.value)}
                      options={[
                        { value: 'biology', label: t('fields.subjects.biology') },
                        { value: 'chemistry', label: t('fields.subjects.chemistry') },
                        { value: 'physics', label: t('fields.subjects.physics') },
                        { value: 'earth-science', label: t('fields.subjects.earthScience') },
                        { value: 'general-science', label: t('fields.subjects.generalScience') },
                        { value: 'environmental', label: t('fields.subjects.environmental') }
                      ]}
                      fullWidth
                    />
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <SelectInput
                      label={t('fields.duration')}
                      value={editValues.duration || ''}
                      onChange={(e) => handleEditChange('duration', e.target.value)}
                      options={[
                        { value: '30-min', label: t('fields.durations.30min') },
                        { value: '1-hour', label: t('fields.durations.1hour') },
                        { value: '90-min', label: t('fields.durations.90min') },
                        { value: '2-hours', label: t('fields.durations.2hours') },
                        { value: 'multi-day', label: t('fields.durations.multiDay') }
                      ]}
                      fullWidth
                    />
                    
                    <SelectInput
                      label={t('fields.complexity')}
                      value={editValues.complexity || ''}
                      onChange={(e) => handleEditChange('complexity', e.target.value)}
                      options={[
                        { value: 'beginner', label: t('fields.complexity.beginner') },
                        { value: 'intermediate', label: t('fields.complexity.intermediate') },
                        { value: 'advanced', label: t('fields.complexity.advanced') }
                      ]}
                      fullWidth
                    />
                  </Box>
                </FormGroup>
              ) : (
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                      "{config.name || t('wizard.untitledExperiment')}"
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {config.description || t('wizard.noDescriptionProvided')}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <PersonIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('fields.gradeLevel')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {config.gradeLevel?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('wizard.notSpecified')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TimeIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('wizard.expectedDuration')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {config.duration?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('wizard.notSpecified')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
            
            {!isEditing && (
              <Paper sx={{ p: 3, mt: 2, backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <PreviewIcon sx={{ mr: 1 }} />
                  {t('wizard.experimentPreview')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('wizard.experimentWillBeCreated')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={t('wizard.educationalTemplate')} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={t('wizard.sectionsCount', { count: selectedSections.length })} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={config.gradeLevel?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('wizard.gradeLevelNotSpecified')} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={config.duration?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || t('wizard.durationNotSpecified')} 
                    variant="outlined" 
                    size="small" 
                  />
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </FormSection>
    );
  };

  const renderCreation = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      {creating ? (
        <LoadingOverlay loading={creating}>
          <Box sx={{ py: 8 }}>
            <ExperimentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t('wizard.creatingExperiment')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('wizard.pleaseWaitSetup')}
            </Typography>
          </Box>
        </LoadingOverlay>
      ) : createError ? (
        <AlertMessage 
          severity="error"
          title={t('wizard.creationFailed')}
          message={createError}
        />
      ) : (
        <Box sx={{ py: 8 }}>
          <ExperimentIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: 'success.main' }}>
            {t('wizard.experimentCreatedSuccess')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('wizard.experimentReady')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const getStepActions = () => {
    const currentStepId = wizardSteps[currentStep].id;
    
    return (
      <ButtonGroup>
        {canGoBack() && (
          <SecondaryButton onClick={handlePrevious}>
            {t('common.previous')}
          </SecondaryButton>
        )}
        
        <SecondaryButton onClick={onCancel}>
          {t('common.cancel')}
        </SecondaryButton>
        
        {currentStepId !== 'create' && (
          <PrimaryButton 
            onClick={handleNext}
            disabled={currentStepId === 'sections' && selectedSections.length === 0}
          >
            {currentStep === wizardSteps.length - 2 ? t('wizard.createTemplate') : 
             currentStep === wizardSteps.length - 3 ? t('wizard.reviewPreview') : t('common.next')}
          </PrimaryButton>
        )}
      </ButtonGroup>
    );
  };

  return (
    <WizardContainer>
      <Box sx={{ p: 4, pb: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          {t('wizard.createEducationalExperiment')}
        </Typography>
        <WizardStepper 
          steps={wizardSteps}
          activeStep={currentStep}
          completedSteps={completedSteps}
        />
      </Box>
      
      <StepContent>
        {renderStepContent()}
      </StepContent>
      
      <Box sx={{ p: 4, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        {getStepActions()}
      </Box>
    </WizardContainer>
  );
};

export default ExperimentWizard;
