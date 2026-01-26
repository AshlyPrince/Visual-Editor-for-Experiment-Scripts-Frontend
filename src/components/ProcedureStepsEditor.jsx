import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  Paper,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notes as NotesIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';
import MediaUploader from './MediaUploader';

const ProcedureStepsEditor = ({ steps = [], onChange }) => {
  const [expandedSteps, setExpandedSteps] = useState({});
  const [expandedMedia, setExpandedMedia] = useState({});

  
  useEffect(() => {
    const newExpandedSteps = {};
    const newExpandedMedia = {};
    
    steps.forEach((step, index) => {
      
      if (step.notes && step.notes.trim()) {
        newExpandedSteps[index] = true;
      }
      
      if (step.media && step.media.length > 0) {
        newExpandedMedia[index] = true;
      }
    });
    
    setExpandedSteps(newExpandedSteps);
    setExpandedMedia(newExpandedMedia);
  }, []); 

  const handleAddStep = () => {
    onChange([...steps, { text: '', notes: '', media: [] }]);
  };

  const handleUpdateStepText = (index, text) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], text };
    onChange(newSteps);
  };

  const handleUpdateStepNotes = (index, notes) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], notes };
    onChange(newSteps);
  };

  const handleUpdateStepMedia = (index, media) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], media };
    onChange(newSteps);
  };

  const handleRemoveStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };

  const toggleExpanded = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleMediaExpanded = (index) => {
    setExpandedMedia(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Procedure Steps
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddStep}
          sx={{ textTransform: 'none' }}
        >
          Add Step
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              border: '1px dashed',
              borderColor: 'grey.300',
            }}
          >
            <Typography color="text.secondary">
              No steps added yet. Click "Add Step" to begin.
            </Typography>
          </Paper>
        ) : (
          steps.map((step, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                >
                  {index + 1}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={step.text}
                    onChange={(e) => handleUpdateStepText(index, e.target.value)}
                    placeholder={`Add procedure step ${index + 1}...`}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={expandedSteps[index] ? <ExpandLessIcon /> : <NotesIcon />}
                      onClick={() => toggleExpanded(index)}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      {expandedSteps[index] ? 'Hide Notes' : 'Add Notes / Table / Links'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={expandedMedia[index] ? <ExpandLessIcon /> : <ImageIcon />}
                      onClick={() => toggleMediaExpanded(index)}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      {expandedMedia[index] ? 'Hide Media' : 'Add Images / Videos'}
                      {step.media && step.media.length > 0 && ` (${step.media.length})`}
                    </Button>
                  </Box>

                  <Collapse in={expandedMedia[index]}>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        📷 Attach images or videos to this step:
                      </Typography>
                      <MediaUploader
                        media={step.media || []}
                        onChange={(media) => handleUpdateStepMedia(index, media)}
                        acceptImages={true}
                        acceptVideos={true}
                        maxFiles={5}
                        maxSize={10}
                      />
                    </Box>
                  </Collapse>

                  <Collapse in={expandedSteps[index]}>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Add additional information, tables, or notes for this step:
                      </Typography>
                      <RichTextEditor
                        value={step.notes || ''}
                        onChange={(notes) => handleUpdateStepNotes(index, notes)}
                        placeholder="Add tables, formatted text, links, or additional instructions..."
                      />
                    </Box>
                  </Collapse>
                </Box>

                <IconButton
                  onClick={() => handleRemoveStep(index)}
                  size="small"
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {steps.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {steps.length} / 50 items
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProcedureStepsEditor;
