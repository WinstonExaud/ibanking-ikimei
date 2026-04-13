import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';
import logo from '../assets/ikm-icon512.png';

export default function NotFoundPage() {
  const { userDoc } = useAuth();
  const navigate = useNavigate();

  const homeRoute = userDoc?.role === 'banker' ? '/banker' : userDoc ? '/account' : '/login';

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">

        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] md:text-[160px] font-bold text-primary-500/10 font-poppins leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
        <img
          src={logo}
          alt="iKIMEI Logo"
          className="h-28 md:h-32 w-auto object-contain mx-auto mb-6 drop-shadow-xl"
        />
          </div>
        </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 font-inter text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2 py-3 px-6"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate(homeRoute)}
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Home size={16} />
            Go to Dashboard
          </button>
        </div>

        {/* Path shown */}
        <p className="mt-8 text-xs text-gray-300 font-mono bg-white border border-surface-border rounded-xl px-4 py-2 inline-block">
          {window.location.pathname}
        </p>
      </div>
    </div>
  );
}