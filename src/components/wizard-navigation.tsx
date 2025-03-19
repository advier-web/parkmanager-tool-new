'use client';

import Link from 'next/link';

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
  return (
    <div className="flex justify-between mt-8">
      {previousStep ? (
        <Link
          href={previousStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Vorige stap
        </Link>
      ) : (
        <div></div>
      )}

      {nextStep && !isNextDisabled ? (
        <Link
          href={nextStep}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Volgende stap
        </Link>
      ) : nextStep && isNextDisabled ? (
        <div
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
          aria-disabled="true"
        >
          Volgende stap
        </div>
      ) : null}
    </div>
  );
}