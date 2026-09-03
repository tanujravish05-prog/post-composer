import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const UpcomingPanel = ({ onSelectPost }) => {
  const posts = useSelector((state) => state.posts.posts);

  const upcomingPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === 'scheduled')
      .slice(0, 3);
  }, [posts]);

  return (
    <aside className="w-80 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hidden lg:flex">
      <div>
        {/* Header matching screenshot: Upcoming with badge count 2 */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-extrabold text-slate-900">Upcoming</h3>
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
            {upcomingPosts.length}
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium mb-6">
          Your next scheduled posts
        </p>

        {/* Scheduled Posts List */}
        <div className="flex flex-col gap-4">
          {upcomingPosts.map((post) => {
            const formattedDate = post.scheduledDate ? (
              format(parseISO(post.scheduledDate), 'd MMM') + ` · ${post.scheduledTime || '10:00 am'}`
            ) : '';

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate leading-tight">
                    {post.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 capitalize mt-0.5">
                    {post.platform}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">
                    {formattedDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Button matching screenshot */}
      <button className="w-full flex items-center justify-center gap-2 border border-indigo-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-indigo-600 font-bold text-xs py-3 rounded-2xl transition-all shadow-sm">
        <span>View scheduled posts</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </aside>
  );
};
