import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500'
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-t-transparent ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

export const LoadingPage = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${props.className || ''} flex items-center justify-center space-x-2 ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </button>
  );
};

export const LoadingCard = ({ message = 'Đang tải...' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-center space-x-3">
        <LoadingSpinner size="md" />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
