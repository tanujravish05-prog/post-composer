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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-700/60 shadow-lg">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              PostPulse <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">NextGen</span>
            </h1>
            <p className="text-xs text-slate-400">Interactive Social Media Scheduler</p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
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
            className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
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
          <span className="text-sm font-bold px-3 text-indigo-300 border-l border-slate-700/60 min-w-[160px] text-center">
            {dateLabel}
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch(setViewMode(mode))}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                data-testid={`view-mode-${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => dispatch(togglePerformanceOverlay())}
            className={`btn border text-xs font-bold ${
              isPerfOpen 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow' 
                : 'btn-secondary text-slate-300'
            }`}
            title="Toggle CO4 Performance Metrics"
            data-testid="perf-toggle-btn"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Perf
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="btn-icon"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-xl border border-slate-700/40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.id;

            return (
              <button
                key={p.id}
                onClick={() => dispatch(setSelectedPlatform(p.id))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
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
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search scheduled posts..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            data-testid="search-posts-input"
          />
        </div>
      </div>
    </header>
  );
};
