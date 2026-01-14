// components/form/FormField.tsx
import React from 'react';
import { FormFieldProps } from '../../types/recruitmentFormTypes';

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  required = false 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default FormField;