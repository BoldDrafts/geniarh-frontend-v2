// components/ErrorDisplay.tsx
import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onDismiss, 
  variant = 'error' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getVariantClasses()}`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium mb-1">
            {variant === 'warning' ? 'Warning' : 'Upload Error'}
          </h3>
          <p className="text-sm">{error}</p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex items-center space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center text-sm font-medium hover:underline"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium hover:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 ${getIconColor()} hover:opacity-70`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;