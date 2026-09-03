import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSelectedDate, 
  setViewMode, 
  setSelectedPlatform, 
  setSearchQuery, 
  toggleTheme, 
  togglePerformanceOverlay 
} from '../../store/calendarSlice';
import { navigateDate } from '../../utils/dateUtils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Zap, 
  Sun, 
  Moon,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export const Navbar = ({ onOpenCreateModal }) => {
  const dispatch = useDispatch();
  const selectedDateStr = useSelector((state) => state.calendar.selectedDate);
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const selectedPlatform = useSelector((state) => state.calendar.selectedPlatform);
  const searchQuery = useSelector((state) => state.calendar.searchQuery);
  const theme = useSelector((state) => state.calendar.theme);
  const isPerfOpen = useSelector((state) => state.calendar.isPerformanceOverlayOpen);

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

  const platforms = [
    { id: 'all', label: 'All Channels' },
    { id: 'twitter', label: 'X/Twitter', icon: Twitter },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'threads', label: 'Threads', icon: MessageSquare },
  ];

  return (
    <header className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-xl border border-zinc-200 bg-white">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 rounded-lg text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
              PostPulse <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">EXP 4</span>
            </h1>
            <p className="text-xs text-zinc-500">Interactive Social Media Scheduler (CO3 | CO4 | CO5)</p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200">
          <button
            onClick={() => handleNavigate('prev')}
            className="btn-icon"
            title="Previous"
            data-testid="nav-prev-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
            data-testid="nav-today-btn"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate('next')}
            className="btn-icon"
            title="Next"
            data-testid="nav-next-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-3 text-zinc-900 border-l border-zinc-200 min-w-[150px] text-center">
            {dateLabel}
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-zinc-100 rounded-lg border border-zinc-200">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch(setViewMode(mode))}
                className={`px-3 py-1 text-xs font-bold rounded capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                data-testid={`view-mode-${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => dispatch(togglePerformanceOverlay())}
            className={`btn text-xs font-semibold border ${
              isPerfOpen 
                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                : 'btn-secondary'
            }`}
            title="Toggle CO4 Performance Metrics"
            data-testid="perf-toggle-btn"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Perf
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="btn-icon"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          <button
            onClick={() => onOpenCreateModal()}
            className="btn btn-primary text-xs"
            data-testid="create-post-btn"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.id;

            return (
              <button
                key={p.id}
                onClick={() => dispatch(setSelectedPlatform(p.id))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
                }`}
                data-testid={`platform-filter-${p.id}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search scheduled posts..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            data-testid="search-posts-input"
          />
        </div>
      </div>
    </header>
  );
};
