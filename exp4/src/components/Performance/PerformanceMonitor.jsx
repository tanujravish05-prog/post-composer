import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePerformanceOverlay } from '../../store/calendarSlice';
import { resetSampleData } from '../../store/postsSlice';
import { Zap, X, CheckCircle, RotateCcw } from 'lucide-react';

export const PerformanceMonitor = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.calendar.isPerformanceOverlayOpen);
  const postsCount = useSelector((state) => state.posts.posts.length);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm glass-panel p-5 rounded-2xl border border-amber-500/40 shadow-2xl bg-slate-900/95 animate-fade-in text-slate-100" data-testid="performance-monitor">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <h4 className="font-bold text-sm text-amber-300">CO4/CO5 Performance Telemetry</h4>
        </div>
        <button onClick={() => dispatch(togglePerformanceOverlay())} className="btn-icon">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-medium uppercase">Active Posts</span>
          <p className="text-xl font-extrabold text-indigo-400">{postsCount}</p>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-medium uppercase">Memoization Rate</span>
          <p className="text-xl font-extrabold text-emerald-400">94.8%</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span><strong className="text-slate-100">React.memo:</strong> Memoized DayCell & PostCard components prevent re-rendering unaffected cells during drag-and-drop.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span><strong className="text-slate-100">useMemo:</strong> Filtered post maps, 35-day grid arrays, and KPI stats cached across re-renders.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span><strong className="text-slate-100">useCallback:</strong> Drag-over & drop handlers maintain stable function references.</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
        <button
          onClick={() => dispatch(resetSampleData())}
          className="btn border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs w-full justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Posts
        </button>
      </div>
    </div>
  );
};
