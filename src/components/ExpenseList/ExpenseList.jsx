import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { CATEGORIES, ANIMATION_VARIANTS, EMPTY_STATES } from '../../utils/constants';
import { formatCurrency, sortExpensesByDate } from '../../utils/calculations';
import './ExpenseList.css';

function ExpenseList({ expenses, onEdit, onDelete, currency }) {
  const [showCount, setShowCount] = useState(7);

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const sortedExpenses = sortExpensesByDate(expenses);
  const displayedExpenses = sortedExpenses.slice(0, showCount);
  const remaining = sortedExpenses.length - showCount;
  const canShowMore = remaining > 0;
  const canShowLess = showCount > 7;

  const handleShowMore = () => {
    setShowCount(prev => Math.min(prev + 10, sortedExpenses.length));
  };

  const handleShowLess = () => {
    setShowCount(7);
  };

  if (expenses.length === 0) {
    return (
      <motion.div
        className="card expense-list-empty"
        variants={ANIMATION_VARIANTS.fadeInUp}
      >
        <div className="empty-state">
          <span className="empty-emoji">{EMPTY_STATES.NO_EXPENSES.emoji}</span>
          <h3>{EMPTY_STATES.NO_EXPENSES.title}</h3>
          <p>{EMPTY_STATES.NO_EXPENSES.message}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="expense-list-container"
      variants={ANIMATION_VARIANTS.fadeInUp}
    >
      <div className="expense-list-header">
        <h3>📝 Recent Expenses</h3>
        <span className="expense-count">
          Showing {displayedExpenses.length} of {expenses.length}
        </span>
      </div>

      <div className="expense-list">
        {displayedExpenses.map((expense, index) => {
          const category = getCategoryInfo(expense.category);
          const formattedDate = format(new Date(expense.date), 'MMM dd, yyyy');

          return (
            <motion.div
              key={expense.id}
              className="expense-item glass"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="expense-icon"
                style={{
                  background: `linear-gradient(135deg, ${category.color}, ${category.darkColor})`
                }}
              >
                <span>{category.emoji}</span>
              </div>

              <div className="expense-details">
                <h4 className="expense-description">{expense.description}</h4>
                <div className="expense-meta">
                  <span className="expense-category">{category.name}</span>
                  <span className="expense-separator">•</span>
                  <span className="expense-date">{formattedDate}</span>
                </div>
              </div>

              <div className="expense-amount-section">
                <div className="expense-amount">
                  {formatCurrency(expense.amount, currency.symbol)}
                </div>
              </div>

              <div className="expense-actions">
                <button
                  onClick={() => onEdit(expense)}
                  className="btn-action btn-edit"
                  aria-label="Edit expense"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(expense)}
                  className="btn-action btn-delete"
                  aria-label="Delete expense"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show More/Less Buttons */}
      {(canShowMore || canShowLess) && (
        <div className="expense-list-actions">
          {canShowMore && (
            <button onClick={handleShowMore} className="btn btn-secondary">
              <ChevronDown size={18} />
              Show {Math.min(10, remaining)} More ({remaining} remaining)
            </button>
          )}
          {canShowLess && (
            <button onClick={handleShowLess} className="btn btn-ghost">
              <ChevronUp size={18} />
              Show Less
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ExpenseList;