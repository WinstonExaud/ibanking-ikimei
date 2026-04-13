import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import TransactionRow from '../../components/ui/TransactionRow';
import ReceiptModal from '../../components/ui/ReceiptModal';
import {
  onTransactionsSnapshot, onAccountsSnapshot, onUsersSnapshot
} from '../../services/bankingService';
import { formatCurrency } from '../../utils/helpers';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [receiptTx, setReceiptTx] = useState(null);

  useEffect(() => {
    const unsubs = [
      onTransactionsSnapshot(data => { setTransactions(data); setLoading(false); }),
      onAccountsSnapshot(setAccounts),
      onUsersSnapshot(setUsers),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  const filtered = transactions.filter(tx => {
    const acc = accounts.find(a => a.id === tx.fromAccountId);
    const user = users.find(u => u.id === tx.toUserId);
    const matchSearch = !search ||
      acc?.name?.toLowerCase().includes(search.toLowerCase()) ||
      user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.note?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || tx.type === filter;
    return matchSearch && matchFilter;
  });

  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalTransfers = transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 font-poppins">Transactions</h2>
        <p className="text-sm text-gray-400 font-inter mt-0.5">{transactions.length} total transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-gray-500 font-inter">Total Deposits</p>
          <p className="text-xl font-bold text-green-600 font-poppins mt-1">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 font-inter">Total Transfers</p>
          <p className="text-xl font-bold text-primary-500 font-poppins mt-1">{formatCurrency(totalTransfers)}</p>
        </div>
        <div className="card col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 font-inter">Transaction Count</p>
          <p className="text-xl font-bold text-gray-900 font-poppins mt-1">{transactions.length}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by account, client, note..."
            />
          </div>
          <div className="flex gap-2">
            {['all', 'deposit', 'transfer'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold font-inter transition-all capitalize ${
                  filter === f
                    ? 'bg-primary-500 text-white shadow-blue'
                    : 'bg-surface-bg text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-inter text-sm">No transactions found</p>
          </div>
        ) : (
          <div>
            {filtered.map(tx => (
              <div key={tx.id} onClick={() => setReceiptTx(tx)} className="cursor-pointer border-b border-surface-border/60 last:border-0">
                <TransactionRow tx={tx} accounts={accounts} users={users} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ReceiptModal open={!!receiptTx} onClose={() => setReceiptTx(null)} tx={receiptTx} accounts={accounts} users={users} />
    </div>
  );
}
