import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CATEGORIES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { addExpense, updateExpense } from '../../utils/localStorage';
import { loadCurrency } from '../../utils/localStorage';
import './ExpenseForm.css';

function ExpenseForm({ isOpen, onClose, onSuccess, editingExpense = null }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const currency = loadCurrency();

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load editing expense data
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
        date: editingExpense.date
      });
    }
  }, [editingExpense]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = ERROR_MESSAGES.INVALID_AMOUNT;
    }

    if (!formData.description.trim()) {
      newErrors.description = ERROR_MESSAGES.DESCRIPTION_REQUIRED;
    }

    if (!formData.date) {
      newErrors.date = ERROR_MESSAGES.DATE_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date
      };

      if (editingExpense) {
        updateExpense(editingExpense.id, expenseData);
      } else {
        addExpense(expenseData);
      }

      // Reset form
      setFormData({
        amount: '',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      onSuccess(editingExpense ? SUCCESS_MESSAGES.EXPENSE_UPDATED : SUCCESS_MESSAGES.EXPENSE_ADDED);
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrors({ submit: ERROR_MESSAGES.GENERIC_ERROR });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      category: 'food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="expense-form-modal glass">
              {/* Header */}
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
                </h2>
                <button
                  onClick={handleClose}
                  className="btn-close"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="expense-form">
                {/* Amount */}
                <div className="form-group">
                  <label htmlFor="amount">
                    Amount ({currency.symbol}) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={errors.amount ? 'input-error' : ''}
                    autoFocus
                  />
                  {errors.amount && (
                    <span className="error-message">{errors.amount}</span>
                  )}
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., Lunch at cafeteria"
                    maxLength="100"
                    className={errors.description ? 'input-error' : ''}
                  />
                  {errors.description && (
                    <span className="error-message">{errors.description}</span>
                  )}
                  <span className="char-count">
                    {formData.description.length}/100
                  </span>
                </div>

                {/* Date */}
                <div className="form-group">
                  <label htmlFor="date">
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.date ? 'input-error' : ''}
                  />
                  {errors.date && (
                    <span className="error-message">{errors.date}</span>
                  )}
                </div>

                {/* Error message */}
                {errors.submit && (
                  <div className="error-banner">
                    {errors.submit}
                  </div>
                )}

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '💫 Saving...' : editingExpense ? '✅ Update' : '➕ Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExpenseForm;