// components/form/FormSelect.tsx
import React from 'react';
import { SelectOption } from '../../types/recruitmentFormTypes';

interface FormSelectProps {
  name: string;
  id?: string;
  required?: boolean;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  id,
  required = false,
  defaultValue,
  options,
  placeholder,
  className = ''
}) => {
  const baseClasses = "block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";
  
  return (
    <select
      name={name}
      id={id || name}
      required={required}
      defaultValue={defaultValue}
      className={`${baseClasses} ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default FormSelect;