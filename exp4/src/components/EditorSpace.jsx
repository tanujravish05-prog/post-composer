import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarView } from './Calendar/CalendarView';
import { UserCheck, ArrowLeft, Sparkles } from 'lucide-react';

const EditorSpace = ({ onSelectPost, onOpenCreateModal, onPreviewPost }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-white rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Editor Studio & Content Composer</h1>
              <p className="text-xs text-zinc-500">Logged in as {user?.name} ({user?.role?.toUpperCase()})</p>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary text-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-zinc-200 mb-6 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-700 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-zinc-900" />
            <span>Interactive Drag-and-Drop Scheduling Space active for Editors & Admins.</span>
          </div>
        </div>

        <CalendarView
          onSelectPost={onSelectPost}
          onOpenCreateModal={onOpenCreateModal}
          onPreviewPost={onPreviewPost}
        />
      </div>
    </div>
  );
};

export default EditorSpace;
