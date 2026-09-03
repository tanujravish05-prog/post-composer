import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App, { 
  reducer, 
  createState, 
  dateKey, 
  parseDate, 
  addDays, 
  getCalendarDates,
  getWeekDates
} from '../App';

describe('Social Media Scheduler (Month View & Week View with Drag-and-Drop Optimization)', () => {
  it('date helpers compute correct month and week date ranges', () => {
    const d = new Date(2026, 8, 3);
    expect(dateKey(d)).toBe('2026-09-03');
    expect(getCalendarDates(d).length).toBe(42);
    expect(getWeekDates(d).length).toBe(7);
  });

  it('switches between Month View and Week View modes', () => {
    render(<App />);

    const weekBtn = screen.getByTestId('view-week-btn');
    fireEvent.click(weekBtn);

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getAllByText('09:00').length).toBeGreaterThan(0);

    const monthBtn = screen.getByTestId('view-month-btn');
    fireEvent.click(monthBtn);

    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('toggles between OPTIMIZED and NON-OPTIMIZED rendering modes', () => {
    render(<App />);

    const toggleBtn = screen.getByTestId('toggle-mode-btn');
    expect(toggleBtn).toHaveTextContent(/⚡ Mode: OPTIMIZED/i);

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/🐌 Mode: NON-OPTIMIZED/i);
  });

  it('reducer handles MOVE action across date and time slots', () => {
    const posts = [
      { id: '1', title: 'Post 1', date: '2026-09-03', time: '09:00', platform: 'Instagram', status: 'Scheduled' }
    ];
    const initialState = createState(posts);

    const nextState = reducer(initialState, { 
      type: 'MOVE', 
      id: '1', 
      date: '2026-09-04', 
      time: '14:00' 
    });

    expect(nextState.postsById['1'].date).toBe('2026-09-04');
    expect(nextState.postsById['1'].time).toBe('14:00');
    expect(nextState.postsByDate['2026-09-03']).not.toContain('1');
    expect(nextState.postsByDate['2026-09-04']).toContain('1');
  });
});
