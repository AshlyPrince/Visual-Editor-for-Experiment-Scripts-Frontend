 

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import TitleIcon from '@mui/icons-material/Title';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LLMChatComponent from './LLMChatComponent';
import TextPolisher from './TextPolisher';
import { useTranslation } from 'react-i18next';
import {
  getSectionSuggestions,
  checkConsistency,
  generateTitleSuggestions,
  generateSafetyRecommendations
} from '../services/llmService';

const LLMAssistantPanel = ({ experimentData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  
  const [polishDialogOpen, setPolishDialogOpen] = useState(false);
  const [polishContext, setPolishContext] = useState({ text: '', field: '', context: '' });
  
  
  const [suggestions, setSuggestions] = useState(null);
  const [consistencyResults, setConsistencyResults] = useState(null);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [safetyRecommendations, setSafetyRecommendations] = useState(null);
  
  
  const [expandedSections, setExpandedSections] = useState({});
  
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  
  const handleOpenPolish = (field, text, context) => {
    setPolishContext({ text, field, context });
    setPolishDialogOpen(true);
  };

  const handleApplyPolish = (polishedText) => {
    if (polishContext.field && onUpdate) {
      onUpdate(polishContext.field, polishedText);
    }
  };

  
  const handleGetSuggestions = async (sectionType, content) => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await getSectionSuggestions(sectionType, content, experimentData);
      setSuggestions({ type: sectionType, ...result });
    } catch (err) {
      setError(err.message || t('llm.suggestions.failedToGet'));
    } finally {
      setLoading(false);
    }
  };

  
  const handleCheckConsistency = async () => {
    setLoading(true);
    setError(null);
    setConsistencyResults(null);

    try {
      const result = await checkConsistency(experimentData);
      setConsistencyResults(result);
    } catch (err) {
      setError(err.message || 'Failed to check consistency');
    } finally {
      setLoading(false);
    }
  };

  
  const handleGenerateTitles = async () => {
    if (!experimentData.description) {
      setError('Please add a description first');
      return;
    }

    setLoading(true);
    setError(null);
    setTitleSuggestions([]);

    try {
      const titles = await generateTitleSuggestions(experimentData.description);
      setTitleSuggestions(titles);
    } catch (err) {
      setError(err.message || t('llm.titles.generating'));
    } finally {
      setLoading(false);
    }
  };

  
  const handleGenerateSafety = async () => {
    if (!experimentData.materials && !experimentData.procedures) {
      setError('Please add materials and procedures first');
      return;
    }

    setLoading(true);
    setError(null);
    setSafetyRecommendations(null);

    try {
      const safety = await generateSafetyRecommendations(
        experimentData.materials || '',
        experimentData.procedures || ''
      );
      setSafetyRecommendations(safety);
    } catch (err) {
      setError(err.message || t('llm.safety.failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (field, value) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<ChatIcon />} label={t('llm.tabs.chat')} />
          <Tab icon={<AutoFixHighIcon />} label={t('llm.tabs.improve')} />
          <Tab icon={<CheckCircleIcon />} label={t('llm.tabs.check')} />
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <LLMChatComponent
            title={t('llm.chat.title')}
            placeholder={t('llm.chat.placeholder')}
            systemPrompt="You are an AI assistant helping with scientific experiment design. Provide clear, practical advice."
            showHeader={false}
            maxHeight={600}
          />
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('llm.polish.polishContent')}
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('polish')}>
                  {expandedSections.polish ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.polish !== false}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {Object.entries(experimentData || {}).map(([key, value]) => {
                    if (typeof value === 'string' && value.length > 0) {
                      return (
                        <Chip
                          key={key}
                          label={t('llm.polish.polishField', { field: key })}
                          icon={<AutoFixHighIcon />}
                          onClick={() => handleOpenPolish(key, value, key)}
                          clickable
                          color="primary"
                          variant="outlined"
                        />
                      );
                    }
                    return null;
                  })}
                </Box>
              </Collapse>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('llm.titles.titleSuggestions')}
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('titles')}>
                  {expandedSections.titles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.titles !== false}>
                <Button
                  variant="outlined"
                  startIcon={<TitleIcon />}
                  onClick={handleGenerateTitles}
                  disabled={loading}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {t('llm.titles.generate')}
                </Button>
                {titleSuggestions.length > 0 && (
                  <List dense>
                    {titleSuggestions.map((title, idx) => (
                      <ListItem
                        key={idx}
                        button
                        onClick={() => applySuggestion('title', title)}
                        sx={{ bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}
                      >
                        <ListItemIcon>
                          <LightbulbIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={title} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Collapse>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('llm.safety.safetyRecommendations')}
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('safety')}>
                  {expandedSections.safety ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.safety !== false}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={handleGenerateSafety}
                  disabled={loading}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {t('llm.safety.generateGuide')}
                </Button>
                {safetyRecommendations && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {safetyRecommendations.recommendations?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>{t('llm.safety.recommendations')}</Typography>
                        <List dense>
                          {safetyRecommendations.recommendations.map((rec, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    {safetyRecommendations.hazards?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>{t('llm.safety.potentialHazards')}</Typography>
                        <List dense>
                          {safetyRecommendations.hazards.map((hazard, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                              <ListItemText primary={hazard} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </Collapse>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              onClick={handleCheckConsistency}
              disabled={loading}
              fullWidth
            >
              {loading ? t('llm.consistency.checking') : t('llm.consistency.checkConsistency')}
            </Button>

            {consistencyResults && (
              <Box>
                <Alert severity={consistencyResults.consistent ? 'success' : 'warning'} sx={{ mb: 2 }}>
                  {consistencyResults.consistent
                    ? t('llm.consistency.consistent')
                    : t('llm.consistency.inconsistent')}
                </Alert>

                {consistencyResults.issues?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>{t('llm.consistency.issuesFound')}</Typography>
                    <List>
                      {consistencyResults.issues.map((issue, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                          <ListItemText primary={issue} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {consistencyResults.recommendations?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>{t('llm.consistency.recommendations')}</Typography>
                    <List>
                      {consistencyResults.recommendations.map((rec, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <TextPolisher
        open={polishDialogOpen}
        onClose={() => setPolishDialogOpen(false)}
        onApply={handleApplyPolish}
        initialText={polishContext.text}
        context={polishContext.context}
        title={t('llm.polish.polishField', { field: polishContext.field })}
      />
    </Paper>
  );
};

export default LLMAssistantPanel;
