'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Step {
  id: number;
  name: string;
  path: string;
}

const STEPS: Step[] = [
  { id: 0, name: 'Bedrijventerrein', path: '/wizard/bedrijventerrein' },
  { id: 1, name: 'Redenen', path: '/wizard/stap-1' },
  { id: 2, name: 'Oplossingen', path: '/wizard/stap-2' },
  { id: 3, name: 'Governance', path: '/wizard/stap-3' },
  { id: 4, name: 'Implementatie', path: '/wizard/stap-4' },
  { id: 5, name: 'Samenvatting', path: '/wizard/samenvatting' },
];

export function WizardProgress() {
  const pathname = usePathname();
  
  // Find current step based on pathname
  const currentStep = STEPS.findIndex(step => pathname === step.path);
  const currentStepIndex = currentStep === -1 ? 0 : currentStep; // Default to first step if not found
  
  return (
    <div className="py-6">
      <ol className="flex items-center w-full">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <li key={step.id} className="flex items-center relative w-full">
              <Link
                href={step.path}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                } ${index === STEPS.length - 1 ? '' : 'mr-8'}`}
              >
                {isCompleted ? '✓' : step.id}
              </Link>
              
              {index < STEPS.length - 1 && (
                <>
                  <div className="hidden sm:flex w-full bg-gray-200 h-1">
                    <div
                      className={`h-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </>
              )}
              
              <span
                className={`hidden sm:block absolute whitespace-nowrap text-xs font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
                style={{ 
                  top: 'calc(100% + 0.5rem)', 
                  left: '50%', 
                  transform: 'translateX(-50%)' 
                }}
              >
                {step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
} 