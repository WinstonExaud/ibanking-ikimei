import { useEffect, useState } from 'react';
import {
  LogOut, Wallet, ArrowDownLeft, Clock, RefreshCw, ArrowUpRight,
  Building2, TrendingUp, Home, Menu, X, ChevronRight, Bell, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  logoutUser, getUserTransactions, onTransactionsSnapshot,
  onAccountsSnapshot
} from '../services/bankingService';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import BankCard from '../components/cards/BankCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import logo from '../assets/ikm-logobg.png'

const safeBalance = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

const NAV_ITEMS = [
  { icon: Home,       label: 'Overview',     id: 'overview'     },
  { icon: Clock,      label: 'Transactions', id: 'transactions' },
  { icon: TrendingUp, label: 'Activity',     id: 'activity'     },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, userDoc, isAccount, onLogout, open, setOpen,
  linkedAccounts, selectedAccountId, setSelectedAccountId }) {

  const [accountsOpen, setAccountsOpen] = useState(false);
  const selectedAcc = linkedAccounts.find(a => a.id === selectedAccountId) || linkedAccounts[0];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col w-64 bg-white border-r border-surface-border
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center px-5 py-5 border-b border-surface-border">
  
  <img
    src={logo}
    alt="iKIMEI Logo"
    className="h-24 w-auto object-contain"
  />

  <button
    onClick={() => setOpen(false)}
    className="ml-auto lg:hidden text-gray-400 hover:text-gray-700"
  >
    <X size={18} />
  </button>

</div>
        {/* User profile pill */}
        <div className="mx-4 mt-4 p-3 bg-surface-bg rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-bold text-sm font-poppins">
              {userDoc?.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{userDoc?.name || 'User'}</p>
            <p className="text-[11px] text-gray-400 font-inter truncate">{userDoc?.accountId || '—'}</p>
          </div>
        </div>

        {/* Account switcher — only when multiple accounts */}
        {isAccount && linkedAccounts.length > 1 && (
          <div className="mx-4 mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-1.5 font-inter">
              Active Account
            </p>
            <button
              onClick={() => setAccountsOpen(!accountsOpen)}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-surface-border hover:bg-surface-bg transition-all text-left"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-poppins"
                style={{
                  backgroundColor: `${selectedAcc?.color || '#2563EB'}22`,
                  color: selectedAcc?.color || '#2563EB',
                }}
              >
                {selectedAcc?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 font-poppins truncate">
                  {selectedAcc?.name || 'Select account'}
                </p>
                <p className="text-[10px] text-gray-400 font-inter">
                  {formatCurrency(safeBalance(selectedAcc?.balance))}
                </p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${accountsOpen ? 'rotate-180' : ''}`} />
            </button>

            {accountsOpen && (
              <div className="mt-1 bg-white border border-surface-border rounded-xl shadow-lg overflow-hidden z-50">
                {linkedAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setSelectedAccountId(acc.id); setAccountsOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-bg transition-colors
                      ${acc.id === selectedAccountId ? 'bg-primary-50' : ''}`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-poppins"
                      style={{ backgroundColor: `${acc.color || '#2563EB'}22`, color: acc.color || '#2563EB' }}
                    >
                      {acc.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 font-poppins truncate">{acc.name}</p>
                      <p className="text-[10px] text-gray-400 font-inter">{formatCurrency(safeBalance(acc.balance))}</p>
                    </div>
                    {acc.id === selectedAccountId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 mt-5 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2 font-inter">Menu</p>
          {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => { setActive(id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all font-inter text-sm font-medium
                  ${isActive ? 'bg-primary-500 text-white shadow-blue' : 'text-gray-500 hover:bg-surface-bg hover:text-gray-800'}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-5 space-y-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-[11px] text-blue-600 font-inter leading-snug">
              🔒 View-only — Contact your banker to make transactions
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-inter font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ active, onMenuClick, onRefresh, selectedAcc }) {
  const titles = { overview: 'Overview', transactions: 'Transaction History', activity: 'Monthly Activity' };
  return (
    <header className="bg-white border-b border-surface-border px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-bg text-gray-500">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 font-poppins">{titles[active]}</h1>
          {selectedAcc && (
            <p className="text-[11px] text-gray-400 font-inter hidden sm:block">{selectedAcc.name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-bg text-gray-400 hover:text-gray-700 transition-all">
          <RefreshCw size={17} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-bg text-gray-400 hover:text-gray-700 transition-all relative">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full" />
        </button>
      </div>
    </header>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, iconBg, iconColor, currency = true, loading }) {
  return (
    <div className="card py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-inter font-medium">{title}</p>
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      {loading
        ? <div className="skeleton h-7 w-28 rounded-lg" />
        : <p className="text-xl font-bold text-gray-900 font-poppins">
            {currency ? formatCurrency(value) : value}
          </p>
      }
    </div>
  );
}

// ─── All Accounts Summary ─────────────────────────────────────────────────────
function AccountSummaryRow({ accounts, selectedAccountId, onSelect }) {
  if (accounts.length <= 1) return null;
  const total = accounts.reduce((s, a) => s + safeBalance(a.balance), 0);
  return (
    <div className="card mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={16} className="text-gray-400" />
        <h3 className="text-base font-semibold text-gray-900 font-poppins">All Accounts</h3>
        <span className="ml-auto text-xs bg-surface-bg text-gray-500 px-2.5 py-1 rounded-full font-inter">
          {accounts.length} accounts
        </span>
      </div>
      <div className="space-y-2">
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => onSelect(acc.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
              ${acc.id === selectedAccountId
                ? 'bg-primary-50 border border-primary-200'
                : 'hover:bg-surface-bg border border-transparent'}`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm font-poppins"
              style={{ backgroundColor: `${acc.color || '#2563EB'}22`, color: acc.color || '#2563EB' }}
            >
              {acc.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{acc.name}</p>
              <p className="text-xs text-gray-400 font-inter">Business Account</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900 font-poppins">{formatCurrency(safeBalance(acc.balance))}</p>
              {acc.id === selectedAccountId && (
                <span className="text-[10px] text-primary-500 font-inter font-semibold">Viewing</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
        <span className="text-xs text-gray-400 font-inter">Total across all accounts</span>
        <span className="text-sm font-bold text-gray-900 font-poppins">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [transactions,      setTransactions]      = useState([]);
  const [allAccounts,       setAllAccounts]        = useState([]);
  const [loading,           setLoading]            = useState(true);
  const [active,            setActive]             = useState('overview');
  const [sidebarOpen,       setSidebarOpen]        = useState(false);
  const [chartWidth,        setChartWidth]         = useState(500);
  const [selectedAccountId, setSelectedAccountId]  = useState(null);

  const isAccount = userDoc?.role === 'account';
  const isClient  = userDoc?.role === 'client';

  // Support both old single-string format and new array format
  const accountDocIds = isAccount
    ? (Array.isArray(userDoc?.accountDocIds)
        ? userDoc.accountDocIds
        : userDoc?.accountDocId
          ? [userDoc.accountDocId]
          : [])
    : [];

  // Filter allAccounts to only James's linked accounts
  const linkedAccounts = allAccounts.filter(a => accountDocIds.includes(a.id));

  // Currently selected account object
  const selectedAccount = linkedAccounts.find(a => a.id === selectedAccountId) || linkedAccounts[0] || null;

  // Auto-select first account once accounts load
  useEffect(() => {
    if (linkedAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(linkedAccounts[0].id);
    }
  }, [linkedAccounts.length]);

  // Chart resize observer
  useEffect(() => {
    const el = document.getElementById('chart-wrap');
    if (!el) return;
    const ro = new ResizeObserver(e => setChartWidth(e[0].contentRect.width || 500));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  useEffect(() => {
    if (!user || !userDoc) return;
    if (isAccount) {
      const u1 = onAccountsSnapshot(docs => setAllAccounts(docs));
      const u2 = onTransactionsSnapshot(txs => {
        // Fetch txns for ALL of James's accounts
        const mine = txs.filter(t =>
          accountDocIds.includes(t.fromAccountId) ||
          accountDocIds.includes(t.toAccountId)
        );
        mine.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setTransactions(mine);
        setLoading(false);
      });
      return () => { u1(); u2(); };
    } else {
      getUserTransactions(user.uid).then(txs => {
        setTransactions(txs);
        setLoading(false);
      });
    }
  }, [user, userDoc]);

  const handleLogout = async () => {
    await logoutUser();
    addToast({ type: 'info', title: 'Signed out', message: 'See you soon!' });
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshUserDoc();
    if (isClient) {
      const txs = await getUserTransactions(user.uid);
      setTransactions(txs);
    }
    addToast({ type: 'info', title: 'Refreshed' });
  };

  // Stats scoped to selected account
  const balance = isAccount ? safeBalance(selectedAccount?.balance) : safeBalance(userDoc?.balance);
  const limit   = isAccount ? safeBalance(selectedAccount?.limit)   : null;

  const selectedTxs = isAccount
    ? transactions.filter(t =>
        t.fromAccountId === selectedAccount?.id ||
        t.toAccountId   === selectedAccount?.id
      )
    : transactions;

  const totalSent = isAccount
    ? selectedTxs.filter(t => t.type === 'transfer' && t.fromAccountId === selectedAccount?.id)
                 .reduce((s, t) => s + safeBalance(t.amount), 0)
    : null;

  const totalDeposited = isAccount
    ? selectedTxs.filter(t => t.type === 'deposit').reduce((s, t) => s + safeBalance(t.amount), 0)
    : null;

  const totalReceived = isClient
    ? transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + safeBalance(t.amount), 0)
    : null;

  const limitUsedPct = limit ? Math.min(100, (totalSent / limit) * 100) : 0;

  const cardAccount = isAccount
    ? { name: selectedAccount?.name || userDoc?.name, balance, accountId: userDoc?.accountId, color: selectedAccount?.color || '#2563EB' }
    : { name: userDoc?.name, balance, accountId: userDoc?.accountId, color: '#2563EB' };

  const chartData = buildMonthlyChart(selectedTxs);
  const recentTx  = selectedTxs.slice(0, 8);

  return (
    <div className="flex h-screen bg-surface-bg overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        userDoc={userDoc}
        isAccount={isAccount}
        onLogout={handleLogout}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        linkedAccounts={linkedAccounts}
        selectedAccountId={selectedAccount?.id}
        setSelectedAccountId={setSelectedAccountId}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          active={active}
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          selectedAcc={isAccount ? selectedAccount : null}
        />

        <main className="flex-1 overflow-y-auto p-5 lg:p-6">

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {active === 'overview' && (
            <div className="animate-fade-in max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                  {isAccount ? <><Building2 className="inline mb-1" size={22} /> </> : '👋 '}
                  {userDoc?.name?.split(' ')[0] || 'Welcome'}
                </h2>
                <p className="text-gray-400 font-inter text-sm mt-0.5">
                  {isAccount
                    ? `Viewing: ${selectedAccount?.name || '—'}`
                    : 'Your personal balance overview'}
                </p>
              </div>

              {/* Multi-account summary */}
              <AccountSummaryRow
                accounts={linkedAccounts}
                selectedAccountId={selectedAccount?.id}
                onSelect={setSelectedAccountId}
              />

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Current Balance"  value={balance}            icon={Wallet}        iconBg="bg-blue-100"   iconColor="text-blue-600"   loading={loading} />
                {isAccount && <StatCard title="Total Sent"      value={totalSent}      icon={ArrowUpRight}  iconBg="bg-red-100"    iconColor="text-red-500"    loading={loading} />}
                {isAccount && <StatCard title="Total Deposited" value={totalDeposited} icon={ArrowDownLeft} iconBg="bg-green-100"  iconColor="text-green-600"  loading={loading} />}
                {isClient  && <StatCard title="Total Received"  value={totalReceived}  icon={ArrowDownLeft} iconBg="bg-green-100"  iconColor="text-green-600"  loading={loading} />}
                <StatCard title="Transactions" value={selectedTxs.length} icon={Clock} iconBg="bg-purple-100" iconColor="text-purple-500" loading={loading} currency={false} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2 flex flex-col gap-5">
                  {chartData.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900 font-poppins">Monthly Activity</h3>
                        <span className="text-xs text-gray-400 font-inter">Last 6 months</span>
                      </div>
                      <div id="chart-wrap" style={{ width: '100%' }}>
                        <BarChart width={chartWidth} height={180} data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                            tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                          <Tooltip formatter={v => [formatCurrency(v), '']} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12 }} cursor={{ fill: '#F3F4F6' }} />
                          <Bar dataKey="amount" radius={[6,6,0,0]} maxBarSize={40}>
                            {chartData.map((_, i) => <Cell key={i} fill={i === chartData.length - 1 ? '#2563EB' : '#BFDBFE'} />)}
                          </Bar>
                        </BarChart>
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900 font-poppins">Recent Transactions</h3>
                      <button onClick={() => setActive('transactions')} className="text-xs text-primary-500 font-semibold font-inter hover:underline">See all</button>
                    </div>
                    {loading ? (
                      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
                    ) : recentTx.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Clock size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="font-inter text-sm">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-surface-border/60">
                        {recentTx.map(tx => (
                          <TxRow key={tx.id} tx={tx} isAccount={isAccount} myAccountDocId={selectedAccount?.id} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900 font-poppins">
                        {isAccount ? 'Account Card' : 'My Card'}
                      </h3>
                    </div>
                    <BankCard account={cardAccount} userName={userDoc?.name} />
                  </div>

                  {isAccount && limit > 0 && (
                    <div className="card">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-gray-400" />
                        <h3 className="text-base font-semibold text-gray-900 font-poppins">Spending Limit</h3>
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 font-poppins">{formatCurrency(limit)}</p>
                          <p className="text-xs text-gray-400 font-inter mt-0.5">Total limit</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold font-poppins ${limitUsedPct > 80 ? 'text-red-500' : 'text-amber-500'}`}>
                            {limitUsedPct.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-400 font-inter">used</p>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 mb-2">
                        <div className={`h-2 rounded-full transition-all ${limitUsedPct > 80 ? 'bg-red-500' : 'bg-amber-400'}`}
                          style={{ width: `${limitUsedPct}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 font-inter text-right">
                        {formatCurrency(Math.max(0, limit - totalSent))} remaining
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ──────────────────────────────────── */}
          {active === 'transactions' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              {/* Account filter tabs */}
              {isAccount && linkedAccounts.length > 1 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {linkedAccounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-inter transition-all
                        ${acc.id === selectedAccount?.id
                          ? 'bg-primary-500 text-white shadow-blue'
                          : 'bg-white text-gray-500 border border-surface-border hover:border-primary-300'}`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: acc.color || '#2563EB' }} />
                      {acc.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900 font-poppins">All Transactions</h3>
                  </div>
                  <span className="text-xs bg-surface-bg text-gray-500 px-3 py-1.5 rounded-full font-inter font-medium">
                    {selectedTxs.length} total
                  </span>
                </div>
                {loading ? (
                  <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
                ) : selectedTxs.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Clock size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="font-inter text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-border/60">
                    {selectedTxs.map(tx => (
                      <TxRow key={tx.id} tx={tx} isAccount={isAccount} myAccountDocId={selectedAccount?.id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACTIVITY ──────────────────────────────────────── */}
          {active === 'activity' && (
            <div className="animate-fade-in max-w-3xl mx-auto space-y-5">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 font-poppins">Monthly Activity</h3>
                  <span className="text-xs text-gray-400 font-inter">Last 6 months · {selectedAccount?.name}</span>
                </div>
                <div id="chart-wrap-activity" style={{ width: '100%' }}>
                  <BarChart width={chartWidth} height={220} data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                    <Tooltip formatter={v => [formatCurrency(v), 'Amount']} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12 }} cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="amount" radius={[6,6,0,0]} maxBarSize={48}>
                      {chartData.map((_, i) => <Cell key={i} fill={i === chartData.length - 1 ? '#2563EB' : '#BFDBFE'} />)}
                    </Bar>
                  </BarChart>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card text-center py-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wallet size={18} className="text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 font-poppins">{formatCurrency(balance)}</p>
                  <p className="text-xs text-gray-400 font-inter mt-1">Current Balance</p>
                </div>
                {isAccount && <>
                  <div className="card text-center py-5">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <ArrowUpRight size={18} className="text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-poppins">{formatCurrency(totalSent)}</p>
                    <p className="text-xs text-gray-400 font-inter mt-1">Total Sent</p>
                  </div>
                  <div className="card text-center py-5">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <ArrowDownLeft size={18} className="text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-poppins">{formatCurrency(totalDeposited)}</p>
                    <p className="text-xs text-gray-400 font-inter mt-1">Total Deposited</p>
                  </div>
                </>}
                {isClient && (
                  <div className="card text-center py-5">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <ArrowDownLeft size={18} className="text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-poppins">{formatCurrency(totalReceived)}</p>
                    <p className="text-xs text-gray-400 font-inter mt-1">Total Received</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="h-6" />
        </main>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildMonthlyChart(transactions) {
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('default', { month: 'short' });
    months[key] = 0;
  }
  transactions.forEach(tx => {
    if (!tx.createdAt?.seconds) return;
    const d   = new Date(tx.createdAt.seconds * 1000);
    const key = d.toLocaleString('default', { month: 'short' });
    if (key in months) months[key] += parseFloat(tx.amount) || 0;
  });
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

function TxRow({ tx, isAccount, myAccountDocId }) {
  const isDeposit  = tx.type === 'deposit';
  const amount     = parseFloat(tx.amount);
  const isOutgoing = isAccount && tx.fromAccountId === myAccountDocId && !isDeposit;

  let label, color, sign;
  if (isAccount) {
    label = isDeposit ? 'Deposit received' : `Sent to ${tx.toClientName || '—'}`;
    color = isOutgoing ? 'text-gray-800' : 'text-green-600';
    sign  = isOutgoing ? '-' : '+';
  } else {
    label = `Received from ${tx.fromAccountName || '—'}`;
    color = 'text-green-600';
    sign  = '+';
  }

  return (
    <div className="flex items-center gap-4 py-3 px-1 hover:bg-surface-bg rounded-xl transition-colors">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${sign === '+' ? 'bg-green-100' : 'bg-blue-100'}`}>
        {sign === '+' ? <ArrowDownLeft size={17} className="text-green-600" /> : <ArrowUpRight size={17} className="text-blue-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{label}</p>
        <p className="text-xs text-gray-400 font-inter">{formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold font-poppins ${color}`}>
          {sign}{formatCurrency(isNaN(amount) ? 0 : amount)}
        </p>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-inter">done</span>
      </div>
    </div>
  );
}