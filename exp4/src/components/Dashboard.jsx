import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Header/Navbar';
import { StatsHeader } from './Analytics/StatsHeader';
import { CalendarView } from './Calendar/CalendarView';
import { PostModal } from './Modals/PostModal';
import { PostPreviewModal } from './Modals/PostPreviewModal';
import { PerformanceMonitor } from './Performance/PerformanceMonitor';
import { ToastContainer } from './Toast/ToastContainer';
import { ConsoleLog } from './ConsoleLog';
import { LogOut, ShieldCheck, UserCheck, Terminal } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState(null);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [defaultDate, setDefaultDate] = useState(null);
  const [defaultTime, setDefaultTime] = useState(null);

  const handleOpenCreateModal = (dateStr = null, timeStr = null) => {
    setSelectedPostForEdit(null);
    setDefaultDate(dateStr);
    setDefaultTime(timeStr);
    setIsCreateModalOpen(true);
  };

  const handleSelectPostForEdit = (post) => {
    setSelectedPostForEdit(post);
    setIsCreateModalOpen(true);
  };

  const handlePreviewPost = (post) => {
    setSelectedPostForPreview(post);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Account Bar from Exp 3 with Exp 2 Look */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 glass-panel rounded-xl border border-zinc-200 mb-6 bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900">{user?.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {user?.role}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">Authenticated Session</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin-panel')}
                className="btn btn-secondary text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                Admin Panel
              </button>
            )}

            {(user?.role === 'admin' || user?.role === 'editor') && (
              <button
                onClick={() => navigate('/editor-space')}
                className="btn btn-secondary text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-zinc-700" />
                Editor Space
              </button>
            )}

            <button
              onClick={() => setIsConsoleOpen(true)}
              className="btn btn-secondary text-xs"
              title="Open Security & Network Logs"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-700" />
              Logs
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn btn-danger text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Toolbar */}
        <Navbar onOpenCreateModal={handleOpenCreateModal} />

        {/* KPI Analytics Stats */}
        <StatsHeader />

        {/* Master Interactive Calendar Views */}
        <main className="mb-8">
          <CalendarView
            onSelectPost={handleSelectPostForEdit}
            onOpenCreateModal={handleOpenCreateModal}
            onPreviewPost={handlePreviewPost}
          />
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-500 py-4 border-t border-zinc-200 flex items-center justify-between">
          <span>PostPulse (Exp 2 Visual Look + Exp 4 Features & Redux)</span>
          <span>CO3 - BT3 | CO4 - BT4 | CO5 - BT5</span>
        </footer>

        {/* Modals & Telemetry Overlays */}
        <PostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialData={selectedPostForEdit}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
        />

        <PostPreviewModal
          post={selectedPostForPreview}
          onClose={() => setSelectedPostForPreview(null)}
        />

        <PerformanceMonitor />
        <ConsoleLog isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />
        <ToastContainer />
      </div>
    </div>
  );
};

export default Dashboard;
