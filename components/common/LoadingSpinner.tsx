
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-t-4 border-b-4 border-primary`}></div>
  );
};

export default LoadingSpinner;