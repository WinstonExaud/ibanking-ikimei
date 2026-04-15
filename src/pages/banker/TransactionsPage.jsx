import { useEffect, useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  ArrowUpRight, Plus, Download, RotateCcw
} from 'lucide-react';
import TransactionRow from '../../components/ui/TransactionRow';
import ReceiptModal from '../../components/ui/ReceiptModal';
import EditTransactionModal from '../../components/ui/EditTransactionModal';
import {
  onTransactionsSnapshot, onAccountsSnapshot, onUsersSnapshot
} from '../../services/bankingService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

// ── Date range presets ────────────────────────────────────────────────────────
function getPresetRange(preset) {
  const now = new Date();
  const start = new Date();
  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return { from: start, to: now };
    case 'yesterday': {
      const y = new Date(); y.setDate(y.getDate() - 1); y.setHours(0,0,0,0);
      const ye = new Date(y); ye.setHours(23,59,59,999);
      return { from: y, to: ye };
    }
    case '7d':
      start.setDate(start.getDate() - 7);
      return { from: start, to: now };
    case '30d':
      start.setDate(start.getDate() - 30);
      return { from: start, to: now };
    case 'month': {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: m, to: now };
    }
    case 'last_month': {
      const lms = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lme = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: lms, to: lme };
    }
    default: return { from: null, to: null };
  }
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function Pill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold font-inter px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900 transition-colors">
        <X size={11} />
      </button>
    </span>
  );
}

