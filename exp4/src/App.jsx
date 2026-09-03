import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopHeader } from './components/Header/TopHeader';
import { StatsHeader } from './components/Analytics/StatsHeader';
import { CalendarView } from './components/Calendar/CalendarView';
import { PostModal } from './components/Modals/PostModal';
import { PostPreviewModal } from './components/Modals/PostPreviewModal';
import { ToastContainer } from './components/Toast/ToastContainer';

export const App = () => {
  const theme = useSelector((state) => state.calendar.theme);
  const activeNavTab = useSelector((state) => state.calendar.activeNavTab);

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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Production Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <TopHeader onOpenCreateModal={handleOpenCreateModal} />
        
        <StatsHeader />

        <main className="flex-1 mb-8">
          <CalendarView
            onSelectPost={handleSelectPostForEdit}
            onOpenCreateModal={handleOpenCreateModal}
            onPreviewPost={handlePreviewPost}
          />
        </main>

        <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-900 flex items-center justify-between">
          <span>PostPulse Pro Social Operations Platform</span>
          <span>CO3 · CO4 · CO5 Compliant</span>
        </footer>

        {/* Modals & Toasts */}
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

        <ToastContainer />
      </div>
    </div>
  );
};

export default App;
