import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import BankerDashboard from './pages/BankerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import logo from './assets/ikm-logobg.png';

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/login':                    'Sign In — iKIMEI Banking',
  '/banker':                   'Dashboard — iKIMEI Banker',
  '/banker/accounts':          'Accounts — iKIMEI Banker',
  '/banker/clients':           'Clients — iKIMEI Banker',
  '/banker/transactions':      'Transactions — iKIMEI Banker',
  '/banker/settings':          'Settings — iKIMEI Banker',
  '/account':                  'Overview — iKIMEI Account',
  '/account/transactions':     'Transactions — iKIMEI Account',
  '/account/activity':         'Activity — iKIMEI Account',
};

// ─── Title updater ────────────────────────────────────────────────────────────
function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    // Exact match first, then prefix match (longest wins)
    const path = location.pathname;

    const exact = PAGE_TITLES[path];
    if (exact) {
      document.title = exact;
      return;
    }

    // Prefix match — find the longest matching prefix
    const match = Object.keys(PAGE_TITLES)
      .filter(key => path.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];

    document.title = match ? PAGE_TITLES[match] : 'iKIMEI Banking';
  }, [location.pathname]);

  return null;
}

// ─── Guards ───────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { user, userDoc, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!userDoc) return <Navigate to="/login" replace />;
  if (role && userDoc.role !== role) {
    return <Navigate to={userDoc.role === 'banker' ? '/banker' : '/account'} replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user, userDoc, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!userDoc) return <Navigate to="/login" replace />;
  return <Navigate to={userDoc.role === 'banker' ? '/banker' : '/account'} replace />;
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      <div className="text-center">
        <img
          src={logo}
          alt="iKIMEI Logo"
          className="h-28 md:h-32 w-auto object-contain mx-auto mb-6 drop-shadow-xl"
        />
        <div className="flex gap-1 justify-center mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <TitleUpdater />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/banker/*" element={
              <ProtectedRoute role="banker">
                <BankerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/account/*" element={
              <ProtectedRoute role="account">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}