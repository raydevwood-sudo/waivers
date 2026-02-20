interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div 
      className="mb-6" 
      role="navigation" 
      aria-label="Form progress"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progressPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Form progress: ${Math.round(progressPercentage)} percent complete`}
        />
      </div>
    </div>
  );
}
