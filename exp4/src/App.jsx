import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar/Sidebar';
import { UpcomingPanel } from './components/Sidebar/UpcomingPanel';
import { PublishingHeader } from './components/Header/PublishingHeader';
import { CalendarView } from './components/Calendar/CalendarView';
import { PostModal } from './components/Modals/PostModal';
import { PostPreviewModal } from './components/Modals/PostPreviewModal';
import { ToastContainer } from './components/Toast/ToastContainer';

export const App = () => {
  const theme = useSelector((state) => state.calendar.theme);
  const postsCount = useSelector((state) => state.posts.posts.length);

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
    <div className="flex min-h-screen bg-slate-100 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Screenshot Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex gap-6 p-6 min-w-0 max-w-[1600px] mx-auto w-full">
        {/* Main Center Card: Publishing Schedule */}
        <main className="flex-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col min-w-0">
          <PublishingHeader 
            onOpenCreateModal={handleOpenCreateModal} 
            postsCount={postsCount}
          />

          <div className="flex-1">
            <CalendarView
              onSelectPost={handleSelectPostForEdit}
              onOpenCreateModal={handleOpenCreateModal}
              onPreviewPost={handlePreviewPost}
            />
          </div>
        </main>

        {/* Screenshot Right Panel: Upcoming */}
        <UpcomingPanel onSelectPost={handleSelectPostForEdit} />
      </div>

      {/* Modals & Toast Notifications */}
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
  );
};

export default App;
