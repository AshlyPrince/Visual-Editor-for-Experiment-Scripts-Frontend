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
  Chip,
  Tooltip
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
  Clear as ClearIcon,
  Psychology as PsychologyIcon,
  DraftsOutlined as DraftIcon
} from '@mui/icons-material';
import { useAsyncOperation, useNotifications } from '../hooks/exports';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx';
import ExportDialog from '../components/ExportDialog.jsx';
import VersionHistory from '../components/VersionHistory.jsx';
import OnboardingTour from '../components/OnboardingTour.jsx';
import LanguageSimplificationDialog from '../components/LanguageSimplificationDialog.jsx';
import { canAccessRestrictedFeature, isUserOwner } from '../utils/permissions.js';

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
  const { t, ready: i18nReady } = useTranslation();
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
  const [hasDraft, setHasDraft] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [simplifyDialogOpen, setSimplifyDialogOpen] = useState(false);
  const [simplifyingExperiment, setSimplifyingExperiment] = useState(null);
  const [simplifiedExportOpen, setSimplifiedExportOpen] = useState(false);
  const [simplifiedExportData, setSimplifiedExportData] = useState(null);

  const { addNotification } = useNotifications();
  const {
    execute: deleteExperimentAsync,
    loading: deleting
  } = useAsyncOperation();
  
  
  const extractTagsFromExperiment = (experiment) => {
    const tags = [];
    
    if (experiment.title && experiment.title !== 'Untitled Experiment') {
      const commonWords = ['the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'lab', 'experiment', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
      const titleWords = experiment.title
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
      tags.push(...titleWords);
    }
    
    if (experiment.course || experiment.content?.config?.subject) {
      const course = experiment.course || experiment.content?.config?.subject;
      tags.push(course);
    }
    
    if (experiment.program || experiment.content?.config?.gradeLevel) {
      const program = experiment.program || experiment.content?.config?.gradeLevel;
      tags.push(program);
    }
    
    if (experiment.estimated_duration || experiment.content?.config?.duration) {
      const duration = experiment.estimated_duration || experiment.content?.config?.duration;
      const durationMatch = duration.match(/\d+/);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[0]);
        if (minutes <= 30) tags.push(t('dashboard.quickDuration'));
        else if (minutes <= 60) tags.push(t('dashboard.mediumDuration'));
        else if (minutes <= 90) tags.push(t('dashboard.longDuration'));
        else tags.push(t('dashboard.extendedDuration'));
      }
    }
    
    if (experiment.content?.sections && Array.isArray(experiment.content.sections)) {
      const commonWords = ['the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that', 'these', 'those', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall'];
      
      experiment.content.sections.forEach(section => {
        const extractWordsFromText = (text) => {
          if (!text || typeof text !== 'string') return [];
          
          const cleanText = text
            .replace(/<[^>]*>/g, ' ')
            .replace(/[^\w\s]/g, ' ')
            .toLowerCase();
          
          return cleanText
            .split(/\s+/)
            .filter(word => word.length > 4 && !commonWords.includes(word))
            .map(word => word.charAt(0).toUpperCase() + word.slice(1));
        };
        
        const processField = (value) => {
          if (typeof value === 'string') {
            return extractWordsFromText(value);
          } else if (Array.isArray(value)) {
            return value.flatMap(item => {
              if (typeof item === 'string') {
                return extractWordsFromText(item);
              } else if (typeof item === 'object' && item !== null) {
                return Object.values(item).flatMap(processField);
              }
              return [];
            });
          } else if (typeof value === 'object' && value !== null) {
            return Object.values(value).flatMap(processField);
          }
          return [];
        };
        
        if (section.content && typeof section.content === 'object') {
          const words = Object.values(section.content).flatMap(processField);
          tags.push(...words.slice(0, 5));
        }
      });
    }
    
    const uniqueTags = [...new Set(tags)].filter(tag => tag && tag.trim().length > 0);
    return uniqueTags.slice(0, 15);
  };

  
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      
      const response = await experimentService.getExperiments({ 
        page: 1,
        limit: 1000 
      });
      
      let allExperimentData = [];
      
      if (Array.isArray(response)) {
        allExperimentData = response;
      } else if (response && typeof response === 'object') {
        allExperimentData = response.data || response.experiments || response.results || [];
      }
      
      allExperimentData = allExperimentData.map(exp => ({
        ...exp,
        autoTags: extractTagsFromExperiment(exp)
      }));
      
      // Filter experiments based on visibility permissions
      const currentUser = keycloakService.getUserInfo();
      const visibleExperiments = allExperimentData.filter(exp => {
        const permissions = exp.content?.permissions;
        
        // If no permissions set, show the experiment (backward compatibility)
        if (!permissions) return true;
        
        // Show all public experiments
        if (permissions.visibility === 'public') return true;
        
        // Show restricted experiments to everyone (but features will be restricted)
        if (permissions.visibility === 'restricted') return true;
        
        // For private experiments, only show to owner
        if (permissions.visibility === 'private') {
          return isUserOwner(exp, currentUser);
        }
        
        return true;
      });
      
      setAllExperiments(visibleExperiments);
      setFilteredExperiments(visibleExperiments);
      setTotalExperiments(visibleExperiments.length);
      
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedExperiments = visibleExperiments.slice(startIndex, endIndex);
      
      setExperiments(paginatedExperiments);
      setStats({
        totalExperiments: visibleExperiments.length
      });

      setError(null);
    } catch (err) {
      console.error('[Dashboard Refresh] Error refreshing dashboard:', err);
      console.error('[Dashboard Refresh] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(t('messages.unableToLoadExperiments'));
      addNotification({
        type: 'error',
        message: t('messages.loadExperimentsFailed')
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (!i18nReady) {
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userInfo = keycloakService.getUserInfo();
        
        const response = await experimentService.getExperiments({ 
          page: 1,
          limit: 1000 
        });
        
        let allExperimentData = [];
        
        if (Array.isArray(response)) {
          allExperimentData = response;
          allExperimentData = response;
        } else if (response && typeof response === 'object') {
          allExperimentData = response.data || response.experiments || response.results || [];
        }
        
        allExperimentData = allExperimentData.map(exp => ({
          ...exp,
          autoTags: extractTagsFromExperiment(exp)
        }));
        
        // Filter experiments based on visibility permissions
        const currentUser = keycloakService.getUserInfo();
        const visibleExperiments = allExperimentData.filter(exp => {
          const permissions = exp.content?.permissions;
          
          // If no permissions set, show the experiment (backward compatibility)
          if (!permissions) return true;
          
          // Show all public experiments
          if (permissions.visibility === 'public') return true;
          
          // Show restricted experiments to everyone (but features will be restricted)
          if (permissions.visibility === 'restricted') return true;
          
          // For private experiments, only show to owner
          if (permissions.visibility === 'private') {
            return isUserOwner(exp, currentUser);
          }
          
          return true;
        });
        
        setAllExperiments(visibleExperiments);
        setFilteredExperiments(visibleExperiments);
        setTotalExperiments(visibleExperiments.length);
        
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedExperiments = visibleExperiments.slice(startIndex, endIndex);
        
        setExperiments(paginatedExperiments);
        setStats({
          totalExperiments: visibleExperiments.length
        });

        setError(null);
      } catch (err) {
        console.error('[Dashboard] Error loading dashboard data:', err);
        console.error('[Dashboard] Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        
        const isNetworkError = !err.response && (
          err.code === 'ECONNABORTED' ||
          err.code === 'ERR_NETWORK' ||
          err.message.includes('Network Error') ||
          err.message.includes('timeout')
        );
        
        if (isNetworkError) {
          setError(t('messages.serverWakingUp', 'Server is waking up... This may take up to a minute on first load. Please wait.'));
          addNotification({
            type: 'info',
            message: t('messages.serverStarting', 'The server is starting up. This usually takes 30-60 seconds on the first request.')
          });
        } else {
          setError(t('messages.unableToLoadExperiments'));
          addNotification({
            type: 'error',
            message: t('messages.loadExperimentsFailed')
          });
        }
        
        setExperiments([]);
        setAllExperiments([]);
        setFilteredExperiments([]);
        setTotalExperiments(0);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [i18nReady]);
  
  // Check for draft on mount and after any changes
  useEffect(() => {
    const checkForDraft = () => {
      const savedDraft = localStorage.getItem('wizardState');
      setHasDraft(!!savedDraft);
    };
    
    checkForDraft();
    
    // Re-check when window gains focus (in case draft was cleared in another tab)
    window.addEventListener('focus', checkForDraft);
    
    // Listen for draft cleared events from the wizard
    window.addEventListener('draftCleared', checkForDraft);
    
    return () => {
      window.removeEventListener('focus', checkForDraft);
      window.removeEventListener('draftCleared', checkForDraft);
    };
  }, []);
  
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && !loading && i18nReady) {
      setTimeout(() => {
        setOnboardingOpen(true);
      }, 1000);
    }
  }, [loading, i18nReady]);
  
  
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
        
        let sectionsMatch = false;
        if (exp.content?.sections && Array.isArray(exp.content.sections)) {
          sectionsMatch = exp.content.sections.some(section => {
            if (!section.content || typeof section.content !== 'object') return false;
            
            const searchInValue = (value) => {
              if (typeof value === 'string') {
                const cleanText = value.replace(/<[^>]*>/g, ' ').toLowerCase();
                return cleanText.includes(query);
              } else if (Array.isArray(value)) {
                return value.some(item => searchInValue(item));
              } else if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(val => searchInValue(val));
              }
              return false;
            };
            
            return Object.values(section.content).some(val => searchInValue(val));
          });
        }
        
        return title.includes(query) || 
               description.includes(query) || 
               subject.includes(query) ||
               gradeLevel.includes(query) ||
               duration.includes(query) ||
               id.includes(query) ||
               tagsMatch ||
               sectionsMatch;
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

  const handleSimplifyLanguage = () => {
    if (selectedExperiment) {
      setSimplifyingExperiment(selectedExperiment);
      setSimplifyDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSimplifiedExport = async (simplifiedData, format, targetLevel) => {
    try {
      const levelNames = {
        beginner: 'Very Simple (Primary School)',
        intermediate: 'Simple',
        advanced: 'Standard (Current)'
      };

      const content = typeof simplifiedData.content === 'string' 
        ? JSON.parse(simplifiedData.content) 
        : simplifiedData.content;
      
      const actualContent = content?.content || content;
      const config = actualContent?.config || {};
      const sections = actualContent?.sections || [];

      const exportExperiment = {
        ...simplifiedData,
        title: simplifiedData.title,
        content: {
          config: {
            ...config,
            simplifiedLevel: levelNames[targetLevel]
          },
          sections: sections
        }
      };

      setSimplifiedExportData(exportExperiment);
      setSimplifiedExportOpen(true);
      
    } catch (error) {
      console.error('Export preparation error:', error);
      addNotification({
        type: 'error',
        message: t('simplification.exportError', 'Failed to prepare simplified version for export')
      });
    }
  };

  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setOnboardingOpen(false);
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
      setStats({ totalExperiments: allExperimentData.length });
      
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedExperiments = allExperimentData.slice(startIndex, endIndex);
      setExperiments(paginatedExperiments);
      
      if (paginatedExperiments.length === 0 && page > 0) {
        setPage(page - 1);
      }
      
      addNotification({
        type: 'success',
        message: t('experiment.experimentDeleted')
      });
      
      setDeleteDialogOpen(false);
      setExperimentToDelete(null);
    } catch (err) {
      console.error('Error deleting experiment:', err);
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
            {t('dashboard.experiments', 'Experiments')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {!loading && allExperiments.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={hasDraft ? <DraftIcon /> : <AddIcon />}
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
              {hasDraft ? t('experiment.continueDraft', 'Continue Draft') : t('experiment.createNew')}
            </Button>
          )}
        </Box>
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
              startIcon={hasDraft ? <DraftIcon /> : <AddIcon />}
              onClick={onCreateExperiment}
            >
              {hasDraft ? t('experiment.continueDraft', 'Continue Draft') : t('experiment.createNew')}
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
            {experiments.map((experiment) => {
              const currentUser = keycloakService.getUserInfo();
              const canViewDetails = canAccessRestrictedFeature(experiment, 'viewDetails', currentUser);
              const isClickable = canViewDetails;
              
              return (
              <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                <ExperimentCard 
                  onClick={isClickable ? () => handleCardClick(experiment) : undefined}
                  sx={{
                    filter: menuAnchor && selectedExperiment?.id !== experiment.id ? 'blur(2px)' : 'none',
                    opacity: menuAnchor && selectedExperiment?.id !== experiment.id ? 0.7 : (!isClickable ? 0.6 : 1),
                    transition: 'filter 0.2s ease, opacity 0.2s ease',
                    cursor: isClickable ? 'pointer' : 'not-allowed',
                    pointerEvents: isClickable ? 'auto' : 'none',
                    backgroundColor: !isClickable ? 'action.disabledBackground' : 'background.paper'
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
                          pointerEvents: 'auto',
                          '&:hover': { 
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      {(experiment.created_by_name || experiment.creator_name || experiment.username) && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{t('dashboard.createdBy', 'Created by')}:</span>
                          {experiment.created_by_name || experiment.creator_name || experiment.username}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {t('dashboard.lastUpdated')}: {formatDate(experiment.updated_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </ExperimentCard>
              </Grid>
              );
            })}
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
        {selectedExperiment && (() => {
          const currentUser = keycloakService.getUserInfo();
          const userIsOwner = isUserOwner(selectedExperiment, currentUser);
          const canEditExp = canAccessRestrictedFeature(selectedExperiment, 'edit', currentUser);
          const canExport = canAccessRestrictedFeature(selectedExperiment, 'export', currentUser);
          const canViewHistory = canAccessRestrictedFeature(selectedExperiment, 'versionControl', currentUser);
          const canSimplify = canAccessRestrictedFeature(selectedExperiment, 'simplify', currentUser);
          const canDeleteExp = canAccessRestrictedFeature(selectedExperiment, 'delete', currentUser);
          
          return (
            <>
              <Tooltip 
                title={!canEditExp ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
                placement="left"
                arrow
              >
                <span>
                  <MenuItem onClick={handleEdit} disabled={!canEditExp}>
                    <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    {t('experiment.editExperiment')}
                  </MenuItem>
                </span>
              </Tooltip>
              
              <Tooltip 
                title={!canViewHistory ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
                placement="left"
                arrow
              >
                <span>
                  <MenuItem onClick={handleVersionHistory} disabled={!canViewHistory}>
                    <HistoryIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    {t('version.versionHistory')}
                  </MenuItem>
                </span>
              </Tooltip>
              
              <Tooltip 
                title={!canExport ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
                placement="left"
                arrow
              >
                <span>
                  <MenuItem onClick={handleExport} disabled={!canExport}>
                    <ExportIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    {t('common.export')}
                  </MenuItem>
                </span>
              </Tooltip>
              
              <Tooltip 
                title={!canSimplify ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
                placement="left"
                arrow
              >
                <span>
                  <MenuItem onClick={handleSimplifyLanguage} disabled={!canSimplify}>
                    <PsychologyIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    {t('simplification.menuItem', 'Simplify Language')}
                  </MenuItem>
                </span>
              </Tooltip>
              
              <Tooltip 
                title={!canDeleteExp ? t('permissions.featureRestricted', 'This feature has been restricted by the experiment creator') : ''}
                placement="left"
                arrow
              >
                <span>
                  <MenuItem onClick={handleDeleteClick} disabled={!canDeleteExp} sx={{ color: canDeleteExp ? 'error.main' : 'text.disabled' }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    {t('common.delete')}
                  </MenuItem>
                </span>
              </Tooltip>
            </>
          );
        })()}
      </Menu>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={experimentToDelete?.title || ''}
        itemType="experiment"
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
      
      <OnboardingTour 
        open={onboardingOpen} 
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {simplifyingExperiment && (
        <LanguageSimplificationDialog
          open={simplifyDialogOpen}
          onClose={() => {
            setSimplifyDialogOpen(false);
            setSimplifyingExperiment(null);
          }}
          experimentData={simplifyingExperiment}
          onExport={handleSimplifiedExport}
        />
      )}

      {simplifiedExportData && (
        <ExportDialog
          open={simplifiedExportOpen}
          onClose={() => {
            setSimplifiedExportOpen(false);
            setSimplifiedExportData(null);
          }}
          experiment={simplifiedExportData}
          onExported={(format) => {
            addNotification({
              type: 'success',
              message: t('simplification.exportSuccess', `Simplified version exported as ${format.toUpperCase()}`)
            });
            setSimplifiedExportOpen(false);
            setSimplifiedExportData(null);
          }}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
