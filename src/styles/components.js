import { alpha } from '@mui/material/styles';
import { colors, corporateColors, gradients, shadows, borderRadius } from './tokens';

export const createCardStyles = (theme, variant = 'default') => {
  
  const dividerColor = theme?.palette?.divider || colors.gray[200];
  
  const variants = {
    default: {
      p: 3,
      borderRadius: borderRadius.lg,
      border: `1px solid ${alpha(dividerColor, 0.2)}`,
      boxShadow: shadows.sm,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: shadows.hover,
        transform: 'translateY(-2px)'
      }
    },
    elevated: {
      p: 4,
      borderRadius: borderRadius.xl,
      background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.1)} 0%, ${alpha(colors.secondary.main, 0.1)} 100%)`,
      border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
      boxShadow: shadows.lg,
    },
    interactive: {
      p: 3,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `1px solid ${alpha(dividerColor, 0.2)}`,
      '&:hover': {
        borderColor: theme?.palette?.primary?.main || colors.primary.main,
        boxShadow: shadows.hover,
        transform: 'translateY(-2px)'
      }
    }
  };

  return variants[variant] || variants.default;
};

export const createButtonStyles = (theme, variant = 'primary') => {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`, 
      color: 'white',
      fontWeight: 600,
      borderRadius: borderRadius.lg,
      px: 4,
      py: 1.5,
      boxShadow: `0 4px 12px rgba(139, 195, 74, 0.3)`, 
      '&:hover': {
        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary[800]} 100%)`,
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 16px rgba(139, 195, 74, 0.4)`
      },
      transition: 'all 0.3s ease'
    },
    secondary: {
      borderRadius: borderRadius.lg,
      fontWeight: 600,
      px: 4,
      py: 1.5,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: shadows.lg
      },
      transition: 'all 0.3s ease'
    },
    icon: {
      p: 1,
      borderRadius: borderRadius.md,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)',
      }
    }
  };

  return variants[variant] || variants.primary;
};

export const createTimelineStyles = (theme) => ({
  container: {
    position: 'relative'
  },
  line: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    background: gradients.primary,
    borderRadius: 1,
    opacity: 0.3
  },
  item: {
    position: 'relative',
    pl: 7,
    pb: 3
  },
  dot: (isActive) => ({
    position: 'absolute',
    left: 16,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: isActive ? gradients.primary : '#cbd5e1',
    border: '3px solid white',
    boxShadow: shadows.sm,
    zIndex: 1
  })
});

export const createDialogStyles = (theme) => ({
  paper: {
    borderRadius: borderRadius.xl,
    backgroundImage: 'none',
    boxShadow: shadows.xl
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 3
  },
  titleIcon: {
    p: 1.5,
    borderRadius: borderRadius.md,
    background: gradients.primary,
    color: 'white'
  },
  content: {
    px: 3
  },
  actions: {
    p: 3,
    pt: 2
  }
});

export const createFormStyles = (theme) => ({
  container: {
    display: 'grid',
    gap: 3
  },
  field: {
    '& .MuiInputLabel-root': { 
      fontWeight: 600 
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.md
    }
  },
  fieldGroup: {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(250px, 1fr))' }
  }
});

export const createAlertStyles = (theme, severity = 'info') => ({
  borderRadius: borderRadius.lg,
  fontWeight: 500,
  '& .MuiAlert-message': { 
    fontSize: '0.95rem' 
  }
});
