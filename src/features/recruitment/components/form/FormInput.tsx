// components/form/FormInput.tsx
import React from 'react';

interface FormInputProps {
  type?: string;
  name: string;
  id?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  name,
  id,
  required = false,
  defaultValue,
  placeholder,
  className = ''
}) => {
  const baseClasses = "block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";
  
  return (
    <input
      type={type}
      name={name}
      id={id || name}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
    />
  );
};

export default FormInput;