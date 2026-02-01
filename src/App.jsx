import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Paper,
  Fade,
  alpha,
  AppBar,
  Toolbar,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  IconButton
} from "@mui/material";
import { 
  Science, 
  History, 
  AutoAwesome,
  TrendingUp,
  ErrorOutline,
  Help as HelpIcon
} from "@mui/icons-material";
import { Dashboard, ExperimentDashboard, ExperimentWizard, ExperimentListContainer } from "./containers/exports.js";
import UserInfo from "./components/UserInfo.jsx";
import ExperimentEditor from "./components/ExperimentEditor.jsx";
import ExperimentViewer from "./components/ExperimentViewer.jsx";
import HelpGuide from "./components/HelpGuide.jsx";
import { keycloakService } from "./services/exports.js";
import { professionalTheme } from "./styles/theme.js";

function ExperimentEditorRoute({ onClose, onSaved }) {
  const { experimentId } = useParams();
  return (
    <ExperimentEditor
      experimentId={experimentId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function ExperimentViewerRoute({ onClose, onEdit }) {
  const { experimentId } = useParams();
  return (
    <ExperimentViewer
      key={`experiment-${experimentId}-${Date.now()}`}
      experimentId={experimentId}
      onClose={onClose}
      onEdit={onEdit}
    />
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reload, setReload] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  
  
  const hasExistingToken = keycloakService.isAuthenticated();
  
  
  const [authenticated, setAuthenticated] = useState(hasExistingToken);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [authError, setAuthError] = useState(null);
  const theme = professionalTheme;

  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      
      if (authCode) {
        setLoading(true);
        setVerifying(true);
        try {
          await keycloakService.initialize();
          const isAuth = keycloakService.isAuthenticated();
          setAuthenticated(isAuth);
          if (isAuth) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Auth callback failed:', error);
          setAuthError({ message: 'Authentication failed', details: error.message });
        } finally {
          setLoading(false);
          setVerifying(false);
        }
      } else if (hasExistingToken) {
        const isAuth = keycloakService.isAuthenticated();
        setAuthenticated(isAuth);
      }
    };
    
    handleAuth();
  }, []);

  const handleExperimentCreated = () => {
    setReload(r => r + 1);
    navigate('/'); 
  };

  const handleEditExperiment = (experiment) => {
    navigate(`/edit/${experiment.id}`);
  };

  const handleViewExperiment = (experiment) => {
    navigate(`/view/${experiment.id}`);
  };

  const handleEditExperimentFromViewer = (experiment) => {
    navigate(`/edit/${experiment.id}`);
  };

  const handleCancelEdit = () => {
    navigate(-1);
  };

  const handleExperimentSaved = async (savedExperiment) => {
    setReload(r => r + 1);
    
    
    
    if (savedExperiment) {
      const experimentId = savedExperiment.experiment_id || savedExperiment.id;
      if (experimentId) {
        navigate(`/view/${experimentId}`);
      } else {
        
        navigate('/');
      }
    } else {
      
      navigate('/');
    }
  };

  
  if (verifying) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#ffffff'
      }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}>
        <Science sx={{ 
          fontSize: 64, 
          color: 'primary.main', 
          mb: 2,
          animation: 'pulse 2s infinite'
        }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {authenticated ? t('app.loadingDashboard') : t('app.initializingAuth')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('app.connectingToKeycloak')}
        </Typography>
      </Box>
    );
  }

  
  if (!authenticated) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <Container maxWidth="sm">
          {authError && (
            <Paper 
              elevation={3}
              sx={{ 
                p: 4,
                mb: 3,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                borderLeft: `4px solid ${theme.palette.error.main}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorOutline sx={{ color: 'error.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {authError.message}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {authError.details}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {t('app.errors.errorOccurredAt', { timestamp: new Date(authError.timestamp).toLocaleString() })}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    keycloakService.clearAuthError();
                    setAuthError(null);
                    window.location.reload();
                  }}
                >
                  {t('app.retryAuthentication')}
                </Button>
              </Box>
            </Paper>
          )}
          
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 4, md: 6 },
              borderRadius: 2,
              background: '#ffffff',
              textAlign: 'center'
            }}
          >
            { }
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#1976d2',
                  fontSize: { xs: '1.75rem', md: '2.125rem' }
                }}
              >
                {t('app.landing.title')}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 400, 
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {t('app.landing.subtitle')}
              </Typography>
            </Box>

            { }
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4,
              mt: 4
            }}>
              <Box sx={{ 
                p: 2.5,
                minHeight: { xs: 'auto', sm: '180px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  flexShrink: 0
                }}>
                  <Typography variant="h5">🧪</Typography>
                </Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.3
                  }}
                >
                  {t('app.landing.feature1Title')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.5
                  }}
                >
                  {t('app.landing.feature1Desc')}
                </Typography>
              </Box>

              <Box sx={{ 
                p: 2.5,
                minHeight: { xs: 'auto', sm: '180px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#f3e5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  flexShrink: 0
                }}>
                  <Typography variant="h5">📚</Typography>
                </Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.3
                  }}
                >
                  {t('app.landing.feature2Title')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.5
                  }}
                >
                  {t('app.landing.feature2Desc')}
                </Typography>
              </Box>

              <Box sx={{ 
                p: 2.5,
                minHeight: { xs: 'auto', sm: '180px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  flexShrink: 0
                }}>
                  <Typography variant="h5">✨</Typography>
                </Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.3
                  }}
                >
                  {t('app.landing.feature3Title')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    hyphens: 'auto',
                    lineHeight: 1.5
                  }}
                >
                  {t('app.landing.feature3Desc')}
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={async () => {
                try {
                  await keycloakService.login();
                } catch (error) {
                  console.error('Login error:', error);
                }
              }}
              sx={{ 
                mt: 3,
                py: 1.5,
                px: 5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1,
                textTransform: 'none',
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0'
                }
              }}
            >
              {t('auth.login')}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              {t('app.secureAuth')}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#FFFFFF',
    }}>
      { }
      {authenticated && (
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            background: '#FFFFFF',
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            borderRadius: 0
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                letterSpacing: '0.5px'
              }}>
                {t('app.title')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserInfo onHelpClick={() => setHelpOpen(true)} />
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />

      { }
      <Box sx={{ 
        background: theme.palette.primary.main,
        color: 'white',
        py: authenticated ? 3 : 5,
        mb: 4,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 3
          }}>
            <Box>
              {!authenticated && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                    {t('wizard.title')}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, color: 'white' }}>
                    {t('app.tagline')}
                  </Typography>
                </Box>
              )}
              
          
              
              <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 600, color: 'white' }}>
                {t('app.welcomeMessage')}
              </Typography>
            </Box>

      
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 6 }}>
        { }
        <Fade in={!loading && authenticated} timeout={700}>
          <Box sx={{ animation: 'fadeIn 0.7s ease-out' }}>
            <Routes>
              { }
              <Route path="/" element={
                <Dashboard
                  onCreateExperiment={() => navigate('/create')}
                  onModifyExperiment={() => navigate('/manage')}
                  onViewExperiments={() => navigate('/manage')}
                  onViewExperiment={handleViewExperiment}
                  onEditExperiment={handleEditExperiment}
                />
              } />

              { }
              <Route path="/create" element={
                <ExperimentWizard 
                  onComplete={handleExperimentCreated}
                  onCancel={() => navigate('/')}
                />
              } />

              { }
              <Route path="/edit/:experimentId" element={
                <ExperimentEditorRoute
                  onClose={handleCancelEdit}
                  onSaved={handleExperimentSaved}
                />
              } />

              { }
              <Route path="/manage" element={
                <ExperimentListContainer 
                  reloadSignal={reload} 
                  onEditExperiment={handleEditExperiment}
                  onBackToDashboard={() => navigate('/')}
                />
              } />

              { }
              <Route path="/view/:experimentId" element={
                <ExperimentViewerRoute
                  onClose={() => navigate(-1)}
                  onEdit={handleEditExperimentFromViewer}
                />
              } />
            </Routes>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={professionalTheme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}
