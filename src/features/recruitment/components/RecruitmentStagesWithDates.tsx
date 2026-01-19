import React, { useState, useEffect, useRef } from 'react';
import { RecruitmentStage } from '../types/recruitmentProcess';
import { StageDueDate } from '../types/stageDueDate';
import { stageDueDateService } from '../api/stageDueDateService';
import StageDateSelector from './StageDateSelector';

interface RecruitmentStagesWithDatesProps {
  stages: RecruitmentStage[];
  onStageDateChange: (stageName: string, dueDate: string) => void;
  disabled?: boolean;
  title?: string;
  recruitmentId: string;
}

export type OveralStatusEnum = 'OVERDUE' | 'URGENT' | 'WARNING' | 'GRAY' | 'NORMAL' | 'COMPLETED' | 'NONE';

interface OverallStatusDto {
  status: OveralStatusEnum;
  color: string;
  text: string;
}

const RecruitmentStagesWithDates: React.FC<RecruitmentStagesWithDatesProps> = ({
  stages,
  onStageDateChange,
  disabled = false,
  title = 'Fechas de Vencimiento por Etapa',
  recruitmentId
}) => {
  const [stageDueDates, setStageDueDates] = useState<Record<string, StageDueDate>>({});
  const loadedRecruitmentId = useRef<string | null>(null);

  // Cargar todas las fechas de vencimiento de una sola vez
  useEffect(() => {
    // Evitar cargar el mismo recruitmentId múltiples veces
    if (!recruitmentId || loadedRecruitmentId.current === recruitmentId) return;

    const loadAllStageDueDates = async () => {
      try {
        loadedRecruitmentId.current = recruitmentId; // Marcar como cargado antes de la llamada
        
        const response = await stageDueDateService.getStageDueDates(recruitmentId, { limit: 100 });
        const dueDatesMap: Record<string, StageDueDate> = {};
        
        response.data.forEach(dueDate => {
          dueDatesMap[dueDate.stage] = dueDate;
        });
        
        setStageDueDates(dueDatesMap);
        
        // Actualizar los stages con las fechas existentes
        response.data.forEach(dueDate => {
          onStageDateChange(dueDate.stage, dueDate.dueDate);
        });
      } catch {
        console.log('No existing due dates found for recruitment:', recruitmentId);
      }
    };

    loadAllStageDueDates();
  }, [recruitmentId]); // Eliminar onStageDateChange de las dependencias

  const getOverallStatus = () : OverallStatusDto => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let hasOverdue = false;
    let hasUrgent = false;
    let hasWarning = false;
    
    for (const stage of stages) {
      if (!stage.dueDate || stage.status === 'COMPLETE') continue;
      
      const dueDate = new Date(stage.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffTime < 0) {
        hasOverdue = true;
        break;
      } else if (diffDays <= 3) {
        hasUrgent = true;
      } else if (diffDays <= 7) {
        hasWarning = true;
      }
    }
    
    if (hasOverdue) return { status: 'OVERDUE', color: 'red', text: 'Hay etapas vencidas' };
    if (hasUrgent) return { status: 'URGENT', color: 'orange', text: 'Hay etapas próximas a vencer (≤ 3 días)' };
    if (hasWarning) return { status: 'WARNING', color: 'yellow', text: 'Hay etapas con fecha cercana (≤ 7 días)' };
    return { status: 'NORMAL', color: 'GRAY', text: 'Todas las etapas están en tiempo' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-4">
      {/* Header con estado general */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-${overallStatus.color}-50 text-${overallStatus.color}-800`}>
          <div className={`w-2 h-2 rounded-full bg-${overallStatus.color}-400`} />
          <span>{overallStatus.text}</span>
        </div>
      </div>

      {/* Grid de etapas con selectores de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.filter((stage) => stage.name != 'Created').map((stage) => (
          <StageDateSelector
            key={stage.name}
            stage={stage}
            onDueDateChange={onStageDateChange}
            disabled={disabled}
            recruitmentId={recruitmentId}
            existingStageDueDate={stageDueDates[stage.name] || null}
            onUpdateStageDueDate={(updatedDueDate: StageDueDate) => {
              setStageDueDates(prev => ({
                ...prev,
                [stage.name]: updatedDueDate
              }));
            }}
          />
        ))}
      </div>

      {/* Resumen de fechas */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Resumen de Fechas</h4>
        <div className="space-y-2">
          {stages
            .filter(stage => stage.dueDate)
            .sort((a, b) => {
              if (!a.dueDate || !b.dueDate) return 0;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .map((stage) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const dueDate = new Date(stage.dueDate!);
              dueDate.setHours(0, 0, 0, 0);
              
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              let statusColor = 'text-gray-600';
              let statusText = '';
              
              if (stage.status === 'COMPLETE') {
                statusColor = 'text-green-600';
                statusText = 'Completado';
              } else if (diffDays < 0) {
                statusColor = 'text-red-600';
                statusText = `${Math.abs(diffDays)} día(s) vencido`;
              } else if (diffDays <= 3) {
                statusColor = 'text-orange-600';
                statusText = `Vence en ${diffDays} día(s)`;
              } else if (diffDays <= 7) {
                statusColor = 'text-yellow-600';
                statusText = `Vence en ${diffDays} día(s)`;
              } else {
                statusColor = 'text-gray-600';
                statusText = `Vence en ${diffDays} día(s)`;
              }
              
              return (
                <div key={stage.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{stage.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">
                      {new Date(stage.dueDate!).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                    <span className={`font-medium ${statusColor}`}>{statusText}</span>
                  </div>
                </div>
              );
            })}
          
          {stages.filter(stage => stage.dueDate).length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No se han configurado fechas de vencimiento para las etapas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentStagesWithDates;