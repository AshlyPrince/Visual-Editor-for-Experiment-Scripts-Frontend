import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import {
  CompareArrows,
  ExpandMore,
  ArrowBack,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  CheckCircle as Check,
} from '@mui/icons-material';
import experimentService from '../services/experimentService.js';
import {
  compareVersions,
  getChangeType,
  getChangePath,
  getChangeColor,
  getChangeBgColor,
  formatValue,
  groupDifferences,
} from '../utils/versionComparison.js';

const VersionComparison = ({ experimentId, version1Id, version2Id, onClose }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (experimentId && version1Id && version2Id) {
      loadComparison();
    }
  }, [experimentId, version1Id, version2Id]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const versions = await experimentService.getVersionHistory(experimentId);

      
      const version1 = versions.find((v) => v.id === parseInt(version1Id));
      const version2 = versions.find((v) => v.id === parseInt(version2Id));

      if (!version1 || !version2) {
        throw new Error('One or both versions not found');
      }

      
      const comparisonResult = compareVersions(version1, version2);
      setComparison(comparisonResult);
    } catch (err) {
      // Error is displayed to user via error state with Alert component and Retry button
      setError(err.message || 'Failed to compare versions');
    } finally {
      setLoading(false);
    }
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

  const getChangeIcon = (change) => {
    switch (change.kind) {
      case 'N':
        return <AddIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'D':
        return <RemoveIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'E':
        return <EditIcon fontSize="small" sx={{ color: 'warning.main' }} />;
      default:
        return <EditIcon fontSize="small" />;
    }
  };

  
  const formatFieldName = (fieldName) => {
    const fieldMap = {
      'estimated_duration': 'Duration',
      'duration': 'Duration',
      'course': 'Course',
      'program': 'Program',
      'title': 'Title',
      'description': 'Description',
      'sections': 'Sections',
      'media': 'Media',
      'tables': 'Tables',
      'links': 'Links',
      'subject': 'Subject',
      'gradeLevel': 'Grade Level',
    };
    
    
    if (fieldName.includes('.')) {
      const firstPart = fieldName.split('.')[0];
      return fieldMap[firstPart] || firstPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadComparison} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!comparison) {
    return (
      <Box p={3}>
        <Alert severity="warning">No comparison data available</Alert>
      </Box>
    );
  }

  const { version1, version2, differences, hasChanges } = comparison;
  const groupedDiffs = groupDifferences(differences);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderLeft: 4, borderColor: 'info.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip label={`Version ${version1.version_number}`} color="info" size="small" />
                <Chip label="Older" variant="outlined" size="small" />
              </Box>
              <Typography variant="h6" gutterBottom>{version1.title}</Typography>
              {version1.commit_message && version1.commit_message.trim() && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                  "{version1.commit_message}"
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {formatDate(version1.created_at)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip label={`Version ${version2.version_number}`} color="success" size="small" />
                <Chip label="Newer" variant="outlined" size="small" />
              </Box>
              <Typography variant="h6" gutterBottom>{version2.title}</Typography>
              {version2.commit_message && version2.commit_message.trim() && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                  "{version2.commit_message}"
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {formatDate(version2.created_at)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {!hasChanges ? (
        <Alert severity="info" icon={<Check />}>
          These versions are identical - no changes detected.
        </Alert>
      ) : (
        <>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h6" color="primary.main">What Changed</Typography>
            <Chip label={`${differences.length} ${differences.length === 1 ? 'change' : 'changes'}`} color="primary" />
          </Box>

          <Stack spacing={2}>
            {Object.entries(groupedDiffs).map(([section, sectionDiffs]) => (
              <Accordion key={section} defaultExpanded={sectionDiffs.length <= 5}>
                <AccordionSummary 
                  expandIcon={<ExpandMore />}
                  sx={{ bgcolor: 'grey.50' }}
                >
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatFieldName(section)}
                    </Typography>
                    <Chip 
                      label={`${sectionDiffs.length} ${sectionDiffs.length === 1 ? 'change' : 'changes'}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {sectionDiffs.map((change, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderLeft: 3,
                          borderLeftColor: 
                            change.kind === 'N' ? 'success.main' :
                            change.kind === 'D' ? 'error.main' : 'warning.main',
                        }}
                      >
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                          {getChangeIcon(change)}
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                              <Chip
                                label={
                                  change.kind === 'N' ? 'Added' :
                                  change.kind === 'D' ? 'Removed' : 'Modified'
                                }
                                size="small"
                                color={
                                  change.kind === 'N' ? 'success' :
                                  change.kind === 'D' ? 'error' : 'warning'
                                }
                              />
                              <Typography variant="body2" color="text.secondary">
                                {formatFieldName(getChangePath(change, version1, version2))}
                              </Typography>
                            </Box>

                            {change.kind === 'E' && (
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 1 }}>
                                    <Typography variant="caption" fontWeight={600} color="error.main" display="block" mb={0.5}>
                                      Before
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatValue(change.lhs)}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ p: 1.5, bgcolor: 'success.50', borderRadius: 1 }}>
                                    <Typography variant="caption" fontWeight={600} color="success.main" display="block" mb={0.5}>
                                      After
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatValue(change.rhs)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            )}

                            {change.kind === 'N' && (
                              <Box sx={{ p: 1.5, bgcolor: 'success.50', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="success.main" display="block" mb={0.5}>
                                  New Value
                                </Typography>
                                <Typography variant="body2">
                                  {formatValue(change.rhs)}
                                </Typography>
                              </Box>
                            )}

                            {change.kind === 'D' && (
                              <Box sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight={600} color="error.main" display="block" mb={0.5}>
                                  Deleted Value
                                </Typography>
                                <Typography variant="body2">
                                  {formatValue(change.lhs)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default VersionComparison;
