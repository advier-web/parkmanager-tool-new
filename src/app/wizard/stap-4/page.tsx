'use client';

import { useWizardStore } from '@/store/wizard-store';
import { useGovernanceModels } from '@/hooks/use-domain-models';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { SiteHeader } from '@/components/site-header';
import { useEffect } from 'react';
import GovernanceModelFactsheetButton from '@/components/governance-model-factsheet-button';
import { governanceTitleToFieldName, stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

export default function ImplementationPlanPage() {
  const {
    selectedGovernanceModel, 
    selectedSolutions, 
    selectedVariants,
    currentGovernanceModelId,
    _hasHydrated
  } = useWizardStore();
  
  const { data: models, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();

  const selectedGovernanceModelData = models && selectedGovernanceModel
    ? models.find(model => model.id === selectedGovernanceModel)
    : null;
    
  const isLoading = isLoadingModels;
  const error = modelsError;

  useEffect(() => {
    if (_hasHydrated) {
      console.log('[Stap 4 Render] Hydrated. selectedGovernanceModelData:', selectedGovernanceModelData);
    }
  }, [_hasHydrated, selectedGovernanceModelData]);

  const isNextDisabled = false; 

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
            <WizardChoicesSummary variationsData={[]} />
            <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
                <p className="text-gray-600 text-sm">
                   Het implementatieplan geeft u een duidelijk overzicht van de stappen die nodig zijn om uw gekozen 
                   mobiliteitsoplossingen en governance model te realiseren. Dit helpt u bij een gestructureerde aanpak.
                </p>
              </div>
              <div className="border-t pt-4 mt-6">
                 <div className="flex items-center text-sm text-blue-600">
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span>Hier vindt u praktische informatie voor implementatie.</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-8 shadow-even mb-8">
              <h2 className="text-2xl font-bold mb-4">Stap 4: Implementatieplan</h2>
              
              {!_hasHydrated && <p className="mb-6 text-gray-500 italic">Laden...</p>}

              {_hasHydrated && (
                <>
                  {isLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Governance modellen laden...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 p-4 rounded-md mb-6">
                      <p className="text-red-600">Fout bij laden van governance modellen: {error.message}</p>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <>
                      {/* CASE 1: Selected model is the same as the current bedrijventerrein model */}
                      {selectedGovernanceModel && currentGovernanceModelId && selectedGovernanceModel === currentGovernanceModelId ? (
                        <>
                          {selectedGovernanceModelData ? (
                            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
                              <p className="font-bold">Huidig model voldoet</p>
                              <p>Uw huidige governance model, "{selectedGovernanceModelData.title}", is reeds geselecteerd en voldoet. Er hoeft geen nieuw governance model geïmplementeerd te worden.</p>
                              <div className="mt-4">
                                <GovernanceModelFactsheetButton 
                                  governanceModel={selectedGovernanceModelData}
                                  selectedVariations={[]}
                                  governanceTitleToFieldName={governanceTitleToFieldName}
                                  stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                                  className="w-full md:w-auto"
                                />
                              </div>
                            </div>
                          ) : (
                            // Edge case: currentGovernanceModelId matches selectedGovernanceModel, but this ID is not in the loaded 'models' list.
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6" role="alert">
                              <p className="font-bold">Fout: Huidig model niet gevonden</p>
                              <p>Uw huidige en geselecteerde governance model (ID: {selectedGovernanceModel}) kon niet worden gevonden in de beschikbare modellen. Dit duidt mogelijk op een data inconsistentie. U kunt proberen een ander model te selecteren in de vorige stap.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* CASE 2: A different model is selected, or no current model ID, or no model selected at all */}
                          <p className="mb-6">
                            Hieronder vindt u de implementatiestappen specifiek voor het door u geselecteerde governance model: 
                            <strong> {selectedGovernanceModelData?.title || (selectedGovernanceModel ? 'Geselecteerd model niet gevonden' : 'Geen model geselecteerd')}</strong>.
                          </p>

                          {selectedGovernanceModelData ? (
                            <div className="mt-6 prose prose-sm max-w-none">
                              <h3 className="text-lg font-semibold mb-2">Implementatiestappen ({selectedGovernanceModelData.title})</h3>
                              {selectedGovernanceModelData.implementatie ? (
                                 <MarkdownContent content={processMarkdownText(selectedGovernanceModelData.implementatie)} />
                              ) : (
                                 <p className="italic text-gray-500">Geen specifieke implementatie-informatie beschikbaar voor dit model.</p>
                              )}
                              <div className="mt-6">
                                <GovernanceModelFactsheetButton 
                                  governanceModel={selectedGovernanceModelData}
                                  selectedVariations={[]}
                                  governanceTitleToFieldName={governanceTitleToFieldName}
                                  stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                                  className="w-full md:w-auto"
                                />
                              </div>
                            </div>
                          ) : (
                            // This covers "no model selected" or "selected model ID not found in list"
                            <p className="italic text-gray-500 mt-4">
                              {selectedGovernanceModel 
                                ? "Het geselecteerde governance model kon niet worden geladen. Controleer of het model bestaat of selecteer een ander model in de vorige stap."
                                : "Geen governance model geselecteerd in de vorige stap."}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <WizardNavigation
          previousStep="/wizard/stap-3"
          nextStep="/wizard/samenvatting"
          isNextDisabled={isNextDisabled}
        />
      </div>
    </>
  );
}