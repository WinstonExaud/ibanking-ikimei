import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AccountCard from '../../components/cards/AccountCard';
import BankCard from '../../components/cards/BankCard';
import CreateAccountModal from '../../components/ui/CreateAccountModal';
import DepositModal from '../../components/ui/DepositModal';
import { onAccountsSnapshot } from '../../services/bankingService';
import { formatCurrency } from '../../utils/helpers';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    return onAccountsSnapshot(data => { setAccounts(data); setLoading(false); });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const handleAccountClick = (acc) => {
    setSelectedAccount(acc);
    setDepositOpen(true);
  };

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-poppins">Business Accounts</h2>
          <p className="text-sm text-gray-400 font-inter mt-0.5">Total: {formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          <span>New Account</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {accounts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-surface-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="opacity-40" />
              </div>
              <p className="font-poppins font-semibold text-gray-600">No accounts yet</p>
              <p className="text-sm font-inter mt-1">Create your first business account</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {accounts.map(acc => (
                <AccountCard key={acc.id} account={acc} onClick={handleAccountClick} />
              ))}
            </div>
          )}

          {/* Visual cards section */}
          {accounts.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Account Cards</h3>
              <div className="flex flex-wrap gap-4">
                {accounts.map(acc => (
                  <BankCard key={acc.id} account={acc} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <DepositModal
        open={depositOpen}
        onClose={() => { setDepositOpen(false); setSelectedAccount(null); }}
        accounts={accounts}
      />
    </div>
  );
}
