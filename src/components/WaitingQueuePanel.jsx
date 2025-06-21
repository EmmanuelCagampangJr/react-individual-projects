// src/components/WaitingQueuePanel.jsx

import React, { useState, useContext } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { QueueContext } from '../QueueContext.jsx';
import { CUSTOMER_TYPES } from '../constants';
import { useTheme } from '@mui/material/styles';

export default function WaitingQueuePanel() {
  const { state, dispatch } = useContext(QueueContext);
  const [newCustomerType, setNewCustomerType] = useState(CUSTOMER_TYPES.REGULAR);
  const theme = useTheme();

  const handleAddCustomer = () => {
    dispatch({ type: 'ADD_CUSTOMER', payload: { type: newCustomerType } });
  };

  const handleDispatchCustomer = () => {
    dispatch({ type: 'DISPATCH_CUSTOMER' });
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{
        bgcolor: theme.palette.cashierQueueHeader.main,
        p: { xs: 2, sm: 3 },
        mb: { xs: 1, sm: 2 },
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        // Added flex container to center and control button width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center content horizontally
        gap: 1 // Gap between buttons
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
          Cashier Queue
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2, gap: 1 }}> {/* Ensured type buttons take full width */}
          <Button
            variant={newCustomerType === CUSTOMER_TYPES.REGULAR ? 'contained' : 'outlined'}
            onClick={() => setNewCustomerType(CUSTOMER_TYPES.REGULAR)}
            size="medium"
            color="info"
            sx={{ flexGrow: 1 }}
          >
            Regular Customer
          </Button>
          <Button
            variant={newCustomerType === CUSTOMER_TYPES.PRIORITY ? 'contained' : 'outlined'}
            onClick={() => setNewCustomerType(CUSTOMER_TYPES.PRIORITY)}
            size="medium"
            color="error"
            sx={{ flexGrow: 1 }}
          >
            Priority Customer
          </Button>
        </Box>
        {/* Shorten "Add Customer" and "Assign Customer" buttons */}
        <Button
          variant="contained"
          onClick={handleAddCustomer}
          size="small" // Kept size as 'small' for height
          sx={{ maxWidth: '200px', mb: 1 }} // Removed fullWidth, set max width
        >
          Add Customer
        </Button>
        <Button
          variant="contained"
          onClick={handleDispatchCustomer}
          size="small" // Kept size as 'small' for height
          color="secondary"
          sx={{ maxWidth: '200px' }} // Removed fullWidth, set max width
        >
          Assign Customer
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>Waiting Queue</Typography>
      {state.waitingQueue.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', p: 1 }}>
          No customers waiting.
        </Typography>
      ) : (
        <List sx={{
          maxHeight: 'calc(100vh - 480px)',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 4,
          bgcolor: 'white',
          width: '100%',
          p: 0,
        }}>
          {state.waitingQueue.map(customer => (
            <ListItem key={customer.id} dense>
              <ListItemText
                primary={`ID: ${customer.id} | ${customer.transactionTime}s`}
                primaryTypographyProps={{
                  color: customer.type === CUSTOMER_TYPES.PRIORITY ? 'error.main' : 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
                sx={{ ml: 1, mr: 1 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
