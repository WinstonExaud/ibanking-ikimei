import { useState } from 'react';
import Modal from './Modal';
import { depositToAccount } from '../../services/bankingService';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function DepositModal({ open, onClose, accounts, onSuccess }) {
  const [step, setStep] = useState(1); // 1=form, 2=receipt
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const { addToast } = useToast();

  const selectedAccount = accounts.find(a => a.id === accountId);

  const reset = () => {
    setStep(1); setAccountId(''); setAmount(''); setNote(''); setReceipt(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!accountId) { addToast({ type: 'error', title: 'Select an account' }); return; }
    if (!num || num <= 0) { addToast({ type: 'error', title: 'Enter a valid amount' }); return; }
    setLoading(true);
    try {
      await depositToAccount(accountId, num, note);
      const now = new Date();
      setReceipt({
        accountName: selectedAccount?.name,
        amount: num,
        note,
        date: now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      addToast({ type: 'success', title: 'Deposit successful!', message: `${formatCurrency(num)} deposited to ${selectedAccount?.name}` });
      onSuccess?.();
      setStep(2);
    } catch (err) {
      addToast({ type: 'error', title: 'Deposit failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={step === 2 ? 'Deposit Receipt' : 'Deposit Money'}>

      {/* ── STEP 1: FORM ── */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Select Account</label>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-field" required>
              <option value="">Choose account...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance || 0)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (TZS)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field"
              placeholder="0"
              min="1"
              step="1"
              required
            />
          </div>

          <div>
            <label className="label">Note <span className="text-gray-300">(optional)</span></label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
              placeholder="Reason for deposit..."
            />
          </div>

          {accountId && amount && parseFloat(amount) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-green-700 font-poppins mb-1">Deposit Preview</p>
              <p className="text-lg font-bold text-green-800 font-poppins">+ {formatCurrency(parseFloat(amount))}</p>
              <p className="text-xs text-green-600 font-inter">→ {selectedAccount?.name}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><PlusCircle size={18} /><span>Confirm Deposit</span></>
            }
          </button>
        </form>
      )}

      {/* ── STEP 2: RECEIPT ── */}
      {step === 2 && receipt && (
        <div className="space-y-5">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={34} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 font-poppins">Deposit Complete</p>
            <p className="text-sm text-gray-400 font-inter mt-0.5">Funds added successfully</p>
          </div>

          <div className="bg-surface-bg rounded-2xl p-5 space-y-3">
            <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4">
              <p className="text-3xl font-bold text-green-600 font-poppins">+{formatCurrency(receipt.amount)}</p>
            </div>
            {[
              { label: 'Account', value: receipt.accountName },
              { label: 'Status', value: 'Completed ✓', cls: 'text-green-600' },
              { label: 'Date', value: receipt.date },
              { label: 'Time', value: receipt.time },
              receipt.note && { label: 'Note', value: receipt.note },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400 font-inter">{row.label}</span>
                <span className={`font-semibold font-poppins text-gray-800 ${row.cls || ''}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset} className="btn-secondary py-3">New Deposit</button>
            <button onClick={() => { onClose(); reset(); }} className="btn-primary py-3">Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
}