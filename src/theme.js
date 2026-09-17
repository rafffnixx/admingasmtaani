// 📁 admin-web/src/theme.js
import { createTheme } from '@mui/material/styles';
import { Colors } from './utils/colors';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: Colors.primary,
      dark: Colors.primaryDark,
      light: Colors.primaryLight,
      contrastText: Colors.white,
    },
    secondary: { main: Colors.gray[700], contrastText: Colors.white },
    success: { main: Colors.success },
    warning: { main: Colors.warning },
    error:   { main: Colors.error },
    info:    { main: Colors.info },
    background: { default: Colors.background, paper: Colors.surface },
    text: {
      primary: Colors.textPrimary,
      secondary: Colors.textSecondary,
      disabled: Colors.textLight,
    },
    divider: Colors.border,
  },

  shape: { borderRadius: 10 },

  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${Colors.border}`,
          boxShadow: Colors.shadow.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${Colors.border}`,
          borderRadius: 12,
          boxShadow: Colors.shadow.md,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, fontWeight: 600 },
        contained: { boxShadow: Colors.shadow.sm },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: Colors.surface,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: Colors.primary,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: Colors.primary },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: Colors.surface,
          color: Colors.textPrimary,
          boxShadow: Colors.shadow.sm,
          borderBottom: `1px solid ${Colors.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: Colors.surface,
          borderRight: `1px solid ${Colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: Colors.gray[100],
          color: Colors.textSecondary,
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: 12,
          letterSpacing: 0.5,
        },
      },
    },
  },
});

export default theme;