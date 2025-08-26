// components/FormHeader.tsx
import React from 'react';
import { X } from 'lucide-react';

interface FormHeaderProps {
  mode: 'create' | 'edit';
  onClose: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ mode, onClose }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-gray-900">
      {mode === 'create' ? 'Create New Recruitment' : 'Edit Recruitment'}
    </h2>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-500 transition-colors"
    >
      <X className="h-6 w-6" />
    </button>
  </div>
);

export default FormHeader;