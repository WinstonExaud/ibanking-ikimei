import { formatCurrency } from '../../utils/helpers';
import { TrendingUp, MoreHorizontal } from 'lucide-react';

export default function AccountCard({ account, onClick }) {
  const color = account?.color || '#2563EB';
  return (
    <div
      className="card card-hover cursor-pointer relative overflow-hidden group"
      onClick={() => onClick && onClick(account)}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <span className="font-bold text-sm font-poppins" style={{ color }}>
            {account?.name?.[0]?.toUpperCase() || 'A'}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-700 font-poppins truncate">{account?.name}</p>
      <p className="text-xl font-bold text-gray-900 font-poppins mt-1">
        {formatCurrency(account?.balance || 0)}
      </p>
      <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-inter">
        <TrendingUp size={12} />
        <span>Active</span>
      </div>
    </div>
  );
}
