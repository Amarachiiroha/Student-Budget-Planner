import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import {
  loadBudget, saveBudget, getExpensesByMonth,
  deleteExpense, loadCurrency, loadExpenses
} from '../../utils/localStorage';
import {
  getSpendingInsights, getDaysElapsedInMonth, getDaysRemainingInMonth
} from '../../utils/calculations';
import { ANIMATION_VARIANTS, MONTH_NAMES, SUCCESS_MESSAGES, CATEGORIES } from '../../utils/constants';
import BudgetSummary from '../BudgetSummary/BudgetSummary';
import BudgetModal from '../BudgetModal/BudgetModal';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import ExpenseList from '../ExpenseList/ExpenseList';
import CategoryChart from '../Charts/CategoryChart';
import SpendingTrend from '../Charts/SpendingTrend';
import Settings from '../Settings/Settings';
import ProfilePage from '../Profile/ProfilePage';
import './Dashboard.css';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.15 } },
};

// ── Spending Insights helper ─────────────────────────────────────────
function SpendingInsights({ expenses, budget, currency }) {
  if (!expenses.length) return null;

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const topCat = byCategory[0];

  const byDay = {};
  expenses.forEach(e => {
    const d = new Date(e.date).getDay();
    byDay[d] = (byDay[d] || 0) + e.amount;
  });
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const topDayIdx = Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const topDay = topDayIdx !== undefined ? dayNames[topDayIdx] : null;

  const daysLeft = getDaysRemainingInMonth();
  const projected = daysLeft > 0
    ? total + (total / Math.max(getDaysElapsedInMonth(), 1)) * daysLeft
    : total;
  const overBy = projected - budget;

  const tips = [];
  if (topCat) tips.push(`💸 You spend most on ${topCat.emoji} ${topCat.name} — ${currency.symbol}${topCat.total.toFixed(2)} this month`);
  if (topDay) tips.push(`📅 Your highest spending day is ${topDay}`);
  if (overBy > 0)
    tips.push(`⚠️ At this rate you're on track to overspend by ${currency.symbol}${overBy.toFixed(2)}`);
  else
    tips.push(`✅ You're on track to finish the month within budget`);

  return (
    <motion.div className="insights-card glass" variants={ANIMATION_VARIANTS.fadeInUp}>
      <h3 className="insights-title">💡 Spending Insights</h3>
      <ul className="insights-list">
        {tips.map((t, i) => <li key={i} className="insights-item">{t}</li>)}
      </ul>
    </motion.div>
  );
}

// ── Monthly History helper ────────────────────────────────────────────
function MonthlyHistory({ currency }) {
  const currentDate = new Date();
  const allExpenses = loadExpenses();

  // Build last 6 months
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const exps = allExpenses.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear() === yr && ed.getMonth() === mo;
    });
    const total = exps.reduce((s, e) => s + e.amount, 0);
    months.push({ label: `${MONTH_NAMES[mo]} ${yr}`, total, count: exps.length, mo, yr });
  }

  if (months.every(m => m.count === 0)) {
    return (
      <div className="history-empty glass">
        <p>📅 No historical data yet. Add more expenses over the coming months to see your history here.</p>
      </div>
    );
  }

  const maxTotal = Math.max(...months.map(m => m.total), 1);

  return (
    <motion.div className="history-card glass" variants={ANIMATION_VARIANTS.fadeInUp}>
      <h3 className="history-title">📅 Monthly History</h3>
      <div className="history-bars">
        {months.map((m, i) => (
          <div key={i} className="history-bar-row">
            <span className="history-bar-label">{m.label.split(' ')[0].slice(0,3)} {m.label.split(' ')[1]}</span>
            <div className="history-bar-track">
              <motion.div
                className="history-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(m.total / maxTotal) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-border-secondary)' }}
              />
            </div>
            <span className="history-bar-amount">
              {m.total > 0 ? `${currency.symbol}${m.total.toFixed(0)}` : '—'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
function Dashboard({ theme, toggleTheme, isDark, activePage, userName, onLogout, onNavigate }) {
  const [expenses, setExpenses]                   = useState([]);
  const [monthlyBudget, setMonthlyBudget]         = useState(500);
  const [currentDate]                             = useState(new Date());
  const [insights, setInsights]                   = useState(null);
  const [isFormOpen, setIsFormOpen]               = useState(false);
  const [editingExpense, setEditingExpense]        = useState(null);
  const [notification, setNotification]           = useState(null);
  const [isSettingsOpen, setIsSettingsOpen]       = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [filterCategory, setFilterCategory]       = useState('all');
  const [filterMonth, setFilterMonth]             = useState(currentDate.getMonth());
  const [sortOrder, setSortOrder]                 = useState('newest');

  useEffect(() => { loadData(); }, [currentDate]);

  useEffect(() => {
    const h = () => setIsBudgetModalOpen(true);
    window.addEventListener('openBudgetModal', h);
    return () => window.removeEventListener('openBudgetModal', h);
  }, []);

  useEffect(() => {
    if (activePage === 'add') {
      setEditingExpense(null);
      setIsFormOpen(true);
    }
  }, [activePage]);

  const loadData = () => {
    const budget = loadBudget();
    setMonthlyBudget(budget);
    const yr = currentDate.getFullYear();
    const mo = currentDate.getMonth();
    const monthExpenses = getExpensesByMonth(yr, mo);
    setExpenses(monthExpenses);
    setInsights(getSpendingInsights(budget, monthExpenses));
  };

  const handleEditExpense   = (exp) => { setEditingExpense(exp); setIsFormOpen(true); };
  const handleDeleteExpense = (exp) => {
    if (window.confirm(`Delete "${exp.description}"?`)) {
      deleteExpense(exp.id);
      showNotification(SUCCESS_MESSAGES.EXPENSE_DELETED);
      loadData();
    }
  };
  const handleFormSuccess  = (msg) => { showNotification(msg); loadData(); };
  const handleBudgetUpdate = (val) => {
    saveBudget(val);
    setMonthlyBudget(val);
    setIsBudgetModalOpen(false);
    showNotification('Budget updated! 💰');
    loadData();
  };
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const currency     = loadCurrency();
  const currentMonth = MONTH_NAMES[currentDate.getMonth()];
  const currentYear  = currentDate.getFullYear();
  const daysElapsed  = getDaysElapsedInMonth();
  const daysLeft     = getDaysRemainingInMonth();
  const pageKey      = activePage === 'add' ? 'dashboard' : activePage;

  // Filtered + sorted transactions
  const filteredExpenses = expenses
    .filter(exp => {
      const catOk = filterCategory === 'all' || exp.category === filterCategory;
      const moOk  = new Date(exp.date).getMonth() === filterMonth;
      return catOk && moOk;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest')  return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'oldest')  return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'highest') return b.amount - a.amount;
      return 0;
    });

  return (
    <div className="dashboard" style={{ paddingBottom: '80px' }}>
      <motion.div
        initial="hidden" animate="visible"
        variants={ANIMATION_VARIANTS.staggerContainer}
        className="dashboard-container"
      >
        {/* ── HEADER ── */}
        <motion.header className="dashboard-header-compact" variants={ANIMATION_VARIANTS.fadeInDown}>
          <div className="header-left">
            <span className="header-welcome">👋 Welcome, {userName || 'Student'}!</span>
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
                <span className="stat-value-compact">{daysLeft}</span>
              </div>
            </div>
            <button onClick={toggleTheme} className="theme-toggle-compact"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </motion.header>

        {/* ── SETTINGS + LOGOUT ── */}
        <motion.div className="settings-btn-container" variants={ANIMATION_VARIANTS.fadeInDown}
          style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setIsSettingsOpen(true)} className="btn btn-secondary btn-sm">
            <SettingsIcon size={15} /> Settings & Backup
          </button>
          <button onClick={onLogout} className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-danger)' }}>
            <LogOut size={15} /> Logout
          </button>
        </motion.div>

        {/* ── PAGE CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* DASHBOARD */}
          {pageKey === 'dashboard' && (
            <motion.div key="dashboard" variants={pageVariants}
              initial="initial" animate="animate" exit="exit">

              {insights && (
                <BudgetSummary budget={monthlyBudget} insights={insights} currency={currency} />
              )}

              <motion.div className="quick-stats-grid" variants={ANIMATION_VARIANTS.fadeInUp}>
                {[
                  { icon: '📊', label: 'Total Expenses',  value: expenses.length },
                  { icon: '📈', label: 'Daily Average',   value: `${currency.symbol}${insights?.dailyAverage.toFixed(2)||'0.00'}` },
                  { icon: '🎯', label: 'Budget/Day Left', value: `${currency.symbol}${insights?.budgetPerDay.toFixed(2)||'0.00'}` },
                  { icon: insights?.topCategory?.emoji||'💡', label: 'Top Category', value: insights?.topCategory?.name||'None yet', small: true },
                ].map((s, i) => (
                  <div key={i} className="stat-card glass">
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-content">
                      <p className="stat-label">{s.label}</p>
                      <p className={s.small ? 'stat-number-small' : 'stat-number'}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Spending Insights */}
              <SpendingInsights
                expenses={expenses}
                budget={monthlyBudget}
                currency={currency}
              />

              {/* Action buttons */}
              <motion.div className="dashboard-actions" variants={ANIMATION_VARIANTS.fadeInUp}>
                <button className="dash-action-btn primary"
                  onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}>
                  ➕ Add Expense
                </button>
                <button className="dash-action-btn secondary"
                  onClick={() => setIsBudgetModalOpen(true)}>
                  💰 Set Budget
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* CHARTS */}
          {pageKey === 'charts' && (
            <motion.div key="charts" variants={pageVariants}
              initial="initial" animate="animate" exit="exit">
              <h2 className="page-section-title">📊 Spending Insights</h2>
              <div className="charts-grid">
                <CategoryChart expenses={expenses} currency={currency} />
                <SpendingTrend  expenses={expenses} currency={currency} />
              </div>
              <MonthlyHistory currency={currency} />
            </motion.div>
          )}

          {/* TRANSACTIONS */}
          {pageKey === 'transactions' && (
            <motion.div key="transactions" variants={pageVariants}
              initial="initial" animate="animate" exit="exit">
              <h2 className="page-section-title">📝 Transactions</h2>

              <div className="txn-filters">
                <div className="txn-filter-group">
                  <label>Category</label>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="all">All</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="txn-filter-group">
                  <label>Month</label>
                  <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="txn-filter-group">
                  <label>Sort</label>
                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>
              </div>

              <ExpenseList
                expenses={filteredExpenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                currency={currency}
              />
            </motion.div>
          )}

          {/* PROFILE */}
          {pageKey === 'profile' && (
            <motion.div key="profile" variants={pageVariants}
              initial="initial" animate="animate" exit="exit">
              <h2 className="page-section-title">👤 My Profile</h2>
              <ProfilePage userName={userName} onLogout={onLogout} />
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── MODALS ── */}
        {isBudgetModalOpen && (
          <BudgetModal currentBudget={monthlyBudget} onSave={handleBudgetUpdate}
            onClose={() => setIsBudgetModalOpen(false)} currency={currency} />
        )}

        <ExpenseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess} editingExpense={editingExpense} />

        <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
          onDataImported={loadData} />

        {notification && (
          <motion.div className="notification"
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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