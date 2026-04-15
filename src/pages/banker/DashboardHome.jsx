import { useEffect, useState } from 'react';
import { Wallet, Users, ArrowLeftRight, Building2, Plus, Send } from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import BankCard from '../../components/cards/BankCard';
import AccountCard from '../../components/cards/AccountCard';
import MoneyFlowChart from '../../components/charts/MoneyFlowChart';
import TransactionRow from '../../components/ui/TransactionRow';
import DepositModal from '../../components/ui/DepositModal';
import TransferModal from '../../components/ui/TransferModal';
import EditTransactionModal from '../../components/ui/EditTransactionModal';
import ReceiptModal from '../../components/ui/ReceiptModal';
import {
  onAccountsSnapshot, onTransactionsSnapshot,
  onUsersSnapshot, onSystemSnapshot
} from '../../services/bankingService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';

export default function DashboardHome() {
  const { userDoc } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [system, setSystem] = useState({ totalBalance: 0 });
  const [loading, setLoading] = useState(true);

  const [depositOpen, setDepositOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState(null);
  const [editTx, setEditTx] = useState(null);

  const clients = users.filter(u => u.role === 'client');

  useEffect(() => {
    const unsubs = [
      onAccountsSnapshot(data => { setAccounts(data); setLoading(false); }),
      onTransactionsSnapshot(setTransactions),
      onUsersSnapshot(setUsers),
      onSystemSnapshot(setSystem),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  const totalAccountBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalClientBalance = clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  const recentTx = transactions.slice(0, 8);

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 hidden lg:block">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">
          Hey {userDoc?.name?.split(' ')[0] || 'Banker'} 👋
        </h2>
        <p className="text-gray-400 font-inter text-sm mt-0.5">Welcome to your transaction partner</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => setDepositOpen(true)} className="btn-primary flex items-center gap-2 py-2.5">
          <Plus size={16} />
          <span className="hidden sm:inline">Deposit</span>
        </button>
        <button onClick={() => setTransferOpen(true)} className="btn-secondary flex items-center gap-2 py-2.5">
          <Send size={16} />
          <span className="hidden sm:inline">Send Money</span>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Balance" value={system.totalBalance} icon={Wallet} iconBg="bg-blue-100" loading={loading} />
        <StatCard title="Account Funds" value={totalAccountBalance} icon={Building2} iconBg="bg-orange-100" loading={loading} change={2.5} changeLabel="vs last month" />
        <StatCard title="Client Funds" value={totalClientBalance} icon={Users} iconBg="bg-green-100" loading={loading} />
        <StatCard title="Transactions" value={transactions.length} icon={ArrowLeftRight} iconBg="bg-purple-100" currency={false} loading={loading} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left — Chart + Recent Transactions */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <MoneyFlowChart transactions={transactions} loading={loading} />

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 font-poppins">Recent Transactions</h3>
              <button className="text-xs text-primary-500 font-semibold font-inter hover:underline">See all</button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : recentTx.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-inter text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border/60">
                {recentTx.map(tx => (
                  <div key={tx.id} onClick={() => setReceiptTx(tx)} className="cursor-pointer">
                    <TransactionRow tx={tx} accounts={accounts} users={users} onEdit={setEditTx} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Card + Account mini-cards */}
        <div className="flex flex-col gap-5">
          {/* Bank Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 font-poppins">Wallet</h3>
              <button className="text-gray-400 hover:text-gray-600">···</button>
            </div>
            <BankCard
              account={accounts[0]}
              userName={userDoc?.name || 'Card Holder'}
            />

            {/* Quick action icons */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[
                { icon: Send, label: 'Send', onClick: () => setTransferOpen(true) },
                { icon: Plus, label: 'Deposit', onClick: () => setDepositOpen(true) },
                { icon: Wallet, label: 'Wallet', onClick: () => {} },
                { icon: Building2, label: 'More', onClick: () => {} },
              ].map(({ icon: Icon, label, onClick }) => (
                <button key={label} onClick={onClick} className="flex flex-col items-center gap-1.5 group">
                  <div className="w-11 h-11 bg-surface-bg rounded-2xl flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-500 text-gray-500 transition-all">
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-inter font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accounts list */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Accounts</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-bg transition-colors cursor-default">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${acc.color || '#2563EB'}22` }}
                    >
                      <span className="font-bold text-sm font-poppins" style={{ color: acc.color || '#2563EB' }}>
                        {acc.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{acc.name}</p>
                      <p className="text-xs text-gray-400 font-inter">{formatCurrency(acc.balance)}</p>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4 font-inter">No accounts yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} accounts={accounts} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} accounts={accounts} clients={clients} />
      <EditTransactionModal
        open={!!editTx}
        onClose={() => setEditTx(null)}
        tx={editTx}
        accounts={accounts}
        users={users}
        onSuccess={() => {
          setEditTx(null);
        }}
      />
      <ReceiptModal open={!!receiptTx} onClose={() => setReceiptTx(null)} tx={receiptTx} accounts={accounts} users={users} />
    </div>
  );
}
