import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { calculateCategoryTotals, formatCurrency } from '../../utils/calculations';
import { ANIMATION_VARIANTS } from '../../utils/constants';
import { useState } from 'react';
import './Charts.css';

function CategoryChart({ expenses, currency }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const categoryData = calculateCategoryTotals(expenses);

  // Transform for Recharts
  const chartData = categoryData.map(cat => ({
    name: cat.name,
    value: cat.total,
    color: cat.color,
    emoji: cat.emoji,
    count: cat.count
  }));

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Active (hovered) slice — lifts out with larger radius + glow ring
  const renderActiveShape = (props) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent
    } = props;

    const RADIAN = Math.PI / 180;
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const lx = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const ly = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        {/* Outer glow ring */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.25}
        />
        {/* Lifted slice */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="var(--color-bg-primary)"
          strokeWidth={2}
          style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.45))' }}
        />
        {/* Percentage label */}
        {percent >= 0.05 && (
          <text
            x={lx}
            y={ly}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: '15px',
              fontWeight: '800',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              pointerEvents: 'none'
            }}
          >
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        )}
      </g>
    );
  };

  // Render custom label INSIDE donut for inactive slices
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '15px',
          fontWeight: '800',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <motion.div
        className="card chart-empty"
        variants={ANIMATION_VARIANTS.fadeInUp}
      >
        <div className="empty-state">
          <span className="empty-emoji">📊</span>
          <h3>No spending data yet</h3>
          <p>Add your first expense to see the breakdown!</p>
        </div>
      </motion.div>
    );
  }

  const activeSlice = activeIndex !== null ? chartData[activeIndex] : null;
  const isActive = activeIndex !== null;

  return (
    <motion.div
      className="card chart-container"
      variants={ANIMATION_VARIANTS.fadeInUp}
    >
      <h3 className="chart-title">💸 Spending by Category</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              innerRadius={85}
              outerRadius={120}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="var(--color-bg-primary)"
                  strokeWidth={2}
                  style={{
                    filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))',
                    cursor: 'pointer',
                    transition: 'filter 0.2s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content — fully hidden (visibility+opacity) when a slice is hovered */}
        <div
          className="donut-center"
          style={{
            opacity: isActive ? 0 : 1,
            visibility: isActive ? 'hidden' : 'visible',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
          }}
        >
          <div className="center-value">{formatCurrency(total, currency.symbol)}</div>
          <div className="center-label">{chartData.reduce((sum, cat) => sum + cat.count, 0)} transactions</div>
        </div>

        {/* State-driven tooltip — renders only when activeSlice exists, never lingers */}
        {activeSlice && (
          <div
            className="chart-tooltip-donut donut-tooltip-floating"
            // Stop mouse leaving the tooltip from clearing the slice
            onMouseEnter={() => {}}
          >
            <div className="tooltip-header">
              <span className="tooltip-emoji">{activeSlice.emoji}</span>
              <span className="tooltip-title">{activeSlice.name}</span>
            </div>
            <div className="tooltip-body">
              <p className="tooltip-amount">{formatCurrency(activeSlice.value, currency.symbol)}</p>
              <p className="tooltip-count">{activeSlice.count} expense{activeSlice.count !== 1 ? 's' : ''}</p>
              <p className="tooltip-percent">{((activeSlice.value / total) * 100).toFixed(1)}% of total</p>
            </div>
          </div>
        )}
      </div>

      {/* Compact Category Legend - Grid Layout */}
      <div className="category-legend">
        {chartData.map((cat, index) => (
          <motion.div
            key={index}
            className={`legend-item ${activeIndex === index ? 'legend-item-active' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="legend-indicator" style={{ backgroundColor: cat.color }} />
            <span className="legend-emoji">{cat.emoji}</span>
            <span className="legend-name">{cat.name}</span>
            <span className="legend-amount">{formatCurrency(cat.value, currency.symbol)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default CategoryChart;