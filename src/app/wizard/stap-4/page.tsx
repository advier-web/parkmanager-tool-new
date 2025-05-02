'use client';

import { useWizardStore } from '@/store/wizard-store';
import { useGovernanceModels } from '@/hooks/use-domain-models';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { SiteHeader } from '@/components/site-header';
import { useEffect } from 'react';

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
              {_hasHydrated && (
                <p className="mb-6">
                  Hieronder vindt u de implementatiestappen specifiek voor het door u geselecteerde governance model: 
                  <strong>{selectedGovernanceModelData?.title || 'Geen model geselecteerd'}</strong>.
                </p>
              )}
              {!_hasHydrated && <p className="mb-6 text-gray-500 italic">Laden...</p>}
              
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Governance model laden...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 p-4 rounded-md mb-6">
                  <p className="text-red-600">Fout bij laden: {error.message}</p>
                </div>
              )}

              {_hasHydrated && !isLoading && !error && selectedGovernanceModelData && (
                <div className="mt-6 prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Implementatiestappen ({selectedGovernanceModelData.title})</h3>
                  {selectedGovernanceModelData.implementatie ? (
                     <MarkdownContent content={processMarkdownText(selectedGovernanceModelData.implementatie)} />
                  ) : (
                     <p className="italic text-gray-500">Geen specifieke implementatie-informatie beschikbaar voor dit model.</p>
                  )}
                </div>
              )}
              {_hasHydrated && !isLoading && !error && !selectedGovernanceModelData && (
                 <p className="italic text-gray-500">Geen governance model geselecteerd in de vorige stap.</p>
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