import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from '../components/Calendar/PostCard';

describe('Component Unit Testing: PostCard Memoization & Dragging (CO4/CO5)', () => {
  const mockPost = {
    id: 'post-1',
    title: 'Testing Memoization',
    content: 'Testing post card render performance',
    platform: 'twitter',
    scheduledDate: '2026-09-10',
    scheduledTime: '10:00',
    status: 'scheduled'
  };

  it('renders PostCard with title, platform badge, and time', () => {
    const handleSelect = vi.fn();
    render(<PostCard post={mockPost} onSelect={handleSelect} compact={false} />);

    expect(screen.getByText('Testing Memoization')).toBeInTheDocument();
    expect(screen.getByText('TWITTER')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('triggers onSelect callback when clicked', () => {
    const handleSelect = vi.fn();
    render(<PostCard post={mockPost} onSelect={handleSelect} compact={false} />);

    const card = screen.getByTestId('post-card-full-post-1');
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(mockPost);
  });

  it('attaches dragstart event with post id payload', () => {
    const handleSelect = vi.fn();
    render(<PostCard post={mockPost} onSelect={handleSelect} compact={false} />);

    const card = screen.getByTestId('post-card-full-post-1');
    
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };

    fireEvent.dragStart(card, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'post-1');
  });
});
