import React from 'react';
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
        className={`group relative flex items-center justify-between gap-1.5 p-1.5 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] shadow-sm ${badgeClass}`}
        title={`${post.title} (${post.scheduledTime || 'All Day'})`}
        data-testid={`post-card-${post.id}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate font-semibold">{post.title}</span>
        </div>
        <span className="text-[10px] opacity-80 font-mono flex-shrink-0">
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
      className="glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-all group flex flex-col gap-2.5 relative bg-slate-900/80 shadow-md"
      data-testid={`post-card-full-${post.id}`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>
          <IconComponent className="w-3.5 h-3.5" />
          {post.platform.toUpperCase()}
        </span>

        <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
          post.status === 'scheduled' ? 'status-scheduled' :
          post.status === 'published' ? 'status-published' : 'status-draft'
        }`}>
          {post.status}
        </span>
      </div>

      <h4 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
        {post.title}
      </h4>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {post.content}
      </p>

      {post.mediaUrl && (
        <div className="mt-1 h-28 w-full rounded-xl overflow-hidden relative border border-slate-800">
          <img 
            src={post.mediaUrl} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs text-slate-400 mt-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{post.scheduledTime || '09:00'}</span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(post);
              }}
              className="p-1.5 hover:text-indigo-400 rounded-lg hover:bg-slate-800"
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
              className="p-1.5 hover:text-red-400 rounded-lg hover:bg-slate-800"
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

// CO4 Performance Optimization: React.memo prevents re-rendering when props are unchanged
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
