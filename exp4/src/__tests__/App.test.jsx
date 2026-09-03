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

describe('Social Media Scheduler (Telemetry Comparison Dashboard)', () => {
  it('renders Telemetry Comparison Dashboard with Optimized and Non-Optimized counters', () => {
    render(<App />);

    expect(screen.getByTestId('telemetry-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-render-val')).toBeInTheDocument();
    expect(screen.getByTestId('unoptimized-render-val')).toBeInTheDocument();
    expect(screen.getByText('Reset Telemetry')).toBeInTheDocument();
  });

  it('resets telemetry counters when Reset Telemetry button is clicked', () => {
    render(<App />);

    const resetBtn = screen.getByText('Reset Telemetry');
    fireEvent.click(resetBtn);

    expect(screen.getByTestId('optimized-render-val')).toHaveTextContent('0');
    expect(screen.getByTestId('unoptimized-render-val')).toHaveTextContent('0');
  });

  it('switches between Month View and Week View modes', () => {
    render(<App />);

    const weekBtn = screen.getByTestId('view-week-btn');
    fireEvent.click(weekBtn);

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getAllByText('09:00').length).toBeGreaterThan(0);
  });
});
