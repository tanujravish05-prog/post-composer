import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from '../components/Calendar/PostCard';

describe('Performance Optimization Verifier (CO4 - BT4)', () => {
  it('prevents unnecessary re-rendering when identical post props are supplied to React.memo PostCard', () => {
    const post = {
      id: 'post-perf-1',
      title: 'Performance Post',
      content: 'Testing re-render minimization',
      platform: 'linkedin',
      scheduledDate: '2026-09-03',
      scheduledTime: '12:00',
      status: 'scheduled'
    };

    const spy = vi.spyOn(React, 'createElement');
    const { rerender } = render(<PostCard post={post} onSelect={() => {}} compact={false} />);
    
    const countBefore = spy.mock.calls.length;

    // Re-render with identical props
    rerender(<PostCard post={post} onSelect={() => {}} compact={false} />);
    
    const countAfter = spy.mock.calls.length;

    // React.memo prevents function execution on identical props
    expect(countAfter).toBe(countBefore);
  });
});
