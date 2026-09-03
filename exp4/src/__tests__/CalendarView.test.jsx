import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import postsReducer from '../store/postsSlice';
import calendarReducer from '../store/calendarSlice';
import { App } from '../App';

const createMockStore = (customState = {}) => {
  return configureStore({
    reducer: {
      posts: postsReducer,
      calendar: calendarReducer,
    },
    preloadedState: customState,
  });
};

describe('Screenshot Layout Testing: PostPulse Calendar (CO3/CO5)', () => {
  it('renders application brand title Publishing Schedule and navigation controls', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/Publishing Schedule/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-post-btn')).toBeInTheDocument();
    expect(screen.getByTestId('search-posts-input')).toBeInTheDocument();
  });

  it('switches calendar views between Month, Week, and Day modes', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const weekBtn = screen.getByTestId('view-mode-week');
    fireEvent.click(weekBtn);
    expect(store.getState().calendar.viewMode).toBe('week');

    const dayBtn = screen.getByTestId('view-mode-day');
    fireEvent.click(dayBtn);
    expect(store.getState().calendar.viewMode).toBe('day');
  });

  it('filters posts by status dropdown selector', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const statusSelect = screen.getByTestId('status-filter-select');
    fireEvent.change(statusSelect, { target: { value: 'scheduled' } });
    expect(store.getState().calendar.selectedStatus).toBe('scheduled');
  });

  it('opens and closes the schedule new post modal', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const createBtn = screen.getByTestId('create-post-btn');
    fireEvent.click(createBtn);

    expect(screen.getByTestId('post-modal')).toBeInTheDocument();
    expect(screen.getByTestId('input-title')).toBeInTheDocument();
  });
});
