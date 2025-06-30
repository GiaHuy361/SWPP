import React from 'react';

export const Modal = ({ isOpen, title, children, onClose, size = 'medium' }) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-md';
      case 'large':
        return 'max-w-2xl';
      case 'extra-large':
        return 'max-w-5xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`bg-white rounded-lg p-6 w-full ${getSizeClasses()} z-10 relative max-h-screen overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};