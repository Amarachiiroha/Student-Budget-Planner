import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { 
  loadExpenses, 
  loadBudget,
  saveBudget,
  getExpensesByMonth,
  deleteExpense,
  loadCurrency
} from '../../utils/localStorage';
import { 
  getSpendingInsights,
  getDaysElapsedInMonth,
  getDaysRemainingInMonth
} from '../../utils/calculations';
import { ANIMATION_VARIANTS, MONTH_NAMES, SUCCESS_MESSAGES } from '../../utils/constants';
import BudgetSummary from '../BudgetSummary/BudgetSummary';
import BudgetModal from '../BudgetModal/BudgetModal';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import ExpenseList from '../ExpenseList/ExpenseList';
import CategoryChart from '../Charts/CategoryChart';
import SpendingTrend from '../Charts/SpendingTrend';
import Settings from '../Settings/Settings';
import './Dashboard.css';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function Dashboard({ theme, toggleTheme, isDark, activePage }) {
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [currentDate] = useState(new Date());
  const [insights, setInsights] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  useEffect(() => {
    const handleOpenBudget = () => setIsBudgetModalOpen(true);
    window.addEventListener('openBudgetModal', handleOpenBudget);
    return () => window.removeEventListener('openBudgetModal', handleOpenBudget);
  }, []);

  // Open expense form when Add tab is tapped
  useEffect(() => {
    if (activePage === 'add') {
      setEditingExpense(null);
      setIsFormOpen(true);
    }
  }, [activePage]);

  const loadData = () => {
    const budget = loadBudget();
    setMonthlyBudget(budget);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthExpenses = getExpensesByMonth(year, month);
    setExpenses(monthExpenses);
    const spendingInsights = getSpendingInsights(budget, monthExpenses);
    setInsights(spendingInsights);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    if (window.confirm(`Delete "${expense.description}"?`)) {
      deleteExpense(expense.id);
      showNotification(SUCCESS_MESSAGES.EXPENSE_DELETED);
      loadData();
    }
  };

  const handleFormSuccess = (message) => {
    showNotification(message);
    loadData();
  };

  const handleBudgetUpdate = (newBudget) => {
    saveBudget(newBudget);
    setMonthlyBudget(newBudget);
    setIsBudgetModalOpen(false);
    showNotification('Budget updated successfully! 💰');
    loadData();
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentMonth = MONTH_NAMES[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const daysElapsed = getDaysElapsedInMonth();
  const daysRemaining = getDaysRemainingInMonth();
  const currency = loadCurrency();

  const pageKey = activePage === 'add' ? 'dashboard' : activePage;

  return (
    <div className="dashboard" style={{ paddingBottom: '72px' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={ANIMATION_VARIANTS.staggerContainer}
        className="dashboard-container"
      >
        {/* Header — always visible */}
        <motion.header
          className="dashboard-header-compact"
          variants={ANIMATION_VARIANTS.fadeInDown}
        >
          <div className="header-left">
            <h1 className="dashboard-title-compact">💰 Your Budget</h1>
            <span className="header-month">{currentMonth} {currentYear}</span>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-compact">
                <span className="stat-label-compact">Days Passed</span>
                <span className="stat-value-compact">{daysElapsed}</span>
              </div>
              <div className="stat-separator">|</div>
              <div className="stat-compact">
                <span className="stat-label-compact">Days Left</span>
                <span className="stat-value-compact">{daysRemaining}</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="theme-toggle-compact"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </motion.header>

        {/* Settings button — always visible */}
        <motion.div className="settings-btn-container" variants={ANIMATION_VARIANTS.fadeInDown}>
          <button onClick={() => setIsSettingsOpen(true)} className="btn btn-secondary btn-sm">
            <SettingsIcon size={16} />
            Settings & Backup
          </button>
        </motion.div>

        {/* Page content — switches based on activePage */}
        <AnimatePresence mode="wait">

          {/* ── DASHBOARD PAGE ── */}
          {pageKey === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {insights && (
                <BudgetSummary
                  budget={monthlyBudget}
                  insights={insights}
                  currency={currency}
                />
              )}

              <motion.div className="quick-stats-grid" variants={ANIMATION_VARIANTS.fadeInUp}>
                <div className="stat-card glass">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <p className="stat-label">Total Expenses</p>
                    <p className="stat-number">{expenses.length}</p>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <p className="stat-label">Daily Average</p>
                    <p className="stat-number">
                      {currency.symbol}{insights?.dailyAverage.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <p className="stat-label">Budget/Day Left</p>
                    <p className="stat-number">
                      {currency.symbol}{insights?.budgetPerDay.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon">{insights?.topCategory?.emoji || '💡'}</div>
                  <div className="stat-content">
                    <p className="stat-label">Top Category</p>
                    <p className="stat-number-small">
                      {insights?.topCategory?.name || 'None yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── CHARTS PAGE ── */}
          {pageKey === 'charts' && (
            <motion.div
              key="charts"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="page-section-title">Spending Insights</h2>
              <div className="charts-grid">
                <CategoryChart expenses={expenses} currency={currency} />
                <SpendingTrend expenses={expenses} currency={currency} />
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTIONS PAGE ── */}
          {pageKey === 'transactions' && (
            <motion.div
              key="transactions"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="page-section-title">Transactions</h2>
              <ExpenseList
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                currency={currency}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* Modals — always mounted */}
        {isBudgetModalOpen && (
          <BudgetModal
            currentBudget={monthlyBudget}
            onSave={handleBudgetUpdate}
            onClose={() => setIsBudgetModalOpen(false)}
            currency={currency}
          />
        )}

        <ExpenseForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          editingExpense={editingExpense}
        />

        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onDataImported={loadData}
        />

        {notification && (
          <motion.div
            className="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {notification}
          </motion.div>
        )}

        <motion.footer className="dashboard-footer" variants={ANIMATION_VARIANTS.fadeInUp}>
          <p>© 2026 Student Budget Planner. Made with 💜 for students.</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}

export default Dashboard;