import React from 'react';
import { Box, Typography, Chip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Code as CodeIcon, Security as SecurityIcon } from '@mui/icons-material';
import { colors, gradients, shadows, borderRadius } from '../../styles/tokens';

const DevelopmentBadge = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 9999,
  background: `linear-gradient(135deg, ${alpha(colors.warning.main, 0.95)} 0%, ${alpha(colors.info.main, 0.95)} 100%)`,
  backdropFilter: 'blur(12px)',
  borderRadius: borderRadius.lg,
  padding: theme.spacing(2),
  border: `1px solid ${alpha(colors.warning.main, 0.3)}`,
  boxShadow: shadows.xl,
  minWidth: 200
}));

const DevelopmentModeIndicator = () => {
  const isDevelopmentMode = import.meta.env.VITE_DEVELOPMENT_MODE !== 'false';

  if (!isDevelopmentMode) {
    return null;
  }

  return (
    <DevelopmentBadge>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <CodeIcon sx={{ fontSize: 20, color: 'white' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
          Development Mode
        </Typography>
      </Box>
      
      <Typography variant="caption" sx={{ color: 'white', opacity: 0.9, display: 'block', mb: 1 }}>
        Using mock authentication and data
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon sx={{ fontSize: 16, color: 'white' }} />
        <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
          Mock User: Development Admin
        </Typography>
      </Box>
    </DevelopmentBadge>
  );
};

export default DevelopmentModeIndicator;
