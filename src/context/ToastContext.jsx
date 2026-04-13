import { createContext, useContext, useState, useCallback } from 'react';
import { playSound } from '../utils/sounds';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now();
    playSound(type);
    setToasts(prev => [...prev, { id, type, title, message, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ id, type, title, message, leaving, onRemove }) {
  const configs = {
    success: { bg: 'bg-white border-l-4 border-green-500', icon: '✓', iconBg: 'bg-green-100 text-green-600' },
    error: { bg: 'bg-white border-l-4 border-red-500', icon: '✕', iconBg: 'bg-red-100 text-red-600' },
    info: { bg: 'bg-white border-l-4 border-blue-500', icon: 'i', iconBg: 'bg-blue-100 text-blue-600' },
    warning: { bg: 'bg-white border-l-4 border-yellow-500', icon: '!', iconBg: 'bg-yellow-100 text-yellow-600' },
  };
  const c = configs[type] || configs.info;

  return (
    <div
      className={`${c.bg} rounded-xl shadow-xl p-4 flex items-start gap-3 pointer-events-auto min-w-[300px] max-w-sm ${leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
      onClick={() => onRemove(id)}
    >
      <div className={`${c.iconBg} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-gray-800 text-sm font-poppins">{title}</p>}
        {message && <p className="text-gray-500 text-xs mt-0.5 font-inter">{message}</p>}
      </div>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
