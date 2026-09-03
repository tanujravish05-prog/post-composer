import React, { useRef } from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Facebook, 
  MessageSquare,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';

const platformIcons = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  facebook: Facebook,
  threads: MessageSquare,
};

const platformBadgeClasses = {
  twitter: 'badge-twitter',
  instagram: 'badge-instagram',
  linkedin: 'badge-linkedin',
  youtube: 'badge-youtube',
  facebook: 'badge-facebook',
  threads: 'badge-threads',
};

const PostCardComponent = ({ 
  post, 
  onSelect, 
  onDelete, 
  onPreview,
  compact = false 
}) => {
  const renderCounter = useRef(0);
  renderCounter.current += 1;

  const IconComponent = platformIcons[post.platform] || MessageSquare;
  const badgeClass = platformBadgeClasses[post.platform] || 'badge-twitter';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', post.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  if (compact) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(post);
        }}
        className={`group relative flex items-center justify-between gap-1.5 p-1.5 rounded text-xs font-medium cursor-grab active:cursor-grabbing border ${badgeClass}`}
        title={`${post.title} (${post.scheduledTime || 'All Day'})`}
        data-testid={`post-card-${post.id}`}
      >
        <div className="flex items-center gap-1 min-w-0 truncate">
          <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{post.title}</span>
        </div>
        <span className="text-[10px] opacity-80 font-mono flex-shrink-0 font-semibold">
          {post.scheduledTime}
        </span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(post)}
      className="glass-panel p-3.5 rounded-xl cursor-grab active:cursor-grabbing border border-zinc-200 hover:border-zinc-400 bg-white shadow-xs transition-all group flex flex-col gap-2 relative"
      data-testid={`post-card-full-${post.id}`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${badgeClass}`}>
          <IconComponent className="w-3 h-3" />
          {post.platform.toUpperCase()}
        </span>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
            post.status === 'scheduled' ? 'status-scheduled' :
            post.status === 'published' ? 'status-published' : 'status-draft'
          }`}>
            {post.status}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200" title="Render count for performance verification">
            R:{renderCounter.current}
          </span>
        </div>
      </div>

      <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h4>

      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
        {post.content}
      </p>

      {post.mediaUrl && (
        <div className="mt-1 h-24 w-full rounded-lg overflow-hidden relative border border-zinc-200">
          <img 
            src={post.mediaUrl} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500 mt-1">
        <div className="flex items-center gap-1.5 text-zinc-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{post.scheduledTime || '09:00'}</span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(post);
              }}
              className="p-1 hover:text-zinc-900 rounded hover:bg-zinc-100"
              title="Social Media Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
              className="p-1 hover:text-red-600 rounded hover:bg-red-50 text-red-500"
              title="Delete Post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PostCard = React.memo(PostCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.scheduledDate === nextProps.post.scheduledDate &&
    prevProps.post.scheduledTime === nextProps.post.scheduledTime &&
    prevProps.post.status === nextProps.post.status &&
    prevProps.compact === nextProps.compact
  );
});
