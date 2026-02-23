import { createTheme, ThemeOptions } from '@mui/material/styles';

// Shared theme options
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#00d26a' : '#00ff81',
      light: mode === 'light' ? '#00ff81' : '#33ff9a',
      dark: mode === 'light' ? '#00b85c' : '#00e874',
      contrastText: mode === 'light' ? '#ffffff' : '#0f172a',
    },
    secondary: {
      main: mode === 'light' ? '#6366f1' : '#818cf8',
      light: mode === 'light' ? '#818cf8' : '#a5b4fc',
      dark: mode === 'light' ? '#4f46e5' : '#6366f1',
    },
    background: {
      default: mode === 'light' ? '#f8f9fa' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#1a1a1a' : '#f1f5f9',
      secondary: mode === 'light' ? '#6c757d' : '#cbd5e1',
      disabled: mode === 'light' ? '#adb5bd' : '#64748b',
    },
    divider: mode === 'light' ? '#e9ecef' : '#334155',
    error: {
      main: mode === 'light' ? '#dc3545' : '#f87171',
    },
    success: {
      main: mode === 'light' ? '#28a745' : '#34d399',
    },
    warning: {
      main: mode === 'light' ? '#ffc107' : '#fbbf24',
    },
    info: {
      main: mode === 'light' ? '#17a2b8' : '#60a5fa',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', system-ui, -apple-system, sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.75rem',
          padding: '0.625rem 1.25rem',
          fontSize: '0.9375rem',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
              : '0 4px 12px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 6px 16px rgba(0, 0, 0, 0.2)'
              : '0 6px 16px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? '#6c757d' : '#cbd5e1',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.2s ease-in-out',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
            : '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
            : '0 3px 6px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.4)',
        },
        elevation3: {
          boxShadow: mode === 'light'
            ? '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
            : '0 10px 20px rgba(0, 0, 0, 0.6), 0 6px 6px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          overflow: 'hidden',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          fontWeight: 500,
        },
      },
    },
  },
});

// Create light and dark themes
export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark'));

// Legacy export for backwards compatibility
export const theme = lightTheme;
