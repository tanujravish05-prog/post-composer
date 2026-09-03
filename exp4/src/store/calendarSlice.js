import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

const initialState = {
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  viewMode: 'month', // 'month' | 'week' | 'day'
  selectedPlatform: 'all',
  selectedStatus: 'all',
  searchQuery: '',
  theme: 'light',
  isPerformanceOverlayOpen: false,
  toasts: [],
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedPlatform: (state, action) => {
      state.selectedPlatform = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    togglePerformanceOverlay: (state) => {
      state.isPerformanceOverlayOpen = !state.isPerformanceOverlayOpen;
    },
    addToast: (state, action) => {
      const toast = {
        id: `toast-${Date.now()}`,
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
      };
      state.toasts.unshift(toast);
      if (state.toasts.length > 4) {
        state.toasts.pop();
      }
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { 
  setSelectedDate, 
  setViewMode, 
  setSelectedPlatform, 
  setSelectedStatus,
  setSearchQuery, 
  toggleTheme, 
  togglePerformanceOverlay,
  addToast,
  removeToast
} = calendarSlice.actions;

export default calendarSlice.reducer;
