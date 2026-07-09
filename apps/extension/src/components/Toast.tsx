import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-bounce">
      <div className={`flex items-center justify-between p-3 border rounded-xl shadow-lg ${bgColors[toast.type]}`}>
        <div className="flex items-center gap-2.5">
          {icons[toast.type]}
          <span className="text-xs font-semibold">{toast.text}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition">
          <X className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    </div>
  );
};
