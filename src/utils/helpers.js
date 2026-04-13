export const formatCurrency = (amount, currency = 'TZS') => {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} 0`;
  return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

export const generateAccountId = () =>
  'IKM' + Math.random().toString(36).substr(2, 6).toUpperCase();

export const getAccountColor = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('cement')) return '#EA580C';
  if (lower.includes('pozzolana')) return '#64748B';
  return '#2563EB';
};

export const getMonthlyData = (transactions = []) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map(name => ({ name, income: 0, expense: 0 }));
  transactions.forEach(tx => {
    const amt = parseFloat(tx.amount);
    if (isNaN(amt)) return;
    const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
    const month = date.getMonth();
    if (tx.type === 'deposit') data[month].income += amt;
    else if (tx.type === 'transfer') data[month].expense += amt;
  });
  return data;
};