'use client';

import { useState, useEffect } from 'react';
import { useGovernanceModels } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { GovernanceCard } from '../../../components/governance-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useDialog } from '../../../contexts/dialog-context';
import { GovernanceModel, ImplementationVariation } from '../../../domain/models';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { getImplementationVariationById } from '@/services/contentful-service';

export default function GovernanceModelsPage() {
  const { data: governanceModels, isLoading: governanceLoading, error: governanceError } = useGovernanceModels();
  const { 
    selectedSolutions, 
    selectedVariants,
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
  
  // State to hold the specifically selected variations data
  const [relevantVariations, setRelevantVariations] = useState<ImplementationVariation[]>([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(true);
  
  // Fetch selected variations based on store
  useEffect(() => {
    async function fetchVariations() {
      // Check if there are selected variants to fetch
      const variantIdsToFetch = Object.values(selectedVariants).filter((vId): vId is string => vId !== null);
      
      if (variantIdsToFetch.length === 0) {
        setIsLoadingVariations(false);
        setRelevantVariations([]);
        console.log("[Stap 3] No variants selected, skipping fetch.");
        return;
      }

      setIsLoadingVariations(true);
      console.log("[Stap 3] Fetching details for selected variation IDs:", variantIdsToFetch);
      
      // Check if variantIdsToFetch contains valid IDs before proceeding
      if (!variantIdsToFetch || variantIdsToFetch.length === 0 || variantIdsToFetch.some(id => !id)) {
          console.error("[Stap 3] Invalid or empty variant IDs detected:", variantIdsToFetch);
          setRelevantVariations([]);
          setIsLoadingVariations(false);
          return; // Stop fetching if IDs are invalid
      }

      try {
        // Create an array of promises to fetch each selected variation
        const fetchPromises = variantIdsToFetch.map(variationId => 
          getImplementationVariationById(variationId)
        );
        
        // Wait for all promises to resolve
        const variationsResults = await Promise.all(fetchPromises);
        
        // Filter out any null results (if a variation wasn't found) 
        // and ensure type correctness
        const fetchedVariations = variationsResults.filter((v: ImplementationVariation | null): v is ImplementationVariation => v !== null);
        
        console.log("[Stap 3] Successfully fetched variations data:", fetchedVariations);
        setRelevantVariations(fetchedVariations);

      } catch (err) {
        console.error("Error fetching variations for Stap 3:", err);
        setRelevantVariations([]); // Clear on error
      } finally {
        setIsLoadingVariations(false);
      }
    }
    fetchVariations();
  }, [selectedVariants]); // Depend only on selectedVariants map
  
  // Check if a governance model is selected
  const hasSelectedModel = selectedGovernanceModel !== null;
  
  // Categorize governance models based on selected variations
  useEffect(() => {
    // Removed console warning as the logic *uses* relevantVariations now
    // console.warn("[Stap 3] Governance model categorization logic needs update...");
    if (governanceModels && relevantVariations.length > 0) {
      const recommendedIds: string[] = [];
      const conditionalIds: string[] = [];
      const unsuitableIds: string[] = [];
      
      // Iterate over the fetched selected variations to categorize models
      relevantVariations.forEach(variation => {
        // Process standard recommended models
        if (variation.governanceModels) {
          variation.governanceModels.forEach(ref => {
            const modelId = ref.sys?.id;
            if (modelId && !recommendedIds.includes(modelId)) {
              recommendedIds.push(modelId);
            }
          });
        }
        // Process conditional recommended models (mits)
        if (variation.governanceModelsMits) {
           variation.governanceModelsMits.forEach(ref => {
            const modelId = ref.sys?.id;
            if (modelId && !conditionalIds.includes(modelId) && !recommendedIds.includes(modelId)) {
              conditionalIds.push(modelId);
            }
          });
        }
        // Process unsuitable models
        if (variation.governanceModelsNietgeschikt) {
           variation.governanceModelsNietgeschikt.forEach(ref => {
            const modelId = ref.sys?.id;
            if (modelId && !unsuitableIds.includes(modelId) && !recommendedIds.includes(modelId) && !conditionalIds.includes(modelId)) {
              unsuitableIds.push(modelId);
            }
          });
        }
      });
      
      setRecommendedModels(recommendedIds);
      setConditionalRecommendedModels(conditionalIds);
      setUnsuitableModels(unsuitableIds);
      
      console.log('[WIZARD STAP 3] Recommended models (from variations):', recommendedIds);
      console.log('[WIZARD STAP 3] Conditional models (from variations):', conditionalIds);
      console.log('[WIZARD STAP 3] Unsuitable models (from variations):', unsuitableIds);
    } else {
      // Reset if no relevant variations are loaded
       setRecommendedModels([]);
       setConditionalRecommendedModels([]);
       setUnsuitableModels([]);
    }
    // Add selectedVariants to dependencies, as categorization indirectly depends on it
    // (because relevantVariations depends on it, and this effect depends on relevantVariations)
  }, [relevantVariations, governanceModels, selectedVariants]); 
  
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
  const isLoading = governanceLoading || isLoadingVariations;
  
  // Create a stable key based on selected variants to force re-render of cards
  const variantsKey = JSON.stringify(selectedVariants);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Add Choices Summary above Info */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary variationsData={relevantVariations} />
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
              Kies een passend governance model voor de organisatie en het beheer van uw mobiliteitsoplossingen. Dit bepaalt hoe de implementatie en het beheer van de oplossingen wordt georganiseerd.
            </p>
            
            {isLoading && <p>Governance modellen laden...</p>}
            {governanceError && <p className="text-red-500">Fout bij laden governance modellen.</p>}
            
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
                key={`${currentModel.id}-${variantsKey}`}
                model={currentModel}
                isSelected={selectedGovernanceModel === currentModel.id}
                onSelect={handleSelectModel}
                isRecommended={currentModelIsRecommended}
                isCurrent={true}
                onMoreInfo={handleShowMoreInfo}
                relevantVariations={relevantVariations}
                selectedVariants={selectedVariants}
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
                    key={`${model.id}-${variantsKey}`}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={true}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                    selectedVariants={selectedVariants}
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
                    key={`${model.id}-${variantsKey}`}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    isConditionalRecommended={true}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                    selectedVariants={selectedVariants}
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
                    key={`${model.id}-${variantsKey}`}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                    selectedVariants={selectedVariants}
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
                    key={`${model.id}-${variantsKey}`}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    isRecommended={false}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                    selectedVariants={selectedVariants}
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