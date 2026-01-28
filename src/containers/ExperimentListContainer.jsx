import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Layers as LayersIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  LoadingSpinner,
  LoadingOverlay,
  AlertMessage,
  StatusIndicator,
  ContentSkeleton
} from '../components/ui/Feedback';
import {
  PrimaryButton,
  SecondaryButton
} from '../components/ui/Button';
import { useAsyncOperation, useNotifications } from '../hooks/exports';
import { experimentService } from '../services/exports';
import { createCardStyles } from '../styles/components.js';
import { colors } from '../styles/tokens.js';
import VersionHistory from '../components/VersionHistory.jsx';
import ModularExperimentWizard from './ModularExperimentWizard.jsx';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx';
import ExportDialog from '../components/ExportDialog.jsx';

const ExperimentCard = styled(Card)(({ theme }) => ({
  ...createCardStyles(theme, 'interactive'),
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const ExperimentAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: theme.palette.primary.main,
  fontSize: '1.25rem',
  fontWeight: 600
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem'
}));

const ExperimentListContainer = ({ reloadSignal, onEditExperiment, onBackToDashboard }) => {
  const { t } = useTranslation();
  const [experiments, setExperiments] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [versionHistoryExperiment, setVersionHistoryExperiment] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportingExperiment, setExportingExperiment] = useState(null);
  
  const { addNotification } = useNotifications();
  const {
    execute: loadExperiments,
    loading: experimentsLoading,
    error: experimentsError
  } = useAsyncOperation();

  const {
    execute: deleteExperimentAsync,
    loading: deleting
  } = useAsyncOperation();

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const data = await loadExperiments(experimentService.getExperiments);
        setExperiments(data || []);
      } catch {
        
      }
    };

    fetchExperiments();
  }, [reloadSignal, loadExperiments]);

  const handleMenuClick = (event, experiment) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedExperiment(experiment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExperiment(null);
  };

  const handleEdit = () => {
    if (selectedExperiment) {
      setEditingExperiment(selectedExperiment);
      setEditorOpen(true);
    }
    handleMenuClose();
  };

  const handleEditClick = (experiment) => {
    setEditingExperiment(experiment);
    setEditorOpen(true);
  };

  const handleExport = () => {
    if (selectedExperiment) {
      setExportingExperiment(selectedExperiment);
      setExportDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleVersionHistory = () => {
    if (selectedExperiment) {
      setVersionHistoryExperiment(selectedExperiment);
      setVersionHistoryOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedExperiment) {
      setExperimentToDelete(selectedExperiment);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!experimentToDelete) return;

    try {
      await deleteExperimentAsync(
        () => experimentService.deleteExperiment(experimentToDelete.id)
      );

      
      setExperiments(prev => prev.filter(exp => exp.id !== experimentToDelete.id));
      
      addNotification({
        type: 'success',
        message: `"${experimentToDelete.title}" deleted successfully`
      });
      
      setDeleteDialogOpen(false);
      setExperimentToDelete(null);
    } catch {
      addNotification({
        type: 'error',
        message: t('messages.deleteExperimentFailed')
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setExperimentToDelete(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      draft: colors.gray.main,
      active: colors.success.main,
      completed: colors.info.main,
      archived: colors.warning.main
    };
    return statusColors[status] || colors.gray.main;
  };

  const getExperimentInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (experimentsError) {
    return (
      <AlertMessage
        severity="error"
        title={t('messages.loadingError')}
        message={t('messages.loadExperimentsError')}
      />
    );
  }

  if (experimentsLoading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ p: 3 }}>
                <ContentSkeleton variant="rectangular" height={200} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <LoadingOverlay loading={deleting}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {t('nav.myExperiments')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {experiments.length} {experiments.length === 1 ? t('nav.experiments').toLowerCase() : t('nav.experiments').toLowerCase()} {t('dashboard.totalExperiments').toLowerCase()}
            </Typography>
          </Box>
          {onBackToDashboard && (
            <SecondaryButton onClick={onBackToDashboard}>
              {t('buttons.backToDashboard')}
            </SecondaryButton>
          )}
        </Box>

        {experiments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <ScienceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Experiments Yet
            </Typography>
            <Typography variant="body2">
              Create your first experiment to get started.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {experiments.map((experiment) => (
              <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                <ExperimentCard>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <ExperimentAvatar>
                        {getExperimentInitials(experiment.name || experiment.title || 'EX')}
                      </ExperimentAvatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {experiment.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, experiment)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {experiment.content?.config?.description || 'No description provided'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(experiment.createdAt || experiment.created_at)}
                        </Typography>
                      </Box>
                      
                      {experiment.version_number && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LayersIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Version {experiment.version_number}
                          </Typography>
                        </Box>
                      )}

                      {experiment.createdBy && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {experiment.createdBy}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, justifyContent: 'flex-start' }}>
                    <SecondaryButton
                      size="small"
                      onClick={() => handleEditClick(experiment)}
                      startIcon={<EditIcon />}
                    >
                      {t('common.edit')}
                    </SecondaryButton>
                  </CardActions>
                </ExperimentCard>
              </Grid>
            ))}
          </Grid>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            {t('experiment.editExperiment')}
          </MenuItem>
          <MenuItem onClick={handleVersionHistory}>
            <HistoryIcon sx={{ mr: 1 }} />
            {t('version.versionHistory')}
          </MenuItem>
          <MenuItem onClick={handleExport}>
            <ExportIcon sx={{ mr: 1 }} />
            {t('common.export')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            {t('common.delete')}
          </MenuItem>
        </Menu>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Experiment?"
          itemName={experimentToDelete?.title || experimentToDelete?.name || 'this experiment'}
          itemType="experiment"
          loading={deleting}
          additionalInfo="All versions and associated data will be permanently removed."
        />

        <Dialog
          open={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            {versionHistoryExperiment && (
              <VersionHistory
                experimentId={versionHistoryExperiment.id}
                onClose={() => setVersionHistoryOpen(false)}
                onVersionRestored={() => {
                  setVersionHistoryOpen(false);
                  
                  const fetchExperiments = async () => {
                    const data = await loadExperiments(experimentService.getExperiments);
                    setExperiments(data || []);
                  };
                  fetchExperiments();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {editorOpen && editingExperiment && (
          <Dialog
            open={editorOpen}
            onClose={() => setEditorOpen(false)}
            maxWidth={false}
            fullScreen
          >
            <ModularExperimentWizard
              existingExperiment={editingExperiment}
              onComplete={() => {
                setEditorOpen(false);
                
                const fetchExperiments = async () => {
                  const data = await loadExperiments(experimentService.getExperiments);
                  setExperiments(data || []);
                };
                fetchExperiments();
              }}
              onCancel={() => setEditorOpen(false)}
            />
          </Dialog>
        )}

        <ExportDialog
          open={exportDialogOpen}
          onClose={() => {
            setExportDialogOpen(false);
            setExportingExperiment(null);
          }}
          experiment={exportingExperiment}
          onExported={(type) => {
            addNotification({
              type: 'success',
              message: `Experiment exported as ${type.toUpperCase()} successfully`
            });
          }}
        />
      </Box>
    </LoadingOverlay>
  );
};

export default ExperimentListContainer;
