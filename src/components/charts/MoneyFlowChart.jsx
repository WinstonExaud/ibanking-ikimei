import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { getMonthlyData } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-surface-border p-4 min-w-[160px]">
      <p className="text-xs font-semibold text-gray-500 font-poppins mb-2 uppercase tracking-wide">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-inter text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-gray-800 font-poppins">
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MoneyFlowChart({ transactions = [], loading }) {
  const data = getMonthlyData(transactions);
  const currentMonth = new Date().getMonth();
  const recentData = data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-5 w-32 mb-4" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 font-poppins">Money Flow</h3>
          <p className="text-xs text-gray-400 font-inter">Cost and usage by type</p>
        </div>
        <div className="flex gap-1">
          {['1d','7d','30d','1m','Max'].map((t, i) => (
            <button
              key={t}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-inter transition-all ${
                i === 2
                  ? 'bg-primary-500 text-white shadow-blue'
                  : 'text-gray-500 hover:bg-surface-bg'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-inter text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-primary-500" />
          Income
        </div>
        <div className="flex items-center gap-1.5 text-xs font-inter text-gray-500">
          <span className="w-3 h-0.5 bg-orange-400 inline-block" />
          Expense
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={recentData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${v/1000}k` : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F7FB' }} />
          <Bar dataKey="income" name="Income" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Line
            dataKey="expense"
            name="Expense"
            type="monotone"
            stroke="#F97316"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
