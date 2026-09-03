import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_POSTS } from '../utils/sampleData';

const initialState = {
  posts: INITIAL_POSTS,
  activePostId: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      const newPost = {
        id: `post-${Date.now()}`,
        status: 'scheduled',
        tags: [],
        mediaUrl: null,
        ...action.payload,
      };
      state.posts.unshift(newPost);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    reschedulePost: (state, action) => {
      const { id, newDate, newTime } = action.payload;
      const post = state.posts.find(p => p.id === id);
      if (post) {
        post.scheduledDate = newDate;
        if (newTime !== undefined) {
          post.scheduledTime = newTime;
        }
      }
    },
    updateStatus: (state, action) => {
      const { id, status } = action.payload;
      const post = state.posts.find(p => p.id === id);
      if (post) {
        post.status = status;
      }
    },
    setActivePostId: (state, action) => {
      state.activePostId = action.payload;
    },
    resetSampleData: (state) => {
      state.posts = INITIAL_POSTS;
    }
  }
});

export const { 
  addPost, 
  updatePost, 
  deletePost, 
  reschedulePost, 
  updateStatus, 
  setActivePostId, 
  resetSampleData 
} = postsSlice.actions;

export default postsSlice.reducer;
