import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

const initialState = {
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  viewMode: 'month', // 'month' | 'week' | 'day'
  selectedPlatform: 'all',
  searchQuery: '',
  theme: 'dark',
  isPerformanceOverlayOpen: false,
  renderTelemetry: {
    totalRenders: 0,
    lastRenderTimeMs: 0,
    memoHits: 0
  }
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
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    togglePerformanceOverlay: (state) => {
      state.isPerformanceOverlayOpen = !state.isPerformanceOverlayOpen;
    },
    recordRenderMetrics: (state, action) => {
      state.renderTelemetry.totalRenders += 1;
      if (action.payload?.renderTime) {
        state.renderTelemetry.lastRenderTimeMs = action.payload.renderTime;
      }
      if (action.payload?.memoHit) {
        state.renderTelemetry.memoHits += 1;
      }
    }
  }
});

export const { 
  setSelectedDate, 
  setViewMode, 
  setSelectedPlatform, 
  setSearchQuery, 
  toggleTheme, 
  togglePerformanceOverlay,
  recordRenderMetrics
} = calendarSlice.actions;

export default calendarSlice.reducer;
