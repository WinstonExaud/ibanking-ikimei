import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconBg, currency = true, loading }) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  const isPositive = change >= 0;

  return (
    <div className="card card-hover cursor-default">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 font-inter font-medium">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-primary-100'}`}>
            <Icon size={18} className="text-primary-500" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 font-poppins count-animate">
        {currency ? formatCurrency(value) : value?.toLocaleString()}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-inter ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span className="font-semibold">{isPositive ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
