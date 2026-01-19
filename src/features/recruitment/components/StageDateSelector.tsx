import React, { useState, useEffect, useRef } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { STAGE_NAMES_MAP, stageDueDateService } from '../api/stageDueDateService';
import { StageDueDate } from '../types/stageDueDate';
import { RecruitmentStage } from '../types/recruitmentProcess';

import { OveralStatusEnum } from './RecruitmentStagesWithDates';
import { RecruitmentStageEnum } from '../types/base';

interface StageDateSelectorProps {
  stage: RecruitmentStage;
  recruitmentId: string;
  onDueDateChange: (stageName: string, dueDate: string) => void;
  disabled?: boolean;
  existingStageDueDate?: StageDueDate | null;
  onUpdateStageDueDate?: (updatedDueDate: StageDueDate) => void;
}

export const recruitmentStageLabeltoKey = (stage: string): RecruitmentStageEnum => {
  for (const [key, value] of Object.entries(STAGE_NAMES_MAP)) {
    if (value === stage) {
      return key as RecruitmentStageEnum;
    }
  }
  throw new Error("No se mapeo el stage.")
}

const StageDateSelector: React.FC<StageDateSelectorProps> = ({
  stage,
  recruitmentId,
  onDueDateChange,
  disabled = false,
  existingStageDueDate: propExistingStageDueDate = null,
  onUpdateStageDueDate
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [existingStageDueDate, setExistingStageDueDate] = useState<StageDueDate | null>(propExistingStageDueDate);
  const [hasChanges, setHasChanges] = useState(false);
  const [inputValue, setInputValue] = useState<string>(stage.dueDate || '');
  const initializedRef = useRef(false);

  // Sincronizar con el prop cuando cambia
  useEffect(() => {
    setExistingStageDueDate(propExistingStageDueDate);
  }, [propExistingStageDueDate]);

  // Sincronizar el input con el stage.dueDate cuando cambia
  useEffect(() => {
    setInputValue(stage.dueDate || '');
  }, [stage.dueDate]);

  // Inicializar la fecha del stage si existe una fecha de vencimiento (solo una vez)
  useEffect(() => {
    if (!initializedRef.current && existingStageDueDate && existingStageDueDate.dueDate) {
      onDueDateChange(stage.name, existingStageDueDate.dueDate);
      setInputValue(existingStageDueDate.dueDate);
      initializedRef.current = true;
    }
  }, [existingStageDueDate, stage.name]); // Eliminar onDueDateChange de las dependencias

  // Guardar o actualizar la fecha
  const handleSaveDate = async () => {
    if (!inputValue) {
      return;
    }

    setIsSaving(true);
    try {
      if (existingStageDueDate) {
        // Actualizar fecha existente
        const updatedDueDate = await stageDueDateService.updateStageDueDate(
          recruitmentId,
          existingStageDueDate.id,
          {
            dueDate: inputValue,
            isCompleted: stage.status === 'COMPLETE'
          }
        );
        setExistingStageDueDate(updatedDueDate);
        if (onUpdateStageDueDate) {
          onUpdateStageDueDate(updatedDueDate);
        }
      } else {
        // Crear nueva fecha
        const newDueDate = await stageDueDateService.createForStage(
          recruitmentId,
          recruitmentStageLabeltoKey(stage.name) as StageDueDate['stage'],
          stage.status as StageDueDate['status'],
          inputValue
        );
        setExistingStageDueDate(newDueDate);
        if (onUpdateStageDueDate) {
          onUpdateStageDueDate(newDueDate);
        }
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving stage due date:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Detectar cambios
  const handleDateChange = (stageName: string, dueDate: string) => {
    setInputValue(dueDate);
    // Solo llamar a onDueDateChange si el valor realmente cambió
    if (dueDate !== (existingStageDueDate?.dueDate || stage.dueDate || '')) {
      onDueDateChange(stageName, dueDate);
    }
    setHasChanges(existingStageDueDate ? existingStageDueDate.dueDate !== dueDate : !!dueDate);
  };
  const getDueDateStatus = () : OveralStatusEnum => {
    if (!inputValue) return 'NONE';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(inputValue);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (stage.status === 'COMPLETE') return 'COMPLETED';
    if (diffDays < 0) return 'OVERDUE';
    if (diffDays <= 3) return 'URGENT';
    if (diffDays <= 7) return 'WARNING';
    return 'NORMAL';
  };

  const getStatusIcon = () => {
    const status = getDueDateStatus();
    
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    const status = getDueDateStatus();
    
    switch (status) {
      case 'COMPLETED':
        return 'border-green-200 bg-green-50';
      case 'OVERDUE':
        return 'border-red-200 bg-red-50';
      case 'URGENT':
        return 'border-orange-200 bg-orange-50';
      case 'WARNING':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusText = () => {
    if (!inputValue) return '';
    
    const status = getDueDateStatus();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(inputValue);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'OVERDUE':
        return `${Math.abs(diffDays)} día(s) vencido`;
      case 'URGENT':
        return `Vence en ${diffDays} día(s)`;
      case 'WARNING':
        return `Vence en ${diffDays} día(s)`;
      default:
        return `Vence en ${diffDays} día(s)`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`border rounded-lg p-3 transition-colors ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm text-gray-900">{stage.name}</span>
        </div>
        {stage.status === 'COMPLETE' && (
          <span className="text-xs text-green-600 font-medium">Completado</span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600 font-medium">
            Fecha de vencimiento:
          </label>
          {inputValue && (
            <span className="text-xs text-gray-500">
              {formatDate(inputValue)}
            </span>
          )}
        </div>
        
        <input
          type="date"
          value={inputValue || ''}
          onChange={(e) => handleDateChange(stage.name, e.target.value)}
          disabled={disabled || stage.status === 'COMPLETE'}
          className={`
            w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 
            focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${disabled || stage.status === 'COMPLETE' 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-300'
            }
          `}
          min={new Date().toISOString().split('T')[0]}
        />

        {hasChanges && inputValue && (
          <button
            onClick={handleSaveDate}
            disabled={isSaving}
            className={`
              w-full flex items-center justify-center space-x-1 px-2 py-1 text-xs font-medium rounded-md 
              transition-colors duration-200
              ${isSaving 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }
            `}
          >
            <Save className="h-3 w-3" />
            <span>{isSaving ? 'Guardando...' : 'Guardar fecha'}</span>
          </button>
        )}
        
        {getStatusText() && (
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <span className={`
              text-xs font-medium
              ${getDueDateStatus() === 'OVERDUE' ? 'text-red-600' : 
                getDueDateStatus() === 'URGENT' ? 'text-orange-600' : 
                getDueDateStatus() === 'WARNING' ? 'text-yellow-600' : 
                getDueDateStatus() === 'COMPLETED' ? 'text-green-600' : 
                'text-gray-600'
              }
            `}>
              {getStatusText()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageDateSelector;