// components/AINotice.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AINoticeProps {
  hasDescription: boolean;
}

const AINotice: React.FC<AINoticeProps> = ({ hasDescription }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">AI-Enhanced Content</h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>
              {hasDescription 
                ? 'This content was automatically generated using AI based on your recruitment data. You can edit it or regenerate with different settings.'
                : 'Click "Regenerate with AI" to create optimized LinkedIn content using your recruitment data and current settings.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINotice;