import { STORAGE_KEYS, DEFAULTS, CURRENCIES } from './constants';

// 
// LOCAL STORAGE UTILITIES
// 

/**
 * Safely get item from localStorage with error handling
 */
const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage with error handling
 */
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// 
// EXPENSES
// 

/**
 * Load all expenses from localStorage
 * @returns {Array} Array of expense objects
 */
export const loadExpenses = () => {
  const expenses = safeGetItem(STORAGE_KEYS.EXPENSES);
  return expenses || [];
};

/**
 * Save expenses to localStorage
 * @param {Array} expenses - Array of expense objects
 * @returns {boolean} Success status
 */
export const saveExpenses = (expenses) => {
  return safeSetItem(STORAGE_KEYS.EXPENSES, expenses);
};

/**
 * Add a new expense
 * @param {Object} expense - Expense object
 * @returns {Object} The added expense with ID
 */
export const addExpense = (expense) => {
  const expenses = loadExpenses();
  const newExpense = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

/**
 * Update an existing expense
 * @param {string} id - Expense ID
 * @param {Object} updates - Updated expense data
 * @returns {Object|null} Updated expense or null if not found
 */
export const updateExpense = (id, updates) => {
  const expenses = loadExpenses();
  const index = expenses.findIndex(exp => exp.id === id);
  
  if (index === -1) return null;
  
  expenses[index] = {
    ...expenses[index],
    ...updates,
    updatedAt: Date.now()
  };
  
  saveExpenses(expenses);
  return expenses[index];
};

/**
 * Delete an expense
 * @param {string} id - Expense ID
 * @returns {boolean} Success status
 */
export const deleteExpense = (id) => {
  const expenses = loadExpenses();
  const filtered = expenses.filter(exp => exp.id !== id);
  
  if (filtered.length === expenses.length) return false; // Not found
  
  return saveExpenses(filtered);
};

/**
 * Get expenses for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Array} Filtered expenses
 */
export const getExpensesByMonth = (year, month) => {
  const expenses = loadExpenses();
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && 
           expenseDate.getMonth() === month;
  });
};

/**
 * Get expenses by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Filtered expenses
 */
export const getExpensesByCategory = (categoryId) => {
  const expenses = loadExpenses();
  return expenses.filter(expense => expense.category === categoryId);
};

// 
// BUDGET
// 

/**
 * Load monthly budget
 * @returns {number} Budget amount
 */
export const loadBudget = () => {
  const budget = safeGetItem(STORAGE_KEYS.BUDGET);
  return budget || DEFAULTS.MONTHLY_BUDGET;
};

/**
 * Save monthly budget
 * @param {number} amount - Budget amount
 * @returns {boolean} Success status
 */
export const saveBudget = (amount) => {
  const budgetAmount = parseFloat(amount);
  if (isNaN(budgetAmount) || budgetAmount <= 0) return false;
  return safeSetItem(STORAGE_KEYS.BUDGET, budgetAmount);
};

// 
// THEME
// 

/**
 * Load theme preference
 * @returns {string} 'light' or 'dark'
 */
export const loadTheme = () => {
  const theme = safeGetItem(STORAGE_KEYS.THEME);
  
  // If no saved theme, check system preference
  if (!theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  
  return theme;
};

/**
 * Save theme preference
 * @param {string} theme - 'light' or 'dark'
 * @returns {boolean} Success status
 */
export const saveTheme = (theme) => {
  if (theme !== 'light' && theme !== 'dark') return false;
  return safeSetItem(STORAGE_KEYS.THEME, theme);
};

// 
// USER DATA
// 

/**
 * Check if onboarding is complete
 * @returns {boolean}
 */
export const isOnboardingComplete = () => {
  return safeGetItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === true;
};

/**
 * Mark onboarding as complete
 * @returns {boolean} Success status
 */
export const completeOnboarding = () => {
  return safeSetItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
};

/**
 * Load user name
 * @returns {string|null}
 */
export const loadUserName = () => {
  return safeGetItem(STORAGE_KEYS.USER_NAME);
};

/**
 * Save user name
 * @param {string} name - User's name
 * @returns {boolean} Success status
 */
export const saveUserName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return safeSetItem(STORAGE_KEYS.USER_NAME, name.trim());
};

// 
// UTILITY FUNCTIONS
// 

/**
 * Clear all app data (useful for testing or reset)
 * @returns {boolean} Success status
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Export all data for backup
 * @returns {Object} All stored data
 */
export const exportData = () => {
  return {
    expenses: loadExpenses(),
    budget: loadBudget(),
    theme: loadTheme(),
    userName: loadUserName(),
    exportDate: new Date().toISOString()
  };
};

/**
 * Import data from backup
 * @param {Object} data - Exported data object
 * @returns {boolean} Success status
 */
export const importData = (data) => {
  try {
    if (data.expenses) saveExpenses(data.expenses);
    if (data.budget) saveBudget(data.budget);
    if (data.theme) saveTheme(data.theme);
    if (data.userName) saveUserName(data.userName);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// 
// CURRENCY
// 

/**
 * Load currency preference
 * @returns {Object} Currency object
 */
export const loadCurrency = () => {
  const currency = safeGetItem(STORAGE_KEYS.CURRENCY);
  return currency || CURRENCIES[0]; // Default to GBP
};

/**
 * Save currency preference
 * @param {Object} currency - Currency object
 * @returns {boolean} Success status
 */
export const saveCurrency = (currency) => {
  return safeSetItem(STORAGE_KEYS.CURRENCY, currency);
};