// src/components/WaitingQueuePanel.jsx

import React, { useState, useContext } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Paper, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import { QueueContext } from '../QueueContext.jsx';
import { CUSTOMER_TYPES, BULK_CUSTOMER_OPTIONS } from '../constants';
import { useTheme } from '@mui/material/styles';

export default function WaitingQueuePanel() {
  const { state, dispatch } = useContext(QueueContext);
  const [newCustomerType, setNewCustomerType] = useState(CUSTOMER_TYPES.REGULAR);
  const [selectedBulkOption, setSelectedBulkOption] = useState('');
  const theme = useTheme();

  const handleAddCustomer = () => {
    dispatch({ type: 'ADD_CUSTOMER', payload: { type: newCustomerType } });
  };

  const handleDispatchCustomer = () => {
    dispatch({ type: 'DISPATCH_CUSTOMER' });
  };

  const handleBulkAddCustomers = () => {
    if (selectedBulkOption) {
      const option = BULK_CUSTOMER_OPTIONS.find(opt => opt.label === selectedBulkOption);
      if (option) {
        dispatch({ type: 'ADD_CUSTOMERS_BULK', payload: option });
        setSelectedBulkOption('');
      }
    }
  };

  const handleRemoveFromWaitingQueue = (customerId) => {
    dispatch({ type: 'REMOVE_FROM_WAITING_QUEUE', payload: { customerId } });
  };

  return (
    <Paper elevation={4} sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header Box - Keep current styling for the header panel */}
      <Box sx={{
        bgcolor: theme.palette.cashierQueueHeader.main,
        p: { xs: 2, sm: 3 },
        mb: { xs: 1, sm: 2 },
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
          Cashier Queue
        </Typography>

        {/* Customer Type Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2, gap: 1 }}>
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

        {/* Single Add Customer Button */}
        <Button variant="contained" onClick={handleAddCustomer} size="small" sx={{ maxWidth: '200px', mb: 1 }}>
          Add Customer
        </Button>

        {/* Assign Customer Button */}
        <Button variant="contained" onClick={handleDispatchCustomer} size="small" color="secondary" sx={{ maxWidth: '200px', mb: 2 }}>
          Assign Customer
        </Button>

        {/* Bulk Add Section */}
        <FormControl fullWidth size="small" sx={{ mb: 1, maxWidth: '200px' }}>
          <InputLabel id="bulk-select-label">Add Bulk Customers</InputLabel>
          <Select
            labelId="bulk-select-label"
            value={selectedBulkOption}
            label="Add Bulk Customers"
            onChange={(e) => setSelectedBulkOption(e.target.value)}
          >
            <MenuItem value="">
              <em>Select an option</em>
            </MenuItem>
            {BULK_CUSTOMER_OPTIONS.map((option) => (
              <MenuItem key={option.label} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleBulkAddCustomers}
          fullWidth
          size="small"
          sx={{ maxWidth: '200px' }}
          disabled={!selectedBulkOption}
        >
          Add Bulk
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>Waiting Queue</Typography>
      {state.waitingQueue.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', p: 1 }}>
          No customers waiting.
        </Typography>
      ) : (
        <List sx={{
          maxHeight: 'calc(100vh - 580px)', // Keep dynamic height for scroll
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '4px', // Reduced border radius for queues
          bgcolor: 'white',
          width: '100%',
          boxSizing: 'border-box',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}>
          {state.waitingQueue.map(customer => (
            <ListItem key={customer.id} dense sx={{
              minHeight: '40px',
              paddingY: '4px',
              paddingX: '8px',
              display: 'flex', // Enable flex for spacing icon
              justifyContent: 'space-between', // Push icon to end
              alignItems: 'center',
            }}>
              <ListItemText
                primary={`ID: ${customer.id} | ${customer.transactionTime}s`}
                primaryTypographyProps={{
                  color: customer.type === CUSTOMER_TYPES.PRIORITY ? 'error.main' : 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveFromWaitingQueue(customer.id)}
                aria-label="remove customer"
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
