import { createTheme } from '@mui/material/styles';
import { colors, corporateColors, shadows } from './tokens';

export const professionalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,      
      light: colors.primary.light,
      dark: colors.primary.dark,
      50: colors.primary[50],
      100: colors.primary[100],
      200: colors.primary[200],
      300: colors.primary[300],
      400: colors.primary[400],
      500: colors.primary[500],
      600: colors.primary[600],
      700: colors.primary[700],
      800: colors.primary[800],
      900: colors.primary[900],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary.main,    
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: '#ffffff',
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
      contrastText: '#ffffff',
    },
    grey: colors.gray,
    background: {
      default: '#FFFFFF',            
      paper: '#FFFFFF',
      alt: colors.primary[50],       
    },
    text: {
      primary: corporateColors.charcoal,  
      secondary: corporateColors.slate,   
      disabled: colors.gray[400],
    },
    divider: colors.gray[200],
    
    
    corporate: {
      main: colors.primary.main,
      black: corporateColors.black,
      white: corporateColors.white,
      darkBlue: corporateColors.darkBlue,
      navyBlue: corporateColors.navyBlue,
      charcoal: corporateColors.charcoal,
      slate: corporateColors.slate,
      platinum: corporateColors.platinum,
      lightGray: corporateColors.lightGray,
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: corporateColors.charcoal,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: corporateColors.charcoal,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: corporateColors.charcoal,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: corporateColors.charcoal,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: corporateColors.charcoal,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: corporateColors.charcoal,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: corporateColors.slate,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: corporateColors.slate,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: corporateColors.charcoal,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: corporateColors.slate,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      color: colors.gray[500],
    },
  },

  shape: {
    borderRadius: 8,
  },

  shadows: [
    'none',
    shadows.sm,
    shadows.md,
    shadows.lg,
    shadows.xl,
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(19).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
  ],

  components: {
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: shadows.sm,
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            
            backgroundColor: colors.gray[100],
            color: colors.gray[500],
            opacity: 0.7,
            cursor: 'not-allowed',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: colors.primary.main,
            '&:hover': {
              background: colors.primary.dark,
            },
            '&.Mui-disabled': {
              backgroundColor: colors.gray[200],
              color: colors.gray[500],
            },
          },
          '&.MuiButton-containedSecondary': {
            background: colors.secondary.main,
            '&:hover': {
              background: colors.secondary.dark,
            },
            '&.Mui-disabled': {
              backgroundColor: colors.gray[200],
              color: colors.gray[500],
            },
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },

    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.gray[200]}`,
        },
        elevation1: {
          boxShadow: shadows.sm,
        },
        elevation2: {
          boxShadow: shadows.md,
        },
        elevation3: {
          boxShadow: shadows.lg,
        },
      },
    },

    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.gray[200]}`,
          boxShadow: shadows.sm,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: shadows.hover,
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: colors.primary[100],
          color: colors.primary[800],
          '&:hover': {
            backgroundColor: colors.primary[200],
          },
        },
        colorSecondary: {
          backgroundColor: colors.secondary[100],
          color: colors.secondary[800],
          '&:hover': {
            backgroundColor: colors.secondary[200],
          },
        },
      },
    },

    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },

    
    MuiStepper: {
      styleOverrides: {
        root: {
          padding: '24px 0',
        },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: colors.primary.main,
          },
          '&.Mui-completed': {
            color: colors.success.main,
          },
        },
      },
    },

    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: corporateColors.white,
          color: corporateColors.charcoal,
          boxShadow: `0 1px 0 ${colors.gray[200]}`,
          borderBottom: `1px solid ${colors.gray[200]}`,
          borderRadius: 0,
        },
      },
    },

    
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '72px !important',
          padding: '0 24px',
        },
      },
    },
  },

  
  custom: {
    shadows,
    corporate: corporateColors,
    
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    
    transitions: {
      fast: 'all 0.15s ease-in-out',
      normal: 'all 0.2s ease-in-out',
      slow: 'all 0.3s ease-in-out',
    },
  },
});

export default professionalTheme;
