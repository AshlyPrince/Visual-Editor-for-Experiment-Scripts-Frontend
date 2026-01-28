import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Chip,
  IconButton,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  History as HistoryIcon,
  ArrowBack,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import experimentService from '../services/experimentService.js';
import RichTextEditor from './RichTextEditor.jsx';
import ListInput from './ListInput.jsx';
import ProcedureStepsEditor from './ProcedureStepsEditor.jsx';
import CreateVersionDialog from './CreateVersionDialog.jsx';
import VersionHistory from './VersionHistory.jsx';
import ExportDialog from './ExportDialog.jsx';
import VersionConflictDialog from './VersionConflictDialog.jsx';
import MediaUploader from './MediaUploader.jsx';
import { normalizeExperiment, denormalizeExperiment, denormalizeSection, getContentSummary } from '../utils/experimentDataNormalizer.js';

const availableSectionTemplates = [
  { id: 'objectives', name: 'Objectives', icon: '🎯', type: 'rich-text' },
  { id: 'materials', name: 'Materials', icon: '🧪', type: 'list' },
  { id: 'chemicals', name: 'Chemicals', icon: '⚗️', type: 'list' },
  { id: 'procedure', name: 'Procedure', icon: '📋', type: 'rich-text' },
  { id: 'safety', name: 'Safety', icon: '⚠️', type: 'rich-text' },
  { id: 'hazards', name: 'Potential Hazards', icon: '🚫', type: 'rich-text' },
  { id: 'disposal', name: 'Disposal', icon: '♻️', type: 'rich-text' },
];

const ExperimentEditor = ({ experimentId, onClose, onSaved }) => {
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [course, setCourse] = useState('');
  const [program, setProgram] = useState('');
  const [tags, setTags] = useState([]);
  const [saveVersionOpen, setSaveVersionOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);

  useEffect(() => {
    if (experimentId) {
      loadExperiment();
    }
  }, [experimentId]);

  const loadExperiment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rawData = await experimentService.getExperiment(experimentId);
      const normalizedData = normalizeExperiment(rawData);
      
      setExperiment(normalizedData);
      setTitle(normalizedData.title || '');
      setDuration(normalizedData.estimated_duration || '');
      setCourse(normalizedData.course || '');
      setProgram(normalizedData.program || '');
      
      if (normalizedData.sections && normalizedData.sections.length > 0) {
        setSections(normalizedData.sections);
      } else {
        setSections([]);
      }
      
    } catch (err) {
      setError(err.message || 'Unable to load experiment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (sectionId, content) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, content } : section
    ));
    setHasUnsavedChanges(true);
  };

  const removeSection = (sectionId) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    setHasUnsavedChanges(true);
  };

  const handleAddSection = () => {
    if (!newSectionType) return;
    
    const template = availableSectionTemplates.find(t => t.id === newSectionType);
    if (!template) return;

    const newSection = {
      id: `${template.id}_${Date.now()}`,
      name: template.name,
      icon: template.icon,
      type: template.type,
      content: template.type === 'list' ? [] : '',
      media: [], 
    };

    setSections(prev => [...prev, newSection]);
    setHasUnsavedChanges(true);
    setAddSectionOpen(false);
    setNewSectionType('');
  };

  const getAvailableSections = () => {
    const existingSectionBaseIds = sections.map(section => {
      return section.id.replace(/_\d+$/, '');
    });
    
    return availableSectionTemplates.filter(
      template => !existingSectionBaseIds.includes(template.id)
    );
  };

  const getUpdatedExperiment = () => {
    const updatedExperiment = denormalizeExperiment(
      {
        ...experiment,
        title,
        estimated_duration: duration,
        course,
        program
      },
      sections
    );
    
    if (!updatedExperiment.content) {
      updatedExperiment.content = {};
    }
    if (!updatedExperiment.content.config) {
      updatedExperiment.content.config = {};
    }
    
    updatedExperiment.content.config.duration = duration || '';
    updatedExperiment.content.config.subject = course || '';
    updatedExperiment.content.config.gradeLevel = program || '';
    updatedExperiment.estimated_duration = duration;
    updatedExperiment.course = course;
    updatedExperiment.program = program;
    
    return updatedExperiment;
  };

  const handleSaveClick = () => {
    if (!hasUnsavedChanges) {
      alert('No changes to save');
      return;
    }
    setSaveVersionOpen(true);
  };

  const handleVersionCreated = async (newVersion, errorInfo) => {
    if (errorInfo?.conflict) {
      setSaveVersionOpen(false);
      
      if (errorInfo?.shouldReload) {
        const shouldReload = window.confirm(
          'Version Conflict Detected\n\n' +
          'Another user has saved changes to this experiment.\n\n' +
          'Would you like to reload the latest version?\n\n' +
          'Note: Clicking OK will discard your unsaved changes.\n' +
          'Click Cancel to copy your changes to clipboard first.'
        );
        
        if (shouldReload) {
          await loadExperiment();
          setHasUnsavedChanges(false);
          alert('Latest version has been loaded successfully.');
        } else {
          const changes = JSON.stringify(getUpdatedExperiment(), null, 2);
          navigator.clipboard.writeText(changes);
          alert('Your changes have been copied to clipboard.');
        }
      } else {
        try {
          const latestExp = await experimentService.getExperiment(experimentId);
          setConflictDetails({
            yourVersion: experiment.current_version_number,
            currentVersion: latestExp.current_version_number,
            updatedBy: latestExp.updated_by || 'Another user',
          });
          setConflictDialogOpen(true);
        } catch (err) {
          alert('Version conflict detected. Please reload the page.');
        }
      }
      return;
    }

    setHasUnsavedChanges(false);
    setSaveVersionOpen(false);
    
    try {
      await loadExperiment();
      if (onSaved) {
        onSaved(newVersion);
      }
    } catch (err) {
      if (onSaved) {
        onSaved(newVersion);
      }
    }
  };

  const handleVersionRestored = async () => {
    await loadExperiment();
    setHasUnsavedChanges(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadExperiment}>Retry</Button>
      </Container>
    );
  }

  if (!experiment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Experiment not found</Alert>
      </Container>
    );
  }

  const handleMediaChange = (sectionId, newMediaArray) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          media: newMediaArray
        };
      }
      return section;
    }));
    setHasUnsavedChanges(true);
  };

  const renderSectionEditor = (section) => {
    const isProcedureWithComplexSteps = (section.id === 'procedure' || section.type === 'procedure-steps') && 
      ((Array.isArray(section.content) && 
        section.content.length > 0 && 
        typeof section.content[0] === 'object' && 
        section.content[0] !== null &&
        ('text' in section.content[0] || 'notes' in section.content[0] || 'media' in section.content[0])) ||
       (section.content?.steps && Array.isArray(section.content.steps)));
    
    const procedureSteps = isProcedureWithComplexSteps 
      ? (section.content?.steps || section.content)
      : [];
    
    const materialsItems = section.type === 'materials_with_media'
      ? (section.content?.items || (Array.isArray(section.content) ? section.content : []))
      : [];
    
    const listItems = section.type === 'list'
      ? (section.content?.items || (Array.isArray(section.content) ? section.content : []))
      : [];

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          {isProcedureWithComplexSteps ? (
            <ProcedureStepsEditor
              steps={procedureSteps}
              onChange={(newSteps) => updateSectionContent(section.id, newSteps)}
            />
          ) : section.type === 'list' ? (
            <ListInput
              items={listItems}
              onChange={(newContent) => updateSectionContent(section.id, newContent)}
              placeholder={`Add ${section.name.toLowerCase()} items...`}
            />
          ) : section.type === 'materials_with_media' && section.id !== 'hazards' ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  List all materials students need. You can optionally add a photo to help with recognition.
                </Typography>
              </Alert>
              
              <Stack spacing={2}>
                {materialsItems.map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Material {index + 1}
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Material name"
                        placeholder="e.g., Beaker (250ml), Safety goggles, pH meter"
                        value={item.name || ''}
                        onChange={(e) => {
                          const newItems = [...materialsItems];
                          newItems[index] = { ...newItems[index], name: e.target.value };
                          updateSectionContent(section.id, newItems);
                        }}
                        required
                      />
                      
                      {item.media && item.media.data ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Reference photo
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                              component="img"
                              src={item.media.data}
                              alt={item.media.name || 'Material photo'}
                              sx={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            />
                            <Stack spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                component="label"
                              >
                                Replace photo
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newItems = [...materialsItems];
                                        newItems[index] = {
                                          ...newItems[index],
                                          media: {
                                            data: reader.result,
                                            name: file.name,
                                            type: file.type,
                                            size: file.size
                                          }
                                        };
                                        updateSectionContent(section.id, newItems);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={() => {
                                  const newItems = [...materialsItems];
                                  newItems[index] = { ...newItems[index], media: null };
                                  updateSectionContent(section.id, newItems);
                                }}
                              >
                                Remove photo
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          component="label"
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          + Add reference photo (optional)
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newItems = [...materialsItems];
                                  newItems[index] = {
                                    ...newItems[index],
                                    media: {
                                      data: reader.result,
                                      name: file.name,
                                      type: file.type,
                                      size: file.size
                                    }
                                  };
                                  updateSectionContent(section.id, newItems);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </Button>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const newItems = materialsItems.filter((_, i) => i !== index);
                            updateSectionContent(section.id, newItems);
                          }}
                          sx={{ textTransform: 'none' }}
                        >
                          Remove material
                        </Button>
                      </Box>
                    </Stack>
                  </Card>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newItems = [...materialsItems, { name: '', media: null }];
                    updateSectionContent(section.id, newItems);
                  }}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Material
                </Button>
              </Stack>
            </Box>
          ) : section.type === 'rich-text' ? (
            <RichTextEditor
              value={typeof section.content === 'string' ? section.content : ''}
              onChange={(newContent) => updateSectionContent(section.id, newContent)}
              placeholder={`Enter ${section.name.toLowerCase()}...`}
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={typeof section.content === 'string' ? section.content : ''}
              onChange={(e) => updateSectionContent(section.id, e.target.value)}
              placeholder={`Enter ${section.name.toLowerCase()}...`}
            />
          )}
        </Box>

        {!isProcedureWithComplexSteps && section.type !== 'materials_with_media' && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              📷 Media (Images & Videos)
            </Typography>
            
            <MediaUploader
              media={section.media || []}
              onChange={(newMediaArray) => handleMediaChange(section.id, newMediaArray)}
              maxFiles={10}
              acceptImages={true}
              acceptVideos={true}
              showSafetyIcons={section.id === 'safety'}
              showHazardIcons={section.id === 'hazards'}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <TextField
          fullWidth
          variant="standard"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Experiment Title"
          sx={{
            mb: 2,
            '& .MuiInputBase-input': {
              fontSize: '1.75rem',
              fontWeight: 600,
              lineHeight: 1.3,
            },
          }}
        />
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`Version ${experiment?.current_version_number || 1}`}
            color="primary"
            size="small"
          />
          {hasUnsavedChanges && (
            <Chip
              label="Unsaved Changes"
              color="warning"
              size="small"
            />
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveClick}
            disabled={!hasUnsavedChanges}
            color="primary"
            size="large"
          >
            Save as New Version
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Basic Information
          </Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setMetadataDialogOpen(true)}
          >
            Edit
          </Button>
        </Box>
        {(duration || course || program) ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {duration && (
              <Chip 
                label={duration} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
            {course && (
              <Chip 
                label={course} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
            {program && (
              <Chip 
                label={program} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No metadata added yet. Click Edit to add duration, course, or program information.
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} key={section.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {section.icon} {section.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeSection(section.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {renderSectionEditor(section)}
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddSectionOpen(true)}
            fullWidth
            sx={{ py: 2 }}
          >
            Add New Section
          </Button>
        </Grid>
      </Grid>

      <Dialog open={addSectionOpen} onClose={() => setAddSectionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          {getAvailableSections().length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Select a section type to add to your experiment. Only sections not yet included are shown.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Section Type</InputLabel>
                <Select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  label="Section Type"
                >
                  {getAvailableSections().map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              All available section types have been added to this experiment.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddSectionOpen(false);
            setNewSectionType('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSection} 
            variant="contained" 
            disabled={!newSectionType || getAvailableSections().length === 0}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {experiment && (
        <CreateVersionDialog
          open={saveVersionOpen}
          onClose={() => setSaveVersionOpen(false)}
          experimentId={experimentId}
          currentVersion={experiment.current_version_number}
          updatedContent={getUpdatedExperiment()}
          onVersionCreated={handleVersionCreated}
        />
      )}

      <Dialog 
        open={metadataDialogOpen} 
        onClose={() => setMetadataDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Basic Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Duration (Optional)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 45 minutes, 1-2 hours"
              helperText="How long does this experiment take?"
            />
            <TextField
              fullWidth
              label="Course / Module (Optional)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g., Chemistry 101, Physics Lab"
              helperText="Which course is this experiment for?"
            />
            <TextField
              fullWidth
              label="Program / Semester (Optional)"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g., Year 1 Semester 2, BSc Chemistry"
              helperText="Which program or semester?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setMetadataDialogOpen(false);
              setHasUnsavedChanges(true);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <VersionConflictDialog
        open={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        conflictDetails={conflictDetails}
        onReloadLatest={async () => {
          await loadExperiment();
          setHasUnsavedChanges(false);
          setConflictDialogOpen(false);
        }}
        onCopyChanges={() => {
          const changes = JSON.stringify(getUpdatedExperiment(), null, 2);
          navigator.clipboard.writeText(changes);
          alert('Your changes have been copied to clipboard!');
        }}
        onOpenInNewTab={() => {
          const changes = getUpdatedExperiment();
          localStorage.setItem('unsavedExperimentChanges', JSON.stringify(changes));
          window.open(`/experiments/${experimentId}/edit?restore=true`, '_blank');
        }}
      />
    </Container>
  );
};

export default ExperimentEditor;
