// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Customizing the primary palette for a more vibrant feel
    primary: {
      main: '#2196f3', // Blue for regular customers and primary actions
      light: '#6ec6ff',
      dark: '#0069c0',
      contrastText: '#fff',
    },
    // Customizing the secondary palette for accent/assign button
    secondary: {
      main: '#ff9800', // Orange for accent, like the Assign Customer button
      light: '#ffc947',
      dark: '#c66900',
      contrastText: '#fff',
    },
    // Green for idle status or success
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#00701a',
    },
    // Red for priority customers or error states
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    // Info color for general information or potentially regular customers (alternative to primary)
    info: {
      main: '#00bcd4', // A teal/cyan for secondary info or specific customer type
      light: '#62efff',
      dark: '#00838f',
    },
    // Background colors for the overall app and paper components
    background: {
      default: '#f8f9fa', // A very light grey background for the entire page
      paper: '#ffffff', // Pure white for cards and panels
    },
    // Custom color for the "Cashier Queue" header panel (derived from success family)
    cashierQueueHeader: {
        main: '#A7E9C7', // The color from your screenshot
        contrastText: '#fff',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Using Roboto as a common modern font
    h3: {
      fontWeight: 700, // Bolder main title
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 600, // Bolder section titles
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 500, // Medium bold
      fontSize: '1.5rem',
    },
    h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      color: 'rgba(0, 0, 0, 0.6)' // Default muted text color
    }
  },
  shape: {
    borderRadius: 12, // More rounded corners for all Paper/Card components
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent ALL CAPS buttons
          borderRadius: 8, // Match theme border radius
          boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .1)', // Subtle shadow for all buttons
          transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)', // Lift effect on hover
            boxShadow: '0 5px 8px 3px rgba(63, 81, 181, .2)', // More pronounced shadow on hover
          },
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12, // Ensure all Paper components use the theme's border radius
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)', // Subtle default shadow for all papers
            }
        }
    },
    MuiList: {
        styleOverrides: {
            root: {
                // Ensure list background is always paper color or slightly off-white
                backgroundColor: 'white',
            }
        }
    },
    MuiListItemText: {
        styleOverrides: {
            primary: {
                fontWeight: 500, // Make primary text in lists a bit bolder
            }
        }
    }
  },
});

export default theme;
