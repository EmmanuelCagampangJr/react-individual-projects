// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3F51B5', // Deep Indigo Blue (for regular customers, primary elements)
      light: '#757de8',
      dark: '#002984',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFC107', // Amber (for Assign Customer button, accents)
      light: '#ffed4b',
      dark: '#c79100',
      contrastText: '#000',
    },
    success: {
      main: '#4CAF50', // Green (for idle cashiers)
      light: '#80e27e',
      dark: '#00701a',
    },
    error: {
      main: '#F44336', // Red (for priority customers, reset button)
      light: '#ff7961',
      dark: '#ba000d',
    },
    info: {
      main: '#2196F3', // Bright Blue (can be used for regular customers or general info)
      light: '#6ec6ff',
      dark: '#0069c0',
    },
    background: {
      default: '#F5F7FA', // Very light grey blue background for the page
      paper: '#FFFFFF', // Pure white for cards/panels
    },
    text: {
      primary: '#333333', // Dark grey for primary text
      secondary: '#666666', // Lighter grey for secondary text
    },
    // Custom color for the "Cashier Queue" header panel (from previous)
    cashierQueueHeader: {
        main: '#A7E9C7', // The color from your screenshot
        contrastText: '#fff',
    }
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif', // Modern font stack
    h3: {
      fontWeight: 700,
      fontSize: '2.8rem',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.6rem',
      marginBottom: '1rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.15rem',
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1.05rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
    },
    button: {
      fontWeight: 600, // Make button text bolder
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners for components
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent ALL CAPS buttons
          borderRadius: 8, // Match theme border radius
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // More prominent shadow
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)', // More noticeable lift on hover
            boxShadow: '0 6px 10px rgba(0,0,0,0.2)', // More pronounced shadow on hover
          },
        },
        containedPrimary: {
            '&:hover': {
                backgroundColor: '#002984', // Darker on hover
            }
        },
        containedSecondary: {
            '&:hover': {
                backgroundColor: '#c79100', // Darker on hover
            }
        },
        containedError: {
            '&:hover': {
                backgroundColor: '#ba000d', // Darker on hover
            }
        },
        outlined: {
            borderColor: 'rgba(0,0,0,0.12)', // Lighter default border for outlined buttons
            '&:hover': {
                borderColor: 'rgba(0,0,0,0.24)',
                backgroundColor: 'rgba(0,0,0,0.04)',
            }
        }
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 16, // Even more rounded corners for main panels/cards
                boxShadow: '0 8px 16px rgba(0,0,0,0.08)', // Deeper, softer shadow for panels
                padding: '24px', // Consistent default padding inside papers
            }
        }
    },
    MuiList: {
        styleOverrides: {
            root: {
                backgroundColor: 'white',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)', // Lighter border
                overflow: 'hidden', // Ensures border radius works for list items
            }
        }
    },
    MuiListItemText: {
        styleOverrides: {
            primary: {
                fontWeight: 600, // Make primary text in lists bolder
                fontSize: '0.95rem',
            },
            secondary: {
                fontSize: '0.8rem',
            }
        }
    },
    MuiBox: {
        styleOverrides: {
            root: {
                // Default styles for Box if needed, e.g., consistent inner padding for certain boxes
            }
        }
    }
  },
});

export default theme;
