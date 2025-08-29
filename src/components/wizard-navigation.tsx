'use client';

import { useRouter } from 'next/navigation';

interface WizardNavigationProps {
  previousStep?: string;
  nextStep?: string;
  isNextDisabled?: boolean;
  onNextClick?: () => void;
}

export function WizardNavigation({ 
  previousStep, 
  nextStep, 
  isNextDisabled = false,
  onNextClick
}: WizardNavigationProps) {
  const router = useRouter();

  // Log de state bij elke render voor debugging
  console.log("[WizardNavigation] Props:", { previousStep, nextStep, isNextDisabled });

  const handlePrevious = () => {
    console.log("[WizardNavigation] handlePrevious called. previousStep:", previousStep);
    if (previousStep) {
      console.log("[WizardNavigation] Attempting router.push to previous:", previousStep);
      router.push(previousStep);
    } else {
      console.log("[WizardNavigation] No previous step defined, not navigating.");
    }
  };

  const handleNext = () => {
    console.log("[WizardNavigation] handleNext called, isNextDisabled:", isNextDisabled);
    
    if (isNextDisabled) {
      console.log("[WizardNavigation] Navigatie geblokkeerd omdat isNextDisabled true is");
      return;
    }
    
    if (onNextClick) {
      onNextClick();
    }
    
    if (nextStep) {
      console.log("[WizardNavigation] Navigeren naar:", nextStep);
      setTimeout(() => {
         router.push(nextStep);
      }, 100);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto max-w-7xl px-6 py-3 flex justify-between items-center">
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
          type="button"
        >
          Volgende stap
        </button>
      ) : null}
      </div>
    </div>
  );
}