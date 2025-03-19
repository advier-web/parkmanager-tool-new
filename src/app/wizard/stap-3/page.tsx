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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Het kiezen van het juiste governance model is essentieel voor een succesvolle implementatie 
                van uw mobiliteitsoplossingen. Het bepaalt hoe de organisatie, het beheer en de financiering 
                worden geregeld.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Aanbevelingen</h3>
              <p className="text-gray-600 text-sm">
                Op basis van uw gekozen mobiliteitsoplossingen tonen we welke governance modellen het beste 
                passen. Deze aanbevelingen zijn gebaseerd op praktijkervaring en succesvolle implementaties.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Huidig model</h3>
              <p className="text-gray-600 text-sm">
                We tonen uw huidige governance model bovenaan en geven aan of dit geschikt is voor de 
                gekozen oplossingen. Als het huidige model minder geschikt is, kunt u een ander model kiezen.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Selecteer een governance model om door te gaan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
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
            
            {/* Current Governance Model Section (always at the top) */}
            {!isLoading && currentModel && (
              <div className="mb-8">
                <div className={`p-4 rounded-t-md border ${currentModelIsRecommended ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h3 className={`text-xl font-semibold ${currentModelIsRecommended ? 'text-green-800' : 'text-yellow-800'}`}>
                    Uw huidige governance model
                  </h3>
                  <p className={`mt-1 ${currentModelIsRecommended ? 'text-green-700' : 'text-yellow-700'}`}>
                    {currentModelIsRecommended 
                      ? 'Goed nieuws! Uw huidige governance model is geschikt voor de geselecteerde mobiliteitsoplossingen.'
                      : 'Uw huidige governance model is mogelijk minder geschikt voor de geselecteerde mobiliteitsoplossingen. Overweeg één van de aanbevolen modellen hieronder.'}
                  </p>
                </div>
                <div className={`border-x border-b p-1 rounded-b-md ${currentModelIsRecommended ? 'border-green-200' : 'border-yellow-200'}`}>
                  <GovernanceCard
                    key={currentModel.id}
                    model={currentModel}
                    isSelected={selectedGovernanceModel === currentModel.id}
                    onSelect={handleSelectModel}
                    isRecommended={currentModelIsRecommended}
                    isCurrent={true}
                  />
                </div>
              </div>
            )}
            
            {/* Recommended Governance Models Section */}
            {!isLoading && getOtherRecommendedModels().length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4 text-green-700">Aanbevolen governance modellen</h3>
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