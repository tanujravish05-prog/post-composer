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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" data-testid="stats-header">
      <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Total Posts</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{stats.total}</h3>
        </div>
        <div className="p-2.5 bg-zinc-100 text-zinc-800 rounded-lg">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Scheduled</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">{stats.scheduled}</h3>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Published</p>
          <h3 className="text-xl font-bold text-blue-600 mt-1">{stats.published}</h3>
        </div>
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Drafts</p>
          <h3 className="text-xl font-bold text-amber-600 mt-1">{stats.drafts}</h3>
        </div>
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
          <FileText className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
