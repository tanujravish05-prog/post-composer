import React from 'react';
import { X, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export const PostPreviewModal = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fade-in" data-testid="preview-modal">
      <div className="glass-panel w-full max-w-sm p-4 rounded-2xl border border-zinc-300 bg-white shadow-xl relative">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            {post.platform} Social Preview
          </span>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
                PP
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-zinc-900">PostPulse Official</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                </div>
                <span className="text-[10px] text-zinc-500">@postpulse_app · Just now</span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>

          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
            {post.content}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="text-xs text-blue-600 font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.mediaUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-200 aspect-video relative mt-1">
              <img src={post.mediaUrl} alt="Post attachment" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-zinc-500 text-xs">
            <div className="flex items-center gap-1.5 hover:text-rose-600 cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px]">142</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[10px]">18</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-emerald-600 cursor-pointer">
              <Share className="w-3.5 h-3.5" />
              <span className="text-[10px]">35</span>
            </div>
            <Bookmark className="w-3.5 h-3.5 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>

        <div className="mt-3 text-center text-[11px] text-zinc-500 font-mono">
          Scheduled for <span className="text-zinc-900 font-bold">{post.scheduledDate}</span> at <span className="text-zinc-900 font-bold">{post.scheduledTime || '10:00'}</span>
        </div>
      </div>
    </div>
  );
};
