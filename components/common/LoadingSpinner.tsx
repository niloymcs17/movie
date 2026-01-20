
import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${sizeClasses[size]} border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
