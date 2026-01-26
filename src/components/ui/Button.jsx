import React from 'react';
import { 
  Button, 
  IconButton, 
  Fab,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createButtonStyles } from '../../styles/components';
import { colors, borderRadius, shadows } from '../../styles/tokens';

const PrimaryButton = styled(Button)(({ theme, size = 'medium' }) => ({
  ...createButtonStyles(theme, 'primary'),
  ...(size === 'large' && {
    fontSize: '1rem',
    py: 2,
    px: 5
  }),
  ...(size === 'small' && {
    fontSize: '0.875rem',
    py: 1,
    px: 3
  })
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  ...createButtonStyles(theme, 'secondary')
}));

const OutlinedButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: borderRadius.md,
  fontWeight: 600,
  px: 4,
  py: 1.5,
  borderWidth: 2,
  '&:hover': {
    borderWidth: 2,
    transform: 'translateY(-1px)',
    boxShadow: shadows.sm
  },
  transition: 'all 0.2s ease'
}));

const IconButtonStyled = styled(IconButton)(({ theme, variant = 'default' }) => {
  const variants = {
    default: {
      ...createButtonStyles(theme, 'icon')
    },
    solid: {
      background: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        background: theme.palette.primary.dark,
        transform: 'scale(1.1)'
      }
    },
    soft: {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'scale(1.05)'
      }
    }
  };

  return variants[variant] || variants.default;
});

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  boxShadow: shadows.lg,
  '&:hover': {
    background: theme.palette.primary.dark,
    boxShadow: shadows.xl,
    transform: 'scale(1.05)'
  },
  transition: 'all 0.3s ease'
}));

const ButtonGroup = ({ children, spacing = 2, direction = 'row', ...props }) => (
  <div 
    style={{
      display: 'flex',
      flexDirection: direction,
      gap: `${spacing * 8}px`,
      alignItems: 'center'
    }}
    {...props}
  >
    {children}
  </div>
);

export {
  PrimaryButton,
  SecondaryButton,
  OutlinedButton,
  IconButtonStyled,
  FloatingActionButton,
  ButtonGroup
};

export default PrimaryButton;
