import { describe, it, expect } from 'vitest';
import postsReducer, { 
  addPost, 
  updatePost, 
  deletePost, 
  reschedulePost, 
  updateStatus 
} from '../store/postsSlice';

describe('Redux Toolkit: postsSlice (CO3/CO5)', () => {
  const initialState = {
    posts: [
      {
        id: 'post-test-1',
        title: 'Initial Post',
        content: 'Testing Redux state',
        platform: 'twitter',
        scheduledDate: '2026-09-10',
        scheduledTime: '10:00',
        status: 'scheduled',
      }
    ],
    activePostId: null
  };

  it('should handle adding a new post', () => {
    const newPostData = {
      title: 'New Post Title',
      content: 'New content body',
      platform: 'instagram',
      scheduledDate: '2026-09-15',
      scheduledTime: '14:00',
    };

    const nextState = postsReducer(initialState, addPost(newPostData));

    expect(nextState.posts.length).toBe(2);
    expect(nextState.posts[0].title).toBe('New Post Title');
    expect(nextState.posts[0].platform).toBe('instagram');
    expect(nextState.posts[0].status).toBe('scheduled');
  });

  it('should handle updating an existing post', () => {
    const updatePayload = {
      id: 'post-test-1',
      title: 'Updated Post Title',
      status: 'published'
    };

    const nextState = postsReducer(initialState, updatePost(updatePayload));

    expect(nextState.posts[0].title).toBe('Updated Post Title');
    expect(nextState.posts[0].status).toBe('published');
    expect(nextState.posts[0].platform).toBe('twitter');
  });

  it('should handle deleting a post', () => {
    const nextState = postsReducer(initialState, deletePost('post-test-1'));
    expect(nextState.posts.length).toBe(0);
  });

  it('should handle rescheduling a post via drag-and-drop', () => {
    const reschedulePayload = {
      id: 'post-test-1',
      newDate: '2026-09-20',
      newTime: '16:30'
    };

    const nextState = postsReducer(initialState, reschedulePost(reschedulePayload));

    expect(nextState.posts[0].scheduledDate).toBe('2026-09-20');
    expect(nextState.posts[0].scheduledTime).toBe('16:30');
  });

  it('should handle status updates', () => {
    const nextState = postsReducer(initialState, updateStatus({ id: 'post-test-1', status: 'draft' }));
    expect(nextState.posts[0].status).toBe('draft');
  });
});
