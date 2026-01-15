import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Calendar } from 'lucide-react';

export interface Stage {
  name: string;
  status: 'complete' | 'current' | 'upcoming' | 'cancelled';
  description?: string;
  dueDate?: string;
}

interface StageProgressProps {
  stages: Stage[];
}

const StageProgress: React.FC<StageProgressProps> = ({ stages }) => {
  const getStageIcon = (status: Stage['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'upcoming':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageClasses = (status: Stage['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'current':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'upcoming':
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getConnectorClasses = (currentStatus: Stage['status']) => {
    if (currentStatus === 'complete') {
      return 'bg-green-600';
    }
    if (currentStatus === 'current') {
      return 'bg-gradient-to-r from-green-600 to-blue-600';
    }
    if (currentStatus === 'cancelled') {
      return 'bg-red-600';
    }
    return 'bg-gray-300';
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return 'none';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    if (diffDays <= 7) return 'warning';
    return 'normal';
  };

  const getDueDateColor = (dueDate?: string) => {
    const status = getDueDateStatus(dueDate);
    switch (status) {
      case 'overdue': return 'text-red-600';
      case 'urgent': return 'text-orange-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.name}>
            {/* Stage */}
            <div className="flex flex-col items-center relative">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStageClasses(stage.status)}`}>
                {getStageIcon(stage.status)}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  stage.status === 'complete' ? 'text-green-800' :
                  stage.status === 'current' ? 'text-blue-800' :
                  stage.status === 'cancelled' ? 'text-red-800' :
                  'text-gray-600'
                }`}>
                  {stage.name}
                </div>
{stage.description && (
                   <div className="text-xs text-gray-500 mt-1 max-w-20 break-words">
                     {stage.description}
                   </div>
                 )}
                 {stage.dueDate && (
                   <div className={`flex items-center justify-center mt-1 text-xs ${getDueDateColor(stage.dueDate)}`}>
                     <Calendar className="h-3 w-3 mr-1" />
                     {formatDueDate(stage.dueDate)}
                   </div>
                 )}
              </div>
            </div>

            {/* Connector */}
            {index < stages.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={`h-0.5 ${getConnectorClasses(stage.status)}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
          <span className="text-gray-600">Complete</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 text-blue-600 mr-1" />
          <span className="text-gray-600">Current</span>
        </div>
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 text-gray-400 mr-1" />
          <span className="text-gray-600">Upcoming</span>
        </div>
        <div className="flex items-center">
          <XCircle className="h-3 w-3 text-red-600 mr-1" />
          <span className="text-gray-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default StageProgress;