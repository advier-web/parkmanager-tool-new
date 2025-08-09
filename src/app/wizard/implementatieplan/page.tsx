'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizard-store';
import { useGovernanceModels } from '@/hooks/use-domain-models';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import GovernanceModelFactsheetButton from '@/components/governance-model-factsheet-button';
import { governanceTitleToFieldName, stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

export default function ImplementationPlanPage() {
  const { selectedGovernanceModel, _hasHydrated } = useWizardStore();
  const { data: models, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();

  const selectedGovernanceModelData = models && selectedGovernanceModel
    ? models.find(model => model.id === selectedGovernanceModel)
    : null;

  const isNextDisabled = false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary variationsData={[]} />
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                 Het implementatieplan geeft u een duidelijk overzicht van de stappen die nodig zijn om uw gekozen 
                 collectieve vervoersoplossing en governance model te realiseren. Dit helpt u bij een gestructureerde aanpak.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h2 className="text-2xl font-bold mb-4">Implementatieplan</h2>
            {!_hasHydrated && <p className="mb-6 text-gray-500 italic">Laden...</p>}
            {_hasHydrated && (
              <>
                {isLoadingModels && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Governance modellen laden...</p>
                  </div>
                )}
                {modelsError && (
                  <div className="bg-red-50 p-4 rounded-md mb-6">
                    <p className="text-red-600">Fout bij laden van governance modellen: {modelsError.message}</p>
                  </div>
                )}
                {!isLoadingModels && !modelsError && (
                  <>
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
                      <p className="italic text-gray-500 mt-4">Geen governance model geselecteerd in de vorige stap.</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <WizardNavigation
        previousStep="/wizard/governance-modellen"
        nextStep="/wizard/samenvatting"
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
}

 
