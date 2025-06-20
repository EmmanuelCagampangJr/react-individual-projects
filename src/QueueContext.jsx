import React, { createContext, useReducer, useEffect } from 'react';
import { CASHIER_CONFIG, getRandomTransactionTime, CUSTOMER_TYPES } from './constants';


export const initialState = {
  waitingQueue: [], 
  cashiers: CASHIER_CONFIG.map(config => ({
    ...config,
    isIdle: true,
    currentCustomer: null,
    currentCustomerRemainingTime: 0,
    cashierQueue: [] 
  })),
  nextCustomerId: 1, 
  servedCustomersCount: 0, 
};


export function queueReducer(state, action) {
  switch (action.type) {
    case 'ADD_CUSTOMER': {
      const { type } = action.payload;
      const transactionTime = getRandomTransactionTime(type);
      const newCustomer = { id: state.nextCustomerId, type, transactionTime };
      return {
        ...state,
        waitingQueue: [...state.waitingQueue, newCustomer],
        nextCustomerId: state.nextCustomerId + 1,
      };
    }

    case 'DISPATCH_CUSTOMER': {
      if (state.waitingQueue.length === 0) {
        return state; 
      }

      const customerToDispatch = { ...state.waitingQueue[0] };
      const remainingWaitingQueue = state.waitingQueue.slice(1);

      let targetCashierIndex = -1;

      
      if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
        
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && c.isPriority);
      } else { 
        
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && !c.isPriority);
        if (targetCashierIndex === -1) {
          targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && c.isPriority);
        }
      }

      
      if (targetCashierIndex !== -1) {
        const updatedCashiers = state.cashiers.map((cashier, idx) => {
          if (idx === targetCashierIndex) {
            return {
              ...cashier,
              isIdle: false,
              currentCustomer: customerToDispatch,
              currentCustomerRemainingTime: customerToDispatch.transactionTime,
            };
          }
          return cashier;
        });

        return {
          ...state,
          waitingQueue: remainingWaitingQueue,
          cashiers: updatedCashiers,
        };
      } else {
        
        let bestCashierForQueue = null;
        let minQueueLength = Infinity;

        state.cashiers.forEach(cashier => {
          let canTakeCustomer = false;
          if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
            
            
            canTakeCustomer = cashier.isPriority; 
          } else { 
            
            canTakeCustomer = !cashier.isPriority;
          }

          if (canTakeCustomer && cashier.cashierQueue.length < minQueueLength) {
            minQueueLength = cashier.cashierQueue.length;
            bestCashierForQueue = cashier;
          }
        });

        if (bestCashierForQueue) {
          
          const cashiersWithCustomerInQueue = state.cashiers.map(c =>
            c.id === bestCashierForQueue.id
              ? { ...c, cashierQueue: [...c.cashierQueue, customerToDispatch] }
              : c
          );

          return {
            ...state,
            waitingQueue: remainingWaitingQueue,
            cashiers: cashiersWithCustomerInQueue,
          };
        }
        
        
        return state;
      }
    }

    case 'CASHIER_TICK_TIMER': {
      const { cashierId } = action.payload;
      const updatedCashiers = state.cashiers.map(cashier => {
        if (cashier.id === cashierId && cashier.currentCustomer) {
          const newRemainingTime = cashier.currentCustomerRemainingTime - 1;
          if (newRemainingTime <= 0) {
            // Time reached 0, customer finished serving.
            // Dispatch the explicit finish serving action so it can handle next customer / served count.
            // This is better than handling next customer assignment directly here within TICK_TIMER.
            // We just set remaining time to 0, CASHIER_FINISH_SERVING will be dispatched next tick.
            return {
              ...cashier,
              currentCustomerRemainingTime: 0,
            };
          }
          return {
            ...cashier,
            currentCustomerRemainingTime: newRemainingTime,
          };
        }
        return cashier;
      });
      return {
        ...state,
        cashiers: updatedCashiers,
      };
    }

    case 'CASHIER_FINISH_SERVING': {
      const { cashierId } = action.payload;
      let servedCustomerFound = false;

      const updatedCashiers = state.cashiers.map(cashier => {
        // Check if this cashier is the one that just finished AND has a customer
        if (cashier.id === cashierId && cashier.currentCustomer && cashier.currentCustomerRemainingTime <= 0) {
          servedCustomerFound = true; // Mark that a customer was served

          // If there's an internal queue, assign the next customer from it
          if (cashier.cashierQueue.length > 0) {
            const [nextCustomer, ...remainingQueue] = cashier.cashierQueue;
            return {
              ...cashier,
              isIdle: false, // Cashier remains busy
              currentCustomer: nextCustomer,
              currentCustomerRemainingTime: nextCustomer.transactionTime,
              cashierQueue: remainingQueue,
            };
          } else {
            // No internal queue, cashier becomes truly idle
            return {
              ...cashier,
              isIdle: true,
              currentCustomer: null,
              currentCustomerRemainingTime: 0,
            };
          }
        }
        return cashier;
      });

      return {
        ...state,
        cashiers: updatedCashiers,
        // Only increment servedCustomersCount if a customer was actually completed
        servedCustomersCount: state.servedCustomersCount + (servedCustomerFound ? 1 : 0),
      };
    }

    case 'AUTO_BALANCE_REGULAR_QUEUES': {
      const regularCashiers = state.cashiers.filter(c => !c.isPriority);
      if (regularCashiers.length < 2) return state;

      // Create mutable copies for local balancing logic
      const mutableRegularCashiers = regularCashiers.map(c => ({...c, cashierQueue: [...c.cashierQueue]}));

      let longestQueueCashier = mutableRegularCashiers[0];
      let shortestQueueCashier = mutableRegularCashiers[0];

      mutableRegularCashiers.forEach(cashier => {
        if (cashier.cashierQueue.length > longestQueueCashier.cashierQueue.length) {
          longestQueueCashier = cashier;
        }
        if (cashier.cashierQueue.length < shortestQueueCashier.cashierQueue.length) {
          shortestQueueCashier = cashier;
        }
      });

      if (longestQueueCashier.cashierQueue.length - shortestQueueCashier.cashierQueue.length >= 2) {
        // CRITICAL CHANGE: Only move if the customer at the end of the longest queue is a REGULAR customer.
        const customerToMove = longestQueueCashier.cashierQueue[longestQueueCashier.cashierQueue.length - 1];

        // Ensure there's a customer to move AND it's a REGULAR customer.
        if (customerToMove && customerToMove.type === CUSTOMER_TYPES.REGULAR) {
          // Remove from longest and add to shortest (immutably)
          longestQueueCashier.cashierQueue.pop(); // Mutates the local mutable copy
          shortestQueueCashier.cashierQueue.push(customerToMove); // Mutates the local mutable copy

          // Reconstruct the full cashiers array with the updated regular cashiers
          const updatedCashiers = state.cashiers.map(c => {
            if (!c.isPriority) { // If it's a regular cashier, find its updated version
              const updatedRegular = mutableRegularCashiers.find(rc => rc.id === c.id);
              return updatedRegular ? updatedRegular : c;
            }
            return c; // Priority cashiers are unchanged
          });

          return {
            ...state,
            cashiers: updatedCashiers,
          };
        }
      }
      return state; // No balancing needed or no eligible customer to move
    }

    case 'RESET_SYSTEM': {
      return {
        ...initialState,
        cashiers: CASHIER_CONFIG.map(config => ({
          ...config,
          isIdle: true,
          currentCustomer: null,
          currentCustomerRemainingTime: 0,
          cashierQueue: []
        })),
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// --- Context ---
export const QueueContext = createContext();

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  // --- useEffect for automatic timer ticks ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Dispatch TICK_TIMER for any busy cashier
      state.cashiers.forEach(cashier => {
        if (cashier.currentCustomer) {
          dispatch({ type: 'CASHIER_TICK_TIMER', payload: { cashierId: cashier.id } });
        }
        // If a customer's time reaches 0, dispatch CASHIER_FINISH_SERVING
        // We do this here as the TICK_TIMER action itself just decrements the time.
        // This ensures the finish serving logic is always checked per tick.
        if (cashier.currentCustomer && cashier.currentCustomerRemainingTime <= 0) {
          dispatch({ type: 'CASHIER_FINISH_SERVING', payload: { cashierId: cashier.id } });
        }
      });
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [state.cashiers]);

  // --- useEffect for auto-assigning from main waiting queue ---
  useEffect(() => {
    // We'll use a timeout to prevent an infinite loop if reducer doesn't change state
    const timeoutId = setTimeout(() => {
      const hasWaitingCustomer = state.waitingQueue.length > 0;
      // An idle cashier is one who has no current customer AND no internal queue
      const hasTrulyIdleCashier = state.cashiers.some(c => c.isIdle && c.cashierQueue.length === 0);

      // Only dispatch if there's a waiting customer AND a truly idle cashier
      if (hasWaitingCustomer && hasTrulyIdleCashier) {
        dispatch({ type: 'DISPATCH_CUSTOMER' });
      }
    }, 100); // Small delay to avoid immediate re-renders after state updates

    return () => clearTimeout(timeoutId);
  }, [state.waitingQueue, state.cashiers]);


  // --- useEffect for auto-balancing regular cashier queues ---
  useEffect(() => {
    // Trigger balancing after a slight delay, to allow other state updates to settle
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'AUTO_BALANCE_REGULAR_QUEUES' });
    }, 1500); // Check for balance every 1.5 seconds (slightly slower than tick)

    return () => clearTimeout(timeoutId);
  }, [state.cashiers]);


  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
}