import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

// Pre-populate initial posts for rich default experience
const initialPosts = [
  {
    id: 'post_init_1',
    platform: 'twitter',
    content: '🚀 Unleashing the power of Redux Toolkit Entity Adapters in state management. It is O(1) lookups all the way down! #Redux #WebDev',
    status: 'published',
    scheduledTime: null,
    publishedTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    likes: 42,
    views: 890,
    shares: 12,
    comments: 3
  },
  {
    id: 'post_init_2',
    platform: 'linkedin',
    content: 'I am thrilled to announce our team has successfully migrated our social media analytics pipeline to Redux. The performance gains in state reconciliation are outstanding.',
    status: 'published',
    scheduledTime: null,
    publishedTime: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    likes: 128,
    views: 2450,
    shares: 18,
    comments: 24
  },
  {
    id: 'post_init_3',
    platform: 'instagram',
    content: 'Coding in dark mode is not a preference, it is a lifestyle. 💻✨ #developer #uidesign #webdevelopment #programmer',
    status: 'draft',
    scheduledTime: null,
    publishedTime: null,
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    likes: 0,
    views: 0,
    shares: 0,
    comments: 0
  },
  {
    id: 'post_init_4',
    platform: 'facebook',
    content: 'Our upcoming Product Launch Event is officially scheduled! Join us live next Friday as we reveal what we have been building.',
    status: 'scheduled',
    scheduledTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    publishedTime: null,
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
    likes: 0,
    views: 0,
    shares: 0,
    comments: 0
  }
];

const ids = initialPosts.map(p => p.id);
const entities = {};
initialPosts.forEach(p => {
  entities[p.id] = p;
});

export const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.timestamp.localeCompare(a.timestamp)
});

// Thunk to publish post asynchronously
export const publishPostAsync = createAsyncThunk(
  'posts/publishPostAsync',
  async (postId, thunkAPI) => {
    const state = thunkAPI.getState();
    const simulateError = state.posts.simulatePublishError;
    const post = state.posts.entities[postId];
    
    if (!post) {
      return thunkAPI.rejectWithValue('Post not found');
    }

    thunkAPI.dispatch(addActivityLog({
      action: 'PUBLISH_PENDING',
      message: `Attempting to publish post to ${post.platform.toUpperCase()}...`,
      platform: post.platform
    }));

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (simulateError) {
          thunkAPI.dispatch(addActivityLog({
            action: 'PUBLISH_FAILED',
            message: `Failed to publish to ${post.platform.toUpperCase()}: API connection refused.`,
            platform: post.platform
          }));
          reject(new Error('Connection failed: Social network API timed out.'));
        } else {
          thunkAPI.dispatch(addActivityLog({
            action: 'PUBLISH_SUCCESS',
            message: `Successfully published post to ${post.platform.toUpperCase()}!`,
            platform: post.platform
          }));
          resolve({
            id: postId,
            publishedTime: new Date().toISOString(),
            likes: Math.floor(Math.random() * 50) + 10,
            views: Math.floor(Math.random() * 500) + 100,
            shares: Math.floor(Math.random() * 10) + 1,
            comments: Math.floor(Math.random() * 5)
          });
        }
      }, 1200); // 1.2 seconds simulation latency
    });
  }
);

