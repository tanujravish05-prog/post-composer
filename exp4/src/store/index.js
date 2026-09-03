import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import calendarReducer from './calendarSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    calendar: calendarReducer,
  },
});
