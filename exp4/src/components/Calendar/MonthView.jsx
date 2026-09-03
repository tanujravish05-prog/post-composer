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
      className={`calendar-day-cell min-h-[125px] p-2 flex flex-col justify-between border-b border-r border-zinc-200 relative group bg-white ${
        !day.isCurrentMonth ? 'other-month opacity-40 bg-zinc-50' : ''
      } ${day.isToday ? 'today bg-zinc-50' : ''}`}
      data-testid={`month-cell-${day.dateString}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          day.isToday 
            ? 'bg-zinc-900 text-white font-bold' 
            : 'text-zinc-700 group-hover:text-zinc-900'
        }`}>
          {day.dayNumber}
        </span>

        <button
          onClick={() => onOpenCreateModal(day.dateString)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 rounded text-zinc-600 transition-opacity"
          title="Add Post to this Date"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[95px] pr-0.5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSelect={onSelectPost}
            compact={true}
          />
        ))}
      </div>

      {posts.length > 3 && (
        <span className="text-[10px] text-zinc-500 font-semibold mt-1">
          +{posts.length - 3} more posts
        </span>
      )}
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

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden glass-panel border border-zinc-200 bg-white">
      <div className="grid grid-cols-7 bg-zinc-100 border-b border-zinc-200 text-center py-2.5 font-bold text-xs text-zinc-700 uppercase tracking-wider">
        {weekDayHeaders.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-zinc-200">
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
