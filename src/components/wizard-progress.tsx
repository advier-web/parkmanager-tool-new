'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWizardStore } from '../lib/store';

interface Step {
  id: number;
  name: string;
  path: string;
}

const STEPS: Step[] = [
  { id: 0, name: 'Bedrijventerrein', path: '/wizard/bedrijventerrein' },
  { id: 1, name: 'Aanleiding', path: '/wizard/stap-1' },
  { id: 2, name: 'Oplossingen', path: '/wizard/stap-2' },
  { id: 3, name: 'Implementatievariant', path: '/wizard/stap-2b' },
  { id: 4, name: 'Governance', path: '/wizard/stap-3' },
  { id: 5, name: 'Implementatie', path: '/wizard/stap-4' },
  { id: 6, name: 'Samenvatting', path: '/wizard/samenvatting' },
];

export function WizardProgress() {
  const pathname = usePathname();
  const { selectedSolutions } = useWizardStore();
  
  // Find current step based on pathname
  const currentStep = STEPS.findIndex(step => pathname === step.path);
  const currentStepIndex = currentStep === -1 ? 0 : currentStep; // Default to first step if not found
  
  // Check if step navigation should be disabled
  const isStepNavigationDisabled = (stepIndex: number): boolean => {
    // Altijd vorige of huidige stappen toestaan
    if (stepIndex <= currentStepIndex) return false;
    
    // Specifieke checks voor stappen na de huidige
    if (currentStepIndex === 2 && stepIndex > 2 && selectedSolutions.length === 0) {
      // Blokkeer navigatie naar stap 3 of hoger als er geen mobiliteitsoplossingen zijn geselecteerd
      return true;
    }
    
    // Sta altijd toe om van stap 0 naar stap 1 of van stap 1 naar stap 2 te gaan
    if ((currentStepIndex === 0 && stepIndex === 1) || 
        (currentStepIndex === 1 && stepIndex === 2)) {
      return false;
    }
    
    // Sta toe om naar de volgende stap te gaan, maar niet verder
    return stepIndex > currentStepIndex + 1;
  };
  
  return (
    <div className="py-6 mb-10">
      <ol className="flex items-center w-full">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isDisabled = isStepNavigationDisabled(index);
          
          // Bepaal het component dat moet worden weergegeven: Link of div
          const StepItem = ({ children }: { children: React.ReactNode }) => {
            const baseClasses = `flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
              isActive
                ? 'bg-blue-600 text-white'
                : isCompleted
                ? 'bg-green-600 text-white'
                : isDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-600'
            } ${index === STEPS.length - 1 ? '' : 'mr-2'}`;
            
            if (isDisabled) {
              return (
                <div className={baseClasses}>
                  {isCompleted ? '✓' : step.id}
                </div>
              );
            }
            
            return (
              <Link
                href={step.path}
                className={baseClasses}
              >
                {isCompleted ? '✓' : step.id}
              </Link>
            );
          };
          
          return (
            <li key={step.id} className="flex items-center relative w-full">
              <StepItem>
                {isCompleted ? '✓' : step.id}
              </StepItem>
              
              {index < STEPS.length - 1 && (
                <>
                  <div className="flex-1 h-1 bg-gray-200 mx-2">
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
                    : isDisabled
                    ? 'text-gray-400'
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