import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import './BudgetModal.css';

const PERIOD_OPTIONS = ['Weekly', 'Monthly', 'Custom'];

// Default category allocations as percentages of total budget
const DEFAULT_ALLOCATIONS = {
  food:          20,
  transport:     10,
  study:         10,
  accommodation: 40,
  entertainment:  5,
  health:         5,
  shopping:       5,
  other:          5,
};

function BudgetModal({ currentBudget, onSave, onClose, currency }) {
  const [budget, setBudget]   = useState(currentBudget || 500);
  const [period, setPeriod]   = useState('Monthly');
  const [allocs, setAllocs]   = useState(DEFAULT_ALLOCATIONS);

  // Recalculate so sliders always sum to ≤ 100
  const totalAllocated = Object.values(allocs).reduce((a, b) => a + b, 0);
  const remaining      = Math.max(0, budget - (budget * totalAllocated / 100));

  const handleSlider = (catId, value) => {
    setAllocs(prev => ({ ...prev, [catId]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(budget);
    if (amount > 0) onSave(amount);
  };

  const catAmount = (catId) =>
    ((allocs[catId] / 100) * budget).toFixed(2);

  return (
    <>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <div className="modal-container">
        <motion.div
          className="budget-modal glass"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">💰 Set Budget</h2>
            <button onClick={onClose} className="btn-close" aria-label="Close">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Total budget input */}
            <div className="bm-total-row">
              <label className="bm-label">Total Budget</label>
              <div className="bm-amount-input">
                <span className="bm-currency">{currency.symbol}</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  step="any"
                  min="1"
                  className="bm-big-input"
                />
              </div>
            </div>

            {/* Budget period selector */}
            <div className="bm-period-row">
              <label className="bm-label">Budget Period</label>
              <div className="bm-period-tabs">
                {PERIOD_OPTIONS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`bm-period-tab${period === p ? ' active' : ''}`}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category sliders */}
            <div className="bm-sliders-section">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="bm-slider-row">
                  <div className="bm-slider-header">
                    <span className="bm-cat-name">
                      {cat.emoji} {cat.name}
                    </span>
                    <span className="bm-cat-amount">
                      {currency.symbol}{catAmount(cat.id)}
                    </span>
                  </div>
                  <div className="bm-slider-track">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={allocs[cat.id]}
                      onChange={e => handleSlider(cat.id, e.target.value)}
                      className="bm-slider"
                      style={{ '--cat-color': cat.color }}
                    />
                    <div
                      className="bm-slider-fill"
                      style={{
                        width: `${allocs[cat.id]}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.darkColor})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="bm-summary">
              <div className="bm-summary-item">
                <span>Total Budget</span>
                <strong>{currency.symbol}{parseFloat(budget).toFixed(2)}</strong>
              </div>
              <div className="bm-summary-item">
                <span>Allocated</span>
                <strong>{currency.symbol}{(budget * totalAllocated / 100).toFixed(2)}</strong>
              </div>
              <div className="bm-summary-item highlight">
                <span>Remaining</span>
                <strong style={{ color: remaining > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {currency.symbol}{remaining.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Actions */}
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