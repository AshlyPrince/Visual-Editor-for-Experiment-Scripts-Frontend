import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

import safetyGloves from '../assets/icons/saftey/saftey-gloves.jpg';
import safetyGoggles from '../assets/icons/saftey/saftey-goggles.jpg';
import labCoat from '../assets/icons/saftey/saftey-dress.jpg';
import closedShoes from '../assets/icons/saftey/saftey-shoes.jpg';
import faceshield from '../assets/icons/saftey/saftey-faceshield.jpg';
import helmet from '../assets/icons/saftey/saftey-helmet.jpg';
import mask from '../assets/icons/saftey/saftey-mask.jpg';
import headset from '../assets/icons/saftey/saftey-headset.jpg';
import highVisibilityJacket from '../assets/icons/saftey/saftey-highvisibilityjackets.jpg';

const SafetyIconLibrary = ({ onIconsSelected }) => {
  const { t } = useTranslation();
  
  const DEFAULT_SAFETY_ICONS = [
    {
      id: 'gloves',
      name: t('safety.gloves'),
      description: t('safety.glovesDesc'),
      data: safetyGloves
    },
    {
      id: 'goggles',
      name: t('safety.goggles'),
      description: t('safety.gogglesDesc'),
      data: safetyGoggles
    },
    {
      id: 'lab-coat',
      name: t('safety.labCoat'),
      description: t('safety.labCoatDesc'),
      data: labCoat
    },
    {
      id: 'closed-shoes',
      name: t('safety.shoes'),
      description: t('safety.shoesDesc'),
      data: closedShoes
    },
    {
      id: 'faceshield',
      name: t('safety.faceShield'),
      description: t('safety.faceShieldDesc'),
      data: faceshield
    },
    {
      id: 'helmet',
      name: t('safety.helmet'),
      description: t('safety.helmetDesc'),
      data: helmet
    },
    {
      id: 'mask',
      name: t('safety.mask'),
      description: t('safety.maskDesc'),
      data: mask
    },
    {
      id: 'headset',
      name: t('safety.hearingProtection'),
      description: t('safety.hearingProtectionDesc'),
      data: headset
    },
    {
      id: 'high-visibility',
      name: t('safety.highVisJacket'),
      description: t('safety.highVisJacketDesc'),
      data: highVisibilityJacket
    }
  ];
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
        {t('safety.addPPEIcons')}
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('safety.ppeLibrary')}
          <Typography variant="body2" color="text.secondary">
            {t('safety.selectRequiredPPE')}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('safety.ppeIconsInfo')}
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
              {t('safety.iconsSelected', { count: selectedIcons.length })}
            </Typography>
            <Box>
              <Button onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddSelected}
                disabled={selectedIcons.length === 0}
              >
                {t('safety.addSelected', { count: selectedIcons.length })}
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SafetyIconLibrary;
