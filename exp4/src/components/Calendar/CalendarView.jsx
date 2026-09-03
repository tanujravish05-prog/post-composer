import React from 'react';
import { useSelector } from 'react-redux';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';

export const CalendarView = ({ onSelectPost, onOpenCreateModal, onPreviewPost }) => {
  const viewMode = useSelector((state) => state.calendar.viewMode);

  return (
    <div className="w-full animate-fade-in" data-testid="calendar-view-container">
      {viewMode === 'month' && (
        <MonthView 
          onSelectPost={onSelectPost} 
          onOpenCreateModal={onOpenCreateModal} 
        />
      )}
      {viewMode === 'week' && (
        <WeekView 
          onSelectPost={onSelectPost} 
          onOpenCreateModal={onOpenCreateModal} 
        />
      )}
      {viewMode === 'day' && (
        <DayView 
          onSelectPost={onSelectPost} 
          onOpenCreateModal={onOpenCreateModal} 
          onPreviewPost={onPreviewPost}
        />
      )}
    </div>
  );
};
