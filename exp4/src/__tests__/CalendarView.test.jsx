import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';
import postsReducer from '../store/postsSlice';
import calendarReducer from '../store/calendarSlice';
import { App } from '../App';

const createMockStore = () => {
  return configureStore({
    reducer: {
      posts: postsReducer,
      calendar: calendarReducer,
    },
  });
};

describe('Integrated App Testing (Exp 3 Auth + Exp 4 Calendar Scheduler)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders login page by default for unauthenticated users', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostPulse Suite/i)).toBeInTheDocument();
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
      expect(screen.getByTestId('login-submit-btn')).toBeInTheDocument();
    });
  });

  it('allows quick-login as Admin and displays main Dashboard', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const adminBtn = await screen.findByTestId('quick-login-admin');
    fireEvent.click(adminBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/PostPulse/i).length).toBeGreaterThan(0);
      expect(screen.getByTestId('create-post-btn')).toBeInTheDocument();
      expect(screen.getByTestId('search-posts-input')).toBeInTheDocument();
    });
  });

  it('allows quick-login as Editor and navigates calendar views', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const editorBtn = await screen.findByTestId('quick-login-editor');
    fireEvent.click(editorBtn);

    await waitFor(() => {
      const weekBtn = screen.getByTestId('view-mode-week');
      fireEvent.click(weekBtn);
      expect(store.getState().calendar.viewMode).toBe('week');
    });
  });

  it('filters posts by platform and opens schedule modal', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const adminBtn = await screen.findByTestId('quick-login-admin');
    fireEvent.click(adminBtn);

    await waitFor(() => {
      const twitterFilter = screen.getByTestId('platform-filter-twitter');
      fireEvent.click(twitterFilter);
      expect(store.getState().calendar.selectedPlatform).toBe('twitter');

      const createBtn = screen.getByTestId('create-post-btn');
      fireEvent.click(createBtn);
      expect(screen.getByTestId('post-modal')).toBeInTheDocument();
    });
  });
});
