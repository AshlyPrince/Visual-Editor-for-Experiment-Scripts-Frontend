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
      content: t('onboarding.welcome.content', 'Create professional experiment scripts in minutes, not hours.'),
      icon: <ScienceIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      details: [
        t('onboarding.welcome.detail1', 'Step-by-step wizard guides you through creation'),
        t('onboarding.welcome.detail2', 'AI assistant helps improve your content'),
        t('onboarding.welcome.detail3', 'Control who can access your experiments'),
        t('onboarding.welcome.detail4', 'Export to PDF/HTML for easy sharing')
      ]
    },
    {
      title: t('onboarding.create.title', 'Creating an Experiment'),
      content: t('onboarding.create.content', 'Start with "Create New Experiment" and follow the wizard.'),
      icon: <AddIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      details: [
        t('onboarding.create.detail1', 'Enter title, duration, and description'),
        t('onboarding.create.detail2', 'Select sections you need (materials, procedure, safety)'),
        t('onboarding.create.detail3', 'Fill in content with rich text editor'),
        t('onboarding.create.detail4', 'Add images, videos, and safety icons')
      ]
    },
    {
      title: t('onboarding.aiFeatures.title', 'AI-Powered Features'),
      content: t('onboarding.aiFeatures.content', 'Get instant help while creating your experiments.'),
      icon: <ChatIcon sx={{ fontSize: 60, color: '#2196f3' }} />,
      details: [
        t('onboarding.aiFeatures.detail1', 'AI Chat: Click bottom-right chat icon for suggestions'),
        t('onboarding.aiFeatures.detail2', 'Content Review: Check for missing or incomplete sections'),
        t('onboarding.aiFeatures.detail3', 'Simplify Language: Adapt content for different grade levels'),
        t('onboarding.aiFeatures.detail4', 'Get personalized help based on your experiment context')
      ]
    },
    {
      title: t('onboarding.permissions.title', 'Sharing & Permissions'),
      content: t('onboarding.permissions.content', 'Decide who can access your experiments.'),
      icon: <Box sx={{ fontSize: 60 }}>🔒</Box>,
      details: [
        t('onboarding.permissions.detail1', 'Private: Only you (perfect for drafts)'),
        t('onboarding.permissions.detail2', 'Public: Everyone has full access'),
        t('onboarding.permissions.detail3', 'Restricted: Choose which features others can use'),
        t('onboarding.permissions.detail4', 'Restricted users see disabled buttons with tooltips explaining why')
      ]
    },
    {
      title: t('onboarding.workflow.title', 'Your Workflow'),
      content: t('onboarding.workflow.content', 'Key features to remember as you work.'),
      icon: <SaveIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      details: [
        t('onboarding.workflow.detail1', 'Auto-save: Work is saved automatically, resume anytime'),
        t('onboarding.workflow.detail2', 'Versions: Every save creates a version you can restore'),
        t('onboarding.workflow.detail3', 'Export: Download as PDF (print) or HTML (web)'),
        t('onboarding.workflow.detail4', 'Help: Click "?" button anytime for detailed guides')
      ]
    },
    {
      title: t('onboarding.ready.title', 'You\'re Ready!'),
      content: t('onboarding.ready.content', 'Start creating amazing experiment scripts now.'),
      icon: <CheckIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      details: [
        t('onboarding.ready.detail1', 'Click "Create New Experiment" to begin'),
        t('onboarding.ready.detail2', 'Use AI assistant when you need guidance'),
        t('onboarding.ready.detail3', 'Check Help Guide for detailed instructions'),
        t('onboarding.ready.detail4', 'Experiment fearlessly - drafts auto-save!')
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
