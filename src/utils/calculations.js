import { BUDGET_STATUS, CATEGORIES } from './constants';

// 
// CALCULATION UTILITIES
// 

/**
 * Calculate total amount from expenses array
 * @param {Array} expenses - Array of expense objects
 * @returns {number} Total amount
 */
export const calculateTotal = (expenses) => {
  if (!Array.isArray(expenses) || expenses.length === 0) return 0;
  
  return expenses.reduce((total, expense) => {
    const amount = parseFloat(expense.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
};

/**
 * Calculate remaining budget
 * @param {number} budget - Monthly budget
 * @param {number} spent - Amount spent
 * @returns {number} Remaining amount
 */
export const calculateRemaining = (budget, spent) => {
  return budget - spent;
};

/**
 * Calculate percentage of budget used
 * @param {number} budget - Monthly budget
 * @param {number} spent - Amount spent
 * @returns {number} Percentage (0-100+)
 */
export const calculatePercentage = (budget, spent) => {
  if (budget === 0) return 0;
  return (spent / budget) * 100;
};

/**
 * Get budget status based on spending
 * @param {number} budget - Monthly budget
 * @param {number} spent - Amount spent
 * @returns {Object} Status object from BUDGET_STATUS
 */
export const getBudgetStatus = (budget, spent) => {
  const ratio = spent / budget;
  
  if (ratio >= BUDGET_STATUS.DANGER.threshold) {
    return BUDGET_STATUS.DANGER;
  } else if (ratio >= BUDGET_STATUS.WARNING.threshold) {
    return BUDGET_STATUS.WARNING;
  } else {
    return BUDGET_STATUS.SAFE;
  }
};

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Object with category IDs as keys and arrays of expenses as values
 */
export const groupByCategory = (expenses) => {
  if (!Array.isArray(expenses)) return {};
  
  return expenses.reduce((groups, expense) => {
    const category = expense.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};

/**
 * Calculate spending by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Array of objects with category data and totals
 */
export const calculateCategoryTotals = (expenses) => {
  const grouped = groupByCategory(expenses);
  
  return CATEGORIES.map(category => {
    const categoryExpenses = grouped[category.id] || [];
    const total = calculateTotal(categoryExpenses);
    
    return {
      ...category,
      total,
      count: categoryExpenses.length,
      expenses: categoryExpenses
    };
  }).filter(cat => cat.total > 0) // Only return categories with expenses
    .sort((a, b) => b.total - a.total); // Sort by total, highest first
};

/**
 * Calculate daily average spending
 * @param {Array} expenses - Array of expense objects
 * @param {number} days - Number of days in period
 * @returns {number} Average daily spending
 */
export const calculateDailyAverage = (expenses, days) => {
  if (days === 0) return 0;
  const total = calculateTotal(expenses);
  return total / days;
};

/**
 * Get days remaining in current month
 * @returns {number} Days remaining
 */
export const getDaysRemainingInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
};

/**
 * Get days elapsed in current month
 * @returns {number} Days elapsed
 */
export const getDaysElapsedInMonth = () => {
  const now = new Date();
  return now.getDate();
};

/**
 * Calculate projected spending for the month
 * @param {Array} expenses - Array of expense objects
 * @returns {number} Projected total
 */
export const calculateProjectedSpending = (expenses) => {
  const daysElapsed = getDaysElapsedInMonth();
  const daysRemaining = getDaysRemainingInMonth();
  const totalDays = daysElapsed + daysRemaining;
  
  if (daysElapsed === 0) return 0;
  
  const currentTotal = calculateTotal(expenses);
  const dailyAverage = currentTotal / daysElapsed;
  
  return dailyAverage * totalDays;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol (default £)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, symbol = '£') => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(2);
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
};

/**
 * Get spending insights
 * @param {number} budget - Monthly budget
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Insights object
 */
export const getSpendingInsights = (budget, expenses) => {
  const total = calculateTotal(expenses);
  const remaining = calculateRemaining(budget, total);
  const percentage = calculatePercentage(budget, total);
  const status = getBudgetStatus(budget, total);
  const categoryTotals = calculateCategoryTotals(expenses);
  const topCategory = categoryTotals[0] || null;
  const projected = calculateProjectedSpending(expenses);
  const daysRemaining = getDaysRemainingInMonth();
  const dailyAverage = calculateDailyAverage(expenses, getDaysElapsedInMonth());
  const budgetPerDay = remaining / (daysRemaining || 1);
  
  return {
    total,
    remaining,
    percentage: Math.round(percentage),
    status,
    categoryTotals,
    topCategory,
    projected,
    daysRemaining,
    dailyAverage,
    budgetPerDay,
    isOverBudget: total > budget,
    canAffordProjected: projected <= budget
  };
};

/**
 * Sort expenses by date (newest first)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Sorted expenses
 */
export const sortExpensesByDate = (expenses) => {
  if (!Array.isArray(expenses)) return [];
  
  return [...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
};

/**
 * Filter expenses by date range
 * @param {Array} expenses - Array of expense objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered expenses
 */
export const filterExpensesByDateRange = (expenses, startDate, endDate) => {
  if (!Array.isArray(expenses)) return [];
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * Search expenses by description
 * @param {Array} expenses - Array of expense objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered expenses
 */
export const searchExpenses = (expenses, searchTerm) => {
  if (!searchTerm || !Array.isArray(expenses)) return expenses;
  
  const term = searchTerm.toLowerCase().trim();
  
  return expenses.filter(expense => {
    return expense.description.toLowerCase().includes(term);
  });
};