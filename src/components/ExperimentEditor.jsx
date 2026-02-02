import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Fab,
  Tooltip,
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
  Chat as ChatIcon,
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
import ChatAssistant from './ChatAssistant.jsx';
import { normalizeExperiment, denormalizeExperiment, denormalizeSection, getContentSummary } from '../utils/experimentDataNormalizer.js';
import aiAssistantIcon from '../assets/icons/ai_assistant.png';

const ExperimentEditor = ({ experimentId, onClose, onSaved }) => {
  const { t } = useTranslation();
  
  const availableSectionTemplates = [
    { id: 'objectives', name: t('wizard.objectives'), icon: '🎯', type: 'rich-text' },
    { id: 'materials', name: t('wizard.materials'), icon: '🧪', type: 'list' },
    { id: 'chemicals', name: t('wizard.chemicals'), icon: '⚗️', type: 'list' },
    { id: 'procedure', name: t('wizard.procedure'), icon: '📋', type: 'rich-text' },
    { id: 'safety', name: t('wizard.safety'), icon: '⚠️', type: 'rich-text' },
    { id: 'hazards', name: t('wizard.potentialHazards'), icon: '🚫', type: 'rich-text' },
    { id: 'disposal', name: t('wizard.disposal'), icon: '♻️', type: 'rich-text' },
    { id: 'custom', name: t('wizard.customSection'), icon: '📝', type: 'rich-text' },
  ];
  
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
  const [customSectionDialogOpen, setCustomSectionDialogOpen] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const [customSectionDescription, setCustomSectionDescription] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (experimentId) {
      loadExperiment();
      const savedHistory = localStorage.getItem(`chat_history_${experimentId}`);
      if (savedHistory) {
        try {
          setChatHistory(JSON.parse(savedHistory));
        } catch (err) {
          console.error('Failed to load chat history:', err);
          setChatHistory([]);
        }
      }
    }
  }, [experimentId]);

  useEffect(() => {
    if (experimentId) {
      if (chatHistory.length > 0) {
        localStorage.setItem(`chat_history_${experimentId}`, JSON.stringify(chatHistory));
      } else {
        localStorage.removeItem(`chat_history_${experimentId}`);
      }
    }
  }, [experimentId, chatHistory]);

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
      setError(err.message || t('messages.loadError'));
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
    
    if (newSectionType === 'custom') {
      setAddSectionOpen(false);
      setCustomSectionDialogOpen(true);
      return;
    }
    
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

  const handleAddCustomSection = () => {
    if (!customSectionName.trim()) return;

    const newSection = {
      id: `custom_${Date.now()}`,
      name: customSectionName.trim(),
      icon: '📝',
      type: 'rich-text',
      content: customSectionDescription.trim() || '',
      media: [], 
    };

    setSections(prev => [...prev, newSection]);
    setHasUnsavedChanges(true);
    setCustomSectionDialogOpen(false);
    setCustomSectionName('');
    setCustomSectionDescription('');
    setNewSectionType('');
  };

  const getAvailableSections = () => {
    const existingSectionBaseIds = sections.map(section => {
      return section.id.replace(/_\d+$/, '').replace(/^custom_/, 'custom');
    });

    return availableSectionTemplates.filter(
      template => template.id === 'custom' || !existingSectionBaseIds.includes(template.id)
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
      alert(t('editor.unsavedChanges'));
      return;
    }
    setSaveVersionOpen(true);
  };

  const handleVersionCreated = async (newVersion, errorInfo) => {
    if (errorInfo?.conflict) {
      setSaveVersionOpen(false);
      
      if (errorInfo?.shouldReload) {
        const shouldReload = window.confirm(
          t('editor.versionConflictDetected') + '\n\n' +
          t('editor.anotherUserSavedChanges') + '\n\n' +
          t('editor.reloadLatestVersion') + '\n\n' +
          t('editor.reloadDiscardNote') + '\n' +
          t('editor.cancelToCopyChanges')
        );
        
        if (shouldReload) {
          await loadExperiment();
          setHasUnsavedChanges(false);
          alert(t('editor.latestVersionLoaded'));
        } else {
          const changes = JSON.stringify(getUpdatedExperiment(), null, 2);
          navigator.clipboard.writeText(changes);
          alert(t('editor.changesCopiedToClipboard'));
        }
      } else {
        try {
          const latestExp = await experimentService.getExperiment(experimentId);
          setConflictDetails({
            yourVersion: experiment.current_version_number,
            currentVersion: latestExp.current_version_number,
            updatedBy: latestExp.updated_by || t('editor.anotherUser'),
          });
          setConflictDialogOpen(true);
        } catch (err) {
          alert(t('editor.versionConflictReload'));
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
        <Button onClick={loadExperiment}>{t('common.cancel')}</Button>
      </Container>
    );
  }

  if (!experiment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{t('experiment.noExperiments')}</Alert>
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
              placeholder={t('editor.addItemsPlaceholder', { section: section.name.toLowerCase() })}
            />
          ) : section.type === 'materials_with_media' && section.id !== 'hazards' ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {t('editor.materialsInstructions')}
                </Typography>
              </Alert>
              
              <Stack spacing={2}>
                {materialsItems.map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('editor.materialNumber', { number: index + 1 })}
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label={t('editor.materialName')}
                        placeholder={t('editor.materialNamePlaceholder')}
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
                            {t('editor.referencePhoto')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                              component="img"
                              src={item.media.data}
                              alt={item.media.name || t('editor.materialPhoto')}
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
                                {t('editor.replacePhoto')}
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
                                {t('editor.removePhoto')}
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
                          {t('editor.addReferencePhoto')}
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
                          {t('editor.removeMaterial')}
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
                  {t('editor.addMaterial')}
                </Button>
              </Stack>
            </Box>
          ) : section.type === 'rich-text' ? (
            <RichTextEditor
              value={typeof section.content === 'string' ? section.content : ''}
              onChange={(newContent) => updateSectionContent(section.id, newContent)}
              placeholder={t('editor.enterPlaceholder', { section: section.name.toLowerCase() })}
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={typeof section.content === 'string' ? section.content : ''}
              onChange={(e) => updateSectionContent(section.id, e.target.value)}
              placeholder={t('editor.enterPlaceholder', { section: section.name.toLowerCase() })}
            />
          )}
        </Box>

        {!isProcedureWithComplexSteps && section.type !== 'materials_with_media' && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {t('editor.mediaImagesVideos')}
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
          placeholder={t('editor.experimentTitlePlaceholder')}
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
            label={t('editor.versionNumber', { version: experiment?.current_version_number || 1 })}
            color="primary"
            size="small"
          />
          {hasUnsavedChanges && (
            <Chip
              label={t('editor.unsavedChangesLabel')}
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
              {t('common.close')}
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
            {t('buttons.saveAsNewVersion')}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('editor.basicInformation')}
          </Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setMetadataDialogOpen(true)}
          >
            {t('common.edit')}
          </Button>
        </Box>
        {(duration || course || program) ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {duration && (
              <Chip 
                label={`${t('experiment.duration')}: ${duration}`} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
            {course && (
              <Chip 
                label={`${t('experiment.course')}: ${course}`} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
            {program && (
              <Chip 
                label={`${t('experiment.program')}: ${program}`} 
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {t('editor.noMetadataYet')}
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
            {t('editor.addNewSection')}
          </Button>
        </Grid>
      </Grid>

      <Dialog open={addSectionOpen} onClose={() => setAddSectionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('editor.addNewSection')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {t('editor.selectSectionType')}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('editor.sectionType')}</InputLabel>
            <Select
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value)}
              label={t('editor.sectionType')}
            >
              {getAvailableSections().map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddSectionOpen(false);
            setNewSectionType('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAddSection} 
            variant="contained" 
            disabled={!newSectionType}
          >
            {t('editor.addSection')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={customSectionDialogOpen} onClose={() => {
        setCustomSectionDialogOpen(false);
        setCustomSectionName('');
        setCustomSectionDescription('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{t('wizard.customSection')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {t('wizard.sectionDescription', 'Enter a name and optional description for your custom section.')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('wizard.sectionName')}
            fullWidth
            required
            value={customSectionName}
            onChange={(e) => setCustomSectionName(e.target.value)}
            placeholder={t('editor.customSectionNamePlaceholder', 'e.g., Conclusion, Discussion, Analysis')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('wizard.sectionDescription', 'Description (optional)')}
            fullWidth
            multiline
            rows={3}
            value={customSectionDescription}
            onChange={(e) => setCustomSectionDescription(e.target.value)}
            placeholder={t('editor.customSectionDescPlaceholder', 'Initial content or description for this section...')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCustomSectionDialogOpen(false);
            setCustomSectionName('');
            setCustomSectionDescription('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAddCustomSection} 
            variant="contained" 
            disabled={!customSectionName.trim()}
          >
            {t('editor.addSection')}
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
        <DialogTitle>{t('editor.editBasicInformation')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('experiment.duration')}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t('editor.durationPlaceholder')}
              helperText={t('editor.durationHelper')}
            />
            <TextField
              fullWidth
              label={t('experiment.course')}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder={t('editor.coursePlaceholder')}
              helperText={t('editor.courseHelper')}
            />
            <TextField
              fullWidth
              label={t('experiment.program')}
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder={t('editor.programPlaceholder')}
              helperText={t('editor.programHelper')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setMetadataDialogOpen(false);
              setHasUnsavedChanges(true);
            }}
          >
            {t('common.save')}
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
          alert(t('version.changesCopied'));
        }}
        onOpenInNewTab={() => {
          const changes = getUpdatedExperiment();
          localStorage.setItem('unsavedExperimentChanges', JSON.stringify(changes));
          window.open(`/experiments/${experimentId}/edit?restore=true`, '_blank');
        }}
      />

      <Tooltip title={t('llm.chat.openAssistant', 'Open AI Assistant')} placement="left">
        <Fab
          color="secondary"
          aria-label="ai assistant"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '700px',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={aiAssistantIcon}
              alt="AI Assistant"
              sx={{ width: 28, height: 28, objectFit: 'contain' }}
            />
            <Typography variant="h6">{t('llm.chat.title', 'AI Assistant')}</Typography>
          </Box>
          <IconButton onClick={() => setChatOpen(false)} size="small">
            <ArrowBack />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <ChatAssistant
            title=""
            placeholder={t('llm.chat.placeholder', 'Ask me anything about your experiment...')}
            initialMessages={chatHistory}
            onMessagesChange={setChatHistory}
            systemPrompt={`You are an AI assistant helping with scientific experiment design. You have access to the current experiment context and should provide specific, relevant advice.

IMPORTANT RESTRICTIONS:
- ONLY answer questions related to scientific experiments, laboratory procedures, and experiment design
- DO NOT answer questions about math, homework, general knowledge, programming, or any non-experiment topics
- If asked about unrelated topics, politely decline and redirect to experiment creation help
- Example refusal: "I'm specifically designed to help with experiment design and creation. I can only answer questions related to your scientific experiment. How can I help you with your experiment?"

CURRENT EXPERIMENT CONTEXT:
Title: ${title || '(not set yet)'}
Duration: ${duration || '(not set yet)'}
Course: ${course || '(not set yet)'}
Program: ${program || '(not set yet)'}

Sections:
${sections.map(section => {
  const sectionName = section.title || section.type;
  const contentSummary = getContentSummary(section);
  return `- ${sectionName}: ${contentSummary}`;
}).join('\n')}

INSTRUCTIONS:
1. Reference the specific experiment details above when answering questions
2. Provide practical, actionable advice tailored to this experiment
3. Suggest improvements based on what's already there or missing
4. Point out inconsistencies or gaps in the current sections
5. Recommend safety precautions based on mentioned materials/chemicals
6. Help with scientific writing, methodology, and best practices
7. STRICTLY stay within the scope of experiment design and laboratory procedures

Be specific to THIS experiment - don't give generic advice. If sections are incomplete, guide the user on what to add. Remember: ONLY discuss experiment-related topics.`}
            showHeader={false}
            maxHeight="100%"
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ExperimentEditor;
