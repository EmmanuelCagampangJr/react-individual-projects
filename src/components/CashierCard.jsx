    // src/components/CashierCard.jsx

    import React, { useContext } from 'react';
    // Removed './CashierCard.css' import as we are using MUI
    import { Box, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
    import { QueueContext } from '../QueueContext'; // Import QueueContext
    import { CUSTOMER_TYPES } from '../constants';

    export default function CashierCard({ cashier }) { // CashierCard now only receives 'cashier' prop
      const { dispatch } = useContext(QueueContext); // Access dispatch from context

      // Status text for current serving customer
      const statusText = cashier.isIdle
        ? 'Idle'
        : `Now serving: ID: ${cashier.currentCustomer?.id} (${cashier.currentCustomerRemainingTime}s remaining)`;
      // Status color for the text based on customer type
      const statusColor = cashier.isIdle ? 'green' : (cashier.currentCustomer?.type === CUSTOMER_TYPES.PRIORITY ? 'error' : 'primary');

      return (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: cashier.isIdle ? '#e8f5e9' : '#fff', height: '100%' }}>
          <Typography variant="h6" fontWeight="bold">
            {cashier.name} {cashier.isPriority ? '(Priority)' : ''}
          </Typography>
          <Typography variant="body1" sx={{ color: statusColor, fontWeight: 'bold', mt: 1 }}>
            {statusText}
          </Typography>

          {/* This button is generally not needed if TICK_TIMER handles completion,
              but can be useful for debugging/manual override.
              If kept, uncomment onClick. */}
          {/* {!cashier.isIdle && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => dispatch({ type: 'CASHIER_FINISH_SERVING', payload: { cashierId: cashier.id } })}
              sx={{ mt: 1 }}
            >
              Finish Serving (Debug)
            </Button>
          )} */}

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Queue</Typography>
          {cashier.cashierQueue.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No customers.</Typography>
          ) : (
            <List dense sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
              {cashier.cashierQueue.map(customer => (
                <ListItem key={customer.id}>
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
    