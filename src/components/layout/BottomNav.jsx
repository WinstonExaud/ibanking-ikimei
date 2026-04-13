import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ArrowLeftRight, BarChart3, Settings } from 'lucide-react';

const links = [
  { to: '/banker', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/banker/accounts', icon: Building2, label: 'Accounts' },
  { to: '/banker/transactions', icon: ArrowLeftRight, label: 'Transfer' },
  { to: '/banker/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/banker/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border z-30 h-16 px-2">
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-all ${
              isActive ? 'text-primary-500' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-100' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium font-inter">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
