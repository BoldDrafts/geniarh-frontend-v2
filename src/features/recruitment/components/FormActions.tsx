// components/FormActions.tsx
import React from 'react';
import { Save } from 'lucide-react';

interface FormActionsProps {
  mode: 'create' | 'edit';
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  mode, 
  onCancel, 
  isSubmitting = false 
}) => (
  <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="mr-2 h-4 w-4" />
      {isSubmitting 
        ? (mode === 'create' ? 'Creating...' : 'Saving...') 
        : (mode === 'create' ? 'Create Recruitment' : 'Save Changes')
      }
    </button>
  </div>
);

export default FormActions;