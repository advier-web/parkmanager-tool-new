'use client';

import { useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { GovernanceCard } from '../../../components/governance-card';
import { WizardNavigation } from '../../../components/wizard-navigation';

export default function GovernanceModelsPage() {
  const { data: governanceModels, isLoading, error } = useGovernanceModels();
  const { data: solutions } = useMobilitySolutions();
  const { selectedSolutions, selectedGovernanceModel, setSelectedGovernanceModel } = useWizardStore();
  
  // Get selected solution titles for display
  const selectedSolutionTitles = solutions
    ? solutions
        .filter(solution => selectedSolutions.includes(solution.id))
        .map(solution => solution.title)
    : [];
  
  // Check if a governance model is selected
  const hasSelectedModel = selectedGovernanceModel !== null;
  
  // Handler for selecting a governance model
  const handleSelectModel = (modelId: string) => {
    setSelectedGovernanceModel(modelId);
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 3: Governance Modellen</h2>
        <p className="mb-6">
          Kies een passend governance model voor de organisatie en het beheer van uw mobiliteitsoplossingen.
          Dit bepaalt hoe de implementatie en het beheer van de oplossingen wordt georganiseerd.
        </p>
        
        {selectedSolutionTitles.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-semibold mb-2">Uw geselecteerde oplossingen:</h3>
            <ul className="list-disc pl-5">
              {selectedSolutionTitles.map((title, index) => (
                <li key={index} className="text-blue-800">{title}</li>
              ))}
            </ul>
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Governance modellen worden geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van de governance modellen.</p>
          </div>
        )}
        
        {governanceModels && governanceModels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Geen governance modellen gevonden.</p>
          </div>
        )}
        
        <div className="space-y-6 mt-6">
          {governanceModels?.map(model => (
            <GovernanceCard
              key={model.id}
              model={model}
              isSelected={selectedGovernanceModel === model.id}
              onSelect={handleSelectModel}
            />
          ))}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-2"
        nextStep="/wizard/stap-4"
        isNextDisabled={!hasSelectedModel}
      />
    </div>
  );
} 