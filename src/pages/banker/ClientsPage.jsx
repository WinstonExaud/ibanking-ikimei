import { useEffect, useState } from 'react';
import { UserPlus, Search, User } from 'lucide-react';
import CreateClientModal from '../../components/ui/CreateClientModal';
import TransferModal from '../../components/ui/TransferModal';
import { onUsersSnapshot, onAccountsSnapshot } from '../../services/bankingService';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ClientsPage() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const unsubs = [
      onUsersSnapshot(data => { setUsers(data); setLoading(false); }),
      onAccountsSnapshot(setAccounts),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  const clients = users.filter(u => u.role === 'client').filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-poppins">Clients</h2>
          <p className="text-sm text-gray-400 font-inter mt-0.5">{clients.length} active clients</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search clients by name or email..."
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-surface-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-gray-300" />
          </div>
          <p className="font-poppins font-semibold text-gray-600">No clients yet</p>
          <p className="text-sm text-gray-400 font-inter mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <div className="card">
          <div className="divide-y divide-surface-border/60">
            {clients.map(client => (
              <div key={client.id} className="flex items-center gap-4 py-4 px-1 hover:bg-surface-bg rounded-xl transition-colors group">
                <div className="w-11 h-11 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-500 font-poppins">
                    {client.name?.[0]?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 font-poppins">{client.name}</p>
                  <p className="text-xs text-gray-400 font-inter">{client.email}</p>
                  {client.accountId && (
                    <p className="text-xs text-gray-300 font-mono mt-0.5">{client.accountId}</p>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 font-poppins">{formatCurrency(client.balance || 0)}</p>
                  <p className="text-xs text-gray-400 font-inter">Balance</p>
                </div>
                <button
                  onClick={() => { setSelectedClient(client); setTransferOpen(true); }}
                  className="btn-primary text-xs py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => { setTransferOpen(false); setSelectedClient(null); }}
        accounts={accounts}
        clients={clients}
      />
    </div>
  );
}
