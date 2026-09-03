import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/calendarSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.calendar.toasts);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto glass-panel p-3.5 rounded-xl border border-slate-700 shadow-2xl bg-slate-900/95 flex items-start gap-3 animate-fade-in"
        >
          <div className="pt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'danger' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>

          <div className="flex-1">
            <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
            <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
