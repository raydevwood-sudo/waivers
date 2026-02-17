import React from 'react';

export default function FormProgress({ currentStep, totalSteps }) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-primary text-white'
                    : index === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs text-gray-500 mt-2 hidden sm:block">
                Step {index + 1}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div className="h-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
