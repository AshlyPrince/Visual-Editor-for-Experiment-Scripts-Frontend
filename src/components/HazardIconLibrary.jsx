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

import ghsExplosive from '../assets/icons/ghs/GHS01-explosive.png';
import ghsFlammable from '../assets/icons/ghs/GHS02-flammable.png';
import ghsOxidizing from '../assets/icons/ghs/GHS03-oxidizing.png';
import ghsCompressedGas from '../assets/icons/ghs/GHS04-compressed-gas.png';
import ghsCorrosive from '../assets/icons/ghs/GHS05-corrosive.png';
import ghsToxic from '../assets/icons/ghs/GHS06-toxic.png';
import ghsIrritant from '../assets/icons/ghs/GHS07-irritant.png';
import ghsHealthHazard from '../assets/icons/ghs/GHS08-health-hazard.png';
import ghsEnvironmental from '../assets/icons/ghs/GHS09-environmental.png';

const HazardIconLibrary = ({ onIconsSelected }) => {
  const { t } = useTranslation();
  
  const DEFAULT_HAZARD_ICONS = [
    {
      id: 'explosive',
      code: 'GHS01',
      name: t('hazard.explosive'),
      description: t('hazard.explosiveDesc'),
      data: ghsExplosive
    },
    {
      id: 'flammable',
      code: 'GHS02',
      name: t('hazard.flammable'),
      description: t('hazard.flammableDesc'),
      data: ghsFlammable
    },
    {
      id: 'oxidizing',
      code: 'GHS03',
      name: t('hazard.oxidizing'),
      description: t('hazard.oxidizingDesc'),
      data: ghsOxidizing
    },
    {
      id: 'compressed-gas',
      code: 'GHS04',
      name: t('hazard.compressedGas'),
      description: t('hazard.compressedGasDesc'),
      data: ghsCompressedGas
    },
    {
      id: 'corrosive',
      code: 'GHS05',
      name: t('hazard.corrosive'),
      description: t('hazard.corrosiveDesc'),
      data: ghsCorrosive
    },
    {
      id: 'toxic',
      code: 'GHS06',
      name: t('hazard.toxic'),
      description: t('hazard.toxicDesc'),
      data: ghsToxic
    },
    {
      id: 'irritant',
      code: 'GHS07',
      name: t('hazard.irritant'),
      description: t('hazard.irritantDesc'),
      data: ghsIrritant
    },
    {
      id: 'health-hazard',
      code: 'GHS08',
      name: t('hazard.healthHazard'),
      description: t('hazard.healthHazardDesc'),
      data: ghsHealthHazard
    },
    {
      id: 'environmental',
      code: 'GHS09',
      name: t('hazard.environmental'),
      description: t('hazard.environmentalDesc'),
      data: ghsEnvironmental
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
        size: icon.data.length,
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
        {t('hazard.addHazardPictograms')}
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('hazard.pictogramLibrary')}
          <Typography variant="body2" color="text.secondary">
            {t('hazard.selectHazardPictograms')}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('hazard.ghsInfo')}
          </Alert>

          <Grid container spacing={2}>
            {DEFAULT_HAZARD_ICONS.map((icon) => {
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
              {t('hazard.pictogramsSelected', { count: selectedIcons.length })}
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
                {t('hazard.addSelected', { count: selectedIcons.length })}
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HazardIconLibrary;
