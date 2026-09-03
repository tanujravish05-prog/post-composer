import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHoursList, formatDate } from '../../utils/dateUtils';
import { PostCard } from './PostCard';
import { reschedulePost, deletePost } from '../../store/postsSlice';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export const DayView = ({ onSelectPost, onOpenCreateModal, onPreviewPost }) => {
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state) => state.calendar.selectedDate);
  const posts = useSelector((state) => state.posts.posts);
  const selectedPlatform = useSelector((state) => state.calendar.selectedPlatform);
  const selectedStatus = useSelector((state) => state.calendar.selectedStatus);
  const searchQuery = useSelector((state) => state.calendar.searchQuery);

  const hoursList = useMemo(() => getHoursList(), []);

  const dayPosts = useMemo(() => {
    return posts.filter((post) => {
      if (post.scheduledDate !== selectedDateStr) return false;
      if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false;
      if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;
      if (
        searchQuery &&
        !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [posts, selectedDateStr, selectedPlatform, selectedStatus, searchQuery]);

  const postsByHour = useMemo(() => {
    const map = {};
    dayPosts.forEach((post) => {
      const hourStr = post.scheduledTime ? post.scheduledTime.split(':')[0] + ':00' : '09:00';
      if (!map[hourStr]) map[hourStr] = [];
      map[hourStr].push(post);
    });
    return map;
  }, [dayPosts]);

  const handleDelete = useCallback((id) => {
    dispatch(deletePost(id));
  }, [dispatch]);

  const handleDrop = (e, hourFormatted) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      dispatch(reschedulePost({ id: postId, newDate: selectedDateStr, newTime: hourFormatted }));
    }
  };

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-xl max-h-[750px] overflow-y-auto">
      <div className="p-4 bg-slate-900/90 border-b border-slate-700/60 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {formatDate(selectedDateStr, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p className="text-xs text-slate-400">
              {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} scheduled for this day
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateModal(selectedDateStr, '09:00')}
          className="btn btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          Schedule New Post
        </button>
      </div>

      <div className="divide-y divide-slate-800/60 p-4">
        {hoursList.map(({ hour, hourFormatted, label }) => {
          const slotPosts = postsByHour[hourFormatted] || [];

          return (
            <div
              key={hour}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => handleDrop(e, hourFormatted)}
              className="py-3 flex gap-4 min-h-[90px] group transition-colors hover:bg-slate-800/20 rounded-xl px-2"
              data-testid={`day-slot-${hourFormatted}`}
            >
              <div className="w-20 text-xs font-mono text-slate-400 flex flex-col items-center pt-1 border-r border-slate-700/40 pr-3">
                <span className="font-semibold text-slate-200">{label}</span>
                <span className="text-[10px] text-slate-500">{hourFormatted}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {slotPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {slotPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onSelect={onSelectPost}
                        onDelete={handleDelete}
                        onPreview={onPreviewPost}
                        compact={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => onOpenCreateModal(selectedDateStr, hourFormatted)}
                    className="h-full border border-dashed border-slate-700/50 rounded-xl flex items-center justify-start px-4 text-xs text-slate-500 cursor-pointer hover:border-indigo-500/50 hover:text-indigo-400 transition-all opacity-40 hover:opacity-100"
                  >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Click or drop post to schedule at {label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
