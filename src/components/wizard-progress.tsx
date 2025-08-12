'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWizardStore } from '../lib/store';
import { useRouter } from 'next/navigation';

interface Step {
  id: number;
  name: string;
  path: string;
}

const STEPS: Step[] = [
  { id: 0, name: 'Bedrijventerrein', path: '/wizard/bedrijventerrein' },
  { id: 1, name: 'Aanleidingen', path: '/wizard/aanleidingen' },
  { id: 2, name: 'Oplossingen', path: '/wizard/oplossingen' },
  { id: 3, name: 'Implementatievarianten', path: '/wizard/implementatievarianten' },
  { id: 4, name: 'Governance modellen', path: '/wizard/governance-modellen' },
  // Implementatieplan stap verwijderd; indexen blijven doorlopen voor stabiliteit
  { id: 6, name: 'Vervolgstappen', path: '/wizard/vervolgstappen' },
];

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

interface StepProps {
  stepNumber: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  isLast: boolean;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({ stepNumber, title, isCompleted, isActive, isLast, onClick }) => {
  const router = useRouter();

  // Determine the component to render: Link for active or completed steps, div for future steps
  const StepItem = ({ children }: { children: React.ReactNode }) => {
    const baseClasses = `flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
      isActive
        ? 'bg-blue-600 text-white'
        : isCompleted
        ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700' // Add pointer and hover for completed
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    } ${isLast ? '' : 'mr-2'}`;
    
    // Make completed steps clickable links as well
    if (isCompleted || isActive) { 
      return (
        <Link
          href={STEPS[stepNumber].path}
          className={baseClasses}
          onClick={(e) => {
            // Prevent default if logic is added, but allow navigation
            onClick(); // Call the passed onClick handler
          }}
        >
          {children}
        </Link>
      );
    }
    
    // Render future steps as non-clickable divs
    return (
       <div className={baseClasses}>
          {children}
       </div>
    );
  };
  
  return (
    <li key={stepNumber} className="flex items-center relative w-full">
      <StepItem>
        {stepNumber + 1}
      </StepItem>
      
      {stepNumber < STEPS.length - 1 && (
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
            : 'text-gray-500'
        }`}
        style={{ 
          top: 'calc(100% + 0.5rem)', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        }}
      >
        {title}
      </span>
    </li>
  );
};

export function WizardProgress() {
  const pathname = usePathname();
  const { selectedSolutions } = useWizardStore();
  const router = useRouter();
  
  // Find current step based on pathname
  const currentStep = STEPS.findIndex(step => pathname === step.path);
  const currentStepIndex = currentStep === -1 ? 0 : currentStep; // Default to first step if not found
  
  return (
    <div className="py-6 mb-10">
      <ol className="flex items-center w-full">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <Step
              key={step.id}
              stepNumber={index}
              title={step.name}
              isCompleted={isCompleted}
              isActive={isActive}
              isLast={index === STEPS.length - 1}
              onClick={() => {
                 router.push(step.path); 
              }}
            />
          );
        })}
      </ol>
    </div>
  );
} 