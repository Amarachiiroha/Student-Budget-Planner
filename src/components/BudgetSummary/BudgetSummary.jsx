import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/calculations';
import { ANIMATION_VARIANTS } from '../../utils/constants';
import './BudgetSummary.css';

function BudgetSummary({ budget, insights, currency }) {
  const { total, remaining, percentage, status } = insights;

  const getStatusClass = () => {
    if (status.label === 'Over Budget') return 'danger';
    if (status.label === 'Caution') return 'warning';
    return 'safe';
  };

  const statusClass = getStatusClass();

  return (
    <motion.div
      className={`budget-summary ${statusClass}`}
      variants={ANIMATION_VARIANTS.fadeInUp}
    >
      {/* Main Cards */}
      <div className="budget-cards">
        <div 
          className="budget-card glass" 
          onClick={() => window.dispatchEvent(new CustomEvent('openBudgetModal'))} 
          style={{ cursor: 'pointer' }}
        >
          <div className="budget-card-header">
            <span className="budget-emoji">💰</span>
            <span className="budget-label">Monthly Budget</span>
          </div>
          <div className="budget-amount">
            {formatCurrency(budget, currency.symbol)}
          </div>
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-tertiary)', 
            margin: '4px 0 0 0',
            fontWeight: 'var(--font-medium)'
          }}>
            Click to edit
          </p>
        </div>

        <div className="budget-card glass">
          <div className="budget-card-header">
            <span className="budget-emoji">💸</span>
            <span className="budget-label">Total Spent</span>
          </div>
          <div className="budget-amount spent">
            {formatCurrency(total, currency.symbol)}
          </div>
          <div className="budget-percentage">
            {percentage}% of budget
          </div>
        </div>

        <div className="budget-card glass">
          <div className="budget-card-header">
            <span className="budget-emoji">
              {remaining >= 0 ? '✨' : '⚠️'}
            </span>
            <span className="budget-label">Remaining</span>
          </div>
          <div className={`budget-amount ${remaining < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(remaining, currency.symbol)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <motion.div
            className={`progress-bar ${statusClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Message */}
      <motion.div
        className={`status-message ${statusClass}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="status-emoji">{status.emoji}</span>
        <span className="status-text">{status.message}</span>
      </motion.div>
    </motion.div>
  );
}

export default BudgetSummary;