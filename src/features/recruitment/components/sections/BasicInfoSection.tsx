// components/sections/BasicInfoSection.tsx
import React from 'react';
import { Recruiter, RecruitmentProcess, Requirement } from '../../types/recruitment';
import SalarySection from './SalarySection';

interface BasicInfoSectionProps {
  initialData?: RecruitmentProcess;
  recruiters: Recruiter[];
  loadingRecruiters: boolean;
  recruitersError: string | null;
  onRetryLoadRecruiters: () => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  initialData,
  recruiters,
  loadingRecruiters,
  recruitersError,
  onRetryLoadRecruiters
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Position Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título del Puesto *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={initialData?.requirement.title}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: Desarrollador Full Stack Senior"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Departamento *
          </label>
          <select
            name="department"
            id="department"
            required
            defaultValue={initialData?.requirement.department}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Seleccionar departamento</option>
            <option value="Technology">Tecnología</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Ventas</option>
            <option value="HR">Recursos Humanos</option>
            <option value="Finance">Finanzas</option>
            <option value="Operations">Operaciones</option>
            <option value="Design">Diseño</option>
            <option value="Product">Producto</option>
            <option value="Support">Soporte</option>
            <option value="Other">Otro</option>
          </select>
        </div>

        {/* WorkType */}
        <div>
          <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
            Ubicación *
          </label>
          <input
            type="text"
            name="workType"
            id="workType"
            required
            defaultValue={initialData?.requirement.workType}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: Lima, Perú / Remoto"
          />
        </div>

        {/* Work Type */}
        <div>
          <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
            Modalidad de Trabajo *
          </label>
          <select
            name="workType"
            id="workType"
            required
            defaultValue={initialData?.requirement.workType}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Seleccionar modalidad</option>
            <option value="Remote">Remoto</option>
            <option value="OnSite">Presencial</option>
            <option value="Hybrid">Híbrido</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
            Tipo de Empleo *
          </label>
          <select
            name="employmentType"
            id="employmentType"
            required
            defaultValue={initialData?.requirement.employmentType}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Seleccionar tipo</option>
            <option value="Full-time">Tiempo Completo</option>
            <option value="Part-time">Tiempo Parcial</option>
            <option value="Contract">Contrato</option>
            <option value="Internship">Práctica</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Prioridad *
          </label>
          <select
            name="priority"
            id="priority"
            required
            defaultValue={initialData?.requirement.priority || 'Medium'}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Low">Baja</option>
            <option value="Medium">Media</option>
            <option value="High">Alta</option>
            <option value="Urgent">Urgente</option>
          </select>
        </div>

        {/* Recruiter Assignment */}
        <div>
          <label htmlFor="recruiterId" className="block text-sm font-medium text-gray-700">
            Reclutador Asignado
          </label>
          
          {loadingRecruiters ? (
            <div className="mt-1 flex items-center px-3 py-2 border border-gray-300 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-500">Cargando reclutadores...</span>
            </div>
          ) : recruitersError ? (
            <div className="mt-1">
              <div className="flex items-center justify-between px-3 py-2 border border-red-300 rounded-md bg-red-50">
                <span className="text-sm text-red-600">{recruitersError}</span>
                <button
                  type="button"
                  onClick={onRetryLoadRecruiters}
                  className="text-sm text-red-700 underline hover:text-red-800"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <select
              name="recruiterId"
              id="recruiterId"
              defaultValue={initialData?.recruiterId || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Sin asignar</option>
              {recruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </select>
          )}
          
          {recruiters.length === 0 && !loadingRecruiters && !recruitersError && (
            <p className="mt-1 text-sm text-gray-500">
              No hay reclutadores disponibles
            </p>
          )}
        </div>

        {/* Expected Start Date */}
        <div>
          <label htmlFor="expectedStartDate" className="block text-sm font-medium text-gray-700">
            Fecha de Inicio Esperada
          </label>
          <input
            type="date"
            name="expectedStartDate"
            id="expectedStartDate"
            defaultValue={initialData?.requirement.expectedStartDate}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Nivel de Experiencia *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'Entry', label: 'Junior (0-2 años)' },
            { value: 'Mid', label: 'Semi-Senior (2-5 años)' },
            { value: 'Senior', label: 'Senior (5+ años)' },
            { value: 'Lead', label: 'Lead/Manager' }
          ].map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                defaultChecked={initialData?.requirement.experienceLevel === level.value}
                className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                required
              />
              <span className="text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Positions Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
            Urgencia de Contratación
          </label>
          <select
            name="urgency"
            id="urgency"
            defaultValue={initialData?.requirement.timeframe || 'Normal'}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="6+ months">Baja - Más de 6 meses</option>
            <option value="3-6 months">Normal - 3-6 meses</option>
            <option value="1-2 months">Alta - 1-2 semanas</option>
            <option value="Immediate">Inmediata - Menos de 2 semanas</option>
          </select>
        </div>
        
        <div>
          {/* Salary Section */}
          <SalarySection initialData={initialData?.requirement} />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;