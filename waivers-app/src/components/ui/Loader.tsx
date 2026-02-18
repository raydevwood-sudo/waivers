import React from 'react';

export default function Loader() {
  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div 
          className="relative w-16 h-16"
          role="status"
          aria-label="Loading"
        >
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p id="loading-message" className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );
}
