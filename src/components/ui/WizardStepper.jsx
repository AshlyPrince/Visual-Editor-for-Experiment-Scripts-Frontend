import React from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  StepConnector, 
  Box,
  Typography,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check as CheckIcon } from '@mui/icons-material';
import { gradients, colors, borderRadius } from '../../styles/tokens';

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.Mui-active': {
    '& .MuiStepConnector-line': {
      background: gradients.primary,
    },
  },
  '&.Mui-completed': {
    '& .MuiStepConnector-line': {
      background: gradients.primary,
    },
  },
  '& .MuiStepConnector-line': {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.divider, 0.3),
    borderRadius: borderRadius.sm,
  },
}));

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed 
    ? colors.success.main 
    : ownerState.active 
      ? colors.primary.main 
      : alpha(theme.palette.divider, 0.3),
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
  ...(ownerState.active && {
    background: gradients.primary,
    boxShadow: theme.shadows[4],
  }),
  ...(ownerState.completed && {
    background: colors.success.main,
  }),
}));

const CustomStepIcon = (props) => {
  const { active, completed, className } = props;

  return (
    <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? (
        <CheckIcon sx={{ fontSize: 20 }} />
      ) : (
        <span>{props.icon}</span>
      )}
    </CustomStepIconRoot>
  );
};

const CustomStepLabel = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    fontWeight: 500,
    fontSize: '0.95rem',
    marginTop: theme.spacing(1),
    '&.Mui-active': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
      fontWeight: 600,
    },
  },
}));

const WizardStepper = ({ 
  steps = [], 
  activeStep = 0, 
  completedSteps = new Set(),
  orientation = 'horizontal',
  showLabels = true,
  ...props 
}) => {
  return (
    <Box sx={{ width: '100%', ...props.sx }}>
      <Stepper 
        activeStep={activeStep} 
        connector={<CustomConnector />}
        orientation={orientation}
        {...props}
      >
        {steps.map((step, index) => (
          <Step key={step.id || index} completed={completedSteps.has(index)}>
            <CustomStepLabel StepIconComponent={CustomStepIcon}>
              {showLabels && (
                <Box>
                  <Typography variant="subtitle2">
                    {step.label || step.name}
                  </Typography>
                  {step.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {step.description}
                    </Typography>
                  )}
                </Box>
              )}
            </CustomStepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default WizardStepper;
