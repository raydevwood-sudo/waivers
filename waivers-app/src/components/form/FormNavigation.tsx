import Button from '../ui/Button';

interface FormNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
  showPrevious?: boolean;
}

export default function FormNavigation({ 
  onPrevious, 
  onNext, 
  currentStep, 
  totalSteps,
  showPrevious = true 
}: FormNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <nav 
      className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-200" 
      aria-label="Form navigation"
    >
      {showPrevious && currentStep > 0 ? (
        <Button
          variant="secondary"
          onClick={onPrevious}
          className="flex-1 sm:flex-initial"
          ariaLabel={`Go to previous step, step ${currentStep}`}
        >
          ← Previous
        </Button>
      ) : (
        <div />
      )}
      <Button
        variant="primary"
        onClick={onNext}
        className="flex-1 sm:flex-initial sm:min-w-[140px]"
        ariaLabel={isLastStep ? 'Submit waiver form' : `Continue to next step, step ${currentStep + 2}`}
      >
        {isLastStep ? 'Submit ✓' : 'Next →'}
      </Button>
    </nav>
  );
}
