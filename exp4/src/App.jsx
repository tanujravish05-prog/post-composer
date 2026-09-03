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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        <Navbar onOpenCreateModal={handleOpenCreateModal} />
        <StatsHeader />
        <main className="mb-8">
          <CalendarView
            onSelectPost={handleSelectPostForEdit}
            onOpenCreateModal={handleOpenCreateModal}
            onPreviewPost={handlePreviewPost}
          />
        </main>
        <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800 flex items-center justify-between">
          <span>PostPulse NextGen Calendar Scheduler</span>
          <span>CO3 - BT3 | CO4 - BT4 | CO5 - BT5</span>
        </footer>

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
