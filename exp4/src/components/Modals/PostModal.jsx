import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addPost, updatePost, deletePost } from '../../store/postsSlice';
import { addToast } from '../../store/calendarSlice';
import { X, Calendar, Clock, Image, Tag, Share2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const PostModal = ({ isOpen, onClose, initialData, defaultDate, defaultTime }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [status, setStatus] = useState('scheduled');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setPlatform(initialData.platform || 'twitter');
      setScheduledDate(initialData.scheduledDate || format(new Date(), 'yyyy-MM-dd'));
      setScheduledTime(initialData.scheduledTime || '10:00');
      setStatus(initialData.status || 'scheduled');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      setMediaUrl(initialData.mediaUrl || '');
    } else {
      setTitle('');
      setContent('');
      setPlatform('twitter');
      setScheduledDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
      setScheduledTime(defaultTime || '10:00');
      setStatus('scheduled');
      setTagsInput('');
      setMediaUrl('');
    }
  }, [initialData, defaultDate, defaultTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const postPayload = {
      title: title.trim(),
      content: content.trim(),
      platform,
      scheduledDate,
      scheduledTime,
      status,
      tags,
      mediaUrl: mediaUrl.trim() || null,
    };

    if (initialData?.id) {
      dispatch(updatePost({ id: initialData.id, ...postPayload }));
      dispatch(addToast({
        type: 'info',
        title: 'Post Saved',
        message: 'Your social post changes were saved successfully.'
      }));
    } else {
      dispatch(addPost(postPayload));
      dispatch(addToast({
        type: 'success',
        title: 'Post Scheduled',
        message: `Scheduled for ${platform.toUpperCase()} on ${scheduledDate}`
      }));
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialData?.id) {
      dispatch(deletePost(initialData.id));
      dispatch(addToast({
        type: 'warning',
        title: 'Post Deleted',
        message: 'The post was removed from your schedule.'
      }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" data-testid="post-modal">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/95 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            {initialData ? 'Edit Scheduled Post' : 'Schedule New Post'}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Headline / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🚀 Product Launch Update"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              data-testid="input-title"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Social Channel</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 capitalize"
              data-testid="input-platform"
            >
              <option value="twitter">X / Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="threads">Threads</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Execution Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                data-testid="input-date"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Time Slot
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                data-testid="input-time"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Content Copy</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your social post content here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              data-testid="input-content"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-indigo-400" />
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Hashtags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, Redux, Performance"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
            <div className="flex items-center gap-4">
              {['scheduled', 'draft', 'published'].map((st) => (
                <label key={st} className="flex items-center gap-2 text-xs text-slate-300 capitalize cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="status"
                    value={st}
                    checked={status === st}
                    onChange={(e) => setStatus(e.target.value)}
                    className="accent-indigo-500"
                  />
                  {st}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
            {initialData ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs" data-testid="submit-post-btn">
                {initialData ? 'Save Changes' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
