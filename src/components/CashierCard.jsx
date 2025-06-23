// src/components/CashierCard.jsx

import React, { useContext } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import an icon for re-queue
import { QueueContext } from '../QueueContext.jsx';
import { CUSTOMER_TYPES } from '../constants';
import { useTheme } from '@mui/material/styles';

export default function CashierCard({ cashier }) {
  const { dispatch } = useContext(QueueContext);
  const theme = useTheme();

  if (!cashier) {
    console.error("CashierCard received undefined or null cashier prop.");
    return <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>Error: Invalid Cashier Data</Paper>;
  }

  const statusText = cashier.isIdle
    ? 'Idle Cashier'
    : `Now serving: ID: ${cashier.currentCustomer?.id} (${cashier.currentCustomerRemainingTime}s remaining)`;

  const statusColor = cashier.isIdle ? theme.palette.success.main : (
    cashier.currentCustomer?.type === CUSTOMER_TYPES.PRIORITY
      ? theme.palette.error.main
      : theme.palette.primary.main
  );

  const handleRequeueCustomer = (customerId, isCurrentlyServing) => {
      dispatch({
          type: 'REQUEUE_CUSTOMER_FROM_CASHIER',
          payload: {
              cashierId: cashier.id,
              customerId,
              isCurrentlyServing,
          }
      });
  };

  return (
    <Paper elevation={4} sx={{
      p: { xs: 2, sm: 3 },
      textAlign: 'center',
      bgcolor: cashier.isIdle ? theme.palette.success.light : theme.palette.background.paper,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      border: `1px solid ${cashier.isIdle ? theme.palette.success.main : theme.palette.divider}`,
      transition: 'all 0.3s ease-in-out',
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
        {cashier.name} {cashier.isPriority ? <Box component="span" sx={{ color: 'error.dark', fontSize: '0.8em' }}>(Priority)</Box> : ''}
      </Typography>
      {/* Current Serving Customer Display */}
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 1
      }}>
          <Typography variant="body1" sx={{ color: statusColor, fontWeight: 'bold', mt: 1 }}>
            {statusText}
          </Typography>
          {cashier.currentCustomer && ( // Show re-queue button only if customer is being served
            <Button
                variant="outlined"
                size="small"
                color="info"
                startIcon={<ArrowBackIcon />}
                onClick={() => handleRequeueCustomer(cashier.currentCustomer.id, true)}
                sx={{ mt: 1, textTransform: 'none' }}
            >
                Re-queue
            </Button>
          )}
      </Box>


      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>Queue</Typography>
      {cashier.cashierQueue.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', p: 1 }}>
          No customers.
        </Typography>
      ) : (
        <List sx={{
          maxHeight: '180px', // Fixed height for scrollable queue
          overflowY: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          // --- CHANGE 1: Adjust borderRadius for even more square look (e.g., 4px) ---
          borderRadius: '4px', // Changed from 8px to 4px for less roundness
          bgcolor: 'background.default',
          width: '100%',
          boxSizing: 'border-box',
          // --- CHANGE 2: Ensure sufficient padding for visibility on the List container itself ---
          paddingTop: '8px',
          paddingBottom: '8px',
        }}>
          {cashier.cashierQueue.map(customer => (
            <ListItem
              key={customer.id}
              dense
              sx={{
                minHeight: '40px',
                // --- CHANGE 3: Adjust padding on ListItem itself for content visibility ---
                paddingY: '4px', // Keep paddingY for vertical spacing
                paddingX: '8px', // Keep paddingX for horizontal spacing
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <ListItemText
                primary={`ID: ${customer.id} | ${customer.transactionTime}s`}
                primaryTypographyProps={{
                  color: customer.type === CUSTOMER_TYPES.PRIORITY ? 'error.main' : 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '0.9rem', // This keeps the text size manageable
                }}
              />
              <IconButton
                size="small"
                color="info"
                onClick={() => handleRequeueCustomer(customer.id, false)}
                aria-label="requeue customer"
                sx={{ ml: 1 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}