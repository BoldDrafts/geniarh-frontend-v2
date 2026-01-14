import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'refresh';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const Icon = variant === 'refresh' ? RefreshCw : Loader2;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
};