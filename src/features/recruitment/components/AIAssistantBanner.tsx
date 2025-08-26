// components/AIAssistantBanner.tsx
import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface AIAssistantBannerProps {
  isVisible: boolean;
}

const AIAssistantBanner: React.FC<AIAssistantBannerProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <BrainCircuit className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            AI Assistant is enabled
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>The AI will help optimize your recruitment process based on market trends and successful past hires.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantBanner;