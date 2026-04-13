import { useState } from 'react';
import Modal from '../ui/Modal';
import { createAccount } from '../../services/bankingService';
import { useToast } from '../../context/ToastContext';
import { Building2 } from 'lucide-react';

const COLORS = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Slate', value: '#64748B' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Red', value: '#DC2626' },
];

export default function CreateAccountModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAccount({ name, color });
      addToast({ type: 'success', title: 'Account created!', message: `${name} account is ready` });
      setName(''); setColor('#2563EB');
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Business Account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Account Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="e.g. James Cement, Pozzolana..."
            required
          />
        </div>
        <div>
          <label className="label">Account Color</label>
          <div className="flex gap-3 mt-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-9 h-9 rounded-xl transition-all ${color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-300' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        {name && (
          <div className="rounded-2xl p-4 text-white text-sm font-poppins" style={{ background: color }}>
            <p className="font-bold text-base">{name}</p>
            <p className="text-white/70 text-xs mt-1">TZS 0</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Building2 size={18} /><span>Create Account</span></>
          }
        </button>
      </form>
    </Modal>
  );
}
