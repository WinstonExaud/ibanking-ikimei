import { useState, useEffect } from 'react';
import Modal from './Modal';
import { editTransaction } from '../../services/bankingService';
import { useToast } from '../../context/ToastContext';
import { Edit3, CheckCircle } from 'lucide-react';
import { formatCurrency, formatAmountInput, parseAmountInput } from '../../utils/helpers';

export default function EditTransactionModal({ open, onClose, tx, accounts = [], users = [], onSuccess }) {
  const [step, setStep] = useState(1); // 1=form, 2=review, 3=done
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const isDeposit = tx?.type === 'deposit';
  const selectedAccount = accounts.find(a => a.id === accountId);
  const originalAmount = parseFloat(tx?.amount);
  const amountDiff = parseAmountInput(amount) - originalAmount;

  useEffect(() => {
    if (open && tx) {
      setAmount(tx.amount?.toString() || '');
      setAccountId(tx.fromAccountId || '');
      setNote(tx.note || '');
      setStep(1);
    }
  }, [open, tx]);

  const reset = () => {
    setStep(1);
    setAmount('');
    setAccountId('');
    setNote('');
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!accountId) {
      addToast({ type: 'error', title: 'Select an account' });
      return;
    }
    const num = parseAmountInput(amount);
    if (!num || num <= 0) {
      addToast({ type: 'error', title: 'Enter a valid amount' });
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const num = parseAmountInput(amount);
      await editTransaction(tx.id, {
        newAmount: num,
        newAccountId: accountId,
        newNote: note,
      });

      const accountChanged = tx.fromAccountId !== accountId;
      let message = `Amount changed from ${formatCurrency(originalAmount)} to ${formatCurrency(num)}`;
      if (accountChanged) {
        message = `${tx.fromAccountName || '—'} → ${selectedAccount?.name || '—'} | Amount: ${formatCurrency(num)}`;
      }

      addToast({
        type: 'success',
        title: 'Transaction updated!',
        message,
      });
      onSuccess?.();
      setStep(3);
      setTimeout(() => {
        onClose();
        reset();
      }, 2000);
    } catch (err) {
      addToast({ type: 'error', title: 'Update failed', message: err.message });
      setLoading(false);
    }
  };

  if (!tx) return null;

  const toUser = users.find(u => u.id === tx.toUserId);

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title={step === 3 ? 'Complete' : 'Edit Transaction'}
    >
      {/* ── STEP 1: FORM ── */}
      {step === 1 && (
        <form onSubmit={handleReview} className="space-y-5">
          <div className="bg-surface-bg rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-poppins mb-2">
              {isDeposit ? 'Deposit' : 'Transfer'}
            </p>
            <p className="text-2xl font-bold text-gray-900 font-poppins">
              {formatCurrency(originalAmount)}
            </p>
            {!isDeposit && (
              <p className="text-sm text-gray-600 font-inter mt-1">To: {toUser?.name || '—'}</p>
            )}
          </div>

          <div>
            <label className="label">From Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose account...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} — {formatCurrency(a.balance || 0)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (TZS)</label>
            <input
              type="text"
              value={formatAmountInput(amount)}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              className="input-field"
              placeholder="0"
              required
            />
            {amount && (
              <div className={`mt-2 text-xs font-inter ${
                amountDiff > 0
                  ? 'text-orange-600 font-semibold'
                  : amountDiff < 0
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-400'
              }`}>
                {amountDiff > 0
                  ? `+${formatCurrency(amountDiff)} (increase)`
                  : amountDiff < 0
                  ? `${formatCurrency(amountDiff)} (decrease)`
                  : 'No change'}
              </div>
            )}
          </div>

          <div>
            <label className="label">
              Note <span className="text-gray-300">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
              placeholder="Transaction note..."
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Edit3 size={18} />
            <span>Review Changes</span>
          </button>
        </form>
      )}

      {/* ── STEP 2: REVIEW ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-surface-bg rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-poppins">
              Confirm Changes
            </p>

            <div className="space-y-3 border-y border-dashed border-gray-200 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-inter">Amount</span>
                <div className="text-right">
                  <p className="text-xs text-gray-400 line-through">
                    {formatCurrency(originalAmount)}
                  </p>
                  <p className="text-lg font-bold text-gray-900 font-poppins">
                    {formatCurrency(parseAmountInput(amount))}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-inter">From Account</span>
                <div className="text-right">
                  {tx.fromAccountId !== accountId ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 line-through">
                          {tx.fromAccountName || '—'}
                        </p>
                        <p className="text-sm font-bold text-orange-600 font-poppins">
                          {selectedAccount?.name || '—'}
                        </p>
                      </div>
                      <span className="text-orange-600 font-bold">→</span>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 font-poppins">
                      {selectedAccount?.name || '—'}
                    </p>
                  )}
                </div>
              </div>

              {!isDeposit && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-inter">To Client</span>
                  <p className="text-sm font-semibold text-gray-800 font-poppins">
                    {toUser?.name || '—'}
                  </p>
                </div>
              )}

              {note && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-inter">Note</span>
                  <p className="text-sm font-semibold text-gray-800 font-poppins">{note}</p>
                </div>
              )}
            </div>

            <div className={`p-3 rounded-xl space-y-2 ${
              amountDiff > 0 || tx.fromAccountId !== accountId
                ? 'bg-orange-50 border border-orange-200'
                : amountDiff < 0
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div>
                <p className={`text-sm font-semibold ${
                  amountDiff > 0 || tx.fromAccountId !== accountId
                    ? 'text-orange-700'
                    : amountDiff < 0
                    ? 'text-green-700'
                    : 'text-blue-700'
                }`}>
                  {tx.fromAccountId !== accountId
                    ? `Transferring from ${tx.fromAccountName || '—'} to ${selectedAccount?.name || '—'}`
                    : amountDiff > 0
                    ? `Account balance will decrease by ${formatCurrency(amountDiff)}`
                    : amountDiff < 0
                    ? `Account balance will increase by ${formatCurrency(Math.abs(amountDiff))}`
                    : 'Amount unchanged'}
                </p>
              </div>
              {tx.fromAccountId !== accountId && amountDiff !== 0 && (
                <p className={`text-xs ${
                  amountDiff > 0 || tx.fromAccountId !== accountId
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  + Amount difference: {amountDiff > 0 ? '+' : ''}{formatCurrency(amountDiff)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary py-3">
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Confirm</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SUCCESS ── */}
      {step === 3 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 font-poppins">Transaction Updated</p>
          <p className="text-sm text-gray-400 font-inter mt-1">Changes applied successfully</p>
        </div>
      )}
    </Modal>
  );
}
