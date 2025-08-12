"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/store/wizard-store';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '@/hooks/use-domain-models';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SummaryPdfDocument from '../../../components/summary-pdf-document';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon, DocumentTextIcon, ClockIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation, GovernanceModel, MobilitySolution } from '@/domain/models';
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
    stripSolutionPrefixFromVariantTitle
} from '../../../utils/wizard-helpers'; 

export default function VervolgstappenPage() {
  const {
    businessParkInfo,
    businessParkName,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel: selectedGovernanceModelId,
    selectedVariants,
    _hasHydrated
  } = useWizardStore();

  const { data: reasons } = useBusinessParkReasons();
  const { data: models } = useGovernanceModels();
  const { data: solutions } = useMobilitySolutions();
  const { data: plans } = useImplementationPlans();
  
  // State for fetched data
  const [selectedVariationsData, setSelectedVariationsData] = useState<ImplementationVariation[]>([]);
  const [selectedGovernanceModelData, setSelectedGovernanceModelData] = useState<GovernanceModel | null>(null);
  const [selectedSolutionsData, setSelectedSolutionsData] = useState<Record<string, MobilitySolution>>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) {
       return; 
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      // Fetch ONLY variants that belong to currently selected solutions
      const solutionIds = selectedSolutions; // From store
      const variantIdsToFetch = solutionIds
        .map((sid) => selectedVariants[sid] || null)
        .filter((vId): vId is string => vId !== null);
      const govModelId = selectedGovernanceModelId; // From store

      try {
        const variationPromises = variantIdsToFetch.map(id => getImplementationVariationById(id));
        const solutionPromises = solutionIds.map(id => getMobilitySolutionById(id));
        const govModelPromise = govModelId ? getGovernanceModelByIdFromContentful(govModelId) : Promise.resolve(null);

        const [variationResults, solutionResults, govModelResult] = await Promise.all([
          Promise.all(variationPromises),
          Promise.all(solutionPromises),
          govModelPromise
        ]);
        
        const fetchedVariations = variationResults.filter((v): v is ImplementationVariation => v !== null);
        const fetchedSolutions = solutionResults.reduce((acc, sol) => {
          if (sol) acc[sol.id] = sol;
          return acc;
        }, {} as Record<string, MobilitySolution>);
        
        setSelectedVariationsData(fetchedVariations);
        setSelectedSolutionsData(fetchedSolutions);
        setSelectedGovernanceModelData(govModelResult);
      } catch (err) {
        console.error("Error fetching data for Vervolgstappen Page:", err);
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

  const selectedReasonTitles = reasons
    ? reasons.filter(reason => selectedReasons.includes(reason.id)).map(reason => reason.title)
    : [];

  const selectedGovernanceModelTitle = selectedGovernanceModelData?.title || '';
  
  const currentGovernanceModelTitle = models && currentGovernanceModelId
    ? models.find((model: GovernanceModel) => model.id === currentGovernanceModelId)?.title || ''
    : '';

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verwijderd: automatische highlights-functionaliteit en helpers

  // Helper list for solutions to allow correct border rendering (no border after last)
  const solutionsList = Object.values(selectedSolutionsData);

  const isSameGovernanceModel = selectedGovernanceModelId && currentGovernanceModelId
    ? selectedGovernanceModelId === currentGovernanceModelId
    : false;

  const extractH2Headings = (html?: string): string[] => {
    if (!html || typeof html !== 'string') return [];
    const results: string[] = [];
    // Accept either <h2> tags or markdown '## ' headings
    const combined = html;
    const regexH2 = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    let m: RegExpExecArray | null;
    while ((m = regexH2.exec(combined)) !== null) {
      const inner = m[1] || '';
      const text = inner.replace(/<[^>]*>/g, '').trim();
      if (text) results.push(text);
    }
    // Markdown fallback
    const mdMatches = combined.match(/^##\s+.*$/gim) || [];
    for (const line of mdMatches) {
      const t = line.replace(/^##\s+/, '').trim();
      if (t) results.push(t);
    }
    return results;
  };

  // Extract variant-specific relevance text for chosen governance model
  const getVariantRelevance = (): string | null => {
    if (!selectedGovernanceModelData || selectedVariationsData.length === 0) return null;
    const fieldName = governanceTitleToFieldName(selectedGovernanceModelData.title);
    if (!fieldName) return null;
    // Neem de daadwerkelijk opgehaalde/gekozen variant (eerste in lijst)
    const variation = selectedVariationsData[0];
    const text = variation ? (variation as any)[fieldName] : undefined;
    return typeof text === 'string' && text.trim() ? text : null;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - alleen keuzes */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary variationsData={selectedVariationsData} />
          {/* Downloads sectie - compact lijstje */}
          <div className="bg-white rounded-lg p-6 shadow-even space-y-3">
            <h3 className="text-lg font-semibold mb-1">Downloads</h3>
            {/* Samenvatting */}
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              {isClient ? (
                <PDFDownloadLink
                  document={(
                    <SummaryPdfDocument 
                      businessParkInfo={businessParkInfo} 
                      businessParkName={businessParkName}
                      currentGovernanceModelTitle={currentGovernanceModelTitle}
                      selectedReasonTitles={selectedReasonTitles} 
                      selectedSolutionsData={Object.values(selectedSolutionsData)}
                      selectedVariants={selectedVariants}
                      selectedGovernanceModelId={selectedGovernanceModelId} 
                      governanceModels={models || []} 
                      governanceTitleToFieldName={governanceTitleToFieldName}
                      reasons={reasons || []}
                      selectedReasons={selectedReasons}
                      snakeToCamel={snakeToCamel}
                      selectedVariationsData={selectedVariationsData}
                    />
                  )}
                  fileName={`Vervolgstappen_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
                >
                  {({ loading }: { loading: boolean }) => (
                    <span className="text-sm text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-800 hover:underline transition-colors">
                      {loading ? '...' : 'Vervolgstappen (PDF)'}
                    </span>
                  )}
                </PDFDownloadLink>
              ) : (
                <span className="text-sm text-gray-500">Laden…</span>
              )}
            </div>

            {/* Oplossingen */}
            {Object.values(selectedSolutionsData).map(sol => (
              <div key={`dl-sol-${sol.id}`} className="flex items-start gap-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <MobilitySolutionFactsheetButton 
                  solution={sol}
                  buttonColorClassName="p-0 h-auto text-sm bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer block whitespace-normal break-words text-left leading-snug min-w-0 max-w-[220px] transition-colors"
                >
                  {`Factsheet: ${sol.title}`}
                </MobilitySolutionFactsheetButton>
              </div>
            ))}

            {/* Varianten */}
            {Array.from(new Map(selectedVariationsData.map(v => [v.title, v])).values()).map(variation => (
              <div key={`dl-var-${variation.id}`} className="flex items-start gap-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <ImplementationVariantFactsheetButton 
                  variation={variation}
                  buttonColorClassName="p-0 h-auto text-sm bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer block whitespace-normal break-words text-left leading-snug min-w-0 max-w-[220px] transition-colors"
                >
                  {`Factsheet: ${stripSolutionPrefixFromVariantTitle(variation.title)}`}
                </ImplementationVariantFactsheetButton>
              </div>
            ))}

            {/* Governance model */}
            {selectedGovernanceModelData && (
              <div className="flex items-start gap-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <GovernanceModelFactsheetButton 
                  governanceModel={selectedGovernanceModelData}
                  selectedVariations={selectedVariationsData}
                  governanceTitleToFieldName={governanceTitleToFieldName}
                  stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                  buttonColorClassName="p-0 h-auto text-sm bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer block whitespace-normal break-words text-left leading-snug min-w-0 max-w-[220px] transition-colors"
                >
                  {`Factsheet: ${selectedGovernanceModelData.title}`}
                </GovernanceModelFactsheetButton>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Top-level Introduction */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Vervolgstappen</h2>
            <p className="mb-6">
              Op deze pagina vindt u een overzicht van de gemaakte keuzes, en concrete vervolgstappen . U kunt teruggaan naar eerdere stappen om wijzigingen aan te brengen.
            </p>
            
            {/* PDF download is verplaatst naar onderaan de pagina */}
          </div>
          
          {/* Geselecteerde Oplossingen & Varianten (incl. governance model info) */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-xl font-semibold mb-6">Geselecteerde governance model, vervoersoplossing & implementatievariant</h2>
            {/* Governance model informatie */}
            {selectedGovernanceModelData && (
              <div className="mb-6">
                {/* <h3 className="text-lg font-semibold mb-2">Governance model</h3> */}
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">{selectedGovernanceModelData.title}</h3>
                {/* Samenvatting governance model indien beschikbaar */}
                {selectedGovernanceModelData.summary && (
                  <div className="prose prose-sm max-w-none text-gray-700 mb-3">
                    <MarkdownContent content={selectedGovernanceModelData.summary} />
                  </div>
                )}
                {/* Variant-specifieke relevantietekst */}
                {(() => {
                  const rel = getVariantRelevance();
                  if (!rel) return null;
                  return (
                    <div className="prose prose-sm max-w-none text-gray-700 mb-3">
                      <MarkdownContent content={processMarkdownText(rel)} />
                    </div>
                  );
                })()}
                {isSameGovernanceModel ? (
                  <p className="text-gray-700">Het gekozen governance model is hetzelfde als uw huidige model. Er zijn geen aanvullende werkzaamheden nodig.</p>
                ) : (
                  (() => {
                    const items = extractH2Headings(selectedGovernanceModelData.implementatie);
                    return items.length > 0 ? (
                      <div className="text-gray-700">
                        <h4 className="text-md font-semibold mb-2">Implementatiestappen governance model</h4>
                        {items.map((txt, idx) => (
                          <div key={`imp-${idx}`}>{txt}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700">Implementatiestappen voor het gekozen governance model worden later toegevoegd.</p>
                    );
                  })()
                )}
                {/* Link naar factsheet */}
                <p className="text-sm text-gray-600 mt-4">
                  Meer informatie over dit governance model en uitgebreide implementatiestappen vind u in de{' '}
                  <GovernanceModelFactsheetButton
                    governanceModel={selectedGovernanceModelData}
                    selectedVariations={selectedVariationsData}
                    governanceTitleToFieldName={governanceTitleToFieldName}
                    stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                    className="inline-block p-0"
                    buttonColorClassName="p-0 h-auto bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    factsheet {selectedGovernanceModelData.title}
                  </GovernanceModelFactsheetButton>
                  .
                </p>
              </div>
            )}
            {/* Divider between governance model and first solution */}
            <div className="mt-6 pt-6 border-t border-gray-200" />
            {isLoading && <p>Oplossingen en varianten laden...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && Object.keys(selectedSolutionsData).length === 0 && (
              <p>Geen oplossingen geselecteerd.</p>
            )}
            {!isLoading && !error && Object.keys(selectedSolutionsData).length > 0 && (
              <>
                {solutionsList.map((solution, idx) => {
                  const solutionVariants = selectedVariationsData.filter(v => v.mobiliteitsdienstVariantId === solution.id);

                  return (
                    <div key={solution.id} className={`mb-4 pb-2 ${idx < solutionsList.length - 1 ? 'border-b' : ''}`}>
                      <h3 className="text-2xl font-semibold mb-3 text-gray-800">{solution.title}</h3>
                      {solution.samenvattingLang && (
                        <div className="prose prose-sm max-w-none mb-4 text-gray-700">
                          <MarkdownContent content={processMarkdownText(solution.samenvattingLang)} />
                        </div>
                      )}

                      {/* Extra solution meta: moeilijkheidsgraad & doorlooptijd */}
                      {(solution.moeilijkheidsgraad || solution.doorlooptijd) && (
                        <div className="flex flex-wrap gap-4 text-gray-700 mb-2">
                          {/* {solution.moeilijkheidsgraad && (
                            <div className="flex items-center">
                              <WrenchScrewdriverIcon className="h-4 w-4 text-amber-600 mr-1" />
                              <span>Moeilijkheidsgraad: {solution.moeilijkheidsgraad}</span>
                            </div>
                          )} */}
                          {solution.doorlooptijd && (
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 text-indigo-600 mr-1" />
                              <span>Doorlooptijd: {solution.doorlooptijd}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verwijderd: automatische highlights onder oplossing */}

                      {/* Inline factsheet link voor oplossing */}
                      <p className="text-sm text-gray-600 mt-4">
                        Meer informatie over deze vervoersoplossing vindt u in de{' '}
                        <MobilitySolutionFactsheetButton
                          solution={solution}
                          className="inline-block p-0"
                          buttonColorClassName="p-0 h-auto bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          factsheet {solution.title}
                        </MobilitySolutionFactsheetButton>
                      </p>

                      {solutionVariants.map(variation => {
                        const displayVariantTitle = stripSolutionPrefixFromVariantTitle(variation.title);
                        return (
                          <div key={variation.id} className="mt-4 pt-4 border-t border-gray-200 mb-2 pb-1">
                            <h3 className="text-2xl font-semibold mb-3 text-gray-800">{displayVariantTitle}</h3>
                            {variation.samenvatting && (
                              <div className="prose prose-sm max-w-none mb-3 text-gray-700">
                                <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
                              </div>
                            )}
                            {variation.vervolgstappen && (
                              <div className="prose prose-sm max-w-none mb-3 text-gray-700">
                                <MarkdownContent content={processMarkdownText(variation.vervolgstappen)} />
                              </div>
                            )}
                            {/* Inline factsheet link voor implementatievariant */}
                            <p className="text-sm text-gray-600 mt-4">
                              Meer informatie over deze implementatievariant vindt u in de{' '}
                              <ImplementationVariantFactsheetButton
                                variation={variation}
                                className="inline-block p-0"
                                buttonColorClassName="p-0 h-auto bg-transparent hover:bg-transparent text-blue-600 underline underline-offset-2 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                factsheet {displayVariantTitle}
                              </ImplementationVariantFactsheetButton>
                            </p>
                            {/* Verwijderd: automatische highlights onder variant */}
                          </div>
                        );
                      })} 
                      {solutionVariants.length === 0 && (
                        <p className="text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">Geen specifieke variant gekozen voor deze oplossing.</p>
                      )}
                    </div>
                  );
                })} 

                {/* Geaggregeerde vervolgstappen onderaan verwijderd om dubbele weergave te voorkomen */}
              </>
            )}
          </div>

          {/* COVER Subsidie sectie - altijd zichtbaar */}
          <div className="bg-white rounded-lg p-8 shadow-even">
              <h2 className="text-xl font-semibold mb-2">Subsidie: COVER (Collectieven mkb Verduurzaming Reisgedrag)</h2>
              <p className="text-gray-700 mb-4">Deze subsidie kan helpen bij het financieren van activiteiten die het zakelijke- en bezoekersverkeer verduurzamen.</p>
              <div className="space-y-3 text-gray-800">
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Waarvoor te gebruiken</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <li>Projecten en activiteiten die blijvend duurzaam reisgedrag stimuleren.</li>
                    <li>Voorbeelden: raamovereenkomsten met vervoeraanbieders, besloten vervoer op bedrijventerreinen (opstart), last-mile vervoer vanaf OV, CAO-afspraken, mobiliteitsbudget.</li>
                    <li>Niet voor logistiek verkeer; gericht op zakelijk verkeer en bezoekers.</li>
                    <li>De subsidie is niet voor exploitatiekosten bedoelt.</li>
                  </ul>
                </details>
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Wie komt in aanmerking</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <li>Een rechtspersoon die optreedt namens een groep werkgevers in het mkb.</li>
                    <li>De achterban bestaat voor ≥ 50% uit mkb-werkgevers.</li>
                    <li>Minimale subsidieaanvraag: €10.000.</li>
                  </ul>
                </details>
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Belangrijkste randvoorwaarden</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <li>Subsidie tot max. 75% van de kosten, met plafond van €100.000 per project.</li>
                    <li>Maximaal €0,75 subsidie per bespaarde kg CO₂; onderbouwde CO₂-berekening vereist.</li>
                    <li>Resultaat is structureel/blijvend; projectduur maximaal 24 maanden.</li>
                    <li>De-minimissteun afgelopen 3 jaar: ≤ €300.000.</li>
                  </ul>
                </details>
              </div>
             
              {/* Aanvraag voorbereiden */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-gray-800">
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Aanvraag voorbereiden</summary>
                  <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                    <li>eHerkenning niveau 2+ (reken op 1–5 werkdagen); intermediair kan namens u aanvragen.</li>
                    <li>Gegevens aanvrager: naam, adres, wettelijk vertegenwoordiger en KvK-nummer.</li>
                    <li>De-minimisverklaring over ontvangen steun in de afgelopen 3 jaar.</li>
                    <li>Projectplan met doel, activiteiten, blijvend resultaat en onderbouwde CO₂-berekening (max € 0,75 subsidie per bespaarde kg CO₂).</li>
                    <li>Gespecificeerde begroting (kostenposten en onderbouwing).</li>
                  </ul>
                </details>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Meer informatie en actuele voorwaarden: <a className="text-blue-600 underline" href="https://www.rvo.nl/subsidies-financiering/cover" target="_blank" rel="noreferrer noopener">RVO – COVER</a>.</p>
                <p className="mt-2">Na verlening keert RVO doorgaans 90% voorschot uit; voor projecten &gt; 1 jaar en &gt; € 25.000 is tussentijdse voortgangsrapportage verplicht. Na afloop volgt vaststelling en een prestatieverklaring.</p>
              </div>
          </div>

          {/* Governance-model sectie verwijderd uit vervolgstappen (staat in implementatieplan) */}
        </div>
      </div>
      
      {/* Centrale downloadrij verplaatst naar Downloads-sectie links */}
      <WizardNavigation
        previousStep="/wizard/governance-modellen"
      />
    </div>
  );
}