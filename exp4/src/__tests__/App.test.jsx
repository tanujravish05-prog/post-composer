import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App, { 
  reducer, 
  createState, 
  dateKey, 
  parseDate, 
  addDays, 
  getCalendarDates 
} from '../App';

describe('Social Media Scheduler (User Provided Single-File Architecture)', () => {
  it('date helpers compute correct date keys and additions', () => {
    const d = new Date(2026, 8, 3); // Sep 3, 2026
    expect(dateKey(d)).toBe('2026-09-03');

    const nextDay = addDays(d, 1);
    expect(dateKey(nextDay)).toBe('2026-09-04');

    const prevDay = addDays(d, -1);
    expect(dateKey(prevDay)).toBe('2026-09-02');

    const dates = getCalendarDates(d);
    expect(dates.length).toBe(42);
  });

  it('reducer handles MOVE action cleanly', () => {
    const posts = [
      { id: '1', title: 'Post 1', date: '2026-09-03', time: '09:00', platform: 'Instagram', status: 'Scheduled' }
    ];
    const initialState = createState(posts);

    const nextState = reducer(initialState, { type: 'MOVE', id: '1', date: '2026-09-04' });

    expect(nextState.postsById['1'].date).toBe('2026-09-04');
    expect(nextState.postsByDate['2026-09-03']).not.toContain('1');
    expect(nextState.postsByDate['2026-09-04']).toContain('1');
  });

  it('reducer handles DELETE action cleanly', () => {
    const posts = [
      { id: '1', title: 'Post 1', date: '2026-09-03', time: '09:00', platform: 'Instagram', status: 'Scheduled' }
    ];
    const initialState = createState(posts);

    const nextState = reducer(initialState, { type: 'DELETE', id: '1' });

    expect(nextState.postsById['1']).toBeUndefined();
    expect(nextState.postsByDate['2026-09-03']).not.toContain('1');
  });

  it('renders application header, filters, and initial posts', () => {
    render(<App />);

    expect(screen.getByText(/Social Media Scheduler/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search posts.../i)).toBeInTheDocument();
    expect(screen.getByText('Product Launch')).toBeInTheDocument();
    expect(screen.getByText('Weekly Company Update')).toBeInTheDocument();
  });

  it('filters posts by platform dropdown', () => {
    render(<App />);

    const selects = screen.getAllByRole('combobox');
    const platformSelect = selects[0];

    fireEvent.change(platformSelect, { target: { value: 'LinkedIn' } });

    expect(screen.getByText('Weekly Company Update')).toBeInTheDocument();
    expect(screen.queryByText('Product Launch')).not.toBeInTheDocument();
  });
});
