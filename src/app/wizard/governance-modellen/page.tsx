'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGovernanceModels } from '../../../hooks/use-domain-models';
import { useWizardStore } from '@/store/wizard-store';
import { GovernanceCard } from '../../../components/governance-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useDialog } from '../../../contexts/dialog-context';
import { GovernanceModel, ImplementationVariation } from '../../../domain/models';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { getImplementationVariationById } from '@/services/contentful-service';
import { SiteHeader } from '@/components/site-header';

export default function Step3Page() {
  const router = useRouter();
  const { data: governanceModels, isLoading: governanceLoading, error: governanceError } = useGovernanceModels();
  const { 
    selectedSolutions, 
    selectedVariants,
    selectedGovernanceModel, 
    setSelectedGovernanceModel,
    currentGovernanceModelId,
    _hasHydrated
  } = useWizardStore();
  
  const { openGovernanceDialog } = useDialog();
  
  const [recommendedModels, setRecommendedModels] = useState<string[]>([]);
  const [conditionalRecommendedModels, setConditionalRecommendedModels] = useState<string[]>([]);
  const [unsuitableModels, setUnsuitableModels] = useState<string[]>([]);
  
  const [relevantVariations, setRelevantVariations] = useState<ImplementationVariation[]>([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(true);
  
  useEffect(() => {
    if (!_hasHydrated) {
       return;
    }

    async function fetchVariations() {
      const variantIdsToFetch = Object.values(selectedVariants).filter((vId): vId is string => vId !== null);
      
      if (variantIdsToFetch.length === 0) {
        setIsLoadingVariations(false);
        setRelevantVariations([]);
        return;
      }

      setIsLoadingVariations(true);
      
      if (!variantIdsToFetch || variantIdsToFetch.length === 0 || variantIdsToFetch.some(id => !id)) {
          console.error('[Stap 3] Invalid or empty variant IDs detected:', variantIdsToFetch);
          setRelevantVariations([]);
          setIsLoadingVariations(false);
          return;
      }

      try {
        const fetchPromises = variantIdsToFetch.map(variationId => 
          getImplementationVariationById(variationId)
        );
        const variationsResults = await Promise.all(fetchPromises);
        const fetchedVariations = variationsResults.filter((v: ImplementationVariation | null): v is ImplementationVariation => v !== null);
        
        setRelevantVariations(currentRelevantVariations => {
          if (JSON.stringify(currentRelevantVariations) === JSON.stringify(fetchedVariations)) {
            return currentRelevantVariations;
          }
          return fetchedVariations;
        });

      } catch (err) {
        console.error('Error fetching variations for Stap 3:', err);
        setRelevantVariations([]);
      } finally {
        setIsLoadingVariations(false);
      }
    }
    fetchVariations();
  }, [selectedVariants, _hasHydrated]);
  
  const hasSelectedModel = selectedGovernanceModel !== null;
  
  useEffect(() => {
    if (governanceModels && relevantVariations.length > 0) {
      // Bepaal de actieve (primaire) variant deterministisch op basis van de eerste geselecteerde oplossing
      const primaryVariantId = (selectedSolutions.find(sid => selectedVariants[sid])
        ? selectedVariants[selectedSolutions.find(sid => selectedVariants[sid]) as string]
        : undefined) as string | undefined;
      const activeVariation = (primaryVariantId
        ? relevantVariations.find(v => v.id === primaryVariantId)
        : relevantVariations[0]) as ImplementationVariation | undefined;

      const recommendedIds: string[] = [];
      const conditionalIds: string[] = [];
      const unsuitableIds: string[] = [];

      if (activeVariation) {
        // Let op: classificatie gebeurt uitsluitend op basis van de geselecteerde implementatievariant
        activeVariation.governanceModels?.forEach(ref => {
          const modelId = ref.sys?.id;
          if (modelId && !recommendedIds.includes(modelId)) recommendedIds.push(modelId);
        });

        activeVariation.governanceModelsMits?.forEach(ref => {
          const modelId = ref.sys?.id;
          if (modelId && !conditionalIds.includes(modelId)) conditionalIds.push(modelId);
        });

        activeVariation.governanceModelsNietgeschikt?.forEach(ref => {
          const modelId = ref.sys?.id;
          if (modelId && !unsuitableIds.includes(modelId)) unsuitableIds.push(modelId);
        });
      }

      // Bij conflicten wint 'Ongeschikt' > 'Aanbevolen, mits' > 'Aanbevolen'
      const resolvedRecommended = recommendedIds.filter(id => !unsuitableIds.includes(id) && !conditionalIds.includes(id));
      const resolvedConditional = conditionalIds.filter(id => !unsuitableIds.includes(id));

      setRecommendedModels(resolvedRecommended);
      setConditionalRecommendedModels(resolvedConditional);
      setUnsuitableModels(unsuitableIds);
    } else {
       setRecommendedModels([]);
       setConditionalRecommendedModels([]);
       setUnsuitableModels([]);
    }
  }, [relevantVariations, governanceModels, selectedVariants]); 
  
  const currentModel = governanceModels?.find(model => model.id === currentGovernanceModelId) || null;
  const currentModelIsRecommended = currentModel ? recommendedModels.includes(currentModel.id) : false;
  
  const otherRecommendedModelsList = useMemo(() => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      recommendedModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  }, [governanceModels, recommendedModels, currentGovernanceModelId]);

  const conditionalRecommendedModelsList = useMemo(() => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      conditionalRecommendedModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  }, [governanceModels, conditionalRecommendedModels, currentGovernanceModelId]);

  const unsuitableModelsList = useMemo(() => {
    if (!governanceModels) return [];
    return governanceModels.filter(model =>
      unsuitableModels.includes(model.id) && model.id !== currentGovernanceModelId
    );
  }, [governanceModels, unsuitableModels, currentGovernanceModelId]);

  const otherModelsList = useMemo(() => {
    if (!governanceModels) return [];
    return governanceModels.filter(model => 
      !recommendedModels.includes(model.id) && 
      !conditionalRecommendedModels.includes(model.id) && 
      !unsuitableModels.includes(model.id) &&
      model.id !== currentGovernanceModelId
    );
  }, [governanceModels, recommendedModels, conditionalRecommendedModels, unsuitableModels, currentGovernanceModelId]);
  
  const handleSelectModel = useCallback((modelId: string) => {
    setSelectedGovernanceModel(modelId);
  }, [setSelectedGovernanceModel]);
  
  const handleShowMoreInfo = useCallback((model: GovernanceModel) => {
    openGovernanceDialog(model);
  }, [openGovernanceDialog]);
  
  const isLoading = governanceLoading || isLoadingVariations;
  
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
                van de gekozen collectieve vervoersoplossing. Het bepaalt hoe de organisatie, het beheer en de financiering 
                worden geregeld.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Aanbevelingen</h3>
              <p className="text-gray-600 text-sm">
                Op basis van uw gekozen collectieve vervoersoplossing tonen we welke governance modellen het beste 
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
            <h2 className="text-2xl font-bold mb-4">Governance modellen</h2>
            <p className="text-gray-600 mb-6">
              Selecteer het governance model dat het beste aansluit bij uw situatie en de gekozen collectieve vervoersoplossing. 
              De aanbevelingen zijn gebaseerd op de door u geselecteerde implementatievarianten. Let wel op: ieder governance model is maatwerk, binnen een governance model zijn veel verschillen mogelijk. Het is aan te raden met een lokale jurist te kijken naar de opzet van het gekozen governance model.
            </p>
            {isLoading && <p>Aanbevelingen laden...</p>}
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
                    ? 'Goed nieuws! Uw huidige governance model is geschikt voor de geselecteerde vervoersoplossing.'
                    : 'Uw huidige governance model is mogelijk minder geschikt voor de geselecteerde vervoersoplossing. Overweeg één van de aanbevolen modellen hieronder of mitigeer de risico\'s van uw huidige governance model. .'}
                </p>
              </div>
              
              <GovernanceCard
                key={currentModel.id}
                model={currentModel}
                isSelected={selectedGovernanceModel === currentModel.id}
                onSelect={handleSelectModel}
                onMoreInfo={handleShowMoreInfo}
                isRecommended={currentModelIsRecommended}
                isCurrent={true}
                relevantVariations={relevantVariations}
                selectedVariants={selectedVariants}
                primaryVariantId={Object.values(selectedVariants).find(Boolean) as string | undefined}
              />
            </div>
          )}
            
          {/* Recommended Governance Models Section */}
          {!isLoading && otherRecommendedModelsList.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">Aanbevolen governance modellen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze modellen worden aanbevolen voor de door u geselecteerde mobiliteitsoplossingen.
              </p>
              <div className="space-y-6">
                {otherRecommendedModelsList.map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    onMoreInfo={handleShowMoreInfo}
                    isRecommended={true}
                    relevantVariations={relevantVariations}
                     selectedVariants={selectedVariants}
                     primaryVariantId={Object.values(selectedVariants).find(Boolean) as string | undefined}
                  />
                ))}
              </div>
            </div>
          )}
            
          {/* Conditional Recommended Governance Models Section */}
          {!isLoading && conditionalRecommendedModelsList.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">Aanbevolen, mits...</h3>
              <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
                <p className="text-blue-800">
                  Deze modellen zijn geschikt voor uw mobiliteitsoplossingen, maar vereisen extra aandacht of aanpassingen.
                </p>
              </div>
              <div className="space-y-6">
                {conditionalRecommendedModelsList.map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    onMoreInfo={handleShowMoreInfo}
                    isConditionalRecommended={true}
                    relevantVariations={relevantVariations}
                     selectedVariants={selectedVariants}
                     primaryVariantId={Object.values(selectedVariants).find(Boolean) as string | undefined}
                  />
                ))}
              </div>
            </div>
          )}
            
          {/* Unsuitable Governance Models Section */}
          {!isLoading && unsuitableModelsList.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h3 className="text-xl font-semibold mb-4 text-red-700 border-b pb-2">Ongeschikte governance modellen</h3>
              <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-200">
                <p className="text-red-800">
                  Deze modellen zijn minder geschikt voor de door u geselecteerde mobiliteitsoplossingen.
                </p>
              </div>
              <div className="space-y-6">
                {unsuitableModelsList.map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                     selectedVariants={selectedVariants}
                     primaryVariantId={Object.values(selectedVariants).find(Boolean) as string | undefined}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Other Models Section - models that don't fit in any category */}
          {!isLoading && otherModelsList.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Overige governance modellen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze modellen hebben geen specifieke aanbeveling voor de door u geselecteerde mobiliteitsoplossingen.
              </p>
              <div className="space-y-6">
                {otherModelsList.map(model => (
                  <GovernanceCard
                    key={model.id}
                    model={model}
                    isSelected={selectedGovernanceModel === model.id}
                    onSelect={handleSelectModel}
                    onMoreInfo={handleShowMoreInfo}
                    relevantVariations={relevantVariations}
                    selectedVariants={selectedVariants}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && 
            !currentModel && 
            otherRecommendedModelsList.length === 0 &&
            conditionalRecommendedModelsList.length === 0 &&
            unsuitableModelsList.length === 0 &&
            otherModelsList.length === 0 && (
            <p>Geen governance modellen gevonden of de aanbevelingen zijn nog niet geladen.</p>
          )}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/implementatievarianten"
        nextStep="/wizard/vervolgstappen"
        isNextDisabled={!selectedGovernanceModel}
      />
    </div>
  );
}

