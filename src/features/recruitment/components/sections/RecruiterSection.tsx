// components/sections/RecruiterSection.tsx
import React from 'react';
import FormField from '../form/FormField';
import FormSelect from '../form/FormSelect';
import { Recruiter } from '../../types/recruiter';

interface RecruiterSectionProps {
  initialData?: { recruiterId?: string };
  recruiters?: Recruiter[];
}

const RecruiterSection: React.FC<RecruiterSectionProps> = ({ 
  initialData, 
  recruiters = [] 
}) => {
  // Convertir la lista de reclutadores al formato de opciones esperado por FormSelect
  const recruiterOptions = recruiters.map(recruiter => ({
    value: recruiter.id,
    label: `${recruiter.name}${recruiter.department ? ` - ${recruiter.department}` : ''}`
  }));

  return (
    <FormField label="Reclutador Asignado" required>
      <FormSelect
        name="recruiterId"
        required
        defaultValue={initialData?.recruiterId}
        options={recruiterOptions}
        placeholder="Seleccionar reclutador..."
      />
    </FormField>
  );
};

export default RecruiterSection;