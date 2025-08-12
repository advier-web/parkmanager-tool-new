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
import { ImplementationVariation, GovernanceModel, MobilitySolution, TrafficType } from '@/domain/models';
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
      const variantIdsToFetch = Object.values(selectedVariants).filter((vId): vId is string => vId !== null);
      const solutionIds = selectedSolutions; // From store
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

  // --- Feature flag: automatisch gegenereerde highlights tonen onder oplossing/variant ---
  const ENABLE_AUTO_HIGHLIGHTS = false;

  // Helpers for compact bullet extraction from multi-line strings
  const textToBullets = (text?: string, maxItems: number = 4): string[] => {
    if (!text || typeof text !== 'string') return [];
    // strip simple HTML tags just in case
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\r/g, '');
    const parts = clean
      .split(/\n|\r|\u2022|\-/)
      .map(s => s.trim())
      .filter(Boolean);
    return parts.slice(0, maxItems);
  };

  const buildSolutionHighlights = (solution: MobilitySolution): string[] => {
    const items: string[] = [];
    if (solution.doorlooptijd) items.push(`Doorlooptijd: ${solution.doorlooptijd}`);
    if (solution.moeilijkheidsgraad) items.push(`Moeilijkheidsgraad: ${solution.moeilijkheidsgraad}`);
    const randvoorwaarden: string[] = [];
    if (solution.minimumAantalPersonen) randvoorwaarden.push(`Min. aantal: ${solution.minimumAantalPersonen}`);
    if (solution.afstand) randvoorwaarden.push(`Afstand: ${solution.afstand}`);
    if (solution.ophalen && solution.ophalen.length > 0) randvoorwaarden.push(`Ophalen: ${solution.ophalen.join(', ')}`);
    if (solution.minimaleInvestering) randvoorwaarden.push(`Min. investering: ${solution.minimaleInvestering}`);
    if (randvoorwaarden.length > 0) items.push(`Randvoorwaarden: ${randvoorwaarden.join(' • ')}`);
    return items.slice(0, 4);
  };

  const buildVariantHighlights = (variation: ImplementationVariation): { title: string; bullets: string[] }[] => {
    const sections: { title: string; bullets: string[] }[] = [];
    const leveranciers = textToBullets(variation.realisatieplanLeveranciers, 3);
    if (leveranciers.length > 0) sections.push({ title: 'Wie betrekken', bullets: leveranciers });
    const aandacht = textToBullets(variation.realisatieplanAandachtspunten || variation.realisatieplanChecklist, 4);
    const risico = textToBullets(
      [variation.risicoVanOnvoldoendeGebruik, variation.juridischeEnComplianceRisicos, variation.operationeleComplexiteit]
        .filter(Boolean)
        .join('\n'),
      3
    );
    const aandachtTotal = [...aandacht, ...risico].slice(0, 4);
    if (aandachtTotal.length > 0) sections.push({ title: 'Belangrijkste aandachtspunten', bullets: aandachtTotal });
    const rand: string[] = [];
    if (variation.geschatteJaarlijkseKosten) rand.push(`Kosten (indicatie): ${variation.geschatteJaarlijkseKosten}`);
    if (rand.length > 0) sections.push({ title: 'Randvoorwaarden & afspraken', bullets: rand.slice(0, 3) });
    return sections;
  };

  // Helper list for solutions to allow correct border rendering (no border after last)
  const solutionsList = Object.values(selectedSolutionsData);

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
            {selectedVariationsData.map(variation => (
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
              Controleer uw selecties hieronder. U kunt teruggaan naar eerdere stappen om wijzigingen aan te brengen.
            </p>
            
            {/* PDF download is verplaatst naar onderaan de pagina */}
          </div>
          
          {/* Geselecteerde Oplossingen & Varianten */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-xl font-semibold mb-6">Geselecteerde vervoerplossing & implementatievariant</h2>
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
                    <div key={solution.id} className={`mb-8 pb-8 ${idx < solutionsList.length - 1 ? 'border-b' : ''}`}>
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

                      {/* Automatische highlights onder oplossing */}
                      {ENABLE_AUTO_HIGHLIGHTS && (
                        (() => {
                          const points = buildSolutionHighlights(solution);
                          if (points.length === 0) return null;
                          return (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="text-sm font-semibold mb-2">Kernpunten voor deze oplossing</h4>
                              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                {points.map((p, idx) => (<li key={idx}>{p}</li>))}
                              </ul>
                            </div>
                          );
                        })()
                      )}

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
                            {/* Automatische highlights onder variant */}
                            {ENABLE_AUTO_HIGHLIGHTS && (
                              (() => {
                                const sections = buildVariantHighlights(variation);
                                if (sections.length === 0) return null;
                                return (
                                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    {sections.map((sec, idx) => (
                                      <div key={idx}>
                                        <p className="text-sm font-semibold mb-1">{sec.title}</p>
                                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                          {sec.bullets.map((b, i) => (<li key={i}>{b}</li>))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        );
                      })} 
                      {solutionVariants.length === 0 && (
                        <p className="text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">Geen specifieke variant gekozen voor deze oplossing.</p>
                      )}
                    </div>
                  );
                })} 

                {/* Geaggregeerde vervolgstappen onderaan */}
                {selectedVariationsData.some(v => v.vervolgstappen) && (
                  <div className="mt-4 pt-8">
                    <h4 className="text-md font-semibold mb-3">Vervolgstappen</h4>
                    <div className="space-y-4">
                      {selectedVariationsData.filter(v => v.vervolgstappen).map(v => {
                        const title = stripSolutionPrefixFromVariantTitle(v.title);
                        return (
                          <div key={v.id}>
                            {/* <p className="text-sm font-medium text-gray-800 mb-1">{title}</p> */}
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <MarkdownContent content={processMarkdownText(v.vervolgstappen as string)} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* COVER Subsidie sectie (alleen tonen als minimaal één oplossing zakelijk of bezoekers verkeer dekt) */}
          {Object.values(selectedSolutionsData).some(s => (s.typeVervoer || []).some(t => t === TrafficType.BUSINESS || t === TrafficType.VISITOR)) && (
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h2 className="text-xl font-semibold mb-2">Subsidie: COVER (Collectieven mkb Verduurzaming Reisgedrag)</h2>
              <p className="text-gray-700 mb-4">Deze subsidie kan helpen bij het financieren van activiteiten die het zakelijke- en bezoekersverkeer verduurzamen.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
                <div>
                  <p className="font-medium mb-2">Waarvoor te gebruiken</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Projecten en activiteiten die blijvend duurzaam reisgedrag stimuleren.</li>
                    <li>Voorbeelden: raamovereenkomsten met vervoeraanbieders, besloten vervoer op bedrijventerreinen (opstart), last-mile vervoer vanaf OV, CAO-afspraken, mobiliteitsbudget.</li>
                    <li>Niet voor logistiek verkeer; gericht op zakelijk verkeer en bezoekers.</li>
                    <li>De subsidie is niet voor exploitatiekosten bedoelt.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Wie komt in aanmerking</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Een rechtspersoon die optreedt namens een groep werkgevers in het mkb.</li>
                    <li>De achterban bestaat voor ≥ 50% uit mkb-werkgevers.</li>
                    <li>Minimale subsidieaanvraag: €10.000.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Belangrijkste randvoorwaarden</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Subsidie tot max. 75% van de kosten, met plafond van €100.000 per project.</li>
                    <li>Maximaal €0,75 subsidie per bespaarde kg CO₂; onderbouwde CO₂-berekening vereist.</li>
                    <li>Resultaat is structureel/blijvend; projectduur maximaal 24 maanden.</li>
                    <li>De-minimissteun afgelopen 3 jaar: ≤ €300.000.</li>
                  </ul>
                </div>
              </div>
             
              {/* Aanvraag voorbereiden */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-gray-800">
                <h3 className="text-md font-semibold mb-2">Aanvraag voorbereiden</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>eHerkenning niveau 2+ (reken op 1–5 werkdagen); intermediair kan namens u aanvragen.</li>
                  <li>Gegevens aanvrager: naam, adres, wettelijk vertegenwoordiger en KvK-nummer.</li>
                  <li>De-minimisverklaring over ontvangen steun in de afgelopen 3 jaar.</li>
                  <li>Projectplan met doel, activiteiten, blijvend resultaat en onderbouwde CO₂-berekening (max € 0,75 subsidie per bespaarde kg CO₂).</li>
                  <li>Gespecificeerde begroting (kostenposten en onderbouwing).</li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Meer informatie en actuele voorwaarden: <a className="text-blue-600 underline" href="https://www.rvo.nl/subsidies-financiering/cover" target="_blank" rel="noreferrer noopener">RVO – COVER</a>.</p>
                <p className="mt-2">Na verlening keert RVO doorgaans 90% voorschot uit; voor projecten &gt; 1 jaar en &gt; € 25.000 is tussentijdse voortgangsrapportage verplicht. Na afloop volgt vaststelling en een prestatieverklaring.</p>
              </div>
            </div>
          )}

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