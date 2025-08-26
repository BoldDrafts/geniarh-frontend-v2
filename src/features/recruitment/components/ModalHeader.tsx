// components/ModalHeader.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  position: string;
  department: string;
  initialContent?: string;
  onClose: () => void;
  loading: boolean;
  isGenerating: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  position,
  department,
  initialContent,
  onClose,
  loading,
  isGenerating
}) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-200">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Create LinkedIn Publication</h2>
        <p className="text-sm text-gray-500 mt-1">
          {position} • {department}
          {initialContent && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              AI Generated
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onClose}
        disabled={loading || isGenerating}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ModalHeader;