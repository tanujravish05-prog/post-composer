import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostCard } from '../components/Calendar/PostCard';

describe('Performance Optimization Verifier (CO4 - BT4)', () => {
  it('prevents re-rendering when identical post props are supplied to React.memo PostCard', () => {
    const post = {
      id: 'post-perf-1',
      title: 'Performance Post',
      content: 'Testing re-render minimization',
      platform: 'linkedin',
      scheduledDate: '2026-09-03',
      scheduledTime: '12:00',
      status: 'scheduled'
    };

    const { rerender } = render(<PostCard post={post} onSelect={() => {}} compact={false} />);
    const renderBadgeBefore = screen.getByTitle('Render count for performance verification').textContent;
    expect(renderBadgeBefore).toBe('R:1');

    rerender(<PostCard post={post} onSelect={() => {}} compact={false} />);
    const renderBadgeAfter = screen.getByTitle('Render count for performance verification').textContent;

    expect(renderBadgeAfter).toBe('R:1');
  });
});
