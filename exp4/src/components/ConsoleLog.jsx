import React, { useState, useEffect } from 'react';
import { subscribeConsoleLogs, consoleLogs } from '../services/mockApi';
import { Terminal, X, Trash2, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const ConsoleLog = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([...consoleLogs]);

  useEffect(() => {
    const unsubscribe = subscribeConsoleLogs((updatedLogs) => {
      setLogs([...updatedLogs]);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 w-full max-w-lg glass-panel p-4 rounded-xl border border-zinc-300 shadow-xl bg-white text-zinc-900 animate-fade-in" data-testid="console-log-modal">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-700" />
          <h4 className="font-bold text-xs text-zinc-900">Axios & Security Audit Console Log</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="p-1 hover:text-red-600 text-zinc-500 rounded"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="btn-icon">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 font-mono text-[11px] pr-1">
        {logs.length === 0 ? (
          <p className="text-zinc-400 italic text-center py-4">No audit logs recorded yet.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border flex items-start gap-2 ${
                log.level === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                log.level === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                log.level === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}
            >
              <div className="pt-0.5">
                {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {log.level === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {log.level === 'error' && <AlertOctagon className="w-3.5 h-3.5 text-red-600" />}
                {log.level === 'info' && <Info className="w-3.5 h-3.5 text-zinc-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold uppercase tracking-wider text-[9px] px-1 rounded bg-zinc-200 text-zinc-800">
                    {log.category}
                  </span>
                  <span className="text-zinc-400 text-[10px]">{log.timestamp}</span>
                </div>
                <p className="leading-snug break-all">{log.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
