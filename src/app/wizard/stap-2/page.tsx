'use client';

import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';

export default function MobilitySolutionsPage() {
  const { selectedReasons } = useWizardStore();
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 2: Mobiliteitsoplossingen</h2>
        <p className="mb-6">
          Op basis van de door u geselecteerde redenen, kunt u hier de gewenste mobiliteitsoplossingen selecteren.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-blue-800">
            Deze pagina wordt in de volgende fase geïmplementeerd. U heeft {selectedReasons.length} redenen geselecteerd.
          </p>
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep="/wizard/stap-3"
      />
    </div>
  );
} 