// Thunk to simulate syncing metrics
export const syncSocialMetrics = createAsyncThunk(
  'posts/syncSocialMetrics',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(addActivityLog({
      action: 'SYNC_PENDING',
      message: 'Syncing live post analytics from platforms...'
    }));

    return new Promise((resolve) => {
      setTimeout(() => {
        const state = thunkAPI.getState();
        const posts = Object.values(state.posts.entities);
        const publishedPosts = posts.filter(p => p.status === 'published');
        
        // Generate new analytics metrics for published posts
        const updates = publishedPosts.map(post => {
          const likesDiff = Math.floor(Math.random() * 15);
          const viewsDiff = Math.floor(Math.random() * 120);
          const sharesDiff = Math.floor(Math.random() * 3);
          const commentsDiff = Math.floor(Math.random() * 2);
          
          return {
            id: post.id,
            changes: {
              likes: (post.likes || 0) + likesDiff,
              views: (post.views || 0) + viewsDiff,
              shares: (post.shares || 0) + sharesDiff,
              comments: (post.comments || 0) + commentsDiff
            }
          };
        });

        thunkAPI.dispatch(addActivityLog({
          action: 'SYNC_SUCCESS',
          message: `Synced metrics for ${publishedPosts.length} published posts.`
        }));

        resolve(updates);
      }, 1000);
    });
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({
    ids,
    entities,
    isLoading: false,
    error: null,
    simulatePublishError: false,
    history: [
      {
        id: 'init_1',
        time: new Date().toLocaleTimeString(),
        action: 'SYSTEM',
        message: 'Redux Social Dashboard store initialized with preloaded posts.'
      }
    ]
  }),
  reducers: {
    addPost: (state, action) => {
      const { platform, content, status, scheduledTime } = action.payload;
      const id = 'post_' + Date.now();
      const newPost = {
        id,
        platform,
        content,
        status,
        scheduledTime: status === 'scheduled' ? scheduledTime : null,
        publishedTime: status === 'published' ? new Date().toISOString() : null,
        timestamp: new Date().toISOString(),
        likes: status === 'published' ? Math.floor(Math.random() * 20) : 0,
        views: status === 'published' ? Math.floor(Math.random() * 150) : 0,
        shares: status === 'published' ? Math.floor(Math.random() * 5) : 0,
        comments: status === 'published' ? Math.floor(Math.random() * 2) : 0,
      };

      postsAdapter.addOne(state, newPost);
      
      state.history.unshift({
        id: 'log_' + Date.now() + Math.random().toString().slice(2, 6),
        time: new Date().toLocaleTimeString(),
        action: 'CREATE_POST',
        platform,
        message: `Created ${status.toUpperCase()} post for ${platform.toUpperCase()}.`
      });
    },
    updatePost: (state, action) => {
      const { id, content, platform, status, scheduledTime } = action.payload;
      const oldPost = state.entities[id];
      
      postsAdapter.updateOne(state, {
        id,
        changes: {
          content,
          platform,
          status,
          scheduledTime: status === 'scheduled' ? scheduledTime : null,
          publishedTime: status === 'published' && (!oldPost || oldPost.status !== 'published') ? new Date().toISOString() : (status === 'published' ? oldPost.publishedTime : null)
        }
      });

      state.history.unshift({
        id: 'log_' + Date.now() + Math.random().toString().slice(2, 6),
        time: new Date().toLocaleTimeString(),
        action: 'UPDATE_POST',
        platform,
        message: `Updated post [${id}] details on ${platform.toUpperCase()}.`
      });
    },
    deletePost: (state, action) => {
      const id = action.payload;
      const post = state.entities[id];
      if (post) {
        postsAdapter.removeOne(state, id);
        state.history.unshift({
          id: 'log_' + Date.now() + Math.random().toString().slice(2, 6),
          time: new Date().toLocaleTimeString(),
          action: 'DELETE_POST',
          platform: post.platform,
          message: `Deleted ${post.status} post from ${post.platform.toUpperCase()}.`
        });
      }
    },
    setSimulatePublishError: (state, action) => {
      state.simulatePublishError = action.payload;
    },
    addActivityLog: (state, action) => {
      const { action: act, message, platform } = action.payload;
      state.history.unshift({
        id: 'log_' + Date.now() + Math.random().toString().slice(2, 6),
        time: new Date().toLocaleTimeString(),
        action: act,
        platform,
        message
      });
    },
    clearActivityLogs: (state) => {
      state.history = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishPostAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishPostAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, publishedTime, likes, views, shares, comments } = action.payload;
        postsAdapter.updateOne(state, {
          id,
          changes: {
            status: 'published',
            publishedTime,
            likes,
            views,
            shares,
            comments
          }
        });
      })
      .addCase(publishPostAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(syncSocialMetrics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncSocialMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        postsAdapter.updateMany(state, action.payload);
      })
      .addCase(syncSocialMetrics.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const {
  addPost,
  updatePost,
  deletePost,
  setSimulatePublishError,
  addActivityLog,
  clearActivityLogs
} = postsSlice.actions;

export const postsSelectors = postsAdapter.getSelectors((state) => state.posts);

export default postsSlice.reducer;
