import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu, Bell, Search, ChevronDown, LogOut, Settings,
  User, Shield, Moon, Sun, X, CheckCircle2, AlertCircle,
  ArrowUpRight, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/bankingService';
import { useToast } from '../../context/ToastContext';

// ─── Avatar: shows photo if available, otherwise stylised initials ────────────
function Avatar({ userDoc, size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  // Build initials from name (max 2 chars)
  const initials = (userDoc?.name || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Role-based gradient so each role has a distinct avatar color
  const gradients = {
    banker:  'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
    account: 'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
    client:  'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
  };
  const gradient = gradients[userDoc?.role] || gradients.banker;

  if (userDoc?.photoURL) {
    return (
      <img
        src={userDoc.photoURL}
        alt={userDoc.name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-md flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0 font-bold font-poppins text-white ring-2 ring-white shadow-md select-none`}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
}

// ─── Notification dot ─────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50',
    title: 'Transfer completed',    body: 'TZS 500,000 sent to James Cement',       time: '2m ago',  unread: true  },
  { id: 2, type: 'info',    icon: ArrowUpRight, color: 'text-blue-500',  bg: 'bg-blue-50',
    title: 'New deposit received',  body: 'Account funded with TZS 2,000,000',      time: '1h ago',  unread: true  },
  { id: 3, type: 'warning', icon: AlertCircle,  color: 'text-amber-500', bg: 'bg-amber-50',
    title: 'Limit threshold',       body: '80% of spending limit reached',           time: '3h ago',  unread: false },
  { id: 4, type: 'info',    icon: Clock,        color: 'text-gray-400',  bg: 'bg-gray-50',
    title: 'Session reminder',      body: 'Your session expires in 30 minutes',      time: '5h ago',  unread: false },
];

// ─── Dropdown wrapper with outside-click close ────────────────────────────────
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return { open, setOpen, ref };
}

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ onClose }) {
  const [notes, setNotes] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notes.filter(n => n.unread).length;

  const markAll = () => setNotes(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-dropdown">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900 font-poppins">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-primary-500 rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAll} className="text-[11px] text-primary-500 font-inter font-semibold hover:underline">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
        {notes.map(({ id, icon: Icon, color, bg, title, body, time, unread }) => (
          <div key={id}
            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative ${unread ? 'bg-blue-50/30' : ''}`}
          >
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon size={15} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 font-poppins truncate">{title}</p>
              <p className="text-[11px] text-gray-400 font-inter mt-0.5 leading-snug">{body}</p>
              <p className="text-[10px] text-gray-300 font-inter mt-1">{time}</p>
            </div>
            {unread && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-center">
        <button className="text-xs text-primary-500 font-semibold font-inter hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ userDoc, onClose, onLogout }) {
  const navigate = useNavigate();

  const roleLabels = { banker: 'Banker · Full Access', account: 'Business Account', client: 'Client · View Only' };
  const roleColors = { banker: 'text-purple-600 bg-purple-50', account: 'text-blue-600 bg-blue-50', client: 'text-green-600 bg-green-50' };

  const menuItems = [
    { icon: User,     label: 'My Profile',   action: () => {} },
    { icon: Settings, label: 'Settings',      action: () => {} },
    { icon: Shield,   label: 'Security',      action: () => {} },
  ];

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-dropdown">
      {/* Profile header */}
      <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar userDoc={userDoc} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 font-poppins truncate">{userDoc?.name || 'User'}</p>
            <p className="text-[11px] text-gray-400 font-inter truncate mt-0.5">{userDoc?.email || ''}</p>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 capitalize ${roleColors[userDoc?.role] || 'text-gray-600 bg-gray-50'}`}>
              {roleLabels[userDoc?.role] || userDoc?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={() => { action(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
          >
            <div className="w-8 h-8 bg-gray-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
              <Icon size={15} className="text-gray-500 group-hover:text-primary-600" />
            </div>
            <span className="text-sm text-gray-700 font-inter font-medium group-hover:text-gray-900">{label}</span>
          </button>
        ))}
      </div>

      {/* Divider + logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-left transition-colors group"
        >
          <div className="w-8 h-8 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
            <LogOut size={15} className="text-gray-500 group-hover:text-red-500" />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-red-600 font-inter font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Topbar ──────────────────────────────────────────────────────────────
export default function Topbar({ onMenuClick, title = 'Dashboard' }) {
  const { userDoc } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const notif   = useDropdown();
  const profile = useDropdown();

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  const handleLogout = async () => {
    profile.setOpen(false);
    await logoutUser();
    addToast({ type: 'info', title: 'Signed out', message: 'See you soon!' });
    navigate('/login');
  };

  return (
    <>
      {/* Inject dropdown animation */}
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-dropdown { animation: dropdown-in 0.18s cubic-bezier(.16,1,.3,1) forwards; }
      `}</style>

      <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)' }}
      >
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all flex-shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Left: title (mobile) / search (desktop) */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {/* Mobile title */}
          <h1 className="text-base font-bold text-gray-900 font-poppins lg:hidden truncate">{title}</h1>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 w-80 transition-all duration-200 focus-within:border-primary-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search transactions, clients..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 font-inter"
            />
            {searchVal && (
              <button onClick={() => setSearchVal('')} className="text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notif.ref}>
            <button
              onClick={() => { notif.setOpen(!notif.open); profile.setOpen(false); }}
              className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all
                ${notif.open ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
            {notif.open && (
              <NotificationPanel onClose={() => notif.setOpen(false)} />
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Profile button */}
          <div className="relative" ref={profile.ref}>
            <button
              onClick={() => { profile.setOpen(!profile.open); notif.setOpen(false); }}
              className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-all
                ${profile.open ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              {/* Avatar */}
              <Avatar userDoc={userDoc} size="md" />

              {/* Name + role (desktop) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-900 font-poppins leading-none truncate max-w-[120px]">
                  {userDoc?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[11px] text-gray-400 font-inter capitalize mt-0.5">{userDoc?.role}</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-400 hidden md:block transition-transform duration-200 ${profile.open ? 'rotate-180' : ''}`}
              />
            </button>

            {profile.open && (
              <ProfileDropdown
                userDoc={userDoc}
                onClose={() => profile.setOpen(false)}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
}