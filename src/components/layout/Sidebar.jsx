import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, BarChart3,
  Settings, LogOut, HelpCircle, Users, Building2, X
} from 'lucide-react';
import { logoutUser } from '../../services/bankingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logo from '../../assets/ikm-logo.png';

const bankerLinks = [
  { to: '/banker', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/banker/accounts', label: 'Accounts', icon: Building2 },
  { to: '/banker/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/banker/clients', label: 'Clients', icon: Users },
  { to: '/banker/analytics', label: 'Analytics', icon: BarChart3 },
];

const bankerBottom = [
  { to: '/banker/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { userDoc } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    addToast({ type: 'info', title: 'Signed out', message: 'See you soon!' });
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-border flex flex-col z-40
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen lg:flex
      `}>
        {/* Logo */}
       <div className="flex items-center justify-between px-5 py-5 border-b border-surface-border">
  
  {/* FULL LOGO */}
  <div className="flex items-center">
    <img 
      src={logo} 
      alt="iKIMEI Logo"
      className="h-9 md:h-10 lg:h-24 w-auto"
    />
  </div>

  {/* CLOSE BUTTON */}
  <button 
    onClick={onClose} 
    className="lg:hidden text-gray-400 hover:text-gray-600"
  >
    <X size={20} />
  </button>

</div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3 font-poppins">Main Menu</p>
          <div className="flex flex-col gap-0.5">
            {bankerLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6 font-poppins">Account</p>
          <div className="flex flex-col gap-0.5">
            <NavLink to="/banker/profile" onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-surface-border px-3 py-4 space-y-0.5">
          {bankerBottom.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button className="sidebar-link w-full" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>

        {/* User card */}
        <div className="px-3 pb-4">
          <div className="bg-surface-bg rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm font-poppins">
                {userDoc?.name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{userDoc?.name || 'Banker'}</p>
              <p className="text-xs text-gray-400 font-inter truncate">{userDoc?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
