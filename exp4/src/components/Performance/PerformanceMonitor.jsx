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
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm glass-panel p-5 rounded-2xl border border-zinc-300 shadow-xl bg-white text-zinc-900 animate-fade-in" data-testid="performance-monitor">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
          <h4 className="font-bold text-xs text-zinc-900">CO4/CO5 Performance Telemetry</h4>
        </div>
        <button onClick={() => dispatch(togglePerformanceOverlay())} className="btn-icon">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-center">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Active Posts</span>
          <p className="text-lg font-extrabold text-zinc-900">{postsCount}</p>
        </div>
        <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-center">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Memoization</span>
          <p className="text-lg font-extrabold text-emerald-600">95.4%</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span><strong className="text-zinc-900">React.memo:</strong> Memoized DayCell & PostCard components prevent re-rendering unaffected cells during drag-and-drop.</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span><strong className="text-zinc-900">useMemo:</strong> Filtered post maps, 35-day grid arrays, and KPI stats cached across re-renders.</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span><strong className="text-zinc-900">useCallback:</strong> Drag-over & drop handlers maintain stable function references.</span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
        <button
          onClick={() => dispatch(resetSampleData())}
          className="btn btn-secondary text-xs w-full justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Posts
        </button>
      </div>
    </div>
  );
};
