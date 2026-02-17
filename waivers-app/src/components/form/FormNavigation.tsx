import React from 'react';
import Button from '../ui/Button';

export default function FormNavigation({ 
  onPrevious, 
  onNext, 
  currentStep, 
  totalSteps,
  showPrevious = true 
}) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {showPrevious && currentStep > 0 ? (
          <Button
            variant="secondary"
            onClick={onPrevious}
            className="flex-1 sm:flex-none"
          >
            ← Previous
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Button
          variant="primary"
          onClick={onNext}
          className="flex-1 sm:flex-none sm:px-8"
        >
          {isLastStep ? 'Submit ✓' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
