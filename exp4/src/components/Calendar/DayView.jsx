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
    <div className="flex flex-col w-full rounded-xl overflow-hidden glass-panel border border-zinc-200 bg-white max-h-[750px] overflow-y-auto">
      <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 text-white rounded-lg">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              {formatDate(selectedDateStr, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p className="text-xs text-zinc-500">
              {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateModal(selectedDateStr, '09:00')}
          className="btn btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          Schedule Post
        </button>
      </div>

      <div className="divide-y divide-zinc-200 p-4">
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
              className="py-3 flex gap-4 min-h-[85px] group transition-colors hover:bg-zinc-50 rounded-lg px-2"
              data-testid={`day-slot-${hourFormatted}`}
            >
              <div className="w-20 text-xs font-mono text-zinc-500 flex flex-col items-center pt-1 border-r border-zinc-200 pr-3 font-semibold">
                <span>{label}</span>
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
                    className="h-full border border-dashed border-zinc-300 rounded-lg flex items-center justify-start px-3 text-xs text-zinc-400 cursor-pointer hover:border-zinc-500 hover:text-zinc-700 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Drop post or click to schedule at {label}
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
