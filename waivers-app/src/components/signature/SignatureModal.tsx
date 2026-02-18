import React from 'react';
import SignatureCanvas from './SignatureCanvas';

export default function SignatureModal({ isOpen, onClose, onSave, signee }) {
  if (!isOpen) return null;

  const handleSave = (signatureDataURL, timestamp) => {
    onSave(signatureDataURL, timestamp);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="signature-modal-title" className="text-2xl font-semibold text-gray-900">
            {signee.charAt(0).toUpperCase() + signee.slice(1)} Signature
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 text-gray-500 hover:text-gray-700"
            aria-label="Close signature dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <SignatureCanvas onSave={handleSave} signee={signee} />
        </div>
      </div>
    </div>
  );
}
