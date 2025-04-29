'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '../../../hooks/use-domain-models';
import { isValidEmail } from '../../../utils/helper';
import PdfDownloadButtonContentful from '../../../components/pdf-download-button-contentful';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { extractPassportTextWithVariant, extractImplementationSummaryFromVariant } from '../../../utils/wizard-helpers';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SummaryPdfDocument from '../../../components/summary-pdf-document';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { MobilitySolution } from '@/domain/models';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';

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

  // Add state for client-side rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to pass to PDF component (simplified, assuming direct use of helper)
  const getPassportTextForPdf = (solution: MobilitySolution, variant: string | undefined): string => {
      return extractPassportTextWithVariant(solution.paspoort, variant ?? null);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Remove Choices Summary */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
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
        <div className="lg:col-span-3 space-y-8">
          {/* Top-level Introduction */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Samenvatting</h2>
            <p className="mb-6">
              Controleer uw selecties hieronder. U kunt teruggaan naar eerdere stappen om wijzigingen aan te brengen.
            </p>
            
            {/* --- ADD Duplicated Download Button Here --- */} 
            <div className="mt-4 pt-4 border-t border-gray-200"> {/* Add divider and spacing */} 
             {isClient && (
                <PDFDownloadLink
                  document={(
                    <SummaryPdfDocument 
                      businessParkInfo={businessParkInfo} 
                      currentGovernanceModelTitle={currentGovernanceModelTitle}
                      selectedReasonTitles={selectedReasonTitles} 
                      selectedSolutionsData={selectedSolutionsData}
                      selectedVariants={selectedVariants}
                      selectedGovernanceModelId={selectedGovernanceModel} 
                      selectedImplementationPlanTitle={selectedImplementationPlanTitle}
                      governanceModels={governanceModels || []} 
                      governanceTitleToFieldName={governanceTitleToFieldName}
                      extractImplementationSummaryFromVariant={extractImplementationSummaryFromVariant}
                      reasons={reasons || []}
                      selectedReasons={selectedReasons}
                      snakeToCamel={snakeToCamel}
                    />
                  )}
                  fileName={`Samenvatting_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
                >
                  {({
                    blob,
                    url,
                    loading,
                    error,
                  }) => (
                    <Button 
                      // Use default button style for primary appearance
                      variant="default" 
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      disabled={loading}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      {loading ? 'PDF genereren...' : 'Download Samenvatting PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
              {!isClient && (
                  // Use default button style for primary appearance
                  <Button variant="default" disabled className="bg-blue-600 text-white opacity-75">
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    PDF laden...
                  </Button>
              )}
            </div>
            {/* --- END Duplicated Download Button --- */} 
          </div>
          
          {/* Uw Keuzes section */}
          {/* This section remains as its own card */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Uw keuzes</h3>
            {/* Combined Bedrijventerrein Info & Locatiekenmerken */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 mb-6">
              {/* Column 1: Bedrijven, Verkeer, Auto, Trein, Bus */}
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
                {/* Moved Locatiekenmerken */}
                {businessParkInfo.carAccessibility && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Bereikbaarheid met auto:</p>
                    <p className="capitalize">{businessParkInfo.carAccessibility}</p>
                  </div>
                )}
                {businessParkInfo.trainAccessibility && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Bereikbaarheid met trein:</p>
                    <p className="capitalize">{businessParkInfo.trainAccessibility}</p>
                  </div>
                )}
                {businessParkInfo.busAccessibility && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Bereikbaarheid met bus:</p>
                    <p className="capitalize">{businessParkInfo.busAccessibility}</p>
                  </div>
                )}
              </div>
              
              {/* Column 2: Werknemers, Huidig Model, Ophalen, Parkeren, Afstand */}
              <div>
                <p className="text-sm font-medium text-gray-500">Aantal werknemers:</p>
                <p>{businessParkInfo.numberOfEmployees}</p>
                {currentGovernanceModelTitle && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Huidig bestuursmodel:</p>
                    <p>{currentGovernanceModelTitle}</p>
                  </div>
                )}
                {businessParkInfo.employeePickupPreference && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Ophalen werknemers:</p>
                    <p className="capitalize">
                      {businessParkInfo.employeePickupPreference === 'thuis' ? 'Vanaf thuis' : 'Vanaf locatie'}
                    </p>
                  </div>
                )}
                {/* Moved Locatiekenmerken */}
                {businessParkInfo.sufficientParking && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Voldoende parkeerplaatsen:</p>
                    <p className="capitalize">{businessParkInfo.sufficientParking}</p>
                  </div>
                )}
                {businessParkInfo.averageDistance && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Gemiddelde woon-werk afstand:</p>
                    <p>{businessParkInfo.averageDistance === '25+' ? 'Meer dan 25 km' : `${businessParkInfo.averageDistance} km`}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selections Section - Apply 2-column grid, light gray divider, adjusted font size */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                
                {/* Aanleidingen */} 
                {selectedReasonTitles.length > 0 && (
                  // Remove text-sm from container
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Geselecteerde aanleidingen:</p>
                    {/* Values inherit base size */}
                    <ul className="list-disc pl-5 text-gray-900 space-y-1">
                      {selectedReasonTitles.map(title => <li key={title}>{title}</li>)}
                    </ul>
                  </div>
                )}

                {/* Mobiliteitsoplossingen */} 
                {selectedSolutionTitles.length > 0 && (
                   // Remove text-sm from container
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Geselecteerde mobiliteitsoplossingen:</p>
                    {/* Values inherit base size */}
                    <ul className="list-disc pl-5 text-gray-900 space-y-1">
                      {selectedSolutionTitles.map(title => <li key={title}>{title}</li>)}
                    </ul>
                  </div>
                )}

                {/* Implementatievariant */} 
                {Object.keys(selectedVariants).length > 0 && solutions && (
                  // Remove text-sm from container
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Gekozen implementatievariant:</p>
                    {/* Values inherit base size */}
                    <ul className="list-disc pl-5 text-gray-900 space-y-1">
                      {solutions
                        .filter(s => selectedSolutions.includes(s.id) && selectedVariants[s.id])
                        .map(s => (
                          <li key={s.id}>{selectedVariants[s.id]}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Governance Model */} 
                {selectedGovernanceModelTitle && (
                  // Remove text-sm from container
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Geselecteerde governance model:</p>
                    {/* Value inherits base size */}
                    <p className="pl-5 text-gray-900">{selectedGovernanceModelTitle}</p>
                  </div>
                )}
              </div>
            </div>
            {/* --- END Moved Selections --- */} 
          </div>

          {/* Conditionally render subsequent sections only if solutions are selected */}
          {selectedSolutionsData.length > 0 ? (
            <> 
              {/* Geselecteerde mobiliteitsoplossingen section - Now its own card */}
              <div className="bg-white rounded-lg p-8 shadow-even">
                <h3 className="text-xl font-semibold mb-4">Geselecteerde mobiliteitsoplossingen</h3>
                {isLoading && <p>Oplossingen laden...</p>}
                {error && <p className="text-red-500">Fout bij laden oplossingen.</p>}
                {!isLoading && !error && selectedSolutionsData.length > 0 ? (
                  <div className="space-y-6">
                    {selectedSolutionsData.map((solution) => (
                      <div key={solution.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <h4 className="font-medium text-lg mb-2">{solution.title}</h4>
                        
                        {/* --- MOVED: Show selected implementation variant --- */}
                        {selectedVariants[solution.id] && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500">Gekozen implementatievariant:</p>
                            <p>{selectedVariants[solution.id]}</p>
                          </div>
                        )}
                        {/* --- END: Show selected implementation variant --- */}
                        
                        {/* Show solution passport filtered by selected variant */}
                        {solution.paspoort && (
                          <div className="mb-4 text-gray-700 prose prose-sm max-w-none">
                            <MarkdownContent 
                              content={processMarkdownText(
                                extractPassportTextWithVariant(
                                  solution.paspoort, 
                                  selectedVariants[solution.id] // Pass the selected variant name
                                )
                              )} 
                            />
                          </div>
                        )}
                        
                        {/* --- RESTORE Original Implementation Summary Code --- */}
                        {solution.implementatie && selectedVariants[solution.id] && (
                           (() => { 
                            const implementationSummary = extractImplementationSummaryFromVariant(
                              solution.implementatie,
                              selectedVariants[solution.id]
                            );
                            if (!implementationSummary) return null; 
                            return (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-gray-700 prose prose-sm max-w-none">
                                  <MarkdownContent content={processMarkdownText(implementationSummary)} />
                                </div>
                              </div>
                            );
                          })()
                        )}
                        {/* --- END: Implementation Summary --- */}
                        
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
                            fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-factsheet.pdf`}
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
              
              {/* Gekozen governance model section - Now its own card */}
              {selectedGovernanceModel && (
                <div className="bg-white rounded-lg p-8 shadow-even">
                  <h3 className="text-xl font-semibold mb-4">Gekozen governance model</h3>
                  {governanceModels ? (
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
              )}
            </>
          ) : (
             // Fallback if no solutions selected - keep this outside the main sections
             !isLoading && !error && (
               <div className="bg-white rounded-lg p-8 shadow-even">
                 <p className="text-gray-500">Geen geselecteerde opties.</p>
               </div>
              )
          )}
          
          {/* PDF Download Button section remains at the bottom */}
          <div className="bg-teal-600 text-white rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3 text-white">Download Samenvatting</h4>
            <p className="text-white text-sm mb-4">
              Download een PDF met de op deze pagina getoonde samenvatting van uw gemaakte keuzes.
            </p>
            {isClient && (
              <PDFDownloadLink
                document={(
                  <SummaryPdfDocument 
                    businessParkInfo={businessParkInfo} 
                    currentGovernanceModelTitle={currentGovernanceModelTitle}
                    selectedReasonTitles={selectedReasonTitles} 
                    selectedSolutionsData={selectedSolutionsData}
                    selectedVariants={selectedVariants}
                    selectedGovernanceModelId={selectedGovernanceModel} 
                    selectedImplementationPlanTitle={selectedImplementationPlanTitle}
                    governanceModels={governanceModels || []} 
                    governanceTitleToFieldName={governanceTitleToFieldName}
                    extractImplementationSummaryFromVariant={extractImplementationSummaryFromVariant}
                    reasons={reasons || []}
                    selectedReasons={selectedReasons}
                    snakeToCamel={snakeToCamel}
                  />
                )}
                fileName={`Samenvatting_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
              >
                {({
                  blob,
                  url,
                  loading,
                  error,
                }) => (
                  <Button 
                    variant="secondary"
                    className="bg-white text-teal-600 hover:bg-gray-100 hover:text-teal-700"
                    disabled={loading}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    {loading ? 'PDF genereren...' : 'Download Samenvatting PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
            {!isClient && (
                <Button variant="secondary" disabled className="bg-white text-teal-600 opacity-75">
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  PDF laden...
                </Button>
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