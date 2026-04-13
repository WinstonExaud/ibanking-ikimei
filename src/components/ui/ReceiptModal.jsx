import Modal from '../ui/Modal';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';
import { CheckCircle, ArrowUpRight, Plus } from 'lucide-react';

export default function ReceiptModal({ open, onClose, tx, accounts, users }) {
  if (!tx) return null;

  const fromAccount = accounts?.find(a => a.id === tx.fromAccountId);
  const toUser = users?.find(u => u.id === tx.toUserId);
  const isDeposit = tx.type === 'deposit';

  return (
    <Modal open={open} onClose={onClose} title="Transaction Receipt" maxWidth="max-w-sm">
      <div className="text-center py-2">
        {/* Status */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <p className="text-sm font-medium text-gray-500 font-inter">
          {isDeposit ? 'Deposit' : 'Transfer'} Completed
        </p>
        <p className="text-4xl font-bold text-gray-900 font-poppins mt-2">
          {formatCurrency(tx.amount)}
        </p>
      </div>

      <div className="bg-surface-bg rounded-2xl p-4 mt-6 space-y-3">
        {[
          { label: 'Type', value: tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1) },
          { label: 'From', value: fromAccount?.name || '—' },
          !isDeposit && { label: 'To', value: toUser?.name || '—' },
          { label: 'Status', value: 'Completed', color: 'text-green-600' },
          { label: 'Date', value: formatDate(tx.createdAt) },
          { label: 'Time', value: formatTime(tx.createdAt) },
          tx.note && { label: 'Note', value: tx.note },
        ].filter(Boolean).map(row => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-gray-400 font-inter">{row.label}</span>
            <span className={`font-semibold font-poppins ${row.color || 'text-gray-800'}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="btn-secondary w-full mt-5 py-3">Close</button>
    </Modal>
  );
}
