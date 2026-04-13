import { useState } from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick, title = 'Dashboard' }) {
  const { userDoc } = useAuth();
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center px-5 gap-4 sticky top-0 z-20">
      {/* Menu button (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Title (mobile) or Search (desktop) */}
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 font-poppins lg:hidden">{title}</h1>
        
        {/* Search bar */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 w-72 group focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search transactions, clients..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 font-inter"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-bg text-gray-500 hover:text-gray-800 transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 cursor-pointer group">
          <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center shadow-blue">
            <span className="text-white font-semibold text-sm font-poppins">
              {userDoc?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800 font-poppins leading-none">{userDoc?.name || 'User'}</p>
            <p className="text-xs text-gray-400 font-inter capitalize">{userDoc?.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
