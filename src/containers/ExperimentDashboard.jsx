import React from 'react';
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
  const wizardSteps = [
    { id: 'sections', label: 'Select Sections', description: 'Choose template sections to include' },
    { id: 'configure', label: 'Configure', description: 'Set up experiment details' },
    { id: 'customize', label: 'Customize Sections', description: 'Customize selected sections' },
    { id: 'review', label: 'Review', description: 'Review and confirm template' },
    { id: 'create', label: 'Create', description: 'Create the experiment template' }
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
      name: 'Title', 
      description: 'Experiment title and introduction',
      icon: '📝',
      required: true,
      defaultContent: { text: 'Enter your experiment title' }
    },
    { 
      id: 'background', 
      name: 'Background Theory', 
      description: 'Scientific concepts and theory behind the experiment',
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
      name: 'Materials & Equipment', 
      description: 'List of required materials and equipment',
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
      name: 'Hypothesis', 
      description: 'Expected outcomes and predictions',
      icon: '💭',
      required: false,
      defaultContent: { 
        prediction: '',
        reasoning: ''
      }
    },
    { 
      id: 'procedure', 
      name: 'Procedure', 
      description: 'Step-by-step experiment instructions',
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
      name: 'Safety Guidelines', 
      description: 'Safety precautions and guidelines',
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
    
    if (!config.name?.trim()) errors.push('Experiment name is required');
    if (!config.description?.trim()) errors.push('Description and learning goals are required');
    if (!config.gradeLevel) errors.push('Grade level must be selected');
    if (!config.duration) errors.push('Estimated duration must be selected');
    if (!config.subject) errors.push('Subject area must be selected');
    
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
        name: 'Custom Section',
        description: 'Custom section created by user',
        icon: '✏️',
        required: false,
        isCustom: true,
        defaultContent: { text: '' }
      };
      setCustomSections(prev => [...prev, customSection]);
    };

    const isSelected = (sectionId) => selectedSections.some(s => s.id === sectionId);
    
    return (
      <FormSection title="Build Your Educational Experiment">
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the sections you want to include in your experiment. These are designed specifically for educational purposes and classroom use.
        </Typography>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Standard Sections
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
                        <Chip label="Required" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem' }} />
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
            Custom Sections
          </Typography>
          <SecondaryButton 
            onClick={addCustomSection}
            startIcon={<EditIcon />}
            size="small"
          >
            Add Custom Section
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
                        <Chip label="Custom" size="small" color="secondary" sx={{ height: 16, fontSize: '0.65rem' }} />
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
              No custom sections added yet. Click "Add Custom Section" to create your own sections.
            </Typography>
          </Box>
        )}

        {selectedSections.length > 0 && (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
              Selected Sections ({selectedSections.length})
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
      <FormSection title="Experiment Details">
        <FormGroup columns={1}>
          <TextInput
            label="Experiment Name"
            value={config.name || ''}
            onChange={(e) => updateExperimentConfig('name', e.target.value)}
            required
            placeholder="e.g., Investigating Plant Growth, Chemical Reactions Lab"
          />
          
          <TextInput
            label="Description & Learning Goals"
            value={config.description || ''}
            onChange={(e) => updateExperimentConfig('description', e.target.value)}
            required
            multiline
            rows={4}
            placeholder="Describe what students will learn and the educational objectives of this experiment"
          />
        </FormGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <FormGroup columns={2}>
          <SelectInput
            label="Grade Level"
            value={config.gradeLevel || ''}
            onChange={(e) => updateExperimentConfig('gradeLevel', e.target.value)}
            options={[
              { value: 'elementary', label: 'Elementary (K-5)' },
              { value: 'middle', label: 'Middle School (6-8)' },
              { value: 'high', label: 'High School (9-12)' },
              { value: 'college', label: 'College/University' }
            ]}
          />
          
          <SelectInput
            label="Estimated Duration"
            value={config.duration || ''}
            onChange={(e) => updateExperimentConfig('duration', e.target.value)}
            options={[
              { value: '30-min', label: '30 minutes' },
              { value: '1-hour', label: '1 hour' },
              { value: '90-min', label: '90 minutes' },
              { value: '2-hours', label: '2 hours' },
              { value: 'multi-day', label: 'Multiple days' }
            ]}
          />
        </FormGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <FormGroup columns={2}>
          <SelectInput
            label="Subject Area"
            value={config.subject || ''}
            onChange={(e) => updateExperimentConfig('subject', e.target.value)}
            options={[
              { value: 'biology', label: 'Biology' },
              { value: 'chemistry', label: 'Chemistry' },
              { value: 'physics', label: 'Physics' },
              { value: 'earth-science', label: 'Earth Science' },
              { value: 'general-science', label: 'General Science' },
              { value: 'environmental', label: 'Environmental Science' }
            ]}
          />
          
          <SelectInput
            label="Complexity Level"
            value={config.complexity || ''}
            onChange={(e) => updateExperimentConfig('complexity', e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
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
      <FormSection title="Customize Your Sections">
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Customize the content and settings for each selected section.
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
              No Sections Selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go back to the previous step to select sections for your experiment.
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
                    label={section.isCustom ? 'Custom' : 'Standard'} 
                    size="small" 
                    color={section.isCustom ? 'secondary' : 'primary'}
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {section.id === 'title' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Title & Objectives Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Default Title Template"
                        value={section.content?.title || ''}
                        onChange={(e) => updateSectionContent(section.id, { title: e.target.value })}
                        placeholder="e.g., [Your Experiment Name Here]"
                        fullWidth
                      />
                      <TextInput
                        label="Objective Template"
                        value={section.content?.objective || ''}
                        onChange={(e) => updateSectionContent(section.id, { objective: e.target.value })}
                        placeholder="Students will learn to..."
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label="Learning Goals (comma-separated)"
                        value={section.content?.learningGoals?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          learningGoals: e.target.value.split(',').map(goal => goal.trim()).filter(Boolean)
                        })}
                        placeholder="observation skills, hypothesis formation, data analysis"
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'background' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Background Theory Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Theory Template"
                        value={section.content?.theory || ''}
                        onChange={(e) => updateSectionContent(section.id, { theory: e.target.value })}
                        placeholder="Explain the scientific concepts behind this experiment..."
                        multiline
                        rows={3}
                        fullWidth
                      />
                      <TextInput
                        label="Key Concepts (comma-separated)"
                        value={section.content?.concepts?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          concepts: e.target.value.split(',').map(concept => concept.trim()).filter(Boolean)
                        })}
                        placeholder="photosynthesis, chemical reactions, gravity"
                        fullWidth
                      />
                      <TextInput
                        label="Vocabulary Terms (comma-separated)"
                        value={section.content?.vocabulary?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          vocabulary: e.target.value.split(',').map(term => term.trim()).filter(Boolean)
                        })}
                        placeholder="hypothesis, variable, control group"
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'materials' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Materials & Equipment Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Materials List (comma-separated)"
                        value={section.content?.materials?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          materials: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="beakers, test tubes, water, food coloring"
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label="Equipment Needed (comma-separated)"
                        value={section.content?.equipment?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          equipment: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="microscope, scale, thermometer, ruler"
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label="Safety Equipment (comma-separated)"
                        value={section.content?.safetyEquipment?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          safetyEquipment: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="safety goggles, gloves, apron"
                        fullWidth
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'hypothesis' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Hypothesis Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Prediction Template"
                        value={section.content?.prediction || ''}
                        onChange={(e) => updateSectionContent(section.id, { prediction: e.target.value })}
                        placeholder="I predict that... because..."
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label="Reasoning Template"
                        value={section.content?.reasoning || ''}
                        onChange={(e) => updateSectionContent(section.id, { reasoning: e.target.value })}
                        placeholder="Based on my knowledge of..., I expect..."
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
                      Procedure Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Default Steps Template"
                        value={section.content?.steps?.join('\n') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          steps: e.target.value.split('\n').filter(Boolean)
                        })}
                        placeholder="1. First, prepare your materials&#10;2. Next, set up the experiment&#10;3. Then, begin the procedure"
                        multiline
                        rows={4}
                        fullWidth
                      />
                      <TextInput
                        label="Teaching Tips (comma-separated)"
                        value={section.content?.tips?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          tips: e.target.value.split(',').map(tip => tip.trim()).filter(Boolean)
                        })}
                        placeholder="remind students about safety, check setup before starting"
                        fullWidth
                      />
                      <TextInput
                        label="Estimated Time"
                        value={section.content?.estimatedTime || ''}
                        onChange={(e) => updateSectionContent(section.id, { estimatedTime: e.target.value })}
                        placeholder="30-45 minutes"
                      />
                    </FormGroup>
                  </Box>
                )}

                {section.id === 'safety' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Safety Guidelines Configuration
                    </Typography>
                    <FormGroup columns={1}>
                      <TextInput
                        label="Safety Precautions (comma-separated)"
                        value={section.content?.precautions?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          precautions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="wear safety goggles, handle chemicals carefully, wash hands after lab"
                        multiline
                        rows={3}
                        fullWidth
                      />
                      <TextInput
                        label="Emergency Procedures (comma-separated)"
                        value={section.content?.emergencyProcedures?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          emergencyProcedures: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="if spilled notify teacher, location of eyewash station, fire extinguisher location"
                        multiline
                        rows={2}
                        fullWidth
                      />
                      <TextInput
                        label="Important Warnings (comma-separated)"
                        value={section.content?.warnings?.join(', ') || ''}
                        onChange={(e) => updateSectionContent(section.id, { 
                          warnings: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                        })}
                        placeholder="do not eat or drink in lab, never leave experiment unattended"
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
                      Custom Section Content
                    </Typography>
                    <TextInput
                      label="Default Content"
                      value={section.content?.text || ''}
                      onChange={(e) => updateSectionContent(section.id, { text: e.target.value })}
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="Enter default content for this custom section..."
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
      <FormSection title="Review & Preview Experiment">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Review your experiment configuration below. You can make changes before creating.
          </Typography>
          <SecondaryButton
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            variant={isEditing ? "contained" : "outlined"}
          >
            {isEditing ? 'Save Changes' : 'Edit Configuration'}
          </SecondaryButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TemplateIcon sx={{ mr: 1, color: 'primary.main' }} />
                Experiment Structure
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Educational Experiment Template
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Custom experiment built from selected sections
                </Typography>
                <Chip 
                  label={config.subject || 'General Science'} 
                  size="small" 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Selected Sections ({selectedSections.length})
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
                  No sections selected
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <ConfigIcon sx={{ mr: 1, color: 'primary.main' }} />
                Experiment Configuration
              </Typography>
              
              {isEditing ? (
                <FormGroup columns={1}>
                  <TextInput
                    label="Experiment Name"
                    value={editValues.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    required
                    fullWidth
                  />
                  
                  <TextInput
                    label="Description"
                    value={editValues.description || ''}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    required
                    multiline
                    rows={3}
                    fullWidth
                  />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <SelectInput
                      label="Grade Level"
                      value={editValues.gradeLevel || ''}
                      onChange={(e) => handleEditChange('gradeLevel', e.target.value)}
                      options={[
                        { value: 'elementary', label: 'Elementary (K-5)' },
                        { value: 'middle', label: 'Middle School (6-8)' },
                        { value: 'high', label: 'High School (9-12)' },
                        { value: 'college', label: 'College/University' }
                      ]}
                      fullWidth
                    />
                    
                    <SelectInput
                      label="Subject Area"
                      value={editValues.subject || ''}
                      onChange={(e) => handleEditChange('subject', e.target.value)}
                      options={[
                        { value: 'biology', label: 'Biology' },
                        { value: 'chemistry', label: 'Chemistry' },
                        { value: 'physics', label: 'Physics' },
                        { value: 'earth-science', label: 'Earth Science' },
                        { value: 'general-science', label: 'General Science' },
                        { value: 'environmental', label: 'Environmental Science' }
                      ]}
                      fullWidth
                    />
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <SelectInput
                      label="Duration"
                      value={editValues.duration || ''}
                      onChange={(e) => handleEditChange('duration', e.target.value)}
                      options={[
                        { value: '30-min', label: '30 minutes' },
                        { value: '1-hour', label: '1 hour' },
                        { value: '90-min', label: '90 minutes' },
                        { value: '2-hours', label: '2 hours' },
                        { value: 'multi-day', label: 'Multiple days' }
                      ]}
                      fullWidth
                    />
                    
                    <SelectInput
                      label="Complexity"
                      value={editValues.complexity || ''}
                      onChange={(e) => handleEditChange('complexity', e.target.value)}
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' }
                      ]}
                      fullWidth
                    />
                  </Box>
                </FormGroup>
              ) : (
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                      "{config.name || 'Untitled Experiment'}"
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {config.description || 'No description provided'}
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
                            Grade Level
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {config.gradeLevel?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
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
                            Expected Duration
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {config.duration?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
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
                  Experiment Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This experiment will be created with the following specifications:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`Educational Template`} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={`${selectedSections.length} sections`} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={config.gradeLevel?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Grade level not specified'} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={config.duration?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Duration not specified'} 
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
              Creating Experiment...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we set up your experiment.
            </Typography>
          </Box>
        </LoadingOverlay>
      ) : createError ? (
        <AlertMessage 
          severity="error"
          title="Creation Failed"
          message={createError}
        />
      ) : (
        <Box sx={{ py: 8 }}>
          <ExperimentIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: 'success.main' }}>
            Experiment Created Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your experiment has been created and is ready to use.
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
            Previous
          </SecondaryButton>
        )}
        
        <SecondaryButton onClick={onCancel}>
          Cancel
        </SecondaryButton>
        
        {currentStepId !== 'create' && (
          <PrimaryButton 
            onClick={handleNext}
            disabled={currentStepId === 'sections' && selectedSections.length === 0}
          >
            {currentStep === wizardSteps.length - 2 ? 'Create Template' : 
             currentStep === wizardSteps.length - 3 ? 'Review & Preview' : 'Next'}
          </PrimaryButton>
        )}
      </ButtonGroup>
    );
  };

  return (
    <WizardContainer>
      <Box sx={{ p: 4, pb: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Create Educational Experiment
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
