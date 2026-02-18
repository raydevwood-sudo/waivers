import React from 'react';

export default function SuccessPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12" role="main">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center" role="img" aria-label="Success checkmark">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Success!</h1>
          <p className="text-lg text-gray-600">
            Your waiver has been successfully submitted.
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            A confirmation email with a copy of your waiver has been sent to your email address.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
          aria-label="Submit another waiver form"
        >
          Submit Another Waiver
        </button>
      </div>
    </div>
  );
}
