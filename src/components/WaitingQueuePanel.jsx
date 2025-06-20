    // src/components/WaitingQueuePanel.jsx

    import React, { useState, useContext } from 'react';
    // Removed './WaitingQueuePanel.css' import as we are using MUI
    import { Box, Button, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
    import { QueueContext } from '../QueueContext'; // Import QueueContext
    import { CUSTOMER_TYPES } from '../constants';

    export default function WaitingQueuePanel() {
      // Use useContext to access state and dispatch from the provider
      const { state, dispatch } = useContext(QueueContext);
      const [newCustomerType, setNewCustomerType] = useState(CUSTOMER_TYPES.REGULAR);

      const handleAddCustomer = () => {
        dispatch({ type: 'ADD_CUSTOMER', payload: { type: newCustomerType } });
      };

      const handleDispatchCustomer = () => {
        dispatch({ type: 'DISPATCH_CUSTOMER' });
      };

      return (
        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ backgroundColor: '#A7E9C7', p: 3, mb: 3 }}>
            <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>Cashier Queue</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant={newCustomerType === CUSTOMER_TYPES.REGULAR ? 'contained' : 'outlined'}
                onClick={() => setNewCustomerType(CUSTOMER_TYPES.REGULAR)}
                size="small"
                sx={{ flexGrow: 1, mr: 1 }}
              >
                Regular Customer
              </Button>
              <Button
                variant={newCustomerType === CUSTOMER_TYPES.PRIORITY ? 'contained' : 'outlined'}
                onClick={() => setNewCustomerType(CUSTOMER_TYPES.PRIORITY)}
                size="small"
                sx={{ flexGrow: 1 }}
              >
                Priority Customer
              </Button>
            </Box>
            <Button variant="contained" onClick={handleAddCustomer} fullWidth sx={{ mb: 1 }}>Add Customer</Button>
            <Button variant="contained" onClick={handleDispatchCustomer} fullWidth>Assign Customer</Button>
          </Box>

          <Typography variant="h5" sx={{ mb: 1 }}>Waiting Queue</Typography>
          {state.waitingQueue.length === 0 ? (
            <Typography sx={{ color: '#666', fontStyle: 'italic' }}>No customers waiting.</Typography>
          ) : (
            <List sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
              {state.waitingQueue.map(customer => (
                <ListItem key={customer.id} dense>
                  <ListItemText
                    primary={`ID: ${customer.id} | ${customer.transactionTime}s`}
                    primaryTypographyProps={{
                      color: customer.type === CUSTOMER_TYPES.PRIORITY ? 'error' : 'primary',
                      fontWeight: 'bold'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      );
    }
    