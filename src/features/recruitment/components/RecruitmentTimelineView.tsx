import React from 'react';
import StageProgress from './StageProgress';
import { Calendar } from 'lucide-react';
import { RecruitmentStage } from '../types/recruitmentProcess';

interface RecruitmentTimelineViewProps {
  stages: RecruitmentStage[];
  showDates?: boolean;
  compact?: boolean;
}

const RecruitmentTimelineView: React.FC<RecruitmentTimelineViewProps> = ({
  stages,
  showDates = true,
  compact = false
}) => {
  // Convert RecruitmentStage to Stage format for StageProgress
  const progressStages = stages.map(stage => ({
    name: stage.name,
    status: stage.status,
    description: stage.description,
    dueDate: stage.dueDate
  }));

  const getTimelineSummary = () => {
    const completedStages = stages.filter(s => s.status === 'COMPLETE').length;
    const currentStages = stages.filter(s => s.status === 'CURRENT').length;
    const totalStages = stages.length;
    
    const hasOverdue = stages.some(stage => {
      if (!stage.dueDate || stage.status === 'COMPLETE') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(stage.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    });

    return {
      progress: Math.round((completedStages / totalStages) * 100),
      completed: completedStages,
      current: currentStages,
      total: totalStages,
      hasOverdue
    };
  };

  const summary = getTimelineSummary();

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Progreso del Proceso</h4>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            summary.hasOverdue 
              ? 'bg-red-100 text-red-800' 
              : summary.progress === 100 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
          }`}>
            {summary.progress}% Completado
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              summary.hasOverdue 
                ? 'bg-red-500' 
                : summary.progress === 100 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
            }`}
            style={{ width: `${summary.progress}%` }}
          />
        </div>

        {showDates && (
          <div className="text-xs text-gray-600">
            {summary.completed} de {summary.total} etapas completadas
            {summary.current > 0 && ` • ${summary.current} en progreso`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Línea de Tiempo del Proceso</h3>
          <p className="text-sm text-gray-600 mt-1">
            Seguimiento de las etapas del reclutamiento
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {summary.hasOverdue && (
            <div className="flex items-center text-red-600 text-sm font-medium">
              <Calendar className="h-4 w-4 mr-1" />
              Hay etapas vencidas
            </div>
          )}
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{summary.progress}%</div>
            <div className="text-xs text-gray-500">
              {summary.completed}/{summary.total} completadas
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            summary.hasOverdue 
              ? 'bg-red-500' 
              : summary.progress === 100 
                ? 'bg-green-500' 
                : 'bg-blue-500'
          }`}
          style={{ width: `${summary.progress}%` }}
        />
      </div>

      {/* Stage Progress */}
      <StageProgress stages={progressStages} />

      {/* Detailed Timeline */}
      {showDates && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Detalles de Fechas</h4>
          <div className="space-y-3">
            {stages.map((stage) => (
              <div key={stage.name} className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full flex-shrink-0
                  ${stage.status === 'COMPLETE' ? 'bg-green-500' : 
                    stage.status === 'CURRENT' ? 'bg-blue-500' : 
                    stage.status === 'CANCELLED' ? 'bg-red-500' : 
                    'bg-gray-300'}
                `} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        stage.status === 'COMPLETE' ? 'bg-green-100 text-green-800' : 
                        stage.status === 'CURRENT' ? 'bg-blue-100 text-blue-800' : 
                        stage.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stage.status === 'COMPLETE' ? 'Completado' : 
                         stage.status === 'CURRENT' ? 'En progreso' : 
                         stage.status === 'CANCELLED' ? 'Cancelado' : 
                         'Pendiente'}
                      </span>
                    </div>
                    
                    {stage.dueDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(stage.dueDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  
                  {stage.description && (
                    <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentTimelineView;