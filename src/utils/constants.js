// 
// DESIGN SYSTEM CONSTANTS
// 

// Category definitions with friendly colors and emojis
export const CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Groceries',
    emoji: '🍔',
    color: '#ef4444',        // Bright Red
    lightColor: '#fee2e2',
    darkColor: '#dc2626'
  },
  {
    id: 'transport',
    name: 'Transport',
    emoji: '🚌',
    color: '#06b6d4',        // Cyan
    lightColor: '#cffafe',
    darkColor: '#0891b2'
  },
  {
    id: 'study',
    name: 'Study Materials',
    emoji: '📚',
    color: '#3b82f6',        // Blue
    lightColor: '#dbeafe',
    darkColor: '#2563eb'
  },
  {
    id: 'accommodation',
    name: 'Accommodation',
    emoji: '🏠',
    color: '#f97316',        // Orange
    lightColor: '#ffedd5',
    darkColor: '#ea580c'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    emoji: '🎉',
    color: '#a855f7',        // Purple
    lightColor: '#f3e8ff',
    darkColor: '#9333ea'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    emoji: '💪',
    color: '#22c55e',        // Green
    lightColor: '#dcfce7',
    darkColor: '#16a34a'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    emoji: '🛍️',
    color: '#ec4899',        // Pink/Magenta
    lightColor: '#fce7f3',
    darkColor: '#db2777'
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '💰',
    color: '#eab308',        // Yellow/Gold
    lightColor: '#fef9c3',
    darkColor: '#ca8a04'
  }
];

// Budget warning thresholds
export const BUDGET_STATUS = {
  SAFE: {
    threshold: 0.70, // 0-70% spent
    color: '#10B981', // Green
    emoji: '✅',
    message: 'You\'re doing great! Keep it up! 🎯',
    label: 'On Track'
  },
  WARNING: {
    threshold: 0.85, // 70-85% spent
    color: '#F59E0B', // Amber
    emoji: '⚠️',
    message: 'Careful! You\'re getting close to your limit.',
    label: 'Caution'
  },
  DANGER: {
    threshold: 1.00, // 85%+ spent
    color: '#EF4444', // Red
    emoji: '🚨',
    message: 'Warning! You\'ve exceeded your budget!',
    label: 'Over Budget'
  }
};

// Default values
export const DEFAULTS = {
  MONTHLY_BUDGET: 500, // £500 default
  CURRENCY_SYMBOL: '£',
  CURRENCY_CODE: 'GBP',
  DATE_FORMAT: 'dd/MM/yyyy',
  MONTH_FORMAT: 'MMMM yyyy'
};

// Currency options
export const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
];

// Local storage keys
export const STORAGE_KEYS = {
  EXPENSES: 'student_budget_expenses',
  BUDGET: 'student_budget_monthly',
  THEME: 'student_budget_theme',
  ONBOARDING_COMPLETE: 'student_budget_onboarding',
  USER_NAME: 'student_budget_username',
  CURRENCY: 'student_budget_currency'
};

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  // Fade in from bottom
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  
  // Fade in from top
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  
  // Scale in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  },
  
  // Slide in from right
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  
  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px'
};

// Emoji theme toggle
export const THEME_EMOJIS = {
  light: '☀️',
  dark: '🌙'
};

// Month names for display
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Empty state messages
export const EMPTY_STATES = {
  NO_EXPENSES: {
    emoji: '🎯',
    title: 'No expenses yet!',
    message: 'Start tracking by adding your first expense.',
    action: 'Add Expense'
  },
  NO_BUDGET: {
    emoji: '💰',
    title: 'Set your budget',
    message: 'Let\'s start by setting your monthly budget.',
    action: 'Set Budget'
  },
  FILTER_NO_RESULTS: {
    emoji: '🔍',
    title: 'No expenses found',
    message: 'Try adjusting your filters.',
    action: 'Clear Filters'
  }
};

// Success messages
export const SUCCESS_MESSAGES = {
  EXPENSE_ADDED: 'Expense added successfully! 🎉',
  EXPENSE_UPDATED: 'Expense updated! ✅',
  EXPENSE_DELETED: 'Expense deleted! 🗑️',
  BUDGET_UPDATED: 'Budget updated successfully! 💰',
  BUDGET_GOAL_MET: 'Amazing! You stayed within budget this month! 🏆'
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_REQUIRED: 'Amount is required',
  DESCRIPTION_REQUIRED: 'Description is required',
  CATEGORY_REQUIRED: 'Please select a category',
  DATE_REQUIRED: 'Date is required',
  BUDGET_REQUIRED: 'Budget amount is required',
  GENERIC_ERROR: 'Oops! Something went wrong. Please try again.'
};