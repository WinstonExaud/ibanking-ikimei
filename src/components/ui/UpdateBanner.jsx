import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { useState } from 'react';

export default function UpdateBanner() {
  const { needsUpdate, applyUpdate } = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!needsUpdate || dismissed) return null;

  const handleUpdate = () => {
    setLoading(true);
    applyUpdate();
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in" />

      {/* Centered modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl border border-surface-border w-full max-w-sm pointer-events-auto animate-slide-up">

          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary-500 via-blue-400 to-primary-600 rounded-t-3xl" />

          <div className="p-6">
            {/* Icon + dismiss */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Sparkles size={22} className="text-primary-500" />
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-gray-500 hover:bg-surface-bg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Text */}
            <h3 className="text-lg font-bold text-gray-900 font-poppins">
              New update available
            </h3>
            <p className="text-sm text-gray-400 font-inter mt-1 leading-relaxed">
              A new version of iKIMEI has been deployed. Reload to get the latest features and fixes.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDismissed(true)}
                className="flex-1 btn-secondary py-2.5 text-sm"
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><RefreshCw size={15} /><span>Reload now</span></>
                }
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-300 font-inter mt-3">
              Your data is safe — this just refreshes the app
            </p>
          </div>
        </div>
      </div>
    </>
  );
}