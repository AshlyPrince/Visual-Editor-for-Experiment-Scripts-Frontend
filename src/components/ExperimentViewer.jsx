import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit as EditIcon,
  Science,
  Warning,
  History as HistoryIcon,
  FileDownload as ExportIcon,
  Lock as LockIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import experimentService from '../services/experimentService.js';
import keycloakService from '../services/keycloakService.js';
import VersionHistory from './VersionHistory';
import ExportDialog from './ExportDialog';
import PermissionsManager from './PermissionsManager';
import LanguageSimplificationDialog from './LanguageSimplificationDialog';
import { toCanonical } from '../utils/experimentCanonical.js';
import { canAccessRestrictedFeature, isUserOwner } from '../utils/permissions.js';

const ExperimentViewer = ({ experimentId, onClose, onEdit }) => {
  const { t } = useTranslation();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [simplifyOpen, setSimplifyOpen] = useState(false);
  const [simplifiedData, setSimplifiedData] = useState(null); // Store simplified version

  useEffect(() => {
    if (experimentId) {
      loadExperiment();
    }
  }, [experimentId]);

  
  const refresh = () => {
    if (experimentId) {
      loadExperiment();
    }
  };

  const handleSavePermissions = async (permissionsData) => {
    try {
      await experimentService.updateExperimentPermissions(experimentId, permissionsData);
      setPermissionsOpen(false);
      refresh(); // Reload experiment to show updated permissions
    } catch (err) {
      console.error('[ExperimentViewer] Error saving permissions:', err);
      // You could add error notification here
    }
  };

  const loadExperiment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rawData = await experimentService.getExperiment(experimentId);
      
      const procedureSection = (rawData.sections || rawData.content?.sections || []).find(s => s.id === 'procedure');
      
      let actualVersionNumber = rawData.current_version_number || rawData.version_number || 1;
      try {
        const versions = await experimentService.getVersionHistory(experimentId);
        if (versions && versions.length > 0) {
          
          const currentVersion = versions.find(v => v.id === rawData.current_version_id);
          if (currentVersion && currentVersion.version_number) {
            actualVersionNumber = currentVersion.version_number;
          } else {
            
            actualVersionNumber = Math.max(...versions.map(v => v.version_number || 1));
          }
        }
      } catch (versionErr) {
        
      }
      
      const canonical = toCanonical(rawData);
      
      const canonicalProcedureSection = (canonical.content?.sections || []).find(s => s.id === 'procedure');
      
      canonical.version_number = actualVersionNumber;
      
      canonical.sections = canonical.content.sections;
      canonical.estimated_duration = canonical.content.config.duration;
      canonical.course = canonical.content.config.subject;
      canonical.program = canonical.content.config.gradeLevel;
      
      setExperiment(canonical);
    } catch (err) {
      setError(err.message || t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {t('messages.errorLoadingExperiment')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          {t('buttons.backToDashboard')}
        </Button>
      </Box>
    );
  }

  if (!experiment) {
    return null;
  }

  const content = experiment.content || {};
  const config = content.config || {};
  
  const sectionEmojiMap = {
    'objectives': '🎯',
    'background': '📚',
    'materials': '🧪',
    'hypothesis': '💡',
    'procedure': '📝',
    'safety': '⚠️',
    'disposal': '♻️',
    'chemicals': '⚗️',
    'title_header': '📋'
  };
  
  const sectionsWithEmojis = (experiment.sections || content.sections || []).map(section => ({
    ...section,
    emoji: section.emoji || sectionEmojiMap[section.id] || '📄'
  }));
  
  const sections = sectionsWithEmojis;

  const parseSectionContent = (section) => {
    if (!section || !section.content) return null;
    
    
    if (typeof section.content === 'string') {
      try {
        return JSON.parse(section.content);
      } catch {
        
        return section.content;
      }
    }
    
    
    return section.content;
  };

  
  const getSectionType = (section) => {
    return section?.id || section?.type || 'generic';
  };

  
  const getSectionContent = (section) => {
    if (!section) return null;
    
    
    if (section.content) {
      
      if (typeof section.content === 'string') {
        return section.content;
      }
      
      
      if (typeof section.content === 'object') {
        
        if (section.content.text) return section.content.text;
        if (section.content.html) return section.content.html;
        if (section.content.content) return section.content.content;
      }
    }
    
    return null;
  };

  
  const renderChemicalsSection = (section) => {
    
    const hasStructuredContent = section.content?.chemicals_list || section.content?.concentrations || section.content?.kits;
    
    
    if (!hasStructuredContent) {
      return renderSectionContent(section);
    }
    
    return (
      <Box sx={{ mb: 4 }} key={section.id}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          ☣️ {t('viewer.chemicalsReagents')}
        </Typography>
        <Grid container spacing={3}>
          {section.content?.chemicals_list && section.content.chemicals_list.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {t('viewer.chemicalsList')}
                  </Typography>
                  <List dense>
                    {section.content.chemicals_list.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
          {section.content?.concentrations && section.content.concentrations.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {t('viewer.concentrations')}
                  </Typography>
                  <List dense>
                    {section.content.concentrations.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
          {section.content?.kits && section.content.kits.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {t('viewer.kitsPrimers')}
                  </Typography>
                  <List dense>
                    {section.content.kits.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
        {((section.media && Array.isArray(section.media) && section.media.length > 0) ||
          (section.content?.media && Array.isArray(section.content.media) && section.content.media.length > 0)) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t('viewer.hazardPictogramsLabels')}
            </Typography>
            <Grid container spacing={2}>
              {(section.media || section.content?.media || []).map((mediaItem, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      {mediaItem.type?.startsWith('image') && mediaItem.data && (
                        <Box
                          component="img"
                          src={mediaItem.data}
                          alt={mediaItem.name || `Media ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 1,
                            mb: 1
                          }}
                        />
                      )}
                      {mediaItem.name && (
                        <Typography variant="body2" noWrap>
                          {mediaItem.name}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
  };

  
  const renderSafetySection = (section) => {
    const safetyContent = getSectionContent(section);
    const hasMedia = (section.media && Array.isArray(section.media) && section.media.length > 0) ||
                     (section.content?.media && Array.isArray(section.content.media) && section.content.media.length > 0);
    const hasSafetyText = typeof safetyContent === 'string' && safetyContent.trim();
    
    if (!hasSafetyText && !hasMedia) {
      return renderSectionContent(section);
    }

    const allMedia = section.media || section.content?.media || [];
    const safetyIcons = allMedia.filter(m => {
      const name = (m.name || '').toLowerCase();
      const url = (m.url || m.data || '').toLowerCase();
      const caption = (m.caption || '').toLowerCase();
      return m.isSafetyIcon || 
             name.includes('safety-') || 
             name.includes('saftey-') ||
             name.includes('ppe') ||
             name.includes('goggles') ||
             name.includes('gloves') ||
             name.includes('helmet') ||
             name.includes('faceshield') ||
             name.includes('headset') ||
             name.includes('lab coat') ||
             name.includes('labcoat') ||
             name.includes('coat') ||
             name.includes('mask') ||
             name.includes('respirator') ||
             name.includes('apron') ||
             name.includes('boots') ||
             name.includes('shoe') ||
             name.includes('wear') ||
             // German safety equipment terms
             name.includes('schutzbrille') ||
             name.includes('handschuhe') ||
             name.includes('helm') ||
             name.includes('kittel') ||
             name.includes('laborkittel') ||
             name.includes('schutzkleidung') ||
             name.includes('atemschutz') ||
             name.includes('schürze') ||
             name.includes('stiefel') ||
             caption.includes('schutzbrille') ||
             caption.includes('handschuhe') ||
             caption.includes('helm') ||
             caption.includes('kittel') ||
             caption.includes('schutz') ||
             url.includes('/saftey/') ||
             url.includes('/safety/');
    });
    const regularMedia = allMedia.filter(m => {
      const name = (m.name || '').toLowerCase();
      const url = (m.url || m.data || '').toLowerCase();
      const caption = (m.caption || '').toLowerCase();
      return !m.isSafetyIcon && 
             !name.includes('safety-') && 
             !name.includes('saftey-') &&
             !name.includes('ppe') &&
             !name.includes('goggles') &&
             !name.includes('gloves') &&
             !name.includes('helmet') &&
             !name.includes('faceshield') &&
             !name.includes('headset') &&
             !name.includes('lab coat') &&
             !name.includes('labcoat') &&
             !name.includes('coat') &&
             !name.includes('mask') &&
             !name.includes('respirator') &&
             !name.includes('apron') &&
             !name.includes('boots') &&
             !name.includes('shoe') &&
             !name.includes('wear') &&
             // German safety equipment terms
             !name.includes('schutzbrille') &&
             !name.includes('handschuhe') &&
             !name.includes('helm') &&
             !name.includes('kittel') &&
             !name.includes('laborkittel') &&
             !name.includes('schutzkleidung') &&
             !name.includes('atemschutz') &&
             !name.includes('schürze') &&
             !name.includes('stiefel') &&
             !caption.includes('schutzbrille') &&
             !caption.includes('handschuhe') &&
             !caption.includes('helm') &&
             !caption.includes('kittel') &&
             !caption.includes('schutz') &&
             !url.includes('/saftey/') &&
             !url.includes('/safety/');
    });
    
    return (
      <Box sx={{ mb: 4 }} key={section.id}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>⚠️</Box>
          {t('wizard.safety')}
        </Typography>
        
        {regularMedia.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            {regularMedia.map((mediaItem, index) => (
              <Box key={index} sx={{ textAlign: 'center', maxWidth: '700px', width: '100%' }}>
                <Box sx={{ 
                  width: `${mediaItem.displaySize || 100}%`,
                  mx: 'auto'
                }}>
                  {mediaItem.type?.startsWith('video/') ? (
                    <Box
                      component="video"
                      controls
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1.5
                      }}
                    >
                      <source src={mediaItem.url || mediaItem.data} type={mediaItem.type} />
                      {t('viewer.browserNoVideoSupport')}
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={mediaItem.data || mediaItem.url}
                      alt={mediaItem.caption || mediaItem.name || `${t('wizard.safety')} ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1.5
                      }}
                    />
                  )}
                </Box>
                {mediaItem.caption && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                    {mediaItem.caption}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {safetyIcons.length > 0 && (
          <Box sx={{ mb: hasSafetyText ? 3 : 0 }}>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              maxWidth: '600px'
            }}>
              {safetyIcons.map((mediaItem, mediaIndex) => (
                <Box 
                  key={mediaIndex}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    width: '60px'
                  }}
                >
                  <Box
                    component="img"
                    src={mediaItem.data || mediaItem.url}
                    alt={mediaItem.name || `${t('wizard.safety')} ${mediaIndex + 1}`}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain'
                    }}
                  />
                  {mediaItem.name && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        textAlign: 'center',
                        fontSize: '0.65rem',
                        lineHeight: 1.2,
                        maxWidth: '60px',
                        wordWrap: 'break-word'
                      }}
                    >
                      {mediaItem.name}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {hasSafetyText && (
          <Box dangerouslySetInnerHTML={{ __html: safetyContent }} sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary' }} />
        )}
      </Box>
    );
  };

  const renderHazardsSection = (section) => {
    const hazardsContent = getSectionContent(section);
    const hasMedia = (section.media && Array.isArray(section.media) && section.media.length > 0) ||
                     (section.content?.media && Array.isArray(section.content.media) && section.content.media.length > 0);
    const hasHazardsText = typeof hazardsContent === 'string' && hazardsContent.trim();
    
    if (!hasHazardsText && !hasMedia) {
      return renderSectionContent(section);
    }

    const allMedia = section.media || section.content?.media || [];
    const hazardIcons = allMedia.filter(m => {
      const name = (m.name || '').toLowerCase();
      const url = (m.url || m.data || '').toLowerCase();
      return m.isHazardIcon || 
             name.includes('ghs') || 
             name.includes('hazard') ||
             name.includes('toxic') ||
             name.includes('flammable') ||
             name.includes('corrosive') ||
             name.includes('explosive') ||
             name.includes('oxidizing') ||
             name.includes('irritant') ||
             name.includes('compressed') ||
             name.includes('environmental') ||
             url.includes('/ghs/') ||
             url.includes('/hazard/');
    });
    const regularMedia = allMedia.filter(m => {
      const name = (m.name || '').toLowerCase();
      const url = (m.url || m.data || '').toLowerCase();
      return !m.isHazardIcon && 
             !name.includes('ghs') && 
             !name.includes('hazard') &&
             !name.includes('toxic') &&
             !name.includes('flammable') &&
             !name.includes('corrosive') &&
             !name.includes('explosive') &&
             !name.includes('oxidizing') &&
             !name.includes('irritant') &&
             !name.includes('compressed') &&
             !name.includes('environmental') &&
             !url.includes('/ghs/') &&
             !url.includes('/hazard/');
    });
    
    return (
      <Box sx={{ mb: 4 }} key={section.id}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>🚫</Box>
          {t('viewer.potentialHazards')}
        </Typography>
        
        {regularMedia.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            {regularMedia.map((mediaItem, index) => (
              <Box key={index} sx={{ textAlign: 'center', maxWidth: '700px', width: '100%' }}>
                <Box sx={{ 
                  width: `${mediaItem.displaySize || 100}%`,
                  mx: 'auto'
                }}>
                  {mediaItem.type?.startsWith('video/') ? (
                    <Box
                      component="video"
                      controls
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1.5
                      }}
                    >
                      <source src={mediaItem.url || mediaItem.data} type={mediaItem.type} />
                      {t('viewer.browserNoVideoSupport')}
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={mediaItem.data || mediaItem.url}
                      alt={mediaItem.caption || mediaItem.name || `${t('viewer.hazardIcon')} ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1.5
                      }}
                    />
                  )}
                </Box>
                {mediaItem.caption && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                    {mediaItem.caption}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {hazardIcons.length > 0 && (
          <Box sx={{ mb: hasHazardsText ? 3 : 0 }}>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              maxWidth: '600px'
            }}>
              {hazardIcons.map((mediaItem, mediaIndex) => (
                <Box 
                  key={mediaIndex}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    width: '60px'
                  }}
                >
                  <Box
                    component="img"
                    src={mediaItem.data || mediaItem.url}
                    alt={mediaItem.name || `${t('viewer.hazardIcon')} ${mediaIndex + 1}`}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain'
                    }}
                  />
                  {mediaItem.name && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        textAlign: 'center',
                        fontSize: '0.65rem',
                        lineHeight: 1.2,
                        maxWidth: '60px',
                        wordWrap: 'break-word'
                      }}
                    >
                      {mediaItem.name}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {hasHazardsText && (
          <Box dangerouslySetInnerHTML={{ __html: hazardsContent }} sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary' }} />
        )}
      </Box>
    );
  };

  const renderProcedureSection = (section) => {
    return renderSectionContent(section);
  };

  
  const renderObservationsSection = (section) => {
    
    return renderSectionContent(section);
  };

  
  const renderConclusionsSection = (section) => {
    
    return renderSectionContent(section);
  };

  
  const renderSectionContent = (section) => {
    const sectionContent = section.content || {};
    
    const hasContent = () => {
      if (typeof sectionContent === 'string' && sectionContent.trim()) {
        return true;
      }
      if (typeof sectionContent === 'object') {
        const hasNonEmptyFields = Object.entries(sectionContent).some(([key, value]) => {
          if (key === 'media') return false;
          if (Array.isArray(value) && value.length > 0) return true;
          if (typeof value === 'string' && value.trim()) return true;
          if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) return true;
          return false;
        });
        if (hasNonEmptyFields) return true;
        
        if (section.media && Array.isArray(section.media) && section.media.length > 0) return true;
        if (sectionContent.media && Array.isArray(sectionContent.media) && sectionContent.media.length > 0) return true;
      }
      return false;
    };
    
    if (!hasContent()) {
      return null;
    }
    
    
    if (typeof sectionContent === 'string') {
      return (
        <Box sx={{ mb: 4 }} key={section.id}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            {section.emoji} {section.name}
          </Typography>
          {section.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              {section.description}
            </Typography>
          )}
          <Box sx={{ pl: 2 }}>
            {section.media && Array.isArray(section.media) && section.media.length > 0 && (
              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                {section.media.map((mediaItem, index) => (
                  <Box key={index} sx={{ textAlign: 'center', maxWidth: '700px', width: '100%' }}>
                    <Box sx={{ 
                      width: `${mediaItem.displaySize || 100}%`,
                      mx: 'auto'
                    }}>
                      {mediaItem.type?.startsWith('video/') ? (
                        <Box
                          component="video"
                          controls
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 1.5
                          }}
                        >
                          <source src={mediaItem.url || mediaItem.data} type={mediaItem.type} />
                          {t('viewer.browserNoVideoSupport')}
                        </Box>
                      ) : (
                        <Box
                          component="img"
                          src={mediaItem.url || mediaItem.data}
                          alt={mediaItem.caption || mediaItem.name || `Media ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 1.5
                          }}
                        />
                      )}
                    </Box>
                    {mediaItem.caption && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                        {mediaItem.caption}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            <Box dangerouslySetInnerHTML={{ __html: sectionContent }} sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary' }} />
          </Box>
        </Box>
      );
    }
    
    
    const nonMediaFields = Object.entries(sectionContent).filter(([key, value]) => {
      return key !== 'media' && value && !(Array.isArray(value) && value.length === 0);
    });
    
    const hasOnlyOneField = nonMediaFields.length === 1;
    
    return (
      <Box sx={{ mb: 4 }} key={section.id}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          {section.emoji} {section.name}
        </Typography>
        
        {section.description && section.id !== 'objectives' && section.id !== 'background' && section.id !== 'materials' && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            {section.description}
          </Typography>
        )}
        
        <Box sx={{ pl: 2 }}>
          {((section.media && Array.isArray(section.media) && section.media.length > 0) || 
            (sectionContent.media && Array.isArray(sectionContent.media) && sectionContent.media.length > 0)) && 
            section.id !== 'safety' && section.id !== 'hazards' && (
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              {(section.media || sectionContent.media || []).map((mediaItem, index) => (
                <Box key={index} sx={{ textAlign: 'center', maxWidth: '700px', width: '100%' }}>
                  <Box sx={{ 
                    width: `${mediaItem.displaySize || 100}%`,
                    mx: 'auto'
                  }}>
                    {mediaItem.type?.startsWith('video/') ? (
                      <Box
                        component="video"
                        controls
                        sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1.5
                        }}
                      >
                        <source src={mediaItem.url || mediaItem.data} type={mediaItem.type} />
                        {t('viewer.browserNoVideoSupport')}
                      </Box>
                    ) : (
                      
                      <Box
                        component="img"
                        src={mediaItem.url || mediaItem.data}
                        alt={mediaItem.caption || mediaItem.name || `Figure ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1.5,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    )}
                  </Box>
                  
                  {mediaItem.caption && (
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        textAlign: 'center',
                        maxWidth: '600px',
                        mx: 'auto'
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {t('viewer.figure', { number: index + 1 })}:
                      </Box>{' '}
                      {mediaItem.caption}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          {Object.entries(sectionContent).map(([key, value]) => {
            
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            
            if (key === 'media') return null;
            
            
            if (Array.isArray(value)) {
              
              const isMaterialsWithMedia = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'name' in value[0];
              
              
              const isProcedureSteps = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'text' in value[0];
              
              if (isProcedureSteps) {
                return (
                  <Box key={key} sx={{ mb: 3 }}>
                    {!hasOnlyOneField && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                    )}
                    <List>
                      {value.map((step, index) => (
                        <ListItem key={index} alignItems="flex-start" sx={{ py: 2, display: 'flex', gap: 2 }}>
                          <Box
                            sx={{
                              minWidth: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            {step.text && (
                              <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7, mb: step.notes || (step.media && step.media.length > 0) ? 2 : 0 }}>
                                {step.text}
                              </Typography>
                            )}
                            
                            {step.notes && (
                              <Box 
                                dangerouslySetInnerHTML={{ __html: step.notes }} 
                                sx={{ 
                                  fontSize: '0.95rem', 
                                  lineHeight: 1.6,
                                  mt: 1,
                                  mb: (step.media && step.media.length > 0) ? 2 : 0,
                                  pl: 2,
                                  borderLeft: '3px solid #e0e0e0'
                                }} 
                              />
                            )}
                            
                            {step.media && step.media.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                {step.media.map((mediaItem, mediaIdx) => (
                                  <Box key={mediaIdx} sx={{ mb: 2 }}>
                                    {mediaItem.type?.startsWith('image') && (
                                      <Box
                                        component="img"
                                        src={mediaItem.data || mediaItem.url}
                                        alt={mediaItem.name || `Step ${index + 1} image`}
                                        sx={{
                                          maxWidth: '100%',
                                          height: 'auto',
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: 'divider'
                                        }}
                                      />
                                    )}
                                    {mediaItem.name && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {mediaItem.name}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              border: '2px solid',
                              borderColor: 'grey.400',
                              borderRadius: '4px',
                              flexShrink: 0,
                              mt: 0.5
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                );
              }
              
              if (isMaterialsWithMedia) {
                return (
                  <Box key={key} sx={{ mb: 3 }}>
                    {!hasOnlyOneField && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                    )}
                    <Stack spacing={2}>
                      {value.map((item, i) => (
                        <Box key={i}>
                          <Typography variant="body1" sx={{ fontSize: '1.05rem', mb: 1 }}>
                            • {item.name || t('viewer.unnamedItem')}
                          </Typography>
                          {item.media && item.media.data && (
                            <Box
                              component="img"
                              src={item.media.data}
                              alt={item.name || `Item ${i + 1}`}
                              sx={{
                                width: 150,
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                ml: 2
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                );
              }
              
              
              return (
                <Box key={key} sx={{ mb: 3 }}>
                  {!hasOnlyOneField && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                  )}
                  <List>
                    {value.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText primary={`• ${typeof item === 'string' ? item : JSON.stringify(item)}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            }
            
            
            if (typeof value === 'string') {
              const isHTML = /<[a-z][\s\S]*>/i.test(value);
              return (
                <Box key={key} sx={{ mb: 3 }}>
                  {!hasOnlyOneField && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                  )}
                  {isHTML ? (
                    <Box dangerouslySetInnerHTML={{ __html: value }} sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary' }} />
                  ) : (
                    <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary' }}>
                      {value}
                    </Typography>
                  )}
                </Box>
              );
            }
            
            
            if (typeof value === 'object') {
              return (
                <Box key={key} sx={{ mb: 3 }}>
                  {!hasOnlyOneField && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                  )}
                  <Box sx={{ pl: 2 }}>
                    {Object.entries(value).map(([subKey, subValue]) => {
                      if (!subValue) return null;
                      
                      
                      let displayValue;
                      if (typeof subValue === 'object') {
                        displayValue = JSON.stringify(subValue);
                      } else {
                        displayValue = String(subValue);
                      }
                      
                      return (
                        <Box key={subKey} sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {subKey.replace(/_/g, ' ')}: {displayValue}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            }
            
            return null;
          })}
        </Box>
      </Box>
    );
  };

  
  const handleLinkClick = (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      e.stopPropagation();
      
      
      try {
        const url = new URL(link.href);
        window.open(url.href, '_blank', 'noopener,noreferrer');
      } catch {
        alert(t('viewer.invalidLinkError'));
      }
    }
  };

  // Check permissions for current user
  const currentUser = keycloakService.getUserInfo();
  const userIsOwner = experiment ? isUserOwner(experiment, currentUser) : false;
  const canEditExp = experiment ? canAccessRestrictedFeature(experiment, 'edit', currentUser) : false;
  const canExport = experiment ? canAccessRestrictedFeature(experiment, 'export', currentUser) : false;
  const canViewHistory = experiment ? canAccessRestrictedFeature(experiment, 'versionControl', currentUser) : false;

  return (
    <Container maxWidth="lg" onClick={handleLinkClick}>
      {/* Restriction Notice Banner */}
      {!userIsOwner && (!canEditExp || !canExport || !canViewHistory) && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Box>🔒</Box>}>
          <Typography variant="body2" fontWeight="bold">
            {t('permissions.restrictedAccess', 'This experiment has restricted access')}
          </Typography>
          <Typography variant="caption">
            {t('permissions.restrictedAccessDesc', 'Some features are disabled by the creator. Disabled buttons are grayed out and show a tooltip explaining the restriction.')}
          </Typography>
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        mb: 3 
      }}>
        {/* Top row - Back button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onClose}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            {t('buttons.backToDashboard')}
          </Button>
        </Box>

        {/* Bottom row - Action buttons in a grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',  // Mobile: 1 column
            sm: 'repeat(2, 1fr)',  // Small: 2 columns
            md: userIsOwner ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)',  // Medium+: 4 or 5 columns
          },
          gap: 1.5,
          alignItems: 'stretch'
        }}>
          {/* Primary action - Edit (most important) */}
          {onEdit && (
            <Tooltip 
              title={!canEditExp ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(experiment)}
                  disabled={!canEditExp}
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  {t('experiment.editExperiment')}
                </Button>
              </span>
            </Tooltip>
          )}
          
          {/* Secondary actions */}
          <Tooltip 
            title={!canViewHistory ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
            arrow
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => setHistoryOpen(true)}
                disabled={!canViewHistory}
                fullWidth
                sx={{ height: '100%' }}
              >
                {t('version.versionHistory')}
              </Button>
            </span>
          </Tooltip>
          
          <Tooltip 
            title={!canExport ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
            arrow
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => setExportOpen(true)}
                disabled={!canExport}
                fullWidth
                sx={{ height: '100%' }}
              >
                {t('common.export')}
              </Button>
            </span>
          </Tooltip>
          
          {/* Simplify Language button */}
          <Tooltip 
            title={t('simplification.tooltip', 'Simplify the language for different education levels')}
            arrow
          >
            <span>
              <Button
                variant="outlined"
                color="info"
                startIcon={<TranslateIcon />}
                onClick={() => setSimplifyOpen(true)}
                fullWidth
                sx={{ height: '100%' }}
              >
                {t('simplification.simplify', 'Simplify')}
              </Button>
            </span>
          </Tooltip>
          
          {/* Admin action - Permissions (only for owner) */}
          {userIsOwner && (
            <Tooltip 
              title={t('permissions.managePermissionsTooltip', 'Manage who can access and edit this experiment')}
              arrow
            >
              <span>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<LockIcon />}
                  onClick={() => setPermissionsOpen(true)}
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  {t('permissions.managePermissions', 'Permissions')}
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Paper sx={{ 
        p: 4, 
        mb: 4,
        '& a': {
          color: 'primary.main',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontWeight: 500,
        },
        '& a:hover': {
          textDecoration: 'underline',
          opacity: 0.8,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: '16px',
          marginBottom: '16px',
        },
        '& table th': {
          border: '1px solid #ddd',
          padding: '12px',
          textAlign: 'left',
          backgroundColor: '#f5f5f5',
          fontWeight: 600,
        },
        '& table td': {
          border: '1px solid #ddd',
          padding: '12px',
          textAlign: 'left',
        },
        '& table tr:nth-of-type(even)': {
          backgroundColor: '#fafafa',
        },
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {experiment.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(config.subjectArea || config.subject || experiment.course) && (
              <Chip 
                label={`${t('experiment.course')}: ${config.subjectArea || config.subject || experiment.course}`} 
                variant="outlined" 
              />
            )}
            {(config.difficultyLevel || config.gradeLevel || experiment.program) && (
              <Chip 
                label={`${t('experiment.program')}: ${config.difficultyLevel || config.gradeLevel || experiment.program}`} 
                variant="outlined" 
              />
            )}
            {(experiment.estimated_duration || config.duration) && (
              <Chip 
                label={`${t('experiment.duration')}: ${experiment.estimated_duration || config.duration}`} 
                variant="outlined" 
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {config.learningObjectives && config.learningObjectives.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              📚 {t('wizard.learningObjectives')}
            </Typography>
            <List>
              {config.learningObjectives.map((objective, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemText 
                    primary={`${index + 1}. ${objective}`}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {sections && sections.length > 0 ? (
          sections.map((section, index) => {
            const sectionType = getSectionType(section);
            
            
            switch (sectionType) {
              case 'chemicals':
                return renderChemicalsSection(section);
              case 'safety':
                return renderSafetySection(section);
              case 'hazards':
                return renderHazardsSection(section);
              case 'procedure':
                return renderProcedureSection(section);
              case 'observations':
                return renderObservationsSection(section);
              case 'conclusions':
                return renderConclusionsSection(section);
              default:
                return renderSectionContent(section);
            }
          })
        ) : (
          <Alert severity="info">
            {t('viewer.noSectionsAvailable')}
          </Alert>
        )}

        <>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              {t('viewer.experimentVersion', { version: experiment.version_number || experiment.current_version_number || 1 })}
            </Typography>
            <Typography variant="caption">
              {t('viewer.lastUpdated')}: {new Date(experiment.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </>
      </Paper>

      {historyOpen && (
        <Paper
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <VersionHistory
              experimentId={experimentId}
              onClose={() => setHistoryOpen(false)}
              onVersionRestored={() => {
                setHistoryOpen(false);
                loadExperiment(); 
              }}
            />
          </Container>
        </Paper>
      )}

      {experiment && (
        <ExportDialog
          open={exportOpen}
          onClose={() => {
            setExportOpen(false);
            setSimplifiedData(null); // Reset simplified data when export dialog closes
          }}
          experiment={simplifiedData || experiment} // Use simplified data if available, otherwise use original
          onExported={(type) => {
            
          }}
        />
      )}

      {experiment && (
        <LanguageSimplificationDialog
          open={simplifyOpen}
          onClose={() => {
            setSimplifyOpen(false);
            setSimplifiedData(null); // Reset simplified data when dialog closes
          }}
          experimentData={experiment}
          onExport={(simplifiedExperiment, format, level) => {
            // Store the simplified version and open export dialog when user clicks export
            setSimplifiedData(simplifiedExperiment);
            setSimplifyOpen(false);
            setExportOpen(true);
          }}
        />
      )}

      {experiment && (
        <PermissionsManager
          open={permissionsOpen}
          onClose={() => setPermissionsOpen(false)}
          experimentId={experimentId}
          currentPermissions={experiment.content?.permissions}
          isNewExperiment={false}
          onSave={handleSavePermissions}
        />
      )}
    </Container>
  );
};

export default ExperimentViewer;

