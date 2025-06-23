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
      const { type } = action.payload;
      const transactionTime = getRandomTransactionTime(type);
      const newCustomer = { id: state.nextCustomerId, type, transactionTime };
      return {
        ...state,
        waitingQueue: [...state.waitingQueue, newCustomer],
        nextCustomerId: state.nextCustomerId + 1,
      };
    }

    case 'ADD_CUSTOMERS_BULK': {
      const { type, count, priorityCount, regularCount } = action.payload;
      let newCustomers = [];
      let currentNextId = state.nextCustomerId;

      if (type === 'mixed') {
        for (let i = 0; i < priorityCount; i++) {
          newCustomers.push({ id: currentNextId++, type: CUSTOMER_TYPES.PRIORITY, transactionTime: getRandomTransactionTime(CUSTOMER_TYPES.PRIORITY) });
        }
        for (let i = 0; i < regularCount; i++) {
          newCustomers.push({ id: currentNextId++, type: CUSTOMER_TYPES.REGULAR, transactionTime: getRandomTransactionTime(CUSTOMER_TYPES.REGULAR) });
        }
      } else {
        for (let i = 0; i < count; i++) {
          newCustomers.push({ id: currentNextId++, type, transactionTime: getRandomTransactionTime(type) });
        }
      }

      return {
        ...state,
        waitingQueue: [...state.waitingQueue, ...newCustomers],
        nextCustomerId: currentNextId,
      };
    }

    case 'DISPATCH_CUSTOMER': {
      if (state.waitingQueue.length === 0) {
        return state;
      }

      const customerToDispatch = { ...state.waitingQueue[0] };
      const remainingWaitingQueue = state.waitingQueue.slice(1);

      let targetCashierIndex = -1;

      // --- CRITICAL FIX 1: STRICT ASSIGNMENT TO IDLE CASHIERS ---
      // Customer can ONLY go to an idle cashier of their OWN type.
      // NO FALLBACK to other types if their specific type's cashiers are busy.
      if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && c.isPriority);
      } else { // Regular customer
        targetCashierIndex = state.cashiers.findIndex(c => c.isIdle && !c.isPriority);
      }

      // If an idle, type-appropriate cashier was found, assign directly
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
        // --- CRITICAL FIX 2: STRICT ASSIGNMENT TO BUSY CASHIER QUEUES ---
        // All idle cashiers of the customer's type are busy. Now, try to queue them.
        // Customers can ONLY join internal queues of their OWN type.
        let bestCashierForQueue = null;
        let minQueueLength = Infinity; // Track shortest queue length among valid cashiers

        state.cashiers.forEach(cashier => {
          let canTakeCustomerInQueue = false;
          if (customerToDispatch.type === CUSTOMER_TYPES.PRIORITY) {
            canTakeCustomerInQueue = cashier.isPriority;
          } else { // Regular customer
            canTakeCustomerInQueue = !cashier.isPriority;
          }

          if (canTakeCustomerInQueue) {
            if (cashier.cashierQueue.length < minQueueLength) {
                minQueueLength = cashier.cashierQueue.length;
                bestCashierForQueue = cashier;
            }
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
        // If no suitable cashier (idle or busy queue for their type) found, customer remains in waitingQueue.
        return state;
      }
    }

    case 'CASHIER_TICK_TIMER': {
      const { cashierId } = action.payload;
      const updatedCashiers = state.cashiers.map(cashier => {
        if (cashier.id === cashierId && cashier.currentCustomer) {
          const newRemainingTime = cashier.currentCustomerRemainingTime - 1;
          return { ...cashier, currentCustomerRemainingTime: Math.max(0, newRemainingTime) };
        }
        return cashier;
      });
      return { ...state, cashiers: updatedCashiers };
    }

    case 'CASHIER_FINISH_SERVING': {
      const { cashierId } = action.payload;
      let servedCustomerFound = false;

      const updatedCashiers = state.cashiers.map(cashier => {
        if (cashier.id === cashierId && cashier.currentCustomer && cashier.currentCustomerRemainingTime <= 0) {
          servedCustomerFound = true;

          if (cashier.cashierQueue.length > 0) {
            const [nextCustomer, ...remainingQueue] = cashier.cashierQueue;
            return {
              ...cashier,
              isIdle: false,
              currentCustomer: nextCustomer,
              currentCustomerRemainingTime: nextCustomer.transactionTime,
              cashierQueue: remainingQueue,
            };
          } else {
            return { ...cashier, isIdle: true, currentCustomer: null, currentCustomerRemainingTime: 0 };
          }
        }
        return cashier;
      });
      return { ...state, cashiers: updatedCashiers, servedCustomersCount: state.servedCustomersCount + (servedCustomerFound ? 1 : 0) };
    }

    case 'REQUEUE_CUSTOMER_FROM_CASHIER': {
        const { cashierId, customerId, isCurrentlyServing } = action.payload;
        let customerToRequeue = null;
        let updatedCashiers = state.cashiers.map(cashier => {
            if (cashier.id === cashierId) {
                if (isCurrentlyServing && cashier.currentCustomer && cashier.currentCustomer.id === customerId) {
                    customerToRequeue = { ...cashier.currentCustomer };
                    if (cashier.cashierQueue.length > 0) {
                        const [nextCustomer, ...remainingQueue] = cashier.cashierQueue;
                        return {
                            ...cashier,
                            currentCustomer: nextCustomer,
                            currentCustomerRemainingTime: nextCustomer.transactionTime,
                            cashierQueue: remainingQueue,
                        };
                    } else {
                        return {
                            ...cashier,
                            isIdle: true,
                            currentCustomer: null,
                            currentCustomerRemainingTime: 0,
                        };
                    }
                } else { // Customer is in the internal queue
                    const customerIndex = cashier.cashierQueue.findIndex(c => c.id === customerId);
                    if (customerIndex !== -1) {
                        customerToRequeue = { ...cashier.cashierQueue[customerIndex] };
                        const newQueue = [...cashier.cashierQueue];
                        newQueue.splice(customerIndex, 1);
                        return { ...cashier, cashierQueue: newQueue };
                    }
                }
            }
            return cashier;
        });

        if (customerToRequeue) {
            return {
                ...state,
                cashiers: updatedCashiers,
                waitingQueue: [...state.waitingQueue, customerToRequeue], // Add to END of waiting queue
            };
        }
        return state;
    }

    case 'REMOVE_FROM_WAITING_QUEUE': {
        const { customerId } = action.payload;
        const newWaitingQueue = state.waitingQueue.filter(customer => customer.id !== customerId);
        return {
            ...state,
            waitingQueue: newWaitingQueue,
        };
    }


    case 'AUTO_BALANCE_REGULAR_QUEUES': {
      const mutableCashiers = state.cashiers.map(c => ({...c, cashierQueue: [...c.cashierQueue]}));
      const regularCashiers = mutableCashiers.filter(c => !c.isPriority);

      let stateChanged = false;

      // --- 1. Balancing between Regular Cashiers ---
      if (regularCashiers.length >= 2) {
        let longestRegQueueCashier = null;
        let shortestRegQueueCashier = null;

        if (regularCashiers.length > 0) {
            longestRegQueueCashier = regularCashiers[0];
            shortestRegQueueCashier = regularCashiers[0];
            regularCashiers.forEach(cashier => {
                if (cashier.cashierQueue.length > longestRegQueueCashier.cashierQueue.length) {
                    longestRegQueueCashier = cashier;
                }
                if (cashier.cashierQueue.length < shortestRegQueueCashier.cashierQueue.length) {
                    shortestRegQueueCashier = cashier;
                }
            });
        }

        if (longestRegQueueCashier && shortestRegQueueCashier &&
            longestRegQueueCashier.cashierQueue.length - shortestRegQueueCashier.cashierQueue.length >= 2) {
          const customerToMove = longestRegQueueCashier.cashierQueue[longestRegQueueCashier.cashierQueue.length - 1];
          if (customerToMove && customerToMove.type === CUSTOMER_TYPES.REGULAR) { // Only move regular customers
            longestRegQueueCashier.cashierQueue.pop();
            shortestRegQueueCashier.cashierQueue.push(customerToMove);
            stateChanged = true;
          }
        }
      }

      // --- Removed: Auto-balancing with Priority Cashier for strict separation ---

      if (stateChanged) {
        const updatedCashiers = state.cashiers.map(c => {
            const updatedC = mutableCashiers.find(mc => mc.id === c.id);
            return updatedC ? updatedC : c;
        });
        return { ...state, cashiers: updatedCashiers };
      }

      return state;
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
  // FIX: Changed 'reducer' to 'queueReducer'
  const [state, dispatch] = useReducer(queueReducer, initialState);

  // --- useEffect for automatic timer ticks ---
  useEffect(() => {
    const interval = setInterval(() => {
      state.cashiers.forEach(cashier => {
        if (cashier.currentCustomer) {
          dispatch({ type: 'CASHIER_TICK_TIMER', payload: { cashierId: cashier.id } });
        }
      });

      state.cashiers.forEach(cashier => {
        if (cashier.currentCustomer && cashier.currentCustomerRemainingTime <= 0) {
          dispatch({ type: 'CASHIER_FINISH_SERVING', payload: { cashierId: cashier.id } });
        }
      });

    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [state.cashiers]);


  // --- CRITICAL FIX: Removed auto-dispatch from useEffect ---
  // The DISPATCH_CUSTOMER action will now only be triggered by the "Assign Customer" button click.
  useEffect(() => {
    // This useEffect is now solely for demonstration or other background tasks.
    // The previous auto-dispatch logic from here has been removed.
    // If you need *any* form of auto-dispatch, it must be carefully re-implemented here
    // with conditions that align with "one-by-one" (e.g., only dispatch one if waiting queue isn't too long)
    // For now, it will only dispatch on button click.
  }, []); // Empty dependency array, runs once on mount.


  // --- useEffect for auto-balancing ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'AUTO_BALANCE_REGULAR_QUEUES' });
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [state.cashiers]);


  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
}