// ── Select dropdown ───────────────────────────────────────────────────────────
function Select({ value, onChange, children, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field appearance-none pr-9 text-sm"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts,     setAccounts]     = useState([]);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [receiptTx,    setReceiptTx]    = useState(null);
  const [editTx,       setEditTx]       = useState(null);
  const [showFilters,  setShowFilters]  = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');       // deposit | transfer | ''
  const [accountFilter, setAccountFilter] = useState('');   // account doc id
  const [clientFilter,  setClientFilter]  = useState('');   // user doc id
  const [datePreset,  setDatePreset]  = useState('');       // today|7d|30d|month|last_month
  const [dateFrom,    setDateFrom]    = useState('');       // YYYY-MM-DD
  const [dateTo,      setDateTo]      = useState('');
  const [minAmount,   setMinAmount]   = useState('');
  const [maxAmount,   setMaxAmount]   = useState('');
  const [sortBy,      setSortBy]      = useState('newest'); // newest|oldest|highest|lowest

  useEffect(() => {
    const unsubs = [
      onTransactionsSnapshot(data => { setTransactions(data); setLoading(false); }),
      onAccountsSnapshot(setAccounts),
      onUsersSnapshot(setUsers),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  // Apply date preset → fills dateFrom / dateTo
  useEffect(() => {
    if (!datePreset) return;
    const { from, to } = getPresetRange(datePreset);
    if (from) setDateFrom(from.toISOString().split('T')[0]);
    if (to)   setDateTo(to.toISOString().split('T')[0]);
  }, [datePreset]);

  const clients = useMemo(() => users.filter(u => u.role === 'client'), [users]);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...transactions];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tx => {
        const accName  = (tx.fromAccountName || accounts.find(a => a.id === tx.fromAccountId)?.name || '').toLowerCase();
        const clientNm = (tx.toClientName    || users.find(u => u.id === tx.toUserId)?.name           || '').toLowerCase();
        const note     = (tx.note || '').toLowerCase();
        return accName.includes(q) || clientNm.includes(q) || note.includes(q);
      });
    }

    // Type
    if (typeFilter) list = list.filter(tx => tx.type === typeFilter);

    // Account
    if (accountFilter) list = list.filter(tx => tx.fromAccountId === accountFilter);

    // Client
    if (clientFilter) list = list.filter(tx => tx.toUserId === clientFilter);

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter(tx => {
        const d = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
        return d >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(tx => {
        const d = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
        return d <= to;
      });
    }

    // Amount range
    if (minAmount) list = list.filter(tx => safeNum(tx.amount) >= safeNum(minAmount));
    if (maxAmount) list = list.filter(tx => safeNum(tx.amount) <= safeNum(maxAmount));

    // Sort
    list.sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      switch (sortBy) {
        case 'oldest':  return aDate - bDate;
        case 'highest': return safeNum(b.amount) - safeNum(a.amount);
        case 'lowest':  return safeNum(a.amount) - safeNum(b.amount);
        default:        return bDate - aDate; // newest
      }
    });

    return list;
  }, [transactions, accounts, users, search, typeFilter, accountFilter, clientFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilters = [typeFilter, accountFilter, clientFilter, dateFrom || dateTo, minAmount || maxAmount]
    .filter(Boolean).length;

  const resetAll = () => {
    setSearch(''); setTypeFilter(''); setAccountFilter(''); setClientFilter('');
    setDatePreset(''); setDateFrom(''); setDateTo('');
    setMinAmount(''); setMaxAmount(''); setSortBy('newest');
  };

  // ── Summary stats (on filtered set) ──────────────────────────────────────
  const filteredDeposits  = filtered.filter(t => t.type === 'deposit').reduce((s, t) => s + safeNum(t.amount), 0);
  const filteredTransfers = filtered.filter(t => t.type === 'transfer').reduce((s, t) => s + safeNum(t.amount), 0);
  const allDeposits  = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + safeNum(t.amount), 0);
  const allTransfers = transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + safeNum(t.amount), 0);

  const isFiltering = filtered.length !== transactions.length;

  // ── Export to CSV ─────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Date', 'Type', 'From Account', 'To Client', 'Amount (TZS)', 'Note', 'Status'],
      ...filtered.map(tx => [
        formatDate(tx.createdAt),
        tx.type,
        tx.fromAccountName || accounts.find(a => a.id === tx.fromAccountId)?.name || '',
        tx.toClientName    || users.find(u => u.id === tx.toUserId)?.name           || '',
        safeNum(tx.amount),
        tx.note || '',
        tx.status || 'completed',
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = `ikimei-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 lg:p-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-poppins">Transactions</h2>
          <p className="text-sm text-gray-400 font-inter mt-0.5">
            {isFiltering
              ? `${filtered.length} of ${transactions.length} transactions`
              : `${transactions.length} total transactions`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary flex items-center gap-2 text-sm py-2.5"
          title="Export filtered results to CSV"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Summary cards — reflect current filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-gray-400 font-inter mb-1">Deposits {isFiltering && <span className="text-primary-400">(filtered)</span>}</p>
          <p className="text-lg font-bold text-green-600 font-poppins">{formatCurrency(filteredDeposits)}</p>
          {isFiltering && <p className="text-[11px] text-gray-300 font-inter mt-0.5">Total: {formatCurrency(allDeposits)}</p>}
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-inter mb-1">Transfers {isFiltering && <span className="text-primary-400">(filtered)</span>}</p>
          <p className="text-lg font-bold text-primary-500 font-poppins">{formatCurrency(filteredTransfers)}</p>
          {isFiltering && <p className="text-[11px] text-gray-300 font-inter mt-0.5">Total: {formatCurrency(allTransfers)}</p>}
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-inter mb-1">Count</p>
          <p className="text-lg font-bold text-gray-900 font-poppins">{filtered.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-inter mb-1">Net Flow</p>
          <p className="text-lg font-bold text-gray-900 font-poppins">
            {formatCurrency(filteredDeposits - filteredTransfers)}
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
              placeholder="Search account, client, note..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select value={sortBy} onChange={setSortBy} placeholder="Sort">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </Select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold font-inter border transition-all ${
              showFilters || activeFilters > 0
                ? 'bg-primary-500 text-white border-primary-500 shadow-blue'
                : 'bg-white text-gray-600 border-surface-border hover:bg-surface-bg'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="bg-white text-primary-600 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Reset */}
          {(activeFilters > 0 || search) && (
            <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-inter">
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">

            {/* Type */}
            <div>
              <label className="label text-xs">Transaction Type</label>
              <Select value={typeFilter} onChange={setTypeFilter} placeholder="All types">
                <option value="deposit">Deposit</option>
                <option value="transfer">Transfer</option>
              </Select>
            </div>

            {/* Account */}
            <div>
              <label className="label text-xs">From Account</label>
              <Select value={accountFilter} onChange={setAccountFilter} placeholder="All accounts">
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </div>

            {/* Client */}
            <div>
              <label className="label text-xs">To Client</label>
              <Select value={clientFilter} onChange={setClientFilter} placeholder="All clients">
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

            {/* Date preset */}
            <div>
              <label className="label text-xs">Date Range (Quick)</label>
              <Select value={datePreset} onChange={v => { setDatePreset(v); }} placeholder="Pick a range">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="month">This month</option>
                <option value="last_month">Last month</option>
              </Select>
            </div>

            {/* Date from */}
            <div>
              <label className="label text-xs">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setDatePreset(''); }}
                className="input-field text-sm"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="label text-xs">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setDatePreset(''); }}
                className="input-field text-sm"
              />
            </div>

            {/* Min amount */}
            <div>
              <label className="label text-xs">Min Amount (TZS)</label>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                className="input-field text-sm"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Max amount */}
            <div>
              <label className="label text-xs">Max Amount (TZS)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                className="input-field text-sm"
                placeholder="No limit"
                min="0"
              />
            </div>

          </div>
        )}

        {/* Active filter pills */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-border/60">
            {typeFilter && (
              <Pill label={`Type: ${typeFilter}`} onRemove={() => setTypeFilter('')} />
            )}
            {accountFilter && (
              <Pill
                label={`Account: ${accounts.find(a => a.id === accountFilter)?.name || accountFilter}`}
                onRemove={() => setAccountFilter('')}
              />
            )}
            {clientFilter && (
              <Pill
                label={`Client: ${clients.find(c => c.id === clientFilter)?.name || clientFilter}`}
                onRemove={() => setClientFilter('')}
              />
            )}
            {(dateFrom || dateTo) && (
              <Pill
                label={`Date: ${dateFrom || '…'} → ${dateTo || '…'}`}
                onRemove={() => { setDateFrom(''); setDateTo(''); setDatePreset(''); }}
              />
            )}
            {minAmount && (
              <Pill label={`Min: ${formatCurrency(minAmount)}`} onRemove={() => setMinAmount('')} />
            )}
            {maxAmount && (
              <Pill label={`Max: ${formatCurrency(maxAmount)}`} onRemove={() => setMaxAmount('')} />
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <div className="w-14 h-14 bg-surface-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search size={22} className="opacity-40" />
            </div>
            <p className="font-poppins font-semibold text-gray-600 text-sm">No transactions found</p>
            <p className="text-xs font-inter mt-1">Try adjusting your filters</p>
            {activeFilters > 0 && (
              <button onClick={resetAll} className="mt-3 text-xs text-primary-500 font-semibold font-inter hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Group by date */}
            <GroupedList
              transactions={filtered}
              accounts={accounts}
              users={users}
              onRowClick={setReceiptTx}
              onEdit={setEditTx}
            />
            <p className="text-center text-xs text-gray-300 font-inter pt-4 border-t border-surface-border/60 mt-2">
              Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      <ReceiptModal
        open={!!receiptTx}
        onClose={() => setReceiptTx(null)}
        tx={receiptTx}
        accounts={accounts}
        users={users}
      />
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
    </div>
  );
}

// ── Grouped by date ───────────────────────────────────────────────────────────
function GroupedList({ transactions, accounts, users, onRowClick, onEdit }) {
  const groups = useMemo(() => {
    const map = new Map();
    transactions.forEach(tx => {
      const d = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || 0);
      const key = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    });
    return [...map.entries()];
  }, [transactions]);

  return (
    <div className="space-y-5">
      {groups.map(([date, txs]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-semibold text-gray-400 font-poppins uppercase tracking-wide whitespace-nowrap">
              {date}
            </p>
            <div className="flex-1 h-px bg-surface-border/60" />
            <span className="text-xs text-gray-300 font-inter whitespace-nowrap">
              {formatCurrency(txs.reduce((s, t) => s + safeNum(t.amount), 0))}
            </span>
          </div>
          {txs.map(tx => (
            <div key={tx.id} onClick={() => onRowClick(tx)} className="cursor-pointer border-b border-surface-border/40 last:border-0">
              <TransactionRow tx={tx} accounts={accounts} users={users} onEdit={onEdit} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}