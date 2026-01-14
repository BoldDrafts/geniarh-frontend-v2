import React from 'react';
import { Interview } from '../types/interview';
import InterviewCalendar from './InterviewCalendar';
import InterviewsTable from './InterviewsTable';

interface InterviewViewContainerProps {
  interviews: Interview[];
  onInterviewSelect: (interview: Interview) => void;
  onActionClick: (action: string, interview: Interview, event: React.MouseEvent) => void;
  loading?: boolean;
  viewMode: 'table' | 'calendar';
}

const InterviewViewContainer: React.FC<InterviewViewContainerProps> = ({
  interviews,
  onInterviewSelect,
  onActionClick,
  loading = false,
  viewMode,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-hidden">
            <InterviewsTable
              interviews={interviews}
              onInterviewSelect={onInterviewSelect}
              onActionClick={onActionClick}
              loading={loading}
            />
          </div>
        ) : (
          <InterviewCalendar
            interviews={interviews}
            onInterviewSelect={onInterviewSelect}
            loading={loading}
          />
        )}
    </div>
  );
};

export default InterviewViewContainer;