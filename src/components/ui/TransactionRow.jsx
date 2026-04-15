import { ArrowUpRight, Plus, Edit2 } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

export default function TransactionRow({ tx, accounts = [], users = [], onEdit }) {
  const isDeposit = tx.type === 'deposit';

  // Use stored names first (always reliable), then fall back to live lookups
  const fromAccountName = tx.fromAccountName
    || accounts.find(a => a.id === tx.fromAccountId)?.name
    || '—';

  const toClientName = tx.toClientName
    || users.find(u => u.id === tx.toUserId)?.name
    || '—';

  const label = isDeposit
    ? `Deposit → ${fromAccountName}`
    : `Transfer → ${toClientName}`;

  const subLabel = isDeposit
    ? fromAccountName
    : `From ${fromAccountName}`;

  // amount safety — Firestore sometimes returns as string or undefined
  const amount = parseFloat(tx.amount);

  return (
    <div className="flex items-center gap-4 py-3 px-1 hover:bg-surface-bg rounded-xl transition-colors group cursor-default">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
        isDeposit ? 'bg-green-100' : 'bg-blue-100'
      }`}>
        {isDeposit
          ? <Plus size={18} className="text-green-600" />
          : <ArrowUpRight size={18} className="text-blue-600" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{label}</p>
        <p className="text-xs text-gray-400 font-inter truncate">
          {subLabel} · {formatDate(tx.createdAt)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold font-poppins ${isDeposit ? 'text-green-600' : 'text-gray-800'}`}>
          {isDeposit ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <p className="text-xs text-gray-400 font-inter">{formatTime(tx.createdAt)}</p>
      </div>

      <button
        onClick={() => onEdit?.(tx)}
        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary-100 rounded-lg transition-all duration-200 flex-shrink-0"
        title="Edit transaction"
      >
        <Edit2 size={16} className="text-primary-600" />
      </button>

      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Completed" />
    </div>
  );
}