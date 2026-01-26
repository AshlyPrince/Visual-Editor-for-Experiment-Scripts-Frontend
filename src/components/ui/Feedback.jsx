import React from 'react';
import { 
  Alert,
  AlertTitle,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Box,
  Typography,
  Fade,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { createAlertStyles } from '../../styles/components';
import { gradients, colors } from '../../styles/tokens';

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  ...createAlertStyles(theme, severity)
}));

export const LoadingSpinner = ({ 
  size = 40, 
  color = 'primary',
  centered = false,
  ...props 
}) => {
  const spinner = <CircularProgress size={size} color={color} {...props} />;
  
  if (centered) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 100 
        }}
      >
        {spinner}
      </Box>
    );
  }
  
  return spinner;
};

export const LoadingBar = ({ 
  variant = 'indeterminate',
  color = 'primary',
  ...props 
}) => (
  <LinearProgress 
    variant={variant}
    color={color}
    sx={{
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(0,0,0,0.1)'
    }}
    {...props}
  />
);

export const LoadingOverlay = ({ loading, children }) => (
  <Box sx={{ position: 'relative' }}>
    {children}
    {loading && (
      <Fade in={loading}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <LoadingSpinner />
        </Box>
      </Fade>
    )}
  </Box>
);

export const ContentSkeleton = ({ 
  variant = 'rectangular',
  width = '100%',
  height = 40,
  animation = 'pulse',
  lines = 1,
  ...props 
}) => {
  if (lines > 1) {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            width={index === lines - 1 ? '60%' : width}
            height={height}
            animation={animation}
            sx={{ mb: 1 }}
            {...props}
          />
        ))}
      </Box>
    );
  }

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      {...props}
    />
  );
};

export const AlertMessage = ({ 
  severity = 'info', 
  title, 
  message,
  children,
  onClose,
  ...props 
}) => {
  const icons = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />
  };

  return (
    <StyledAlert 
      severity={severity} 
      onClose={onClose}
      icon={icons[severity]}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message || children}
    </StyledAlert>
  );
};

export const NotificationSnackbar = ({
  open,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  ...props
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
    {...props}
  >
    <StyledAlert 
      onClose={onClose} 
      severity={severity}
      variant="filled"
    >
      {message}
    </StyledAlert>
  </Snackbar>
);

export const StatusIndicator = ({ 
  status, 
  label,
  size = 'medium' 
}) => {
  const statusConfig = {
    active: { color: colors.success.main, label: 'Active' },
    inactive: { color: colors.gray.main, label: 'Inactive' },
    pending: { color: colors.warning.main, label: 'Pending' },
    error: { color: colors.error.main, label: 'Error' },
    draft: { color: colors.blue.main, label: 'Draft' }
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const dotSize = size === 'small' ? 8 : size === 'large' ? 16 : 12;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: config.color
        }}
      />
      <Typography variant={size === 'small' ? 'caption' : 'body2'}>
        {label || config.label}
      </Typography>
    </Box>
  );
};

export const ProgressIndicator = ({ 
  value, 
  max = 100,
  label,
  showPercentage = true,
  color = 'primary'
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress 
        variant="determinate" 
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4
          }
        }}
      />
    </Box>
  );
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error is displayed to user via AlertMessage in render method
  }

  render() {
    if (this.state.hasError) {
      return (
        <AlertMessage 
          severity="error"
          title="Something went wrong"
          message="An unexpected error occurred. Please try refreshing the page."
        />
      );
    }

    return this.props.children;
  }
}

export default AlertMessage;
