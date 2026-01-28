import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { experimentService, keycloakService } from '../services/exports.js';
import { styled } from '@mui/material/styles';
import { 
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  GetApp as ExportIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useAsyncOperation, useNotifications } from '../hooks/exports';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx';
import ExportDialog from '../components/ExportDialog.jsx';
import VersionHistory from '../components/VersionHistory.jsx';

const DashboardContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(1), 
  minHeight: 'calc(100vh - 210px)', 
  display: 'flex',
  flexDirection: 'column'
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1)
}));

const ExperimentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  border: `2px solid ${theme.palette.grey[300]}`,
  cursor: 'pointer',
  borderRadius: 12,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
  }
}));

const Dashboard = ({ onCreateExperiment, onViewExperiments, onViewExperiment, onEditExperiment }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalExperiments: 0
  });
  const [experiments, setExperiments] = useState([]);
  const [allExperiments, setAllExperiments] = useState([]); 
  const [filteredExperiments, setFilteredExperiments] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportingExperiment, setExportingExperiment] = useState(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [versionHistoryExperiment, setVersionHistoryExperiment] = useState(null);

  const { addNotification } = useNotifications();
  const {
    execute: deleteExperimentAsync,
    loading: deleting
  } = useAsyncOperation();
  
  
  const extractTagsFromExperiment = (experiment) => {
    const tags = [];
    
    
    if (experiment.course) {
      const courseWords = experiment.course.split(/\s+/).filter(word => word.length > 2);
      tags.push(...courseWords);
    }
    
    
    if (experiment.program) {
      const programWords = experiment.program.split(/\s+/).filter(word => word.length > 2);
      tags.push(...programWords);
    }
    
    
    if (experiment.estimated_duration) {
      const durationMatch = experiment.estimated_duration.match(/\d+/);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[0]);
        if (minutes <= 30) tags.push(t('dashboard.quickDuration'));
        else if (minutes <= 60) tags.push(t('dashboard.mediumDuration'));
        else if (minutes <= 90) tags.push(t('dashboard.longDuration'));
        else tags.push(t('dashboard.extendedDuration'));
      }
    }
    
    
    if (experiment.title) {
      const commonWords = ['the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'lab', 'experiment'];
      const titleWords = experiment.title
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
      tags.push(...titleWords.slice(0, 3)); 
    }
    
    return [...new Set(tags)]; 
  };

  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        
        
        const userInfo = keycloakService.getUserInfo();
        
        
        const response = await experimentService.getExperiments({ 
          page: 1,
          limit: 1000 
        });
        
        
        
        let allExperimentData = [];
        
        if (Array.isArray(response)) {
          allExperimentData = response;
        } else {
          allExperimentData = response.data || response.experiments || [];
        }
        
        
        
        allExperimentData = allExperimentData.map(exp => ({
          ...exp,
          autoTags: extractTagsFromExperiment(exp)
        }));
        
        
        setAllExperiments(allExperimentData);
        setFilteredExperiments(allExperimentData); 
        setTotalExperiments(allExperimentData.length);
        
        
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedExperiments = allExperimentData.slice(startIndex, endIndex);
        
        setExperiments(paginatedExperiments);
        setStats({
          totalExperiments: allExperimentData.length
        });

        setError(null);
      } catch (err) {
        setError(t('messages.unableToLoadExperiments'));
        setExperiments([]);
        setAllExperiments([]);
        setFilteredExperiments([]);
        setTotalExperiments(0);
        
        addNotification({
          type: 'error',
          message: t('messages.loadExperimentsFailed')
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []); 
  
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      
      setFilteredExperiments(allExperiments);
      setTotalExperiments(allExperiments.length);
    } else {
      
      const query = searchQuery.toLowerCase();
      const filtered = allExperiments.filter(exp => {
        const title = (exp.title || '').toLowerCase();
        const description = (exp.description || '').toLowerCase();
        
        
        const subject = (exp.content?.config?.subject || exp.course || '').toLowerCase();
        const gradeLevel = (exp.content?.config?.gradeLevel || exp.program || '').toLowerCase();
        const duration = (exp.content?.config?.duration || exp.estimated_duration || '').toLowerCase();
        
        const id = (exp.id || '').toString();
        
        
        const tagsMatch = exp.autoTags && exp.autoTags.some(tag => 
          tag.toLowerCase().includes(query)
        );
        
        return title.includes(query) || 
               description.includes(query) || 
               subject.includes(query) ||
               gradeLevel.includes(query) ||
               duration.includes(query) ||
               id.includes(query) ||
               tagsMatch;
      });
      
      setFilteredExperiments(filtered);
      setTotalExperiments(filtered.length);
      setPage(0); 
    }
  }, [searchQuery, allExperiments]);
  
  
  useEffect(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedExperiments = filteredExperiments.slice(startIndex, endIndex);
    setExperiments(paginatedExperiments);
  }, [page, rowsPerPage, filteredExperiments]);

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
      if (onEditExperiment) {
        onEditExperiment(selectedExperiment);
      }
    }
    handleMenuClose();
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
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
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

      
      const response = await experimentService.getExperiments({ 
        page: page + 1,
        limit: rowsPerPage 
      });
      const experimentData = Array.isArray(response) ? response : (response.data || []);
      const total = response.total || experimentData.length;
      
      setExperiments(experimentData);
      setTotalExperiments(total);
      setStats({ totalExperiments: total });
      
      addNotification({
        type: 'success',
        message: t('experiment.experimentDeleted')
      });
      
      setDeleteDialogOpen(false);
      setExperimentToDelete(null);
    } catch {
      addNotification({
        type: 'error',
        message: t('messages.errorDeletingExperiment')
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setExperimentToDelete(null);
  };

  const handleCardClick = (experiment) => {
    
    if (onViewExperiment) {
      onViewExperiment(experiment);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardContainer>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: 'text.primary'
          }}>
            {t('dashboard.title')}
          </Typography>
        </Box>

        {!loading && allExperiments.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateExperiment}
            sx={{ 
              fontWeight: 600,
              px: 3,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            {t('experiment.createNew')}
          </Button>
        )}
      </Box>
      
      {!loading && allExperiments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                py: 1.5
              }
            }}
          />
          {searchQuery && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {totalExperiments} {totalExperiments === 1 ? t('dashboard.result') : t('dashboard.results')} {t('dashboard.found')}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ p: 3 }}>
                  <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                  <Skeleton height={30} sx={{ mb: 1 }} />
                  <Skeleton height={20} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : experiments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <ScienceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('experiment.noExperiments')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              {t('experiment.noExperimentsDesc')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateExperiment}
            >
              {t('experiment.createNew')}
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
            {experiments.map((experiment) => (
              <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                <ExperimentCard 
                  onClick={() => handleCardClick(experiment)}
                  sx={{
                    filter: menuAnchor && selectedExperiment?.id !== experiment.id ? 'blur(2px)' : 'none',
                    opacity: menuAnchor && selectedExperiment?.id !== experiment.id ? 0.7 : 1,
                    transition: 'filter 0.2s ease, opacity 0.2s ease'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                          minHeight: '2.8em', 
                          pr: 1,
                          color: (experiment.title === 'Untitled Experiment' || !experiment.title) ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {experiment.title && experiment.title !== 'Untitled Experiment' 
                          ? experiment.title 
                          : t('dashboard.experimentNumber', { id: experiment.id || t('dashboard.new') })}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleMenuClick(e, experiment);
                        }}
                        sx={{ 
                          flexShrink: 0,
                          '&:hover': { 
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('dashboard.lastUpdated')}: {formatDate(experiment.updated_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </ExperimentCard>
              </Grid>
            ))}
          </Grid>
        </>
        )}
      </Box>

      {!loading && totalExperiments > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: totalExperiments > rowsPerPage ? 'space-between' : 'flex-end',
          alignItems: 'center',
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 'auto'
        }}>
          {totalExperiments > rowsPerPage && (
            <Pagination 
              count={Math.ceil(totalExperiments / rowsPerPage)}
              page={page + 1}
              onChange={(event, value) => handleChangePage(event, value - 1)}
              color="primary"
              size="large"
            />
          )}
          
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.showing', { 
              start: page * rowsPerPage + 1,
              end: Math.min((page + 1) * rowsPerPage, totalExperiments),
              total: totalExperiments
            })}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            boxShadow: 3
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
          {t('experiment.editExperiment')}
        </MenuItem>
        <MenuItem onClick={handleVersionHistory}>
          <HistoryIcon sx={{ mr: 1.5, fontSize: 20 }} />
          {t('version.versionHistory')}
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <ExportIcon sx={{ mr: 1.5, fontSize: 20 }} />
          {t('common.export')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        experimentName={experimentToDelete?.title || ''}
        loading={deleting}
      />

      {exportDialogOpen && exportingExperiment && (
        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          experiment={exportingExperiment}
        />
      )}

      {versionHistoryOpen && versionHistoryExperiment && (
        <Dialog
          open={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {t('version.versionHistory')} - {versionHistoryExperiment.title}
          </DialogTitle>
          <DialogContent>
            <VersionHistory
              experimentId={versionHistoryExperiment.id}
              onClose={() => setVersionHistoryOpen(false)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVersionHistoryOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
