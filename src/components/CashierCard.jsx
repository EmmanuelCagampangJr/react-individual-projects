// src/components/CashierCard.jsx

import React, { useContext } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { QueueContext } from '../QueueContext.jsx';
import { CUSTOMER_TYPES } from '../constants';
import { useTheme } from '@mui/material/styles';

export default function CashierCard({ cashier }) {
  const { dispatch } = useContext(QueueContext);
  const theme = useTheme();

  if (!cashier) { // Defensive check
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

  return (
    // Reverted Paper styling for simplicity and ID visibility
    <Paper elevation={1} sx={{
      p: { xs: 1.5, sm: 2 },
      textAlign: 'center',
      bgcolor: 'background.paper', // Simple white background
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1, // Reduced spacing within the card
      border: '1px solid #ddd', // Added a subtle border
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
        {cashier.name} {cashier.isPriority ? <Box component="span" sx={{ color: 'error.dark', fontSize: '0.8em' }}>(Priority)</Box> : ''}
      </Typography>
      <Typography variant="body1" sx={{ color: statusColor, fontWeight: 'bold', mt: 1 }}>
        {statusText}
      </Typography>

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>Queue</Typography>
      {cashier.cashierQueue.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No customers.
        </Typography>
      ) : (
        // Reverted List styling for simplicity and ID visibility
        <List dense sx={{
          maxHeight: '180px', // Fixed height for scrollable queue
          overflowY: 'auto',
          border: '1px solid #ccc', // Simple grey border
          borderRadius: 4, // Slightly rounded corners
          bgcolor: 'white', // White background for the list itself
          width: '100%',
          p: 0, // No padding inside the list itself
        }}>
          {cashier.cashierQueue.map(customer => (
            <ListItem key={customer.id} dense> {/* Removed divider for tighter look */}
              <ListItemText
                primary={`ID: ${customer.id} | ${customer.transactionTime}s`}
                primaryTypographyProps={{
                  color: customer.type === CUSTOMER_TYPES.PRIORITY ? 'error.main' : 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '0.9rem', // Slightly smaller font to fit
                }}
                sx={{ ml: 1, mr: 1 }} // Add some horizontal margin to text
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
