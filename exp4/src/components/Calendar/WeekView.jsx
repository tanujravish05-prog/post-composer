import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWeekDays, getHoursList } from '../../utils/dateUtils';
import { PostCard } from './PostCard';
import { reschedulePost } from '../../store/postsSlice';
import { addToast } from '../../store/calendarSlice';

export const WeekView = ({ onSelectPost, onOpenCreateModal }) => {
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state) => state.calendar.selectedDate);
  const posts = useSelector((state) => state.posts.posts);
  const selectedPlatform = useSelector((state) => state.calendar.selectedPlatform);
  const selectedStatus = useSelector((state) => state.calendar.selectedStatus);
  const searchQuery = useSelector((state) => state.calendar.searchQuery);

  const currentDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const hoursList = useMemo(() => getHoursList(), []);

  const postsByTimeSlot = useMemo(() => {
    const map = {};
    posts.forEach((post) => {
      if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return;
      if (selectedStatus !== 'all' && post.status !== selectedStatus) return;
      if (
        searchQuery && 
        !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return;
      }

      const postHourStr = post.scheduledTime ? post.scheduledTime.split(':')[0] + ':00' : '09:00';
      const key = `${post.scheduledDate}_${postHourStr}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(post);
    });
    return map;
  }, [posts, selectedPlatform, selectedStatus, searchQuery]);

  const handleDrop = useCallback((e, dateString, hourFormatted) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      dispatch(reschedulePost({ id: postId, newDate: dateString, newTime: hourFormatted }));
      dispatch(addToast({
        type: 'success',
        title: 'Slot Updated',
        message: `Rescheduled to ${dateString} at ${hourFormatted}`
      }));
    }
  }, [dispatch]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden glass-panel border border-zinc-200 bg-white max-h-[750px] overflow-y-auto">
      <div className="grid grid-cols-8 bg-zinc-100 border-b border-zinc-200 sticky top-0 z-20">
        <div className="p-3 text-xs font-bold text-zinc-500 border-r border-zinc-200 flex items-center justify-center">
          TIME
        </div>
        {weekDays.map((day) => (
          <div
            key={day.dateString}
            className={`p-3 text-center border-r border-zinc-200 ${
              day.isToday ? 'bg-zinc-200/60 font-bold' : 'text-zinc-700'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
              {day.dayName}
            </div>
            <div className={`text-xs font-bold mt-0.5 inline-block px-2 py-0.5 rounded ${
              day.isToday ? 'bg-zinc-900 text-white' : ''
            }`}>
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      <div className="divide-y divide-zinc-200">
        {hoursList.map(({ hour, hourFormatted, label }) => (
          <div key={hour} className="grid grid-cols-8 min-h-[65px]">
            <div className="p-2 border-r border-zinc-200 text-xs font-mono text-zinc-500 flex items-start justify-center pt-2.5 bg-zinc-50 font-medium">
              {label}
            </div>

            {weekDays.map((day) => {
              const key = `${day.dateString}_${hourFormatted}`;
              const slotPosts = postsByTimeSlot[key] || [];

              return (
                <div
                  key={key}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.dateString, hourFormatted)}
                  onClick={() => onOpenCreateModal(day.dateString, hourFormatted)}
                  className="p-1.5 border-r border-zinc-200 hover:bg-zinc-50 transition-colors flex flex-col gap-1.5 relative group min-h-[65px]"
                  data-testid={`week-slot-${key}`}
                >
                  {slotPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onSelect={onSelectPost}
                      compact={true}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
