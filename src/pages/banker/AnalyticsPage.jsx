import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { onTransactionsSnapshot, onAccountsSnapshot, onUsersSnapshot } from '../../services/bankingService';
import { getMonthlyData, formatCurrency } from '../../utils/helpers';

const COLORS = ['#2563EB', '#22C55E', '#F97316', '#7C3AED', '#EF4444', '#64748B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-surface-border p-4">
      <p className="text-xs font-semibold text-gray-500 font-poppins mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-bold text-gray-800 font-poppins">
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs = [
      onTransactionsSnapshot(d => { setTransactions(d); setLoading(false); }),
      onAccountsSnapshot(setAccounts),
      onUsersSnapshot(setUsers),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  const monthlyData = getMonthlyData(transactions);
  const totalDeposited = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalTransferred = transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

  // Account distribution pie
  const accountPie = accounts.map((a, i) => ({
    name: a.name,
    value: a.balance || 0,
    color: a.color || COLORS[i % COLORS.length],
  })).filter(a => a.value > 0);

  // Client balance pie
  const clients = users.filter(u => u.role === 'client');
  const clientPie = clients.map((c, i) => ({
    name: c.name,
    value: c.balance || 0,
    color: COLORS[i % COLORS.length],
  })).filter(c => c.value > 0);

  if (loading) {
    return (
      <div className="p-5 lg:p-6">
        <div className="skeleton h-8 w-48 mb-6 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 font-poppins">Analytics</h2>
        <p className="text-sm text-gray-400 font-inter mt-0.5">Financial overview and insights</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Deposited', value: formatCurrency(totalDeposited), color: 'text-green-600' },
          { label: 'Total Transferred', value: formatCurrency(totalTransferred), color: 'text-primary-500' },
          { label: 'Accounts', value: accounts.length, color: 'text-orange-500' },
          { label: 'Clients', value: clients.length, color: 'text-purple-500' },
        ].map(item => (
          <div key={item.label} className="card text-center">
            <p className={`text-2xl font-bold font-poppins ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-400 font-inter mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly deposits bar */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Monthly Deposits</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F7FB' }} />
              <Bar dataKey="income" name="Income" fill="#2563EB" radius={[6,6,0,0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly line */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
              <Line dataKey="income" name="Income" type="monotone" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#2563EB' }} />
              <Line dataKey="expense" name="Expense" type="monotone" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Account Pie */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Account Distribution</h3>
          {accountPie.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={accountPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {accountPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {accountPie.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-inter text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                      {a.name}
                    </span>
                    <span className="font-semibold font-poppins text-gray-800 text-xs">{formatCurrency(a.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 font-inter py-8 text-center">No account data</p>}
        </div>

        {/* Client Pie */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">Client Balances</h3>
          {clientPie.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={clientPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {clientPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {clientPie.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-inter text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold font-poppins text-gray-800 text-xs">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 font-inter py-8 text-center">No client data</p>}
        </div>
      </div>
    </div>
  );
}
