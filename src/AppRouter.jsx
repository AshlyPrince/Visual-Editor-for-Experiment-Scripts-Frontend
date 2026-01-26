import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Fade,
  AppBar,
  Toolbar,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { Science } from '@mui/icons-material';
import { Dashboard, ExperimentDashboard, ExperimentWizard, ExperimentListContainer } from './containers/exports.js';
import DevelopmentModeIndicator from './components/ui/DevelopmentModeIndicator.jsx';
import UserInfo from './components/UserInfo.jsx';
import ModularExperimentWizard from './containers/ModularExperimentWizard.jsx';
import ExperimentViewer from './components/ExperimentViewer.jsx';
import { keycloakService } from './services/exports.js';
import { professionalTheme } from './styles/theme.js';
import experimentService from './services/experimentService.js';

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await keycloakService.initialize();
        setAuthenticated(isAuth);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <Fade in={true} timeout={300}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}>
          <Science sx={{ fontSize: 64, color: 'primary.main' }} />
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Fade>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await keycloakService.login();
      navigate('/dashboard');
    } catch {
      
    }
  };

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
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
            Visual Editor Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create, manage, and share interactive educational experiments
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{ minWidth: 200 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await keycloakService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        }}
      >
        <Toolbar>
          <Science sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Visual Editor Platform
          </Typography>
          <UserInfo onLogout={handleLogout} />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

function DashboardRoute() {
  const navigate = useNavigate();

  return (
    <Dashboard
      onCreateExperiment={() => navigate('/create-experiment')}
      onModifyExperiment={() => navigate('/experiments')}
      onViewExperiments={() => navigate('/experiments')}
    />
  );
}

function CreateExperimentRoute() {
  const navigate = useNavigate();

  return (
    <ExperimentWizard
      onComplete={() => navigate('/dashboard')}
      onCancel={() => navigate('/dashboard')}
    />
  );
}

function ExperimentsRoute() {
  const navigate = useNavigate();
  const [reload, setReload] = useState(0);

  const handleEditExperiment = (experiment) => {
    navigate('/create-experiment', { state: { experiment } });
  };

  return (
    <ExperimentListContainer
      reloadSignal={reload}
      onEditExperiment={handleEditExperiment}
      onBackToDashboard={() => navigate('/dashboard')}
    />
  );
}

function ExperimentEditRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExperiment = async () => {
      try {
        const data = await experimentService.getExperiment(parseInt(id));
        setExperiment(data);
      } catch (err) {
        // Error is displayed to user via error state
        setError('Failed to load experiment. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadExperiment();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading experiment...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px" gap={2}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <ModularExperimentWizard
      existingExperiment={experiment}
      onComplete={() => navigate('/dashboard')}
      onCancel={() => navigate('/dashboard')}
    />
  );
}

function ExperimentViewerRoute() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <ExperimentViewer
      experimentId={parseInt(id)}
      onClose={() => navigate('/dashboard')}
      onEdit={() => navigate(`/experiments/${id}`)}
    />
  );
}

export default function AppRouter() {
  return (
    <ThemeProvider theme={professionalTheme}>
      <CssBaseline />
      <DevelopmentModeIndicator />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardRoute />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-experiment"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateExperimentRoute />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/experiments"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExperimentsRoute />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/experiments/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExperimentEditRoute />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExperimentViewerRoute />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
