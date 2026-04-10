import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './BudgetModal.css';

function BudgetModal({ currentBudget, onSave, onClose, currency }) {
  const [budget, setBudget] = useState(currentBudget);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(budget);
    if (amount > 0) {
      onSave(amount);
    }
  };

  return (
    <>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <div className="modal-container">
        <motion.div
          className="budget-modal glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="modal-title">💰 Set Monthly Budget</h2>
            <button onClick={onClose} className="btn-close">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="budget">Monthly Budget ({currency.code})</label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                step="0.01"
                min="1"
                autoFocus
                style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Budget
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default BudgetModal;