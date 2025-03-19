'use client';

import { useImplementationPlans, useGovernanceModels } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { ImplementationPlanCard } from '../../../components/implementation-plan-card';
import { WizardNavigation } from '../../../components/wizard-navigation';

export default function ImplementationPlanPage() {
  const { data: implementationPlans, isLoading, error } = useImplementationPlans();
  const { data: governanceModels } = useGovernanceModels();
  const { 
    selectedGovernanceModel, 
    selectedImplementationPlan, 
    setSelectedImplementationPlan 
  } = useWizardStore();
  
  // Get selected governance model title for display
  const selectedGovernanceModelTitle = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)?.title || ''
    : '';
  
  // Check if an implementation plan is selected
  const hasSelectedPlan = selectedImplementationPlan !== null;
  
  // Handler for selecting an implementation plan
  const handleSelectPlan = (planId: string) => {
    setSelectedImplementationPlan(planId);
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 4: Implementatieplan</h2>
        <p className="mb-6">
          Kies een implementatieplan dat aansluit bij uw gekozen mobiliteitsoplossingen en governance model.
          Dit plan beschrijft de stappen die nodig zijn om de mobiliteitsoplossingen succesvol te implementeren.
        </p>
        
        {selectedGovernanceModelTitle && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-semibold mb-2">Uw gekozen governance model:</h3>
            <p className="text-blue-800">{selectedGovernanceModelTitle}</p>
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Implementatieplannen worden geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van de implementatieplannen.</p>
          </div>
        )}
        
        {implementationPlans && implementationPlans.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Geen implementatieplannen gevonden.</p>
          </div>
        )}
        
        <div className="space-y-6 mt-6">
          {implementationPlans?.map(plan => (
            <ImplementationPlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedImplementationPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-3"
        nextStep="/wizard/samenvatting"
        isNextDisabled={!hasSelectedPlan}
      />
    </div>
  );
} 