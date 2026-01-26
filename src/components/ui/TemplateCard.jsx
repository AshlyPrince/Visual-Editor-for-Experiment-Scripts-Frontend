import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { createCardStyles } from '../../styles/components';
import { gradients, colors } from '../../styles/tokens';

const StyledCard = styled(Card)(({ theme }) => ({
  ...createCardStyles(theme, 'interactive'),
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem'
}));

const TemplateAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: gradients.primary,
  fontSize: '1.25rem',
  fontWeight: 600
}));

const TemplateCard = ({ 
  template, 
  onClick, 
  selected = false,
  ...props 
}) => {
  const getCategoryColor = (category) => {
    const categoryColors = {
      survey: colors.info.main,
      testing: colors.secondary.main,
      analytics: colors.success.main,
      feedback: colors.warning.main,
      research: colors.primary.main
    };
    return categoryColors[category] || colors.gray.main;
  };

  const getTemplateInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledCard 
      onClick={onClick}
      sx={{
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'primary.50' : 'background.paper',
        ...props.sx
      }}
      {...props}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <TemplateAvatar>
            {getTemplateInitials(template.name)}
          </TemplateAvatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {template.name}
            </Typography>
            <CategoryChip 
              label={template.category}
              size="small"
              sx={{ 
                backgroundColor: getCategoryColor(template.category),
                color: 'white'
              }}
            />
          </Box>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {template.sections?.length || 0} sections
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v{template.version}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TemplateCard;
