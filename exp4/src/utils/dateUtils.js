import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  setHours,
  parseISO
} from 'date-fns';

export { parseISO };

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const isToday = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(d, new Date());
};

export const getMonthGrid = (currentDate) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map(day => ({
    date: day,
    dateString: format(day, 'yyyy-MM-dd'),
    isCurrentMonth: isSameMonth(day, monthStart),
    isToday: isSameDay(day, new Date()),
    dayNumber: format(day, 'd')
  }));
};

export const getWeekDays = (currentDate) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate }).map(day => ({
    date: day,
    dateString: format(day, 'yyyy-MM-dd'),
    dayName: format(day, 'EEE'),
    dayNumber: format(day, 'd'),
    isToday: isSameDay(day, new Date())
  }));
};

export const getHoursList = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hourFormatted = i < 10 ? `0${i}:00` : `${i}:00`;
    const label = format(setHours(new Date(), i), 'ha');
    return { hour: i, hourFormatted, label };
  });
};

export const navigateDate = (date, direction, viewMode) => {
  const amount = direction === 'next' ? 1 : -1;
  if (viewMode === 'month') {
    return amount > 0 ? addMonths(date, 1) : subMonths(date, 1);
  } else if (viewMode === 'week') {
    return amount > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
  } else {
    return amount > 0 ? addDays(date, 1) : subDays(date, 1);
  }
};
