import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  text = 'Loading...',
  className = ''
}) => {
  if (!show) return null;

  return (
    <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};