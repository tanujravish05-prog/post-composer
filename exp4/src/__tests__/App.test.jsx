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

describe('Social Media Scheduler (Optimization Toggle & Render Monitoring)', () => {
  it('date helpers compute correct date keys and additions', () => {
    const d = new Date(2026, 8, 3);
    expect(dateKey(d)).toBe('2026-09-03');
    expect(dateKey(addDays(d, 1))).toBe('2026-09-04');
    expect(getCalendarDates(d).length).toBe(42);
  });

  it('toggles between OPTIMIZED and NON-OPTIMIZED modes', () => {
    render(<App />);

    const toggleBtn = screen.getByTestId('toggle-mode-btn');
    expect(toggleBtn).toHaveTextContent(/⚡ Mode: OPTIMIZED/i);

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/🐌 Mode: NON-OPTIMIZED/i);

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/⚡ Mode: OPTIMIZED/i);
  });

  it('displays component render counter badge R:1 on post cards', () => {
    render(<App />);
    const renderBadges = screen.getAllByTitle('Component Render Count');
    expect(renderBadges.length).toBeGreaterThan(0);
    expect(renderBadges[0]).toHaveTextContent('R:1');
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
