import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/calendarSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.calendar.toasts);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto glass-panel p-3 rounded-xl border border-zinc-300 shadow-lg bg-white flex items-start gap-3 animate-fade-in text-zinc-900"
        >
          <div className="pt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {toast.type === 'danger' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
          </div>

          <div className="flex-1">
            <h5 className="text-xs font-bold text-zinc-900">{toast.title}</h5>
            <p className="text-xs text-zinc-600 mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="text-zinc-400 hover:text-zinc-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
