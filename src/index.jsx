import ReactDOM from 'react-dom/client'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { professionalTheme } from './styles/theme'
import './index.css'
import { i18nInitPromise } from './i18n/config.js'

window.keycloak = null;

// Wait for i18n to initialize before rendering
i18nInitPromise.then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={professionalTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  );
});
