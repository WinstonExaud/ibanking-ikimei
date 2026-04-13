import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { quickTransfer } from '../../services/bankingService';
import { useToast } from '../../context/ToastContext';
import { SendHorizonal, CheckCircle, UserPlus, User, Printer } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

export default function TransferModal({ open, onClose, accounts, clients, onSuccess }) {
  const [step, setStep] = useState(1); // 1=form, 2=review, 3=receipt
  const [accountId, setAccountId] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedClient, setMatchedClient] = useState(null);
  const [receipt, setReceipt] = useState(null); // holds result after success
  const suggestRef = useRef(null);
  const { addToast } = useToast();

  const selectedAccount = accounts.find(a => a.id === accountId);

  useEffect(() => {
    if (!clientName.trim()) { setSuggestions([]); setMatchedClient(null); return; }
    const filtered = clients.filter(c =>
      c.name?.toLowerCase().includes(clientName.toLowerCase())
    );
    setSuggestions(filtered);
    const exact = clients.find(c => c.name?.toLowerCase().trim() === clientName.toLowerCase().trim());
    setMatchedClient(exact || null);
  }, [clientName, clients]);

  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reset = () => {
    setStep(1); setAccountId(''); setClientName('');
    setAmount(''); setNote(''); setMatchedClient(null);
    setSuggestions([]); setReceipt(null);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!accountId) { addToast({ type: 'error', title: 'Select an account' }); return; }
    if (!clientName.trim()) { addToast({ type: 'error', title: 'Enter recipient name' }); return; }
    const num = parseFloat(amount);
    if (!num || num <= 0) { addToast({ type: 'error', title: 'Enter a valid amount' }); return; }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const num = parseFloat(amount);
      const result = await quickTransfer(accountId, clientName.trim(), num, note);
      const now = new Date();
      setReceipt({
        clientName: result.clientName,
        isNew: result.isNew,
        txId: result.txId,
        amount: num,
        fromAccount: selectedAccount?.name,
        note,
        date: now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      addToast({
        type: 'success',
        title: 'Transfer successful!',
        message: result.isNew
          ? `${formatCurrency(num)} sent to ${result.clientName} (new client added)`
          : `${formatCurrency(num)} sent to ${result.clientName}`,
      });
      onSuccess?.();
      setStep(3); // show receipt
    } catch (err) {
      addToast({ type: 'error', title: 'Transfer failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isNewClient = clientName.trim() && !matchedClient;

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={step === 3 ? 'Receipt' : 'Send Money'}>

      {/* ── STEP 1: FORM ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-5">
          <div>
            <label className="label">From Account</label>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-field" required>
              <option value="">Choose source account...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance || 0)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Recipient Name</label>
            <div className="relative" ref={suggestRef}>
              <input
                type="text"
                value={clientName}
                onChange={e => { setClientName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="input-field pr-10"
                placeholder="Type recipient name..."
                autoComplete="off"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {clientName.trim() && (matchedClient
                  ? <User size={16} className="text-green-500" />
                  : <UserPlus size={16} className="text-blue-400" />
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-bg transition-colors text-left"
                      onMouseDown={() => { setClientName(c.name); setMatchedClient(c); setShowSuggestions(false); }}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-500 font-bold text-sm">{c.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(c.balance || 0)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clientName.trim() && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-inter ${matchedClient ? 'text-green-600' : 'text-blue-500'}`}>
                {matchedClient
                  ? <><User size={12} />Existing client — balance will be updated</>
                  : <><UserPlus size={12} />New client — will be created automatically</>
                }
              </div>
            )}
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
            {selectedAccount && (
              <p className="text-xs text-gray-400 font-inter mt-1">
                Available: {formatCurrency(selectedAccount.balance || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="label">Note <span className="text-gray-300">(optional)</span></label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
              placeholder="Payment reason..."
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <SendHorizonal size={18} /><span>Review Transfer</span>
          </button>
        </form>
      )}

      {/* ── STEP 2: REVIEW ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-surface-bg rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-poppins">Confirm Transfer</p>
            <div className="text-center py-3">
              <p className="text-4xl font-bold text-gray-900 font-poppins">{formatCurrency(parseFloat(amount))}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 font-inter">
                <span className="font-semibold text-gray-700">{selectedAccount?.name}</span>
                <span>→</span>
                <span className="font-semibold text-gray-700">{clientName}</span>
              </div>
            </div>
            {isNewClient && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <UserPlus size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-inter">
                  <span className="font-semibold">{clientName}</span> is a new client — they will be added automatically.
                </p>
              </div>
            )}
            {note && <p className="text-xs text-center text-gray-400 font-inter">"{note}"</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary py-3">Back</button>
            <button onClick={handleConfirm} disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle size={18} /><span>Confirm</span></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: RECEIPT ── */}
      {step === 3 && receipt && (
        <div className="space-y-5">
          {/* Success icon */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={34} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 font-poppins">Transfer Complete</p>
            <p className="text-sm text-gray-400 font-inter mt-0.5">Money sent successfully</p>
          </div>

          {/* Receipt card */}
          <div className="bg-surface-bg rounded-2xl p-5 space-y-3">
            <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4">
              <p className="text-3xl font-bold text-gray-900 font-poppins">{formatCurrency(receipt.amount)}</p>
            </div>
            {[
              { label: 'From Account', value: receipt.fromAccount },
              { label: 'Recipient', value: receipt.clientName },
              { label: 'Status', value: 'Completed ✓', cls: 'text-green-600' },
              { label: 'Date', value: receipt.date },
              { label: 'Time', value: receipt.time },
              receipt.note && { label: 'Note', value: receipt.note },
              receipt.isNew && { label: 'Note', value: 'New client created', cls: 'text-blue-500' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400 font-inter">{row.label}</span>
                <span className={`font-semibold font-poppins text-gray-800 ${row.cls || ''}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { reset(); }}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <SendHorizonal size={16} /><span>New Transfer</span>
            </button>
            <button
              onClick={() => { onClose(); reset(); }}
              className="btn-primary py-3"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}