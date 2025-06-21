// src/QueueContext.jsx

import React, { createContext, useReducer, useEffect } from 'react';
import { CASHIER_CONFIG, getRandomTransactionTime, CUSTOMER_TYPES } from './constants';

// --- Initial State ---
export const initialState = {
  waitingQueue: [], // Main pool of customers waiting for initial assignment
  cashiers: CASHIER_CONFIG.map(config => ({
    ...config,
    isIdle: true,
    currentCustomer: null,
    currentCustomerRemainingTime: 0,
    cashierQueue: [] // Each cashier has their own queue
  })),
  nextCustomerId: 1, // To assign unique IDs to new customers
  servedCustomersCount: 0, // Total count of customers served
};

// --- Reducer Function ---
export function queueReducer(state, action) {
  switch (action.type) {
    case 'ADD_CUSTOMER': {
      // Payload: { type: 'regular' | 'priority' }
      const { type } = action.payload;
      const transactionTime = getRandomTransactionTime(type);
      const newCustomer = { id: state.nextCustomerId, type, transactionTime };
      return {
        ...state,
        waitingQueue: [...state.waitingQueue, newCustomer],
        nextCustomerId: state.nextCustomerId + 1, // CORRECTED TYPO HERE
      };
    }

    case 'DISPATCH_CUSTOMER': {
      if (state.waitingQueue.length === 0) {
        return state; // No customers to dispatch
      }

      const customerToDispatch = { ...state.waitingQueue[0] };
      const remainingWaitingQueue = state.waitingQueue.slice(1);

      let targetCashierIndex = -1;

      // Logic for finding an idle cashier (first attempt)
      if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
        // PRIORITY CUSTOMER: Strictly look for an idle Priority Cashier.
        // NO FALLBACK to Regular Cashiers if no idle priority found.
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && c.isPriority);
      } else { // Regular customer
        // REGULAR CUSTOMER: Try idle Regular, then idle Priority (fallback allowed here)
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && !c.isPriority);
        if (targetCashierIndex === -1) {
          targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && c.isPriority);
        }
      }

      // If an idle cashier was found, assign the customer directly
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
        // If NO idle cashier was found (all are busy), put customer in an internal queue
        let bestCashierForQueue = null;
        let minQueueLength = Infinity;

        state.cashiers.forEach(cashier => {
          let canTakeCustomer = false;
          if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
            // PRIORITY CUSTOMER:
            // CRITICAL CHANGE: Only allow placement in a busy Priority Cashier's internal queue.
            canTakeCustomer = cashier.isPriority; // <-- Changed from `true`
          } else { // Regular customer
            // Regular customer can go to a regular cashier's queue (as before)
            canTakeCustomer = !cashier.isPriority;
          }

          if (canTakeCustomer && cashier.cashierQueue.length < minQueueLength) {
            minQueueLength = cashier.cashierQueue.length;
            bestCashierForQueue = cashier;
          }
        });

        if (bestCashierForQueue) {
          // Push customer to the internal queue of the chosen cashier
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
        // If no suitable cashier (e.g., all priority cashiers busy for a priority customer),
        // customer remains in waitingQueue.
        return state;
      }
    }

    case 'CASHIER_TICK_TIMER': {
      // Payload: { cashierId: string }
      const { cashierId } = action.payload;
      const updatedCashiers = state.cashiers.map(cashier => {
        if (cashier.id === cashierId && cashier.currentCustomer) {
          const newRemainingTime = cashier.currentCustomerRemainingTime - 1;
          if (newRemainingTime <= 0) {
            // Time reached 0, customer finished serving.
            // We just set remaining time to 0, CASHIER_FINISH_SERVING will be dispatched by useEffect
            return {
              ...cashier,
              currentCustomerRemainingTime: 0, // Ensure it's not negative
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
      // This action is implicitly triggered when TICK_TIMER finishes a customer.
      // Payload: { cashierId: string }
      const { cashierId } = action.payload;

      let servedCustomerFound = false; // Flag to track if a customer was served

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
      // ONLY applies to regular cashiers
      const regularCashiers = state.cashiers.filter(c => !c.isPriority);
      if (regularCashiers.length < 2) return state; // Need at least two regular cashiers to balance

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

      // Move a customer only if there's a significant difference (e.g., 2 or more customers)
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
        // If a cashier finished serving (time <= 0), trigger CASHIER_FINISH_SERVING
        // This handles automatically moving next customer from internal queue.
        if (cashier.currentCustomer && cashier.currentCustomerRemainingTime <= 0) {
          dispatch({ type: 'CASHIER_FINISH_SERVING', payload: { cashierId: cashier.id } });
        }
      });
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [state.cashiers]); // Dependency on state.cashiers to re-evaluate timers and finished customers

  // --- useEffect for auto-assigning from main waiting queue ---
  // If there's a waiting customer and an idle cashier, try to assign immediately
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        const hasWaitingCustomer = state.waitingQueue.length > 0;
        // A 'truly idle' cashier is one with no current customer AND an empty internal queue
        const hasTrulyIdleCashier = state.cashiers.some(c => c.isIdle && c.cashierQueue.length === 0);

        // Only dispatch if there's a waiting customer AND a truly idle cashier
        if (hasWaitingCustomer && hasTrulyIdleCashier) {
            dispatch({ type: 'DISPATCH_CUSTOMER' });
        }
    }, 100); // Small delay to avoid immediate re-renders after state updates

    return () => clearTimeout(timeoutId);
  }, [state.waitingQueue, state.cashiers]); // Rerun when waiting queue or cashier status changes


  // --- useEffect for auto-balancing regular cashier queues ---
  useEffect(() => {
    // Dispatch auto balance action after a short delay, to allow other state updates to settle
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'AUTO_BALANCE_REGULAR_QUEUES' });
    }, 1500); // Check for balance every 1.5 seconds

    return () => clearTimeout(timeoutId);
  }, [state.cashiers]); // Rerun when cashiers' queues might have changed


  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
}
