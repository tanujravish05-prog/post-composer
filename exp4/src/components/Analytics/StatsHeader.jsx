import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';

export const StatsHeader = () => {
  const posts = useSelector((state) => state.posts.posts);

  const stats = useMemo(() => {
    const total = posts.length;
    const scheduled = posts.filter((p) => p.status === 'scheduled').length;
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;

    return { total, scheduled, published, drafts };
  }, [posts]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in" data-testid="stats-header">
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Total Posts</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{stats.total}</h3>
        </div>
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Scheduled</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.scheduled}</h3>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Published</p>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{stats.published}</h3>
        </div>
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Drafts</p>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{stats.drafts}</h3>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
          <FileText className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
