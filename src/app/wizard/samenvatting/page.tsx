'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/store/wizard-store';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '@/hooks/use-domain-models';
import { isValidEmail } from '../../../utils/helper';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SummaryPdfDocument from '../../../components/summary-pdf-document';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation, GovernanceModel, MobilitySolution, BusinessParkReason } from '@/domain/models';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { getImplementationVariationById, getMobilitySolutionById, getGovernanceModelByIdFromContentful } from '@/services/contentful-service';
import { WizardNavigation } from '@/components/wizard-navigation';
import MobilitySolutionFactsheetButton from '@/components/mobility-solution-factsheet-button';
import ImplementationVariantFactsheetButton from '@/components/implementation-variant-factsheet-button';
import GovernanceModelFactsheetButton from '@/components/governance-model-factsheet-button';

// Import helpers from utils
import { 
    governanceTitleToFieldName,
    snakeToCamel,
    extractImplementationSummaryFromVariant,
    stripSolutionPrefixFromVariantTitle
} from '../../../utils/wizard-helpers'; 

export default function SummaryPage() {
  const {
    businessParkInfo,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel: selectedGovernanceModelId,
    selectedVariants,
    _hasHydrated
  } = useWizardStore();
  
  // --- REMOVED DEBUG LOG --- 

  const { data: reasons } = useBusinessParkReasons();
  const { data: models } = useGovernanceModels();
  const { data: solutions } = useMobilitySolutions();
  const { data: plans } = useImplementationPlans();
  
  // State for fetched data
  const [selectedVariationsData, setSelectedVariationsData] = useState<ImplementationVariation[]>([]);
  const [selectedGovernanceModelData, setSelectedGovernanceModelData] = useState<GovernanceModel | null>(null);
  // Store full solution objects now
  const [selectedSolutionsData, setSelectedSolutionsData] = useState<Record<string, MobilitySolution>>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all necessary data based on selections
  useEffect(() => {
    // Wait for hydration before fetching
    if (!_hasHydrated) {
       // REMOVED console.log('[Samenvatting fetchData] Waiting for hydration...');
       return; 
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      const variantIdsToFetch = Object.values(selectedVariants).filter((vId): vId is string => vId !== null);
      const solutionIds = selectedSolutions; // From store
      const govModelId = selectedGovernanceModelId; // From store

      // --- REMOVED DEBUG LOGS --- 

      try {
        const variationPromises = variantIdsToFetch.map(id => getImplementationVariationById(id));
        const solutionPromises = solutionIds.map(id => getMobilitySolutionById(id));
        const govModelPromise = govModelId ? getGovernanceModelByIdFromContentful(govModelId) : Promise.resolve(null);

        const [variationResults, solutionResults, govModelResult] = await Promise.all([
          Promise.all(variationPromises),
          Promise.all(solutionPromises),
          govModelPromise
        ]);
        
        // --- REMOVED DEBUG LOGS --- 

        const fetchedVariations = variationResults.filter((v): v is ImplementationVariation => v !== null);
        const fetchedSolutions = solutionResults.reduce((acc, sol) => {
          if (sol) acc[sol.id] = sol;
          return acc;
        }, {} as Record<string, MobilitySolution>);
        
        // --- REMOVED DEBUG LOGS --- 

        setSelectedVariationsData(fetchedVariations);
        setSelectedSolutionsData(fetchedSolutions);
        setSelectedGovernanceModelData(govModelResult);
      } catch (err) {
        console.error("Error fetching data for Summary Page:", err);
        setError("Kon de benodigde data niet laden.");
        setSelectedVariationsData([]);
        setSelectedSolutionsData({});
        setSelectedGovernanceModelData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedVariants, selectedSolutions, selectedGovernanceModelId, _hasHydrated]);

  // Get selected item titles (use fetched data where possible)
  const selectedReasonTitles = reasons
    ? reasons.filter(reason => selectedReasons.includes(reason.id)).map(reason => reason.title)
    : [];
    
  const selectedSolutionTitles = Object.values(selectedSolutionsData).map(s => s.title); // Use fetched basic info
  
  const selectedGovernanceModelTitle = selectedGovernanceModelData?.title || '';
  
  // selectedImplementationPlanTitle remains the same for now
  const selectedImplementationPlanTitle = ''; // Assuming not used or fetched elsewhere 
  
  const currentGovernanceModelTitle = models && currentGovernanceModelId
    ? models.find((model: GovernanceModel) => model.id === currentGovernanceModelId)?.title || ''
    : '';

  // Add state for client-side rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
                      selectedSolutionsData={Object.values(selectedSolutionsData)}
                      selectedVariants={selectedVariants}
                      selectedGovernanceModelId={selectedGovernanceModelId} 
                      selectedImplementationPlanTitle={''}
                      governanceModels={models || []} 
                      governanceTitleToFieldName={governanceTitleToFieldName}
                      extractImplementationSummaryFromVariant={extractImplementationSummaryFromVariant}
                      reasons={reasons || []}
                      selectedReasons={selectedReasons}
                      snakeToCamel={snakeToCamel}
                      selectedVariationsData={selectedVariationsData}
                    />
                  )}
                  fileName={`Samenvatting_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
                >
                  {({
                    blob,
                    url,
                    loading,
                    error,
                  }: {
                    blob: Blob | null;
                    url: string | null;
                    loading: boolean;
                    error: Error | null;
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

                {/* Implementatievariant - Apply helper and remove solution suffix */}
                {selectedVariationsData.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Gekozen implementatievarianten:</p>
                    <ul className="list-disc pl-5 text-gray-900 space-y-1">
                      {selectedVariationsData.map(v => (
                        <li key={v.id}>{stripSolutionPrefixFromVariantTitle(v.title)}</li>
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

          {/* Geselecteerde Oplossingen & Varianten */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-xl font-semibold mb-6">Geselecteerde Oplossingen & Varianten</h2>
            {isLoading && <p>Oplossingen en varianten laden...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && Object.keys(selectedSolutionsData).length === 0 && (
              <p>Geen oplossingen geselecteerd.</p>
            )}
            {!isLoading && !error && Object.keys(selectedSolutionsData).length > 0 && (
              <>
                {Object.values(selectedSolutionsData).map((solution) => {
                  const solutionVariants = selectedVariationsData.filter(v => v.mobiliteitsdienstVariantId === solution.id);
                  const selectedReasonsForCurrentSolution = reasons?.filter(r => 
                    selectedReasons.includes(r.id) && r.identifier
                  ) || [];

                  return (
                    <div key={solution.id} className="mb-8 pb-8 border-b last:border-b-0 last:mb-0 last:pb-0">
                      <h3 className="text-2xl font-semibold mb-3 text-gray-800">{solution.title}</h3>
                      {solution.samenvattingLang && (
                        <div className="prose prose-sm max-w-none mb-4 text-gray-700">
                          <MarkdownContent content={processMarkdownText(solution.samenvattingLang)} />
                        </div>
                      )}

                      {selectedReasonsForCurrentSolution.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200"> {/* Removed mb-6 and pb-2 */}
                          <h4 className="text-md font-semibold mb-3">Bijdrage aan geselecteerde aanleidingen:</h4>
                          <div className="space-y-4"> {/* Spacing between each reason's block */}
                            {selectedReasonsForCurrentSolution.map(reason => {
                              const explanationFieldName = reason.identifier ? snakeToCamel(reason.identifier) + 'Toelichting' : '';
                              const explanationText = explanationFieldName ? (solution as any)[explanationFieldName] : undefined;

                              console.log(`[SummaryPage] Reason: ${reason.title}, Identifier: ${reason.identifier}, FieldName: ${explanationFieldName}, TextFound: ${explanationText ? 'YES' : 'NO'}`, explanationText);

                              return (
                                <div key={reason.id}>
                                  <p className="text-sm font-medium text-gray-800 mb-1">{reason.title}:</p>
                                  {explanationText ? (
                                    <div className="prose prose-sm max-w-none text-gray-700 pl-4">
                                      <MarkdownContent content={processMarkdownText(explanationText as string)} />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 pl-4 italic">Geen specifieke toelichting beschikbaar.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* MOBILITY SOLUTION BUTTON WRAPPER WITH BORDER - REVERTED TO MT-6 PT-6 */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <MobilitySolutionFactsheetButton 
                          solution={solution} 
                          className="mb-4" // Adjusted className
                        />
                      </div>

                      {solutionVariants.map(variation => {
                        const displayVariantTitle = stripSolutionPrefixFromVariantTitle(variation.title);
                        return (
                          <div key={variation.id} className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-semibold mb-2">Geselecteerde implementatievariant: {displayVariantTitle}</h4>
                            {variation.samenvatting && (
                              <div className="prose prose-sm max-w-none mb-3 text-gray-700">
                                <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
                              </div>
                            )}
                            {/* IMPLEMENTATION VARIANT BUTTON WRAPPER WITH BORDER */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <ImplementationVariantFactsheetButton 
                                variation={variation} 
                                className="mt-2"
                              />
                            </div>
                          </div>
                        );
                      })} 
                      {solutionVariants.length === 0 && (
                        <p className="text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">Geen specifieke variant gekozen voor deze oplossing.</p>
                      )}
                    </div>
                  );
                })} 
              </>
            )}
          </div>

          {/* Gekozen governance model section */}
          {selectedGovernanceModelData && (
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h3 className="text-xl font-semibold mb-4">Gekozen governance model</h3>
              <div className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-lg mb-2">{selectedGovernanceModelData.title}</h4>
                {/* Display summary/description from the fetched model */}
                <p className="mb-3 text-gray-700">{selectedGovernanceModelData.summary || selectedGovernanceModelData.description || 'Geen beschrijving'}</p>
                
                {/* --- START: Show explanation per selected VARIANT --- */}
                {selectedVariationsData.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {selectedVariationsData.map(variation => {
                      const fieldName = governanceTitleToFieldName(selectedGovernanceModelData.title);
                      if (!fieldName) return null;
                      
                      const text = (variation as any)[fieldName]; 
                      if (!text) return null;

                      // Apply helper to variation title here as well
                      const displayVariantTitleForGov = stripSolutionPrefixFromVariantTitle(variation.title);

                      return (
                        <div key={variation.id} className="pl-2">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Relevantie voor variant "{displayVariantTitleForGov}":
                          </p>
                          <div className="prose prose-sm max-w-none pl-4 text-gray-700">
                            <MarkdownContent content={processMarkdownText(text)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* --- END: Show explanation per selected VARIANT --- */}
                
                {/* PDF Download Button for Governance Model */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <GovernanceModelFactsheetButton 
                    governanceModel={selectedGovernanceModelData}
                    selectedVariations={selectedVariationsData}
                    governanceTitleToFieldName={governanceTitleToFieldName}
                    stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                    className="w-full md:w-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-4"
      />
    </div>
  );
} 