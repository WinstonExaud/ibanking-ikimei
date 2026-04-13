import { useState } from 'react';
import Modal from '../ui/Modal';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { createUserDoc } from '../../services/bankingService';
import { generateAccountId } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { UserPlus } from 'lucide-react';

export default function CreateClientModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDoc(cred.user.uid, {
        name,
        email,
        role: 'client',
        accountId: generateAccountId(),
        balance: 0,
      });
      addToast({ type: 'success', title: 'Client created!', message: `${name} can now log in` });
      setName(''); setEmail(''); setPassword('');
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to create client', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Client">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="client@email.com" required />
        </div>
        <div>
          <label className="label">Temporary Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" minLength={6} required />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 font-inter">
          <p className="font-semibold mb-1">ℹ️ Client Access</p>
          <p>The client will be able to log in and view their balance and transaction history. They cannot make transfers.</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><UserPlus size={18} /><span>Create Client</span></>
          }
        </button>
      </form>
    </Modal>
  );
}
