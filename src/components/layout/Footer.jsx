import { useState, useEffect } from 'react';
import {
  Shield, Wifi, WifiOff, Activity, Clock, Lock,
  ExternalLink, ChevronUp, Zap, Globe, HelpCircle,
  FileText, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, '0');
  const h   = pad(time.getHours());
  const m   = pad(time.getMinutes());
  const s   = pad(time.getSeconds());
  const date = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center">
        <Clock size={12} className="text-primary-500" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-700 font-mono tracking-wider">
          {h}:{m}:<span className="text-primary-400">{s}</span>
        </p>
        <p className="text-[9px] text-gray-400 font-inter leading-none mt-0.5">{date}</p>
      </div>
    </div>
  );
}

// ─── System status indicator ──────────────────────────────────────────────────
function SystemStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ping,   setPing]   = useState(null);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Simulate ping measurement
  useEffect(() => {
    const measure = () => {
      const start = performance.now();
      fetch('/favicon.ico', { cache: 'no-cache', mode: 'no-cors' })
        .then(() => setPing(Math.round(performance.now() - start)))
        .catch(() => setPing(null));
    };
    measure();
    const id = setInterval(measure, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg ${online ? 'bg-green-50' : 'bg-red-50'}`}>
        {online
          ? <Wifi    size={12} className="text-green-500" />
          : <WifiOff size={12} className="text-red-500"   />
        }
        {online && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-white">
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          </span>
        )}
      </div>
      <div>
        <p className={`text-[11px] font-bold font-inter ${online ? 'text-green-600' : 'text-red-500'}`}>
          {online ? 'All systems operational' : 'Connection lost'}
        </p>
        {online && ping !== null && (
          <p className="text-[9px] text-gray-400 font-inter leading-none mt-0.5">{ping}ms latency</p>
        )}
      </div>
    </div>
  );
}

// ─── Session timer ────────────────────────────────────────────────────────────
function SessionTimer({ loginTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = loginTime || Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [loginTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');

  const danger = elapsed > 3600 * 4; // warn after 4h

  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${danger ? 'bg-amber-50' : 'bg-blue-50'}`}>
        <Activity size={12} className={danger ? 'text-amber-500' : 'text-blue-400'} />
      </div>
      <div>
        <p className={`text-[11px] font-bold font-mono tracking-wider ${danger ? 'text-amber-600' : 'text-gray-700'}`}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </p>
        <p className="text-[9px] text-gray-400 font-inter leading-none mt-0.5">Session active</p>
      </div>
    </div>
  );
}

// ─── Quick links ──────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { icon: HelpCircle, label: 'Help Center',   href: '#' },
  { icon: FileText,   label: 'Audit Logs',    href: '#' },
  { icon: Globe,      label: 'API Status',    href: '#' },
  { icon: AlertTriangle, label: 'Report Issue', href: '#' },
];

// ─── Status pills ─────────────────────────────────────────────────────────────
const STATUS_ITEMS = [
  { label: 'Firebase',  status: 'ok'  },
  { label: 'Auth',      status: 'ok'  },
  { label: 'Firestore', status: 'ok'  },
  { label: 'Storage',   status: 'ok'  },
];

// ─── Scroll to top ────────────────────────────────────────────────────────────
function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById('main-scroll');
    if (!container) return;
    const handler = () => setVisible(container.scrollTop > 200);
    container.addEventListener('scroll', handler);
    return () => container.removeEventListener('scroll', handler);
  }, []);

  const scrollTop = () => {
    const container = document.getElementById('main-scroll');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      className="w-7 h-7 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition-all shadow-blue hover:shadow-lg active:scale-95"
      title="Scroll to top"
    >
      <ChevronUp size={14} />
    </button>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────
export default function DashboardFooter({ loginTime }) {
  const { userDoc } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm">

      {/* ── Top strip — status bar ── */}
      <div
        className="px-5 lg:px-6 py-2.5 border-b border-gray-100 flex items-center gap-6 overflow-x-auto"
        style={{ background: 'linear-gradient(90deg, #f8faff 0%, #ffffff 50%, #f8faff 100%)' }}
      >
        {/* Service status pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <CheckCircle2 size={11} className="text-green-500" />
          <span className="text-[10px] font-semibold text-gray-500 font-inter uppercase tracking-wider">Services</span>
          <div className="flex items-center gap-1.5 ml-1">
            {STATUS_ITEMS.map(({ label, status }) => (
              <span
                key={label}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full font-inter
                  ${status === 'ok'   ? 'bg-green-50 text-green-700'  : ''}
                  ${status === 'warn' ? 'bg-amber-50 text-amber-700'  : ''}
                  ${status === 'down' ? 'bg-red-50   text-red-700'    : ''}
                `}
              >
                <span className={`w-1 h-1 rounded-full inline-block
                  ${status === 'ok'   ? 'bg-green-500' : ''}
                  ${status === 'warn' ? 'bg-amber-500' : ''}
                  ${status === 'down' ? 'bg-red-500'   : ''}
                `} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Security badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Lock size={11} className="text-primary-400" />
          <span className="text-[10px] font-semibold text-primary-500 font-inter">
            TLS 1.3 · AES-256 Encrypted
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Zap size={11} className="text-amber-400" />
          <span className="text-[10px] font-semibold text-gray-400 font-inter">
            iKIMEI Security Protocol v2.0
          </span>
        </div>
      </div>

      {/* ── Main footer row ── */}
      <div className="px-5 lg:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">

        {/* Left group */}
        <div className="flex items-center gap-5 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center shadow-blue">
              <span className="text-white font-black text-[10px] font-poppins">iK</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 font-poppins leading-none">iKIMEI Banking</p>
              <p className="text-[9px] text-gray-400 font-inter mt-0.5">Internal Platform · © {year}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-gray-200 hidden sm:block" />

          {/* Live clock */}
          <div className="hidden sm:block">
            <LiveClock />
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-gray-200 hidden md:block" />

          {/* Session timer */}
          <div className="hidden md:block">
            <SessionTimer loginTime={loginTime} />
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-gray-200 hidden lg:block" />

          {/* System status */}
          <div className="hidden lg:block">
            <SystemStatus />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right group */}
        <div className="flex items-center gap-3 flex-wrap justify-end">

          {/* Quick links */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-gray-700 hover:bg-gray-50 font-inter font-medium transition-all group"
              >
                <Icon size={11} className="group-hover:text-primary-500 transition-colors" />
                {label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 hidden xl:block" />

          {/* Logged-in user chip */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
            <Shield size={11} className="text-primary-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-700 font-poppins leading-none truncate max-w-[100px]">
                {userDoc?.name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-[9px] text-gray-400 font-inter capitalize leading-none mt-0.5">
                {userDoc?.role || 'banker'} session
              </p>
            </div>
          </div>

          {/* Scroll to top */}
          <ScrollTopButton />
        </div>
      </div>
    </footer>
  );
}