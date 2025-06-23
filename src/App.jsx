// src/App.jsx

import React, { useContext } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import Grid from '@mui/material/Grid'; // New Grid import for v6+
import { QueueProvider, QueueContext } from './QueueContext.jsx';
import WaitingQueuePanel from './components/WaitingQueuePanel.jsx';
import CashierCard from './components/CashierCard.jsx';
import { useTheme } from '@mui/material/styles'; // Import useTheme for AppContent styling

// AppContent will consume the context and handle the main layout
function AppContent() {
  const { state, dispatch } = useContext(QueueContext);
  const theme = useTheme(); // Access theme for consistent styling

  const handleResetSystem = () => {
    dispatch({ type: 'RESET_SYSTEM' });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          textAlign: 'center',
          bgcolor: theme.palette.background.default, // Use theme background color
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, md: 5 }
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: theme.palette.primary.dark, mb: { xs: 2, md: 4 } }}>
          Cashier Queuing System
        </Typography>

        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ width: '100%' }}>
          {/* Left Panel: Waiting Queue */}
          <Grid size={{ xs: 12, md: 6 }}>
            <WaitingQueuePanel />
          </Grid>

          {/* Right Panel: Cashiers */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" sx={{ mb: { xs: 1, md: 2 }, textAlign: 'center', color: 'text.primary' }}>
              Cashiers
            </Typography>
            <Grid container spacing={2}>
              {state.cashiers && state.cashiers.map(cashier => (
                <Grid key={cashier.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <CashierCard cashier={cashier} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Global Controls & Stats */}
        <Box sx={{ mt: { xs: 2, md: 4 }, textAlign: 'center' }}>
          <Button variant="contained" color="error" onClick={handleResetSystem} size="large" sx={{ mb: 2 }}>
            Reset System
          </Button>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Total Customers Served: <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{state.servedCustomersCount}</Box>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <AppContent />
    </QueueProvider>
  );
}
