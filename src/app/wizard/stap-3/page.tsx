'use client';

import { useState, useEffect } from 'react';
import { useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { GovernanceCard } from '../../../components/governance-card';
import { WizardNavigation } from '../../../components/wizard-navigation';

export default function GovernanceModelsPage() {
  const { data: governanceModels, isLoading: governanceLoading, error: governanceError } = useGovernanceModels();
  const { data: solutions, isLoading: solutionsLoading } = useMobilitySolutions();
  const { 
    selectedSolutions, 
    selectedGovernanceModel, 
    setSelectedGovernanceModel,
    currentGovernanceModelId
  } = useWizardStore();
  
  // State for storing recommended governance models based on selected solutions
  const [recommendedModels, setRecommendedModels] = useState<string[]>([]);
  
  // Get selected solution titles for display
  const selectedSolutionTitles = solutions
    ? solutions
        .filter(solution => selectedSolutions.includes(solution.id))
        .map(solution => solution.title)
    : [];
  
  // Check if a governance model is selected
  const hasSelectedModel = selectedGovernanceModel !== null;
  
  // Find recommended governance models based on selected solutions
  useEffect(() => {
    if (solutions && governanceModels) {
      const recommendedIds: string[] = [];
      
      // For each selected solution, find the associated governance models
      selectedSolutions.forEach(solutionId => {
        const solution = solutions.find(s => s.id === solutionId);
        
        // Check if the solution has governanceModels field (from Contentful)
        if (solution && (solution as any).governanceModels) {
          const modelRefs = (solution as any).governanceModels;
          
          // Add the model IDs to our recommended list
          if (Array.isArray(modelRefs)) {
            modelRefs.forEach(ref => {
              // Contentful references might be in format { sys: { id: 'xxx' } }
              const modelId = ref.sys?.id || ref;
              if (modelId && !recommendedIds.includes(modelId)) {
                recommendedIds.push(modelId);
              }
            });
          }
        }
      });
      
      setRecommendedModels(recommendedIds);
    }
  }, [solutions, governanceModels, selectedSolutions]);
  
  // Handler for selecting a governance model
  const handleSelectModel = (modelId: string) => {
    setSelectedGovernanceModel(modelId);
  };
  
  // Get the current governance model from step 0
  const getCurrentGovernanceModel = () => {
    if (!governanceModels || !currentGovernanceModelId) return null;
    return governanceModels.find(model => model.id === currentGovernanceModelId);
  };
  
  // Check if current governance model is recommended
  const isCurrentModelRecommended = () => {
    if (!currentGovernanceModelId) return false;
    return recommendedModels.includes(currentGovernanceModelId);
  };
  
  // Get recommended models except for the current one (if it's recommended)
  const getOtherRecommendedModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      recommendedModels.includes(model.id) && 
      model.id !== currentGovernanceModelId
    );
  };
  
  // Get non-recommended models
  const getNonRecommendedModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => !recommendedModels.includes(model.id));
  };
  
  const isLoading = governanceLoading || solutionsLoading;
  const currentModel = getCurrentGovernanceModel();
  const currentModelIsRecommended = isCurrentModelRecommended();
  
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
        
        {governanceError && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van de governance modellen.</p>
          </div>
        )}
        
        {governanceModels && governanceModels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Geen governance modellen gevonden.</p>
          </div>
        )}
        
        {/* Current Governance Model Section (if it's recommended) */}
        {!isLoading && currentModel && currentModelIsRecommended && (
          <div className="mb-8">
            <div className="bg-green-50 p-4 rounded-t-md border border-green-200">
              <h3 className="text-xl font-semibold text-green-800">Uw huidige governance model</h3>
              <p className="text-green-700 mt-1">
                Goed nieuws! Uw huidige governance model is geschikt voor de geselecteerde mobiliteitsoplossingen.
              </p>
            </div>
            <div className="border-x border-b border-green-200 p-1 rounded-b-md">
              <GovernanceCard
                key={currentModel.id}
                model={currentModel}
                isSelected={selectedGovernanceModel === currentModel.id}
                onSelect={handleSelectModel}
                isRecommended={true}
                isCurrent={true}
              />
            </div>
          </div>
        )}
        
        {/* Recommended Governance Models Section */}
        {!isLoading && getOtherRecommendedModels().length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-green-700">
              {currentModelIsRecommended ? 'Andere aanbevolen governance modellen' : 'Aanbevolen governance modellen'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Deze modellen worden aanbevolen voor de door u geselecteerde mobiliteitsoplossingen.
            </p>
            <div className="space-y-6">
              {getOtherRecommendedModels().map(model => (
                <GovernanceCard
                  key={model.id}
                  model={model}
                  isSelected={selectedGovernanceModel === model.id}
                  onSelect={handleSelectModel}
                  isRecommended={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Current Governance Model Section (if it's NOT recommended) */}
        {!isLoading && currentModel && !currentModelIsRecommended && (
          <div className="mb-8">
            <div className="bg-yellow-50 p-4 rounded-t-md border border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-800">Uw huidige governance model</h3>
              <p className="text-yellow-700 mt-1">
                Uw huidige governance model is mogelijk minder geschikt voor de geselecteerde mobiliteitsoplossingen. 
                Overweeg één van de aanbevolen modellen hierboven.
              </p>
            </div>
            <div className="border-x border-b border-yellow-200 p-1 rounded-b-md">
              <GovernanceCard
                key={currentModel.id}
                model={currentModel}
                isSelected={selectedGovernanceModel === currentModel.id}
                onSelect={handleSelectModel}
                isRecommended={false}
                isCurrent={true}
              />
            </div>
          </div>
        )}
        
        {/* Other Non-Recommended Governance Models Section */}
        {!isLoading && getNonRecommendedModels().filter(model => model.id !== currentGovernanceModelId).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Overige governance modellen</h3>
            <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
              <p className="text-amber-800">
                Deze modellen zijn minder geschikt voor de door u geselecteerde mobiliteitsoplossingen.
              </p>
            </div>
            <div className="space-y-6">
              {getNonRecommendedModels()
                .filter(model => model.id !== currentGovernanceModelId)
                .map(model => (
                <GovernanceCard
                  key={model.id}
                  model={model}
                  isSelected={selectedGovernanceModel === model.id}
                  onSelect={handleSelectModel}
                  isRecommended={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-2"
        nextStep="/wizard/stap-4"
        isNextDisabled={!hasSelectedModel}
      />
    </div>
  );
} 