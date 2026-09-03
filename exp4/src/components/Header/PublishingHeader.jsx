import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSelectedDate, 
  setViewMode, 
  setSelectedStatus, 
  setSearchQuery 
} from '../../store/calendarSlice';
import { navigateDate } from '../../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ChevronDown,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

export const PublishingHeader = ({ onOpenCreateModal, postsCount }) => {
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state) => state.calendar.selectedDate);
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const selectedStatus = useSelector((state) => state.calendar.selectedStatus);
  const searchQuery = useSelector((state) => state.calendar.searchQuery);

  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);

  const dateLabel = useMemo(() => {
    if (viewMode === 'month') {
      return format(selectedDate, 'MMMM yyyy');
    } else if (viewMode === 'week') {
      return `Week of ${format(selectedDate, 'MMM d, yyyy')}`;
    } else {
      return format(selectedDate, 'EEEE, MMM d, yyyy');
    }
  }, [selectedDate, viewMode]);

  const handleNavigate = (direction) => {
    const nextDate = navigateDate(selectedDate, direction, viewMode);
    dispatch(setSelectedDate(format(nextDate, 'yyyy-MM-dd')));
  };

  const handleToday = () => {
    dispatch(setSelectedDate(format(new Date(), 'yyyy-MM-dd')));
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Top Row: Title + Search & Status Select */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Publishing Schedule
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {postsCount} post{postsCount !== 1 ? 's' : ''} shown
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box matching screenshot */}
          <div className="relative w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search posts..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              data-testid="search-posts-input"
            />
          </div>

          {/* Status Dropdown matching screenshot */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => dispatch(setSelectedStatus(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-indigo-500 shadow-sm"
              data-testid="status-filter-select"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add Post Button */}
          <button
            onClick={() => onOpenCreateModal()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
            data-testid="create-post-btn"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Control Bar: Nav Buttons, Month Text, View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Left Nav Buttons matching screenshot */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-indigo-600 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-2 text-white hover:bg-indigo-700 transition-colors"
              title="Previous"
              data-testid="nav-prev-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-indigo-500" />
            <button
              onClick={() => handleNavigate('next')}
              className="p-2 text-white hover:bg-indigo-700 transition-colors"
              title="Next"
              data-testid="nav-next-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
            data-testid="nav-today-btn"
          >
            today
          </button>
        </div>

        {/* Center Month Title matching screenshot */}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight text-center">
          {dateLabel}
        </h3>

        {/* View Switcher Pills matching screenshot */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => dispatch(setViewMode(mode))}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid={`view-mode-${mode}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
