'use client';

import { useRouter } from 'next/navigation';

interface WizardNavigationProps {
  previousStep?: string;
  nextStep?: string;
  isNextDisabled?: boolean;
}

export function WizardNavigation({ 
  previousStep, 
  nextStep, 
  isNextDisabled = false 
}: WizardNavigationProps) {
  const router = useRouter();

  const handlePrevious = () => {
    if (previousStep) {
      router.push(previousStep);
    }
  };

  const handleNext = () => {
    if (nextStep && !isNextDisabled) {
      router.push(nextStep);
    }
  };

  return (
    <div className="flex justify-between mt-8">
      {previousStep ? (
        <button
          onClick={handlePrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Vorige stap
        </button>
      ) : (
        <div></div>
      )}

      {nextStep ? (
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`px-4 py-2 rounded-md ${
            isNextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
          aria-disabled={isNextDisabled}
        >
          Volgende stap
        </button>
      ) : null}
    </div>
  );
}