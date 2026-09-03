import React from 'react';
import { X, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export const PostPreviewModal = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" data-testid="preview-modal">
      <div className="glass-panel w-full max-w-sm p-4 rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-900/95 relative">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {post.platform} Social Preview
          </span>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                PP
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-100">PostPulse Official</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                </div>
                <span className="text-[10px] text-slate-500">@postpulse_app · Just now</span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-500" />
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {post.content}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="text-xs text-indigo-400 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.mediaUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video relative mt-1">
              <img src={post.mediaUrl} alt="Post attachment" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-xs">
            <div className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="text-[10px]">142</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer">
              <MessageCircle className="w-4 h-4" />
              <span className="text-[10px]">18</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
              <Share className="w-4 h-4" />
              <span className="text-[10px]">35</span>
            </div>
            <Bookmark className="w-4 h-4 hover:text-indigo-400 cursor-pointer" />
          </div>
        </div>

        <div className="mt-3 text-center text-[11px] text-slate-400 font-mono">
          Scheduled for <span className="text-indigo-300 font-semibold">{post.scheduledDate}</span> at <span className="text-indigo-300 font-semibold">{post.scheduledTime || '10:00'}</span>
        </div>
      </div>
    </div>
  );
};
