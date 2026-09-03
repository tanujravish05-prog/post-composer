import React, { useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMonthGrid } from '../../utils/dateUtils';
import { PostCard } from './PostCard';
import { reschedulePost } from '../../store/postsSlice';
import { addToast } from '../../store/calendarSlice';
import { Plus } from 'lucide-react';

const DayCellComponent = ({
  day,
  posts,
  onSelectPost,
  onOpenCreateModal,
  onDropPost
}) => {
  const cellRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (cellRef.current) {
      cellRef.current.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    if (cellRef.current) {
      cellRef.current.classList.remove('drag-over');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (cellRef.current) {
      cellRef.current.classList.remove('drag-over');
    }
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      onDropPost(postId, day.dateString);
    }
  };

  return (
    <div
      ref={cellRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`calendar-day-cell min-h-[125px] p-2 flex flex-col justify-between relative group ${
        !day.isCurrentMonth ? 'other-month' : ''
      }`}
      data-testid={`month-cell-${day.dateString}`}
    >
      <div className="flex items-center justify-end mb-1">
        <span className={`text-xs font-extrabold ${
          day.isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'
        }`}>
          {day.dayNumber}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[105px]">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSelect={onSelectPost}
            compact={true}
          />
        ))}
      </div>

      <button
        onClick={() => onOpenCreateModal(day.dateString)}
        className="opacity-0 group-hover:opacity-100 absolute top-2 left-2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-opacity"
        title="Add post on this date"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const MemoizedDayCell = React.memo(DayCellComponent, (prevProps, nextProps) => {
  return (
    prevProps.day.dateString === nextProps.day.dateString &&
    prevProps.day.isCurrentMonth === nextProps.day.isCurrentMonth &&
    prevProps.day.isToday === nextProps.day.isToday &&
    prevProps.posts.length === nextProps.posts.length &&
    prevProps.posts.every((p, idx) => p.id === nextProps.posts[idx]?.id)
  );
});

export const MonthView = ({ onSelectPost, onOpenCreateModal }) => {
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state) => state.calendar.selectedDate);
  const posts = useSelector((state) => state.posts.posts);
  const selectedPlatform = useSelector((state) => state.calendar.selectedPlatform);
  const selectedStatus = useSelector((state) => state.calendar.selectedStatus);
  const searchQuery = useSelector((state) => state.calendar.searchQuery);

  const currentDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const postsByDate = useMemo(() => {
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

      if (!map[post.scheduledDate]) {
        map[post.scheduledDate] = [];
      }
      map[post.scheduledDate].push(post);
    });
    return map;
  }, [posts, selectedPlatform, selectedStatus, searchQuery]);

  const handleDropPost = useCallback((postId, newDate) => {
    dispatch(reschedulePost({ id: postId, newDate }));
    dispatch(addToast({
      type: 'success',
      title: 'Post Rescheduled',
      message: `Moved to ${newDate}`
    }));
  }, [dispatch]);

  const weekDayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Header matching screenshot SUN, MON, TUE, WED, THU, FRI, SAT */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center py-2.5 font-bold text-xs text-slate-400 tracking-wider">
        {weekDayHeaders.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* 35/42 Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-white">
        {monthGrid.map((day) => (
          <MemoizedDayCell
            key={day.dateString}
            day={day}
            posts={postsByDate[day.dateString] || []}
            onSelectPost={onSelectPost}
            onOpenCreateModal={onOpenCreateModal}
            onDropPost={handleDropPost}
          />
        ))}
      </div>
    </div>
  );
};
