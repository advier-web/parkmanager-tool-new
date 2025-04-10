'use client';

import { useState, useEffect } from 'react';
import { useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { GovernanceCard } from '../../../components/governance-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useDialog } from '../../../contexts/dialog-context';
import { GovernanceModel } from '../../../domain/models';

export default function GovernanceModelsPage() {
  const { data: governanceModels, isLoading: governanceLoading, error: governanceError } = useGovernanceModels();
  const { data: solutions, isLoading: solutionsLoading } = useMobilitySolutions();
  const { 
    selectedSolutions, 
    selectedGovernanceModel, 
    setSelectedGovernanceModel,
    currentGovernanceModelId
  } = useWizardStore();
  
  // Access the dialog context
  const { openGovernanceDialog } = useDialog();
  
  // State for storing governance models based on categories
  const [recommendedModels, setRecommendedModels] = useState<string[]>([]);
  const [conditionalRecommendedModels, setConditionalRecommendedModels] = useState<string[]>([]);
  const [unsuitableModels, setUnsuitableModels] = useState<string[]>([]);
  
  // Get selected solution titles for display
  const selectedSolutionTitles = solutions
    ? solutions
        .filter(solution => selectedSolutions.includes(solution.id))
        .map(solution => solution.title)
    : [];
    
  // Get the current selected mobility solution (eerste oplossing gebruiken voor rechtsvorm data)
  const activeMobilitySolution = solutions && selectedSolutions.length > 0
    ? solutions.find(solution => solution.id === selectedSolutions[0])
    : null;
    
  // Log de actieve mobiliteitsoplossing
  console.log('[WIZARD STAP 3] Active mobility solution:', activeMobilitySolution);
  
  // Haal rechtsvorm velden op uit de active mobility solution
  const rechtsvormen = activeMobilitySolution
    ? {
        geenRechtsvorm: (activeMobilitySolution as any).geenRechtsvorm,
        vereniging: (activeMobilitySolution as any).vereniging,
        stichting: (activeMobilitySolution as any).stichting,
        ondernemersBiz: (activeMobilitySolution as any).ondernemersBiz,
        vastgoedBiz: (activeMobilitySolution as any).vastgoedBiz,
        gemengdeBiz: (activeMobilitySolution as any).gemengdeBiz,
        cooperatieUa: (activeMobilitySolution as any).cooperatieUa,
        bv: (activeMobilitySolution as any).bv,
        ondernemersfonds: (activeMobilitySolution as any).ondernemersfonds
      }
    : null;
    
  // Log de rechtsvorm velden
  console.log('[WIZARD STAP 3] Rechtsvormen data:', rechtsvormen);
  
  // Check if a governance model is selected
  const hasSelectedModel = selectedGovernanceModel !== null;
  
  // Find recommended governance models based on selected solutions
  useEffect(() => {
    if (solutions && governanceModels) {
      const recommendedIds: string[] = [];
      const conditionalIds: string[] = [];
      const unsuitableIds: string[] = [];
      
      // For each selected solution, find the associated governance models
      selectedSolutions.forEach(solutionId => {
        const solution = solutions.find(s => s.id === solutionId);
        
        if (!solution) return;
        
        // Process standard recommended models
        if ((solution as any).governanceModels) {
          const modelRefs = (solution as any).governanceModels;
          
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
        
        // Process conditional recommended models (mits)
        if ((solution as any).governanceModelsMits) {
          const modelRefs = (solution as any).governanceModelsMits;
          
          if (Array.isArray(modelRefs)) {
            modelRefs.forEach(ref => {
              const modelId = ref.sys?.id || ref;
              if (modelId && !conditionalIds.includes(modelId) && !recommendedIds.includes(modelId)) {
                conditionalIds.push(modelId);
              }
            });
          }
        }
        
        // Process unsuitable models
        if ((solution as any).governanceModelsNietgeschikt) {
          const modelRefs = (solution as any).governanceModelsNietgeschikt;
          
          if (Array.isArray(modelRefs)) {
            modelRefs.forEach(ref => {
              const modelId = ref.sys?.id || ref;
              if (modelId && !unsuitableIds.includes(modelId) && !recommendedIds.includes(modelId) && !conditionalIds.includes(modelId)) {
                unsuitableIds.push(modelId);
              }
            });
          }
        }
      });
      
      setRecommendedModels(recommendedIds);
      setConditionalRecommendedModels(conditionalIds);
      setUnsuitableModels(unsuitableIds);
      
      // Debug logging
      console.log('[WIZARD STAP 3] Recommended models:', recommendedIds);
      console.log('[WIZARD STAP 3] Conditional models:', conditionalIds);
      console.log('[WIZARD STAP 3] Unsuitable models:', unsuitableIds);
    }
  }, [solutions, governanceModels, selectedSolutions]);
  
  // Find the current model from the governance models array
  const currentModel = governanceModels?.find(model => model.id === currentGovernanceModelId) || null;
  
  // Check if the current model is also in the recommended list
  const currentModelIsRecommended = currentModel ? recommendedModels.includes(currentModel.id) : false;
  
  // Get other recommended models (excluding the current model)
  const getOtherRecommendedModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      recommendedModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  };
  
  // Get conditional recommended models (mits)
  const getConditionalRecommendedModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      conditionalRecommendedModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  };
  
  // Get unsuitable models
  const getUnsuitableModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model =>
      unsuitableModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  };
  
  // Get all other models that don't fit in any category
  const getOtherModels = () => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      !recommendedModels.includes(model.id) && 
      !conditionalRecommendedModels.includes(model.id) && 
      !unsuitableModels.includes(model.id) &&
      model.id !== currentGovernanceModelId
    );
  };
  
  // Handler for selecting a governance model
  const handleSelectModel = (modelId: string) => {
    setSelectedGovernanceModel(modelId);
  };
  
  // Handler for showing more info about a governance model
  const handleShowMoreInfo = (model: GovernanceModel) => {
    openGovernanceDialog(model);
  };
  
  // Determine if we're currently loading
  const isLoading = governanceLoading || solutionsLoading;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
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
          {/* Inleiding sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h2 className="text-2xl font-bold mb-4">Stap 3: Governance Modellen</h2>
            <p className="mb-6">
              Kies een passend governance model voor de organisatie en het beheer van uw mobiliteitsoplossingen.
              Dit bepaalt hoe de implementatie en het beheer van de oplossingen wordt georganiseerd.
            </p>
            
            {selectedSolutionTitles.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-md">
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
          </div>
            
          {/* Current Governance Model Section (always at the top) */}
          {!isLoading && currentModel && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <div className={`p-4 rounded-md ${currentModelIsRecommended ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'} mb-4`}>
                <h3 className={`text-xl font-semibold ${currentModelIsRecommended ? 'text-green-800' : 'text-yellow-800'}`}>
                  Uw huidige governance model
                </h3>
                <p className={`mt-1 ${currentModelIsRecommended ? 'text-green-700' : 'text-yellow-700'}`}>
                  {currentModelIsRecommended 
                    ? 'Goed nieuws! Uw huidige governance model is geschikt voor de geselecteerde mobiliteitsoplossingen.'
                    : 'Uw huidige governance model is mogelijk minder geschikt voor de geselecteerde mobiliteitsoplossingen. Overweeg één van de aanbevolen modellen hieronder of mitigeer de risico\'s van uw huidige governance model. .'}
                </p>
              </div>
              
              <GovernanceCard
                key={currentModel.id}
                model={rechtsvormen ? { ...currentModel, ...rechtsvormen } : currentModel}
                isSelected={selectedGovernanceModel === currentModel.id}
                onSelect={handleSelectModel}
                isRecommended={currentModelIsRecommended}
                isCurrent={true}
                onMoreInfo={handleShowMoreInfo}
              />
            </div>
          )}
            
          {/* Recommended Governance Models Section */}
          {!isLoading && getOtherRecommendedModels().length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">Aanbevolen governance modellen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze modellen worden aanbevolen voor de door u geselecteerde mobiliteitsoplossingen.
              </p>
              <div className="space-y-6">
                {getOtherRecommendedModels().map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={rechtsvormen ? { ...model, ...rechtsvormen } : model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={true}
                    onMoreInfo={handleShowMoreInfo}
                  />
                ))}
              </div>
            </div>
          )}
            
          {/* Conditional Recommended Governance Models Section */}
          {!isLoading && getConditionalRecommendedModels().length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">Aanbevolen, mits...</h3>
              <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
                <p className="text-blue-800">
                  Deze modellen zijn geschikt voor uw mobiliteitsoplossingen, maar vereisen extra aandacht of aanpassingen.
                </p>
              </div>
              <div className="space-y-6">
                {getConditionalRecommendedModels().map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={rechtsvormen ? { ...model, ...rechtsvormen } : model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    isConditionalRecommended={true}
                    onMoreInfo={handleShowMoreInfo}
                  />
                ))}
              </div>
            </div>
          )}
            
          {/* Unsuitable Governance Models Section */}
          {!isLoading && getUnsuitableModels().length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-red-700 border-b pb-2">Ongeschikte governance modellen</h3>
              <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-200">
                <p className="text-red-800">
                  Deze modellen zijn minder geschikt voor de door u geselecteerde mobiliteitsoplossingen.
                </p>
              </div>
              <div className="space-y-6">
                {getUnsuitableModels().map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={rechtsvormen ? { ...model, ...rechtsvormen } : model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    onMoreInfo={handleShowMoreInfo}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Other Models Section - models that don't fit in any category */}
          {!isLoading && getOtherModels().length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Overige governance modellen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze modellen hebben geen specifieke aanbeveling voor de door u geselecteerde mobiliteitsoplossingen.
              </p>
              <div className="space-y-6">
                {getOtherModels().map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={rechtsvormen ? { ...model, ...rechtsvormen } : model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    onMoreInfo={handleShowMoreInfo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-2b"
        nextStep="/wizard/stap-4"
        isNextDisabled={!selectedGovernanceModel}
      />
    </div>
  );
} 