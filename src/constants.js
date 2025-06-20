// src/constants.js

export const CUSTOMER_TYPES = {
  REGULAR: 'regular',
  PRIORITY: 'priority',
};

export const CUSTOMER_TRANSACTION_TIMES = {
  [CUSTOMER_TYPES.REGULAR]: { min: 8, max: 15 }, // e.g., 8 to 15 seconds
  [CUSTOMER_TYPES.PRIORITY]: { min: 3, max: 8 },  // e.g., 3 to 8 seconds (shorter for priority)
};

export const getRandomTransactionTime = (type) => {
  const timeRange = CUSTOMER_TRANSACTION_TIMES[type];
  if (!timeRange) return 10; // Default if type is unknown
  return Math.floor(Math.random() * (timeRange.max - timeRange.min + 1)) + timeRange.min;
};

export const CASHIER_CONFIG = [
  { id: 'c1', name: 'Priority Cashier', isPriority: true },
  { id: 'c2', name: 'Regular Cashier 1', isPriority: false },
  { id: 'c3', name: 'Regular Cashier 2', isPriority: false },
];
