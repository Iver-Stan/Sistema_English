import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Lock, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 3800);
    },
    [removeToast]
  );

  const stylesByVariant: Record<ToastVariant, string> = {
    success: 'bg-emerald-500 text-slate-950 border-emerald-700',
    info: 'bg-cyan-500 text-slate-950 border-cyan-700',
    warning: 'bg-amber-400 text-slate-950 border-amber-600',
    error: 'bg-rose-600 text-white border-rose-800',
  };

  const renderIcon = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0" />;
      case 'warning':
        return <Lock className="w-5 h-5 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 shrink-0" />;
      default:
        return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-pop flex items-center gap-3 px-4 py-3 rounded-2xl border-b-4 shadow-xl ${stylesByVariant[toast.variant]}`}
          >
            {renderIcon(toast.variant)}
            <p className="text-sm font-bold flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider.');
  }
  return ctx;
}
