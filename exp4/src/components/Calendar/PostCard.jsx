import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook, 
  MessageSquare,
  Clock,
  Eye,
  Trash2,
  Briefcase
} from 'lucide-react';

const platformBadgeClasses = {
  linkedin: 'bg-blue-600 text-white',
  instagram: 'bg-pink-600 text-white',
  twitter: 'bg-sky-600 text-white',
  facebook: 'bg-blue-700 text-white',
  threads: 'bg-purple-600 text-white',
};

const PostCardComponent = ({ 
  post, 
  onSelect, 
  onDelete, 
  onPreview,
  compact = false 
}) => {
  const badgeClass = platformBadgeClasses[post.platform] || 'bg-blue-600 text-white';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', post.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const formattedTime = post.scheduledTime ? (
    post.scheduledTime.startsWith('0') 
      ? `${parseInt(post.scheduledTime.split(':')[0])}${post.scheduledTime.split(':')[1] === '00' ? '' : ':' + post.scheduledTime.split(':')[1]}a`
      : parseInt(post.scheduledTime.split(':')[0]) > 12
        ? `${parseInt(post.scheduledTime.split(':')[0]) - 12}${post.scheduledTime.split(':')[1] === '00' ? '' : ':' + post.scheduledTime.split(':')[1]}p`
        : `${parseInt(post.scheduledTime.split(':')[0])}a`
  ) : '10a';

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
        className={`group relative flex flex-col gap-1 p-2 rounded-xl text-xs font-semibold cursor-grab active:cursor-grabbing shadow-sm transition-all hover:scale-[1.02] ${badgeClass}`}
        title={`${post.title} (${post.scheduledTime || 'All Day'})`}
        data-testid={`post-card-${post.id}`}
      >
        {/* Top Channel & Status Row matching screenshot */}
        <div className="flex items-center justify-between text-[10px] opacity-90">
          <div className="flex items-center gap-1 font-bold">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            <span className="capitalize">{post.platform}</span>
          </div>
          <span className="bg-white/20 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider">
            {post.status === 'scheduled' ? 'Sched' : post.status === 'published' ? 'Publ' : 'Draft'}
          </span>
        </div>

        {/* Post Title matching screenshot */}
        <h5 className="font-extrabold text-xs line-clamp-1 leading-tight text-white">
          {post.title}
        </h5>

        {/* Scheduled Time Row matching screenshot */}
        <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono">
          <Clock className="w-2.5 h-2.5" />
          <span>{formattedTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(post)}
      className="bg-white p-4 rounded-2xl cursor-grab active:cursor-grabbing border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col gap-2 relative"
      data-testid={`post-card-full-${post.id}`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>
          <Briefcase className="w-3 h-3" />
          {post.platform.toUpperCase()}
        </span>

        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
          post.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' :
          post.status === 'published' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {post.status}
        </span>
      </div>

      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {post.title}
      </h4>

      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {post.content}
      </p>

      {post.mediaUrl && (
        <div className="mt-1 h-28 w-full rounded-xl overflow-hidden relative border border-slate-100">
          <img 
            src={post.mediaUrl} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-400 mt-1">
        <div className="flex items-center gap-1.5 text-slate-500 font-mono font-semibold">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{post.scheduledTime || '09:00'}</span>
        </div>

        <div className="flex items-center gap-1">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(post);
              }}
              className="p-1.5 hover:text-indigo-600 rounded-lg hover:bg-slate-50"
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
              className="p-1.5 hover:text-red-600 rounded-lg hover:bg-slate-50"
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
