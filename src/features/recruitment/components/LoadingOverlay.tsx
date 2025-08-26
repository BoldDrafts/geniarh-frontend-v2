// components/LoadingOverlay.tsx
import React from 'react';
import { Loader2, BrainCircuit } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  position: string;
  department: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  position,
  department
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-1/2 mx-auto p-0 w-full max-w-md transform -translate-y-1/2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Regenerating Content
            </h3>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              AI is creating optimized content for your{' '}
              <span className="font-semibold text-blue-600">
                {position}
              </span>{' '}
              position in {department}...
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <BrainCircuit className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="ml-3 text-left">
                  <p className="text-sm text-blue-800 font-medium">AI Processing</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Analyzing preferences and generating fresh content
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              This usually takes 5-10 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;