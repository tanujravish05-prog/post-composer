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

describe('PostPulse NextGen Integration Testing (CO3/CO5)', () => {
  it('renders application brand title and navigation controls', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getAllByText(/PostPulse/i).length).toBeGreaterThan(0);
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

  it('filters posts by social platform filter pill', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const twitterFilter = screen.getByTestId('platform-filter-twitter');
    fireEvent.click(twitterFilter);
    expect(store.getState().calendar.selectedPlatform).toBe('twitter');
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

  it('toggles CO4 performance monitor panel overlay', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const perfBtn = screen.getByTestId('perf-toggle-btn');
    fireEvent.click(perfBtn);

    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
    expect(screen.getByText(/CO4\/CO5 Performance Telemetry/i)).toBeInTheDocument();
  });
});
