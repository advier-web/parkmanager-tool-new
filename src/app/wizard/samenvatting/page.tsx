'use client';

import { useState } from 'react';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '../../../hooks/use-domain-models';
import { isValidEmail } from '../../../utils/helper';
import PdfDownloadButtonContentful from '../../../components/pdf-download-button-contentful';

export default function SummaryPage() {
  const {
    businessParkInfo,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel,
    selectedImplementationPlan
  } = useWizardStore();
  
  const { data: reasons } = useBusinessParkReasons();
  const { data: solutions } = useMobilitySolutions();
  const { data: governanceModels } = useGovernanceModels();
  const { data: implementationPlans } = useImplementationPlans();
  
  // Get selected item titles
  const selectedReasonTitles = reasons
    ? reasons
        .filter(reason => selectedReasons.includes(reason.id))
        .map(reason => reason.title)
    : [];
    
  const selectedSolutionTitles = solutions
    ? solutions
        .filter(solution => selectedSolutions.includes(solution.id))
        .map(solution => solution.title)
    : [];
  
  const selectedGovernanceModelTitle = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)?.title || ''
    : '';
    
  const selectedImplementationPlanTitle = implementationPlans && selectedImplementationPlan
    ? implementationPlans.find(plan => plan.id === selectedImplementationPlan)?.title || ''
    : '';
    
  const currentGovernanceModelTitle = governanceModels && currentGovernanceModelId
    ? governanceModels.find(model => model.id === currentGovernanceModelId)?.title || ''
    : '';
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                De samenvatting geeft u een compleet overzicht van alle keuzes die u heeft gemaakt. 
                Dit helpt u om te controleren of alles correct is.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Controleer alle gegevens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          {/* Samenvatting sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h2 className="text-2xl font-bold mb-4">Samenvatting</h2>
            <p className="mb-6">
              Een overzicht van uw geselecteerde opties voor het mobiliteitsplan van uw bedrijfsterrein.
            </p>
            
            <section>
              <h3 className="text-xl font-semibold mb-2">Informatie over het bedrijventerrein</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aantal bedrijven:</p>
                  <p>{businessParkInfo.numberOfCompanies}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Aantal werknemers:</p>
                  <p>{businessParkInfo.numberOfEmployees}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Verkeerstypen:</p>
                <ul className="list-disc pl-5">
                  {(businessParkInfo.trafficTypes || []).map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              </div>
              {currentGovernanceModelTitle && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Huidig bestuursmodel:</p>
                  <p>{currentGovernanceModelTitle}</p>
                </div>
              )}
            </section>
          </div>
          
          {/* Geselecteerde aanleidingen sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h3 className="text-xl font-semibold mb-4">Geselecteerde aanleidingen</h3>
            {selectedReasons.length > 0 && reasons ? (
              <div className="space-y-6">
                {reasons
                  .filter(reason => selectedReasons.includes(reason.id))
                  .map((reason, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-lg mb-2">{reason.title}</h4>
                      {reason.summary ? (
                        <p className="mb-3 text-gray-700">{reason.summary}</p>
                      ) : reason.description ? (
                        <p className="mb-3 text-gray-700">{reason.description}</p>
                      ) : null}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">Geen aanleidingen geselecteerd.</p>
            )}
          </div>
          
          {/* Geselecteerde mobiliteitsoplossingen sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h3 className="text-xl font-semibold mb-4">Geselecteerde mobiliteitsoplossingen</h3>
            {selectedSolutions.length > 0 ? (
              <div className="space-y-6">
                {solutions
                  ?.filter(solution => selectedSolutions.includes(solution.id))
                  .map((solution, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-lg mb-2">{solution.title}</h4>
                      {solution.samenvattingLang && (
                        <p className="mb-3 text-gray-700">{solution.samenvattingLang}</p>
                      )}
                      <div className="mt-3">
                        <PdfDownloadButtonContentful
                          mobilityServiceId={solution.id}
                          fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                          contentType="mobilityService"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">Geen mobiliteitsoplossingen geselecteerd.</p>
            )}
          </div>
          
          {/* Gekozen governance model sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h3 className="text-xl font-semibold mb-4">Gekozen governance model</h3>
            {selectedGovernanceModel && governanceModels ? (
              (() => {
                const model = governanceModels.find(model => model.id === selectedGovernanceModel);
                return model ? (
                  <div className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-lg mb-2">{model.title}</h4>
                    {model.summary ? (
                      <p className="mb-3 text-gray-700">{model.summary}</p>
                    ) : model.samenvatting ? (
                      <p className="mb-3 text-gray-700">{model.samenvatting}</p>
                    ) : model.description ? (
                      <p className="mb-3 text-gray-700">{model.description}</p>
                    ) : null}
                    <div className="mt-3">
                      <PdfDownloadButtonContentful
                        mobilityServiceId={model.id}
                        fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                        contentType="governanceModel"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Governance model informatie kon niet worden geladen.</p>
                );
              })()
            ) : (
              <p className="text-gray-500">Geen governance model geselecteerd.</p>
            )}
          </div>
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-4"
      />
    </div>
  );
} 