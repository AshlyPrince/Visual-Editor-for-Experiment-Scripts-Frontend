import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Checkbox,
  Stack,
  Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

import safetyGloves from '../assets/icons/saftey/saftey-gloves.png';
import safetyGoggles from '../assets/icons/saftey/saftey-goggles.png';
import labCoat from '../assets/icons/saftey/saftey-labcoat.png';
import closedShoes from '../assets/icons/saftey/saftey-shoes.png';
import faceshield from '../assets/icons/saftey/saftey-faceshield.png';
import helmet from '../assets/icons/saftey/saftey-helmet.png';
import mask from '../assets/icons/saftey/saftey-mask.png';
import headset from '../assets/icons/saftey/saftey-headset.png';
import highVisibilityJacket from '../assets/icons/saftey/saftey-highvisibilityjackets.png';

const DEFAULT_SAFETY_ICONS = [
  {
    id: 'gloves',
    name: 'Safety Gloves',
    description: 'Wear protective gloves',
    data: safetyGloves
  },
  {
    id: 'goggles',
    name: 'Safety Goggles',
    description: 'Wear safety goggles',
    data: safetyGoggles
  },
  {
    id: 'lab-coat',
    name: 'Lab Coat',
    description: 'Wear lab coat',
    data: labCoat
  },
  {
    id: 'closed-shoes',
    name: 'Safety Shoes',
    description: 'Wear closed-toe safety shoes',
    data: closedShoes
  },
  {
    id: 'faceshield',
    name: 'Face Shield',
    description: 'Wear face shield protection',
    data: faceshield
  },
  {
    id: 'helmet',
    name: 'Safety Helmet',
    description: 'Wear safety helmet',
    data: helmet
  },
  {
    id: 'mask',
    name: 'Respiratory Mask',
    description: 'Wear respiratory protection mask',
    data: mask
  },
  {
    id: 'headset',
    name: 'Hearing Protection',
    description: 'Wear hearing protection headset',
    data: headset
  },
  {
    id: 'high-visibility',
    name: 'High Visibility Jacket',
    description: 'Wear high visibility jacket',
    data: highVisibilityJacket
  }
];

const SafetyIconLibrary = ({ onIconsSelected }) => {
  const [open, setOpen] = useState(false);
  const [selectedIcons, setSelectedIcons] = useState([]);

  const handleToggleIcon = (icon) => {
    setSelectedIcons(prev => {
      const isSelected = prev.find(i => i.id === icon.id);
      if (isSelected) {
        return prev.filter(i => i.id !== icon.id);
      } else {
        return [...prev, icon];
      }
    });
  };

  const handleAddSelected = () => {
    if (selectedIcons.length > 0) {
      
      const mediaItems = selectedIcons.map(icon => ({
        type: 'image/png',
        data: icon.data,
        name: icon.name,
        caption: icon.description,
        size: 0,
        isDefault: true 
      }));
      
      onIconsSelected(mediaItems);
      setSelectedIcons([]);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<WarningIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 1 }}
      >
        Add PPE Icons
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Personal Protective Equipment (PPE) Library
          <Typography variant="body2" color="text.secondary">
            Select required PPE icons for safety measures
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select one or more PPE icons below. These indicate required personal protective equipment for the experiment.
          </Alert>

          <Grid container spacing={2}>
            {DEFAULT_SAFETY_ICONS.map((icon) => {
              const isSelected = selectedIcons.find(i => i.id === icon.id);
              
              return (
                <Grid item xs={6} sm={4} md={3} key={icon.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #4A90E2' : '1px solid #ddd',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleToggleIcon(icon)}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                      <Checkbox 
                        checked={!!isSelected}
                        onChange={() => handleToggleIcon(icon)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                    
                    <CardMedia
                      component="img"
                      image={icon.data}
                      alt={icon.name}
                      sx={{ 
                        height: 120,
                        objectFit: 'contain',
                        p: 2,
                        bgcolor: 'grey.100'
                      }}
                    />
                    
                    <CardContent sx={{ p: 1.5, pt: 1 }}>
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {icon.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {icon.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Stack direction="row" spacing={2} width="100%" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {selectedIcons.length} icon{selectedIcons.length !== 1 ? 's' : ''} selected
            </Typography>
            <Box>
              <Button onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddSelected}
                disabled={selectedIcons.length === 0}
              >
                Add Selected ({selectedIcons.length})
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SafetyIconLibrary;
