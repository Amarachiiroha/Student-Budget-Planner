import { motion } from 'framer-motion';
import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/calculations';
import { ANIMATION_VARIANTS } from '../../utils/constants';
import './Charts.css';

function SpendingTrend({ expenses, currency }) {
  // Group expenses by day
  const dailyData = expenses.reduce((acc, expense) => {
    const date = format(new Date(expense.date), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        date,
        amount: expense.amount,
        count: 1,
        fullDate: expense.date
      });
    }
    
    return acc;
  }, []);

  // Sort by date
  dailyData.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Take last 14 days
  const recentData = dailyData.slice(-14);

  // Calculate 3-day moving average for trend line
  const dataWithTrend = recentData.map((item, index) => {
    if (index < 2) {
      return { ...item, trend: item.amount };
    }
    
    const avg = (
      recentData[index].amount + 
      recentData[index - 1].amount + 
      recentData[index - 2].amount
    ) / 3;
    
    return { ...item, trend: avg };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip glass">
          <p className="tooltip-title">{payload[0].payload.date}</p>
          <div style={{ marginTop: '8px' }}>
            <p className="tooltip-amount" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
              Daily: {formatCurrency(payload[0].value, currency.symbol)}
            </p>
            <p className="tooltip-count" style={{ marginBottom: '4px' }}>
              {payload[0].payload.count} expense{payload[0].payload.count !== 1 ? 's' : ''}
            </p>
            {payload[1] && (
              <p className="tooltip-count" style={{ color: '#f97316', fontWeight: 'var(--font-semibold)' }}>
                3-Day Avg: {formatCurrency(payload[1].value, currency.symbol)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (dataWithTrend.length === 0) {
    return (
      <motion.div
        className="card chart-empty"
        variants={ANIMATION_VARIANTS.fadeInUp}
      >
        <div className="empty-state">
          <span className="empty-emoji">📈</span>
          <h3>No spending trend yet</h3>
          <p>Add expenses to see your daily spending pattern!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card chart-container"
      variants={ANIMATION_VARIANTS.fadeInUp}
    >
      <h3 className="chart-title">📈 Daily Spending Trend</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dataWithTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              stroke="var(--color-border)"
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              stroke="var(--color-border)"
              tickFormatter={(value) => `${currency.symbol}${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-bg)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            
            {/* Bar Chart */}
            <Bar
              dataKey="amount"
              fill="var(--color-primary)"
              radius={[8, 8, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              name="Daily Spending"
            />
            
            {/* Trend Line */}
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              animationBegin={400}
              animationDuration={1000}
              name="3-Day Average"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="chart-stat">
          <span className="stat-label">Total Days</span>
          <span className="stat-value">{dataWithTrend.length}</span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Avg/Day</span>
          <span className="stat-value">
            {formatCurrency(dataWithTrend.reduce((sum, d) => sum + d.amount, 0) / dataWithTrend.length, currency.symbol)}
          </span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Highest Day</span>
          <span className="stat-value">
            {formatCurrency(Math.max(...dataWithTrend.map(d => d.amount)), currency.symbol)}
          </span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Trend</span>
          <span className="stat-value" style={{ color: '#f97316' }}>
            {dataWithTrend[dataWithTrend.length - 1].trend > dataWithTrend[0].trend ? '📈' : '📉'}
          </span>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="chart-explanation">
        <p className="chart-info">
          <span className="info-icon">💡</span>
          <span className="info-text">
            The <strong>orange line</strong> shows a 3-day average, so one expensive day won't throw off your overall trend.
          </span>
        </p>
      </div>
    </motion.div>
  );
}

export default SpendingTrend;