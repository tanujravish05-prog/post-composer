import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navbar } from './components/Header/Navbar';
import { StatsHeader } from './components/Analytics/StatsHeader';
import { CalendarView } from './components/Calendar/CalendarView';
import { PostModal } from './components/Modals/PostModal';
import { PostPreviewModal } from './components/Modals/PostPreviewModal';
import { PerformanceMonitor } from './components/Performance/PerformanceMonitor';
import { ToastContainer } from './components/Toast/ToastContainer';

export const App = () => {
  const theme = useSelector((state) => state.calendar.theme);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState(null);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState(null);

  const [defaultDate, setDefaultDate] = useState(null);
  const [defaultTime, setDefaultTime] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
          <span>PostPulse Interactive Social Scheduler (Exp 2 Look + Exp 4 Features & Redux)</span>
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
        <ToastContainer />
      </div>
    </div>
  );
};

export default App;
