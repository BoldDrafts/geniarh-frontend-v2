// components/ModalActions.tsx
import React from 'react';
import { Loader2, Send } from 'lucide-react';

interface ModalActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  isGenerating: boolean;
  autoPost: boolean;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  onSubmit,
  loading,
  isGenerating,
  autoPost
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading || isGenerating}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || isGenerating}
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </div>
          ) : (
            <div className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              {autoPost ? 'Create & Publish' : 'Create Publication'}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModalActions;