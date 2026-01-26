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

import ghsExplosive from '../assets/icons/ghs/GHS01-explosive.png';
import ghsFlammable from '../assets/icons/ghs/GHS02-flammable.png';
import ghsOxidizing from '../assets/icons/ghs/GHS03-oxidizing.png';
import ghsCompressedGas from '../assets/icons/ghs/GHS04-compressed-gas.png';
import ghsCorrosive from '../assets/icons/ghs/GHS05-corrosive.png';
import ghsToxic from '../assets/icons/ghs/GHS06-toxic.png';
import ghsIrritant from '../assets/icons/ghs/GHS07-irritant.png';
import ghsHealthHazard from '../assets/icons/ghs/GHS08-health-hazard.png';
import ghsEnvironmental from '../assets/icons/ghs/GHS09-environmental.png';

const DEFAULT_HAZARD_ICONS = [
  {
    id: 'explosive',
    code: 'GHS01',
    name: 'Explosive',
    description: 'Explosionsgefährlich',
    data: ghsExplosive
  },
  {
    id: 'flammable',
    code: 'GHS02',
    name: 'Flammable',
    description: 'Leicht/Hoch entzündlich',
    data: ghsFlammable
  },
  {
    id: 'oxidizing',
    code: 'GHS03',
    name: 'Oxidizing',
    description: 'Brandfördernd',
    data: ghsOxidizing
  },
  {
    id: 'compressed-gas',
    code: 'GHS04',
    name: 'Compressed Gas',
    description: 'Komprimierte Gase',
    data: ghsCompressedGas
  },
  {
    id: 'corrosive',
    code: 'GHS05',
    name: 'Corrosive',
    description: 'Ätzend',
    data: ghsCorrosive
  },
  {
    id: 'toxic',
    code: 'GHS06',
    name: 'Acute Toxicity',
    description: 'Giftig/Sehr giftig',
    data: ghsToxic
  },
  {
    id: 'irritant',
    code: 'GHS07',
    name: 'Irritant/Harmful',
    description: 'Gesundheitsgefährdend',
    data: ghsIrritant
  },
  {
    id: 'health-hazard',
    code: 'GHS08',
    name: 'Health Hazard',
    description: 'Gesundheitsschädlich',
    data: ghsHealthHazard
  },
  {
    id: 'environmental',
    code: 'GHS09',
    name: 'Environmental Hazard',
    description: 'Umweltgefährdend',
    data: ghsEnvironmental
  }
];

const HazardIconLibrary = ({ onIconsSelected }) => {
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
        Add Hazard Pictograms
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Hazard Pictogram Library
          <Typography variant="body2" color="text.secondary">
            Select hazard pictograms to add to your experiment
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select one or more hazard pictograms below. These follow the Globally Harmonized System (GHS) standards.
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
              {selectedIcons.length} pictogram{selectedIcons.length !== 1 ? 's' : ''} selected
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

export default HazardIconLibrary;
