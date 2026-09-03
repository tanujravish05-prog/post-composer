import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Calendar from '../App';

describe('Calendar Component (User Provided Code)', () => {
  it('renders Scheduled Posts header and month navigation toolbar', () => {
    render(<Calendar />);
    expect(screen.getByText('Scheduled Posts')).toBeInTheDocument();
    expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
  });

  it('renders initial scheduled post cards', () => {
    render(<Calendar />);
    expect(screen.getByText('Product launch')).toBeInTheDocument();
    expect(screen.getByText('Weekly company update')).toBeInTheDocument();
    expect(screen.getByText('Customer story')).toBeInTheDocument();
  });

  it('deletes a post card when delete button is clicked', () => {
    render(<Calendar />);
    const deleteBtn = screen.getByLabelText('Delete Product launch');
    fireEvent.click(deleteBtn);
    expect(screen.queryByText('Product launch')).not.toBeInTheDocument();
  });

  it('navigates next and previous month', () => {
    render(<Calendar />);
    const nextBtn = screen.getByText('→');
    fireEvent.click(nextBtn);
    expect(screen.getByText('October 2026')).toBeInTheDocument();

    const prevBtn = screen.getByText('←');
    fireEvent.click(prevBtn);
    expect(screen.getByText('September 2026')).toBeInTheDocument();
  });
});
