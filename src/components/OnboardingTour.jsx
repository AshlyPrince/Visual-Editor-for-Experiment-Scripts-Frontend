import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CheckCircle as CheckIcon,
  Science as ScienceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  GetApp as ExportIcon,
  Help as HelpIcon,
  AutoFixHigh as PolishIcon,
  Chat as ChatIcon,
  VerifiedUser as ConsistencyIcon
} from '@mui/icons-material';

const OnboardingTour = ({ open, onClose, onComplete }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: t('onboarding.welcome.title', 'Welcome to Visual Editor!'),
      content: t('onboarding.welcome.content', 'Let\'s take a quick tour to help you get started with creating experiment scripts.'),
      icon: <ScienceIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      details: [
        t('onboarding.welcome.detail1', 'Create professional experiment scripts'),
        t('onboarding.welcome.detail2', 'Add images, videos, and safety information'),
        t('onboarding.welcome.detail3', 'Export as PDF or HTML for sharing'),
        t('onboarding.welcome.detail4', 'Track versions and changes over time')
      ]
    },
    {
      title: t('onboarding.create.title', 'Creating Your First Experiment'),
      content: t('onboarding.create.content', 'Click the "Create New Experiment" button to start building your experiment script.'),
      icon: <AddIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      details: [
        t('onboarding.create.detail1', 'Choose from templates or start from scratch'),
        t('onboarding.create.detail2', 'Enter a descriptive title and summary'),
        t('onboarding.create.detail3', 'Select relevant sections (materials, procedure, etc.)'),
        t('onboarding.create.detail4', 'Add custom sections for specific needs')
      ]
    },
    {
      title: t('onboarding.sections.title', 'Working with Sections'),
      content: t('onboarding.sections.content', 'Each experiment is organized into sections like materials, procedure, safety measures, and more.'),
      icon: <EditIcon sx={{ fontSize: 60, color: 'info.main' }} />,
      details: [
        t('onboarding.sections.detail1', 'Materials & Equipment: List required items'),
        t('onboarding.sections.detail2', 'Procedure: Add step-by-step instructions'),
        t('onboarding.sections.detail3', 'Safety: Include warnings and protective gear'),
        t('onboarding.sections.detail4', 'Media: Upload images and videos')
      ]
    },
    {
      title: t('onboarding.editing.title', 'Editing Content'),
      content: t('onboarding.editing.content', 'Use the rich text editor to format your content and add media files.'),
      icon: <EditIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
      details: [
        t('onboarding.editing.detail1', 'Format text with bold, italic, lists'),
        t('onboarding.editing.detail2', 'Upload images from your computer'),
        t('onboarding.editing.detail3', 'Add procedure steps with notes'),
        t('onboarding.editing.detail4', 'Select safety icons from the library')
      ]
    },
    {
      title: t('onboarding.aiAssistant.title', 'Context-Aware AI Assistant'),
      content: t('onboarding.aiAssistant.content', 'Your intelligent co-pilot for creating better experiments:'),
      icon: <ChatIcon sx={{ fontSize: 60, color: '#2196f3' }} />,
      details: [
        t('onboarding.aiAssistant.detail1', '� Click the chat button (bottom-right) to open the AI Assistant'),
        t('onboarding.aiAssistant.detail2', '🎯 Get personalized suggestions based on YOUR experiment'),
        t('onboarding.aiAssistant.detail3', '✨ Ask for help improving text, adding sections, or fixing issues'),
        t('onboarding.aiAssistant.detail4', '🔍 The AI knows your experiment context and gives specific advice'),
        t('onboarding.aiAssistant.detail5', '💡 Try: "What\'s missing?", "Improve my objectives", "Is this safe?"')
      ]
    },
    {
      title: t('onboarding.consistency.title', 'Content Review & Consistency Checks'),
      content: t('onboarding.consistency.content', 'Ensure your experiment is complete and professional before exporting:'),
      icon: <ConsistencyIcon sx={{ fontSize: 60, color: '#4caf50' }} />,
      details: [
        t('onboarding.consistency.detail1', '✅ Automatic checks for missing required fields (title, sections, procedure)'),
        t('onboarding.consistency.detail2', '🔍 Validates safety information and hazard warnings are complete'),
        t('onboarding.consistency.detail3', '📊 Reviews structure consistency across all sections'),
        t('onboarding.consistency.detail4', '⚡ Click \'Review Content\' button to get a detailed report with suggestions')
      ]
    },
    {
      title: t('onboarding.saving.title', 'Saving Your Work'),
      content: t('onboarding.saving.content', 'Always save your work regularly. The system creates automatic versions.'),
      icon: <SaveIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      details: [
        t('onboarding.saving.detail1', 'Click Save button after making changes'),
        t('onboarding.saving.detail2', 'Each save creates a new version'),
        t('onboarding.saving.detail3', 'View version history anytime'),
        t('onboarding.saving.detail4', 'Compare or restore previous versions')
      ]
    },
    {
      title: t('onboarding.export.title', 'Exporting & Sharing'),
      content: t('onboarding.export.content', 'Export your completed experiment as PDF or HTML to share with students.'),
      icon: <ExportIcon sx={{ fontSize: 60, color: 'error.main' }} />,
      details: [
        t('onboarding.export.detail1', 'PDF: Perfect for printing and offline use'),
        t('onboarding.export.detail2', 'HTML: Interactive web-friendly format'),
        t('onboarding.export.detail3', 'All media files are included'),
        t('onboarding.export.detail4', 'Professional formatting applied')
      ]
    },
    {
      title: t('onboarding.help.title', 'Getting Help'),
      content: t('onboarding.help.content', 'Access the Help Guide anytime you need assistance or want to review features.'),
      icon: <HelpIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      details: [
        t('onboarding.help.detail1', 'Click the Help button on the dashboard'),
        t('onboarding.help.detail2', 'Browse Getting Started, Features, and Tips'),
        t('onboarding.help.detail3', 'Check FAQ for common questions'),
        t('onboarding.help.detail4', 'Available in English and German')
      ]
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold" color="primary">
            {t('onboarding.tourTitle', 'Quick Start Tour')}
          </Typography>
          <IconButton onClick={handleSkip} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 2, height: 6, borderRadius: 3 }} 
        />
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        <Box textAlign="center" mb={3}>
          {steps[activeStep].icon}
        </Box>

        <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
          {steps[activeStep].title}
        </Typography>

        <Typography variant="body1" paragraph textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
          {steps[activeStep].content}
        </Typography>

        <Paper elevation={2} sx={{ p: 3, bgcolor: 'grey.50' }}>
          <List>
            {steps[activeStep].details.map((detail, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary={detail}
                  primaryTypographyProps={{
                    variant: 'body2'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('onboarding.stepCounter', 'Step {{current}} of {{total}}', {
              current: activeStep + 1,
              total: steps.length
            })}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button onClick={handleSkip} color="inherit">
          {t('onboarding.skip', 'Skip Tour')}
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<BackIcon />}
          >
            {t('common.previous', 'Previous')}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <NextIcon />}
          >
            {activeStep === steps.length - 1 
              ? t('onboarding.finish', 'Get Started!')
              : t('common.next', 'Next')
            }
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingTour;
