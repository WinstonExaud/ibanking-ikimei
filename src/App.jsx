import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import BankerDashboard from './pages/BankerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import logo from './assets/ikm-logo.png';

function ProtectedRoute({ children, role }) {
  const { user, userDoc, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!userDoc) return <Navigate to="/login" replace />;
  if (role && userDoc.role !== role) {
    return <Navigate to={userDoc.role === 'banker' ? '/banker' : '/client'} replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user, userDoc, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  // userDoc loaded but no role means Firestore doc is missing — send back to login with message
  if (!userDoc) return <Navigate to="/login" replace />;
  return <Navigate to={userDoc.role === 'banker' ? '/banker' : '/account'} replace />;
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      
      <div className="text-center">
        
        {/* BIG LOGO */}
        <img
          src={logo}
          alt="iKIMEI Logo"
          className="h-28 md:h-32 w-auto object-contain mx-auto mb-6 drop-shadow-xl"
        />

        {/* LOADING DOTS */}
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
