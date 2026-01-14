import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FullScreenLoaderProps {
  show: boolean;
  text?: string;
  subText?: string;
  variant?: 'default' | 'blur' | 'dark';
  showProgress?: boolean;
  progress?: number;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  show,
  text = 'Loading...',
  subText,
  variant = 'default',
  showProgress = false,
  progress = 0
}) => {
  if (!show) return null;

  const getBackgroundClass = () => {
    switch (variant) {
      case 'blur':
        return 'bg-white bg-opacity-80 backdrop-blur-sm';
      case 'dark':
        return 'bg-gray-900 bg-opacity-75';
      default:
        return 'bg-white bg-opacity-90';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${getBackgroundClass()}`}>
      <div className="text-center p-8 rounded-lg max-w-md w-full mx-4">
        {/* Spinner principal */}
        <div className="mb-6">
          <LoadingSpinner size="lg" variant="spinner" />
        </div>
        
        {/* Texto principal */}
        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-900">{text}</h3>
        </div>
        
        {/* Subtexto */}
        {subText && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{subText}</p>
          </div>
        )}
        
        {/* Barra de progreso opcional */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        
        {/* Animación de pulso decorativa */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};