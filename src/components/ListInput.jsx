import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  IconButton,
  Button,
  List,
  ListItem,
  Typography,
  Paper,
  Chip,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

const ListInput = ({ 
  items = [], 
  onChange, 
  label,
  placeholder,
  addButtonText,
  emptyText,
  maxItems = 50,
  showNumbers = false,
  variant = 'outlined', 
}) => {
  const { t } = useTranslation();
  
  const finalLabel = label || t('common.items');
  const finalPlaceholder = placeholder || t('common.item');
  const finalAddButtonText = addButtonText || t('common.add');
  const finalEmptyText = emptyText || t('messages.noItemsYet');
  const handleAdd = () => {
    if (items.length < maxItems) {
      onChange([...items, '']);
    }
  };

  const handleUpdate = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={1.5}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {finalLabel}
          </Typography>
          {items.length > 0 && (
            <Chip 
              label={items.length} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={items.length >= maxItems}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {finalAddButtonText}
        </Button>
      </Box>
      
      <Box 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          minHeight: items.length === 0 ? 100 : 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {items.length > 0 ? (
          <List sx={{ p: 1.5, pt: 1 }}>
            {items.map((item, index) => (
              <Fade in key={index} timeout={300}>
                <ListItem 
                  sx={{ 
                    px: 0, 
                    py: 0.75,
                    gap: 1,
                    alignItems: 'center',
                    '&:hover': {
                      '& .drag-handle': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  {showNumbers && (
                    <Chip
                      label={index + 1}
                      size="small"
                      color="primary"
                      sx={{ 
                        minWidth: 32,
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  
                  <TextField
                    fullWidth
                    size="small"
                    value={item}
                    onChange={(e) => handleUpdate(index, e.target.value)}
                    placeholder={`${finalPlaceholder} ${index + 1}`}
                    variant={variant}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'background.paper',
                        }
                      }
                    }}
                  />
                  
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemove(index)}
                    color="error"
                    sx={{ 
                      ml: 0.5,
                      '&:hover': {
                        bgcolor: 'error.lighter',
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              </Fade>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
              px: 2,
              textAlign: 'center',
              minHeight: 100,
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontStyle: 'italic', mb: 1 }}
            >
              {finalEmptyText}
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ textTransform: 'none' }}
            >
              {finalAddButtonText}
            </Button>
          </Box>
        )}
      </Box>
      
      {items.length > 0 && maxItems && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 0.5, display: 'block' }}
        >
          {t('messages.itemsCount', { count: items.length, max: maxItems })}
        </Typography>
      )}
    </Box>
  );
};

export default ListInput;
