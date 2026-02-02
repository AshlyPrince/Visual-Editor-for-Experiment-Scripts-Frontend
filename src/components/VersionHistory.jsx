import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  Restore,
  Visibility,
  CompareArrows,
  Check,
  History as HistoryIcon,
} from '@mui/icons-material';
import experimentService from '../services/experimentService.js';
import VersionComparison from './VersionComparison.jsx';

const VersionHistory = ({ experimentId, onClose, onVersionRestored }) => {
  const { t } = useTranslation();
  const [experiment, setExperiment] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [versionToView, setVersionToView] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ v1: null, v2: null });

  useEffect(() => {
    if (experimentId) {
      loadData();
    }
  }, [experimentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [expData, versionsData] = await Promise.all([
        experimentService.getExperiment(experimentId),
        experimentService.getVersionHistory(experimentId),
      ]);
      
      setExperiment(expData);
      setVersions(versionsData);
    } catch (err) {
      setError(err.message || t('versionHistory.unableToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (versionId) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId]; 
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      
      const v1 = versions.find(v => v.id === selectedVersions[0]);
      const v2 = versions.find(v => v.id === selectedVersions[1]);

      const sorted = [v1, v2].sort((a, b) => a.version_number - b.version_number);
      
      setCompareVersions({ v1: sorted[0], v2: sorted[1] });
      setCompareDialogOpen(true);
    }
  };

  const handleCompareClose = () => {
    setCompareDialogOpen(false);
    setSelectedVersions([]);
  };

  const handleRestoreClick = (version) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!versionToRestore) return;

    try {
      setRestoring(true);
      await experimentService.checkoutVersion(experimentId, versionToRestore.id);
      
      setRestoreDialogOpen(false);
      setVersionToRestore(null);

      await loadData();

      if (onVersionRestored) {
        onVersionRestored(versionToRestore);
      }
    } catch (err) {
      alert(t('versionHistory.unableToRestore') + ' ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setVersionToRestore(null);
  };

  const handleViewVersion = (version) => {
    
    let parsedContent = version.content;
    try {
      if (typeof version.content === 'string') {
        parsedContent = JSON.parse(version.content);
      }
    } catch {
      
      parsedContent = version.content;
    }
    
    const parsedVersion = {
      ...version,
      content: parsedContent
    };
    setVersionToView(parsedVersion);
    setViewDialogOpen(true);
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setVersionToView(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadData} sx={{ mt: 2 }}>
          {t('common.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <HistoryIcon fontSize="large" color="primary" />
          <Typography variant="h5" fontWeight={600}>
            {t('version.versionHistory')}
          </Typography>
        </Box>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {t('common.close')}
        </Button>
      </Box>

      <Card 
        sx={{ 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 'none'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('nav.experiments')}
              </Typography>
              <Typography variant="h6" color="text.primary">
                {experiment?.title}
              </Typography>
            </Box>
            <Chip
              label={t('version.versionNumber', { number: experiment?.version_number })}
              color="success"
              size="medium"
              icon={<Check />}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </CardContent>
      </Card>

      {selectedVersions.length === 2 && (
        <Alert
          severity="info"
          variant="outlined"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                color="primary"
                size="small"
                variant="contained"
                startIcon={<CompareArrows />}
                onClick={handleCompare}
              >
                {t('common.compare')}
              </Button>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={() => setSelectedVersions([])}
              >
                {t('common.clear')}
              </Button>
            </Stack>
          }
          sx={{ mb: 3 }}
        >
          {t('version.readyToCompare')}
        </Alert>
      )}

      <Stack spacing={2}>
        {versions.map((version) => {
          const isCurrent = version.id === experiment?.current_version_id;
          const isSelected = selectedVersions.includes(version.id);

          return (
            <Card
              key={version.id}
              sx={{
                border: '1px solid',
                borderColor: isCurrent ? 'success.main' : 'divider',
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: isCurrent ? 'success.main' : 'primary.light',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectVersion(version.id)}
                    disabled={
                      selectedVersions.length >= 2 &&
                      !selectedVersions.includes(version.id)
                    }
                    sx={{ mt: 0.5 }}
                  />

                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        label={t('version.versionNumber', { number: version.version_number })}
                        color="primary"
                        size="small"
                        variant={isCurrent ? "filled" : "outlined"}
                        sx={{ fontWeight: 600 }}
                      />
                      {isCurrent && (
                        <Chip
                          icon={<Check />}
                          label={t('version.currentVersion').toUpperCase()}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      {version.title}
                    </Typography>

                    {version.commit_message && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        "{version.commit_message}"
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      {formatDate(version.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewVersion(version)}
                  variant="outlined"
                >
                  {t('common.view')}
                </Button>
                {!isCurrent && (
                  <Button
                    size="small"
                    startIcon={<Restore />}
                    onClick={() => handleRestoreClick(version)}
                    color="primary"
                    variant="contained"
                  >
                    {t('common.restore')}
                  </Button>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Stack>

      <Dialog
        open={restoreDialogOpen}
        onClose={handleRestoreCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('version.restoreVersion')}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('version.restoreConfirm', { number: versionToRestore?.version_number })}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            {t('version.restoreInfo', { number: versionToRestore?.version_number })}
          </DialogContentText>
          {versionToRestore && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{t('experiment.title')}:</strong> {versionToRestore.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{t('version.commitMessage')}:</strong> {versionToRestore.commit_message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{t('versionHistory.created')}:</strong> {formatDate(versionToRestore.created_at)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestoreCancel} disabled={restoring}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            color="warning"
            variant="contained"
            disabled={restoring}
            startIcon={restoring ? <CircularProgress size={20} /> : <Restore />}
          >
            {restoring ? t('messages.loadingVersions') : t('common.restore')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" component="span" fontWeight={600}>
                {t('version.versionNumber', { number: versionToView?.version_number })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(versionToView?.created_at)}
              </Typography>
            </Box>
            <Chip
              label={versionToView?.commit_message || t('versionHistory.noMessage')}
              variant="outlined"
              sx={{ fontStyle: 'italic' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          {versionToView && renderVersionContent(versionToView)}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button onClick={handleViewClose} size="large">
            {t('versionHistory.closeButton')}
          </Button>
          {!isCurrent(versionToView) && (
            <Button
              onClick={() => {
                handleViewClose();
                handleRestoreClick(versionToView);
              }}
              variant="contained"
              color="warning"
              startIcon={<Restore />}
              size="large"
            >
              {t('versionHistory.restoreThisVersion')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={compareDialogOpen}
        onClose={handleCompareClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="span" fontWeight={600}>
              {t('version.compareVersions')}
            </Typography>
            <Box display="flex" gap={2}>
              <Chip 
                label={t('version.versionNumber', { number: compareVersions.v1?.version_number })}
                color="info"
                variant="outlined"
              />
              <CompareArrows />
              <Chip 
                label={t('version.versionNumber', { number: compareVersions.v2?.version_number })}
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {compareVersions.v1 && compareVersions.v2 && (
            <VersionComparison
              experimentId={experimentId}
              version1Id={compareVersions.v1.id}
              version2Id={compareVersions.v2.id}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button onClick={handleCompareClose} size="large">
            {t('versionHistory.closeButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  function isCurrent(version) {
    return version?.id === experiment?.current_version_id;
  }

  function renderVersionContent(version) {
    if (!version?.content) {
      return (
        <Alert severity="info">
          {t('versionHistory.noContentAvailable')}
        </Alert>
      );
    }

    const content = version.content;

    const actualContent = content?.content || content;
    const config = actualContent?.config || {};

    const sections = content?.sections || actualContent?.sections || [];

    return (
      <Box>
        <Paper elevation={0} sx={{ p: 3, mb: 4, mt: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {version.title || actualContent.title || t('versionHistory.untitledExperiment')}
          </Typography>
          
          {(() => {
            const subject = config.subject || config.course || content.course;
            const gradeLevel = config.gradeLevel || config.program || content.program;
            const duration = config.duration || content.estimated_duration;
            
            if (subject || gradeLevel || duration) {
              return (
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                  {subject && (
                    <Chip 
                      label={`${t('experiment.course')}: ${subject}`} 
                      variant="outlined"
                      size="medium"
                    />
                  )}
                  {gradeLevel && (
                    <Chip 
                      label={`${t('experiment.program')}: ${gradeLevel}`} 
                      variant="outlined"
                      size="medium"
                    />
                  )}
                  {duration && (
                    <Chip 
                      label={`${t('versionHistory.duration')}: ${duration}`} 
                      variant="outlined"
                      size="medium"
                    />
                  )}
                </Stack>
              );
            }
            return null;
          })()}
        </Paper>

        {sections.length > 0 ? (
          <Stack spacing={3}>
            {sections.map((section, idx) => {
              
              let sectionData = section;
              if (typeof section === 'string') {
                try {
                  sectionData = JSON.parse(section);
                } catch {
                  sectionData = { content: section };
                }
              }

              const sectionName = sectionData.name || sectionData.title || `Section ${idx + 1}`;
              const sectionIcon = sectionData.icon || '📝';
              const sectionContent = sectionData.content || '';
              const sectionMedia = sectionData.media || [];

              const isSafetySection = sectionName.toLowerCase().includes('safety') || 
                                     sectionName.toLowerCase().includes('sicherheit') ||
                                     sectionData.id?.includes('safety');
              const isHazardsSection = sectionName.toLowerCase().includes('hazard') || 
                                      sectionName.toLowerCase().includes('gefahr') ||
                                      sectionData.id?.includes('hazard');

              const safetyIcons = isSafetySection || isHazardsSection ? sectionMedia.filter(m => {
                const name = (m.name || '').toLowerCase();
                const url = (m.url || m.data || '').toLowerCase();
                const caption = (m.caption || '').toLowerCase();
                
                if (isSafetySection) {
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
                } else if (isHazardsSection) {
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
                         
                         name.includes('giftig') ||
                         name.includes('ätzend') ||
                         name.includes('entzündbar') ||
                         name.includes('explosiv') ||
                         name.includes('oxidierend') ||
                         name.includes('reizend') ||
                         name.includes('umwelt') ||
                         name.includes('gesundheit') ||
                         caption.includes('giftig') ||
                         caption.includes('ätzend') ||
                         caption.includes('entzündbar') ||
                         caption.includes('explosiv') ||
                         caption.includes('gefahr') ||
                         url.includes('/ghs/') ||
                         url.includes('/hazard/');
                }
                return false;
              }) : [];

              const regularMedia = isSafetySection || isHazardsSection ? sectionMedia.filter(m => {
                const name = (m.name || '').toLowerCase();
                const url = (m.url || m.data || '').toLowerCase();
                const caption = (m.caption || '').toLowerCase();
                
                if (isSafetySection) {
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
                } else if (isHazardsSection) {
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
                         
                         !name.includes('giftig') &&
                         !name.includes('ätzend') &&
                         !name.includes('entzündbar') &&
                         !name.includes('explosiv') &&
                         !name.includes('oxidierend') &&
                         !name.includes('reizend') &&
                         !name.includes('umwelt') &&
                         !name.includes('gesundheit') &&
                         !caption.includes('giftig') &&
                         !caption.includes('ätzend') &&
                         !caption.includes('entzündbar') &&
                         !caption.includes('explosiv') &&
                         !caption.includes('gefahr') &&
                         !url.includes('/ghs/') &&
                         !url.includes('/hazard/');
                }
                return true;
              }) : sectionMedia;

              const hasContent = () => {
                if (sectionMedia.length > 0) return true;
                
                if (typeof sectionContent === 'string' && sectionContent.trim()) {
                  return true;
                }
                
                if (Array.isArray(sectionContent) && sectionContent.length > 0) {
                  return true;
                }
                
                if (typeof sectionContent === 'object' && sectionContent !== null) {
                  const hasNonEmptyFields = Object.entries(sectionContent).some(([key, value]) => {
                    if (key === 'media') return false;
                    if (Array.isArray(value) && value.length > 0) return true;
                    if (typeof value === 'string' && value.trim()) return true;
                    if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) return true;
                    return false;
                  });
                  return hasNonEmptyFields;
                }
                
                return false;
              };

              if (!hasContent()) {
                return null;
              }

              return (
                <Card key={idx} variant="outlined" sx={{ overflow: 'visible' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{sectionIcon}</span>
                      {sectionName}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {}
                    {safetyIcons.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 2,
                          mb: 2
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
                                alt={mediaItem.name || `Icon ${mediaIndex + 1}`}
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

                    {}
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
                                  {t('viewer.browserNoVideoSupport', 'Your browser does not support the video tag.')}
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
                                  {t('viewer.figure', { number: index + 1, defaultValue: `Figure ${index + 1}` })}:
                                </Box>{' '}
                                {mediaItem.caption}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {sectionContent && (
                      <Box sx={{ mb: 3 }}>
                        {Array.isArray(sectionContent) ? (
                          
                          <Box component="ul" sx={{ pl: 3, m: 0 }}>
                            {sectionContent.map((item, itemIdx) => {
                              
                              let displayText = '';
                              
                              if (typeof item === 'string') {
                                displayText = item;
                              } else if (typeof item === 'object' && item !== null) {
                                
                                if (item.text || item.instruction) {
                                  displayText = item.text || item.instruction;
                                }
                                
                                else if (item.name) {
                                  displayText = item.name;
                                }
                                
                                else {
                                  displayText = JSON.stringify(item);
                                }
                              } else {
                                displayText = String(item);
                              }
                              
                              return (
                                <Typography component="li" key={itemIdx} variant="body1" sx={{ mb: 1 }}>
                                  {displayText}
                                </Typography>
                              );
                            })}
                          </Box>
                        ) : typeof sectionContent === 'object' && sectionContent !== null ? (
                          
                          <Stack spacing={1.5}>
                            {Object.entries(sectionContent).map(([key, value]) => {
                              
                              if (!value || (Array.isArray(value) && value.length === 0)) return null;
                              
                              return (
                                <Box key={key}>
                                  <Typography variant="subtitle2" color="primary" gutterBottom>
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                  </Typography>
                                  {Array.isArray(value) ? (
                                    <Box component="ul" sx={{ pl: 3, mt: 0.5, mb: 0 }}>
                                      {value.map((item, idx) => {
                                        
                                        let displayText = '';
                                        
                                        if (typeof item === 'string') {
                                          displayText = item;
                                        } else if (typeof item === 'object' && item !== null) {
                                          
                                          if (item.text || item.instruction) {
                                            displayText = item.text || item.instruction;
                                          }
                                          
                                          else if (item.name) {
                                            displayText = item.name;
                                          }
                                          
                                          else {
                                            displayText = JSON.stringify(item);
                                          }
                                        } else {
                                          displayText = String(item);
                                        }
                                        
                                        return (
                                          <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                            {displayText}
                                          </Typography>
                                        );
                                      })}
                                    </Box>
                                  ) : typeof value === 'object' ? (
                                    <Typography variant="body2" sx={{ ml: 2, whiteSpace: 'pre-wrap' }}>
                                      {JSON.stringify(value, null, 2)}
                                    </Typography>
                                  ) : (
                                    <Box sx={{ ml: 2 }}>
                                      {String(value).split(/\n\n+/).map((para, pIdx) => {
                                        const cleanedPara = para.trim().replace(/\n/g, ' ');
                                        return cleanedPara ? (
                                          <Typography key={pIdx} variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                                            {cleanedPara}
                                          </Typography>
                                        ) : null;
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : typeof sectionContent === 'string' && (sectionContent.startsWith('<') || sectionContent.includes('<p>') || sectionContent.includes('<div>') || sectionContent.includes('<font') || sectionContent.includes('<b>') || sectionContent.includes('<i>')) ? (
                          <Box
                            sx={{
                              '& p': { mb: 1.5, lineHeight: 1.7 },
                              '& ul, & ol': { pl: 3, mb: 1.5 },
                              '& li': { mb: 0.5, lineHeight: 1.6 },
                              '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1, fontWeight: 600 },
                              '& strong, & b': { fontWeight: 600 },
                              '& em, & i': { fontStyle: 'italic' },
                              '& font': { display: 'inline' },
                              wordBreak: 'break-word'
                            }}
                            dangerouslySetInnerHTML={{ __html: sectionContent }}
                          />
                        ) : typeof sectionContent === 'string' ? (
                          <Box>
                            {sectionContent.split(/\n\n+/).map((paragraph, pIdx) => {
                              const cleanedPara = paragraph.trim().replace(/\n/g, ' ');
                              return cleanedPara ? (
                                <Typography 
                                  key={pIdx} 
                                  variant="body1" 
                                  sx={{ 
                                    mb: 2,
                                    lineHeight: 1.7,
                                    textAlign: 'justify'
                                  }}
                                >
                                  {cleanedPara}
                                </Typography>
                              ) : null;
                            })}
                          </Box>
                        ) : (
                          
                          <Typography variant="body2" color="text.secondary">
                            {t('versionHistory.unableToDisplay')}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            }).filter(Boolean)}
          </Stack>
        ) : (
          <Alert severity="info">
            {t('versionHistory.noSectionsDefined')}
          </Alert>
        )}
      </Box>
    );
  }
};

export default VersionHistory;
