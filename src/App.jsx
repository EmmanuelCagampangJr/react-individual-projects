    // src/App.jsx

    import React from 'react';
    import { Box, Button, Typography, Grid, Paper } from '@mui/material'; // Make sure Paper is imported for general styling
    import { QueueProvider, QueueContext } from './QueueContext'; // Import provider and context
    import WaitingQueuePanel from './components/WaitingQueuePanel';
    import CashierCard from './components/CashierCard';
    import { useContext } from 'react'; // Import useContext here as well

    // This component will contain the main UI layout and consume the context
    function AppContent() {
      // Access state and dispatch from the QueueContext
      const { state, dispatch } = useContext(QueueContext);

      // Handler for the global Reset button
      const handleResetSystem = () => {
        dispatch({ type: 'RESET_SYSTEM' }); // Dispatch the RESET_SYSTEM action
      };

      return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: '#f0f0f0' }}>
          <Typography variant="h3" gutterBottom sx={{ mb: 4, color: '#3f51b5' }}>Cashier Queuing System</Typography>

          <Grid container spacing={4} sx={{ width: '100%', maxWidth: '1200px' }}>
            {/* Left Panel: Waiting Queue */}
            <Grid item xs={12} md={6}>
              <WaitingQueuePanel /> {/* WaitingQueuePanel will consume context directly */}
            </Grid>

            {/* Right Panel: Cashiers */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Cashiers</Typography>
              <Grid container spacing={2}>
                {/* Map over the cashiers array from state to render CashierCard for each */}
                {state.cashiers.map(cashier => (
                  <Grid item xs={12} sm={6} md={4} key={cashier.id}> {/* Responsive grid for cashiers */}
                    {/* Pass the individual cashier object to CashierCard */}
                    <CashierCard cashier={cashier} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* Global Controls & Stats */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" color="error" onClick={handleResetSystem} sx={{ mb: 2 }}>
              Reset System
            </Button>
            <Typography variant="h6" sx={{ color: '#555' }}>
              Total Customers Served: {state.servedCustomersCount}
            </Typography>
          </Box>
        </Box>
      );
    }

    // This is the root App component that provides the context to its children
    export default function App() {
      return (
        <QueueProvider> {/* Wrap the entire AppContent with the QueueProvider */}
          <AppContent />
        </QueueProvider>
      );
    }
    