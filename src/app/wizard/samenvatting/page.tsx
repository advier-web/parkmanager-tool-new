'use client';

import { useState, useMemo } from 'react';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '../../../hooks/use-domain-models';
import { isValidEmail } from '../../../utils/helper';
import PdfDownloadButtonContentful from '../../../components/pdf-download-button-contentful';
import { MarkdownContent } from '../../../components/markdown-content';

// Helper function to convert snake_case to camelCase
const snakeToCamel = (str: string): string => 
  str.toLowerCase().replace(/([-_\s][a-z])/g, group => 
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
      .replace(' ', '')
  );

// Helper function to convert Governance Model title to field name used on MobilitySolution
const governanceTitleToFieldName = (title: string | undefined): string | null => {
  if (!title) return null;
  const lowerTitle = title.toLowerCase();
  // Specific mappings based on known titles and field names
  if (lowerTitle.includes('coöperatie') && lowerTitle.includes('u.a.')) return 'cooperatieUa';
  if (lowerTitle.includes('stichting')) return 'stichting';
  if (lowerTitle.includes('ondernemers biz')) return 'ondernemersBiz'; // Assuming BIZ is always capitalized in field
  if (lowerTitle.includes('vastgoed biz')) return 'vastgoedBiz';
  if (lowerTitle.includes('gemengde biz')) return 'gemengdeBiz';
  if (lowerTitle.includes('b.v.') || lowerTitle.includes(' bv ')) return 'bv'; // Handle variations
  if (lowerTitle.includes('ondernemersfonds')) return 'ondernemersfonds';
  if (lowerTitle.includes('geen rechtsvorm')) return 'geenRechtsvorm';
  if (lowerTitle.includes('vereniging')) return 'vereniging';
  // Add more mappings if needed
  console.warn(`[governanceTitleToFieldName] No specific field name mapping found for title: ${title}`);
  // Fallback: try simple camelCase conversion (might not match exactly)
  return snakeToCamel(title.replace(/\./g, '')); 
};

export default function SummaryPage() {
  const {
    businessParkInfo,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel,
    selectedImplementationPlan,
    selectedVariants
  } = useWizardStore();
  
  const { data: reasons, isLoading: isLoadingReasons, error: reasonsError } = useBusinessParkReasons();
  const { data: solutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  const { data: governanceModels, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();
  const { data: implementationPlans } = useImplementationPlans();
  
  // Map Reason IDs to their identifiers for easy lookup
  const reasonIdToIdentifierMap = useMemo(() => {
    if (!reasons) return {};
    return reasons.reduce((acc, reason) => {
      if (reason.identifier) {
        acc[reason.id] = reason.identifier;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [reasons]);

  // Filter selected solutions data
  const selectedSolutionsData = useMemo(() => {
    if (!solutions || !selectedSolutions) return [];
    return solutions.filter(solution => selectedSolutions.includes(solution.id));
  }, [solutions, selectedSolutions]);
  
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

  const isLoading = isLoadingReasons || isLoadingSolutions || isLoadingModels;
  const error = reasonsError || solutionsError || modelsError;

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aantal bedrijven:</p>
                  <p>{businessParkInfo.numberOfCompanies}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Verkeerstypen:</p>
                    <ul className="list-disc pl-5">
                      {(businessParkInfo.trafficTypes || []).map(type => (
                        <li key={type}>{type}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Aantal werknemers:</p>
                  <p>{businessParkInfo.numberOfEmployees}</p>
                  {currentGovernanceModelTitle && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Huidig bestuursmodel:</p>
                      <p>{currentGovernanceModelTitle}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Locatiekenmerken weergave */}
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2">Locatiekenmerken</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessParkInfo.carAccessibility && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bereikbaarheid met auto:</p>
                      <p className="capitalize">{businessParkInfo.carAccessibility}</p>
                    </div>
                  )}
                  
                  {businessParkInfo.trainAccessibility && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bereikbaarheid met trein:</p>
                      <p className="capitalize">{businessParkInfo.trainAccessibility}</p>
                    </div>
                  )}
                  
                  {businessParkInfo.busAccessibility && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bereikbaarheid met bus:</p>
                      <p className="capitalize">{businessParkInfo.busAccessibility}</p>
                    </div>
                  )}
                  
                  {businessParkInfo.sufficientParking && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Voldoende parkeerplaatsen:</p>
                      <p className="capitalize">{businessParkInfo.sufficientParking}</p>
                    </div>
                  )}
                  
                  {businessParkInfo.averageDistance && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gemiddelde woon-werk afstand:</p>
                      <p>{businessParkInfo.averageDistance === '25+' ? 'Meer dan 25 km' : `${businessParkInfo.averageDistance} km`}</p>
                    </div>
                  )}
                </div>
                
                {!businessParkInfo.carAccessibility && 
                 !businessParkInfo.trainAccessibility && 
                 !businessParkInfo.busAccessibility && 
                 !businessParkInfo.sufficientParking && 
                 !businessParkInfo.averageDistance && (
                  <p className="text-gray-500">Geen locatiekenmerken opgegeven.</p>
                )}
              </div>
            </section>
          </div>
          
          {/* Geselecteerde mobiliteitsoplossingen sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h3 className="text-xl font-semibold mb-4">Geselecteerde mobiliteitsoplossingen</h3>
            {isLoading && <p>Oplossingen laden...</p>}
            {error && <p className="text-red-500">Fout bij laden oplossingen.</p>}
            {!isLoading && !error && selectedSolutionsData.length > 0 ? (
              <div className="space-y-6">
                {selectedSolutionsData.map((solution) => (
                  <div key={solution.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-lg mb-2">{solution.title}</h4>
                    {/* Show solution summary */}
                    {solution.samenvattingLang && (
                      <p className="mb-4 text-gray-700">{solution.samenvattingLang}</p>
                    )}
                    
                    {/* --- START: Show selected implementation variant --- */}
                    {selectedVariants[solution.id] && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Gekozen implementatievariant:</p>
                        <p>{selectedVariants[solution.id]}</p>
                      </div>
                    )}
                    {/* --- END: Show selected implementation variant --- */}
                    
                    {/* --- START: Show contributions to selected reasons --- */}
                    {selectedReasons.length > 0 && reasons && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <h5 className="text-md font-semibold text-gray-800">Bijdrage aan geselecteerde aanleidingen:</h5>
                        {selectedReasons.map(reasonId => {
                          const reason = reasons.find(r => r.id === reasonId);
                          if (!reason || !reason.identifier) return null; 

                          const reasonIdentifierSnake = reason.identifier;
                          // Convert identifier to camelCase before appending 'Toelichting'
                          const reasonIdentifierCamel = snakeToCamel(reasonIdentifierSnake);
                          const fieldName = `${reasonIdentifierCamel}Toelichting`;
                          const text = (solution as any)[fieldName];

                          if (!text) return null; 

                          return (
                            <div key={reasonId} className="pl-2">
                              <p className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block"></span>
                                {reason.title}
                              </p>
                              <div className="prose prose-sm max-w-none pl-4 text-gray-700">
                                <MarkdownContent content={text} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* --- END: Show contributions to selected reasons --- */}

                    {/* PDF Download Button */}
                    <div className="mt-4">
                      <PdfDownloadButtonContentful
                        mobilityServiceId={solution.id}
                        fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                        contentType="mobilityService"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && !error && <p className="text-gray-500">Geen mobiliteitsoplossingen geselecteerd.</p>
            )}
          </div>
          
          {/* Gekozen governance model sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
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
                    
                    {/* --- START: Show explanation per selected solution --- */}
                    {selectedSolutionsData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {selectedSolutionsData.map(solution => {
                          const fieldName = governanceTitleToFieldName(model.title);
                          if (!fieldName) return null;
                          
                          const text = (solution as any)[fieldName];
                          if (!text) return null;

                          return (
                            <div key={solution.id} className="pl-2">
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Relevantie voor "{solution.title}":
                              </p>
                              <div className="prose prose-sm max-w-none pl-4 text-gray-700">
                                <MarkdownContent content={text} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* --- END: Show explanation per selected solution --- */}
                    
                    {/* PDF Download Button */}
                    <div className="mt-3">
                      <PdfDownloadButtonContentful
                        mobilityServiceId={model.id}
                        fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                        contentType="governanceModel"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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