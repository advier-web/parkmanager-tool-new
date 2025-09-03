"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/store/wizard-store';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '@/hooks/use-domain-models';
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SummaryPdfDocument from '../../../components/summary-pdf-document';
import SummaryPdfDownloadButton from '@/components/summary-pdf-download-button';
import { Document as PdfDocument, Page as PdfPage, View as PdfView, Text as PdfText } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon, DocumentTextIcon, ClockIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation, GovernanceModel, MobilitySolution } from '@/domain/models';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { getImplementationVariationById, getMobilitySolutionById, getGovernanceModelByIdFromContentful } from '@/services/contentful-service';
import { WizardNavigation } from '@/components/wizard-navigation';
import MobilitySolutionFactsheetButton from '@/components/mobility-solution-factsheet-button';
import ImplementationVariantFactsheetButton from '@/components/implementation-variant-factsheet-button';
import GovernanceModelFactsheetButton from '@/components/governance-model-factsheet-button';
import MobilitySolutionFactsheetPdf from '@/components/mobility-solution-factsheet-pdf';
import ImplementationVariantFactsheetPdf from '@/components/implementation-variant-factsheet-pdf';
import GovernanceModelFactsheetPdf from '@/components/governance-model-factsheet-pdf';

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
          {/* Downloads sectie - compact lijstje met inline iconen */}
          <div className="bg-white rounded-lg p-6 shadow-even space-y-3">
            <h3 className="text-lg font-semibold mb-1">Downloads</h3>
            {/* Samenvatting */}
            <div className="flex items-center gap-2 text-blue-600">
              <DocumentTextIcon className="w-4 h-4 shrink-0" />
              {isClient ? (
                <SummaryPdfDownloadButton
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
                  fileName={`Adviesrapport_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
                  className=""
                  buttonClassName=""
                  label="Adviesrapport (PDF)"
                  showIcon={false}
                  asLink
                />
              ) : (
                <span className="text-sm text-gray-500">Laden…</span>
              )}
            </div>

            {/* Oplossingen */}
            {Object.values(selectedSolutionsData).map(sol => (
              <div key={`dl-sol-${sol.id}`} className="flex items-center gap-2 text-blue-600">
                <DocumentTextIcon className="w-4 h-4 shrink-0" />
                {isClient ? (
                  <PDFDownloadLink document={<MobilitySolutionFactsheetPdf solution={sol} />} fileName={`Factsheet_${sol.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}>
                    {({ loading }: { loading: boolean }) => (
                      <span className="text-sm underline underline-offset-2 hover:text-blue-800 hover:underline transition-colors">
                        {loading ? '...' : `Factsheet: ${sol.title}`}
                      </span>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <span className="text-sm text-gray-500">Laden…</span>
                )}
              </div>
            ))}

            {/* Varianten */}
            {Array.from(new Map(selectedVariationsData.map(v => [v.title, v])).values()).map(variation => {
              const display = stripSolutionPrefixFromVariantTitle(variation.title);
              return (
                <div key={`dl-var-${variation.id}`} className="flex items-center gap-2 text-blue-600">
                  <DocumentTextIcon className="w-4 h-4 shrink-0" />
                  {isClient ? (
                    <PDFDownloadLink document={<ImplementationVariantFactsheetPdf variation={variation} />} fileName={`Factsheet_Variant_${variation.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}>
                      {({ loading }: { loading: boolean }) => (
                        <span className="text-sm underline underline-offset-2 hover:text-blue-800 hover:underline transition-colors">
                          {loading ? '...' : `Factsheet: ${display}`}
                        </span>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <span className="text-sm text-gray-500">Laden…</span>
                  )}
                </div>
              );
            })}

            {/* Governance model */}
            {selectedGovernanceModelData && (
              <div className="flex items-center gap-2 text-blue-600">
                <DocumentTextIcon className="w-4 h-4" />
                {isClient ? (
                  <PDFDownloadLink
                    document={(
                      <GovernanceModelFactsheetPdf
                        model={selectedGovernanceModelData}
                        variations={selectedVariationsData}
                        governanceTitleToFieldName={governanceTitleToFieldName}
                        stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                      />
                    )}
                    fileName={`Factsheet_Governance_Model_${(selectedGovernanceModelData.title || 'model').replace(/[^a-z0-9]/gi, '_')}.pdf`}
                  >
                    {({ loading }: { loading: boolean }) => (
                      <span className="text-sm underline underline-offset-2 hover:text-blue-800 hover:underline transition-colors">
                        {loading ? '...' : `Factsheet: ${selectedGovernanceModelData.title}`}
                      </span>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <span className="text-sm text-gray-500">Laden…</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Top-level Introduction */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Vervolgstappen</h2>
            <p className="mb-3">
              Op deze pagina vindt u een overzicht van de gemaakte keuzes, en concrete vervolgstappen . U kunt teruggaan naar eerdere stappen om wijzigingen aan te brengen. Via onderstaande knop kunt u het adviesrapport in PDF downloaden.
            </p>
            <p className="mb-6">Let op: dit is géén volledige mobiliteitsscan en ook geen individueel bedrijfsadvies; de uitkomst is bedoeld als gerichte shortlist en startpunt voor verdere uitwerking.</p>
            {/* Centrale downloadknop voor Adviesrapport */}
            {isClient && (
              <SummaryPdfDownloadButton
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
                fileName={`Adviesrapport_Mobiliteitsplan_${businessParkInfo?.numberOfCompanies ?? 'bedrijven'}.pdf`}
                label="Download Adviesrapport"
              />
            )}
          </div>
          
          {/* Geselecteerde Oplossingen & Varianten (incl. governance model info) */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            {/* <h2 className="text-xl font-semibold mb-6">Geselecteerde governance model, vervoersoplossing & implementatievariant</h2> */}
            {/* Indien huidig governance model 'niet geschikt' is voor gekozen variant(en) */}
            {false && (() => {
              // Toon ook de melding als huidig model 'Geen bestuursvorm' is
              const isNoGovernance = (currentGovernanceModelTitle || '').toLowerCase().includes('geen') &&
                ((currentGovernanceModelTitle || '').toLowerCase().includes('bestuursvorm') || (currentGovernanceModelTitle || '').toLowerCase().includes('rechtsvorm'));
              const notSuitable = isNoGovernance || (
                currentGovernanceModelId
                  ? selectedVariationsData.some(v =>
                      Array.isArray(v.governanceModelsNietgeschikt) &&
                      v.governanceModelsNietgeschikt.some(g => g.sys?.id === currentGovernanceModelId)
                    )
                  : true
              );
              if (!notSuitable) return null;
              return (
                <div className="mb-6 text-gray-700">
                  <h4 className="text-md font-semibold mb-2">Indien het huidige governance model niet volstaat:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Controleer of er in het kader van andere gemeenschappelijke voorzieningen (bijvoorbeeld energie) al een rechtsvorm wordt opgezet of aanwezig is waarbij kan worden aangesloten.</li>
                    <li>Update het huidige governance model naar één van de geadviseerde rechtsvormen en laat u daarin begeleiden door een specialist (check governance model factsheet voor concrete eerste stappen).</li>
                  </ul>
                </div>
              );
            })()}
            {/* Governance model informatie */}
            {selectedGovernanceModelData && (
              <div className="mb-6">
                {/* <h3 className="text-lg font-semibold mb-2">Governance model</h3> */}
                <h2 className="text-2xl font-bold mb-4">Gekozen governance model: {selectedGovernanceModelData.title}</h2>
                {(() => {
                  // 0) Indien het geselecteerde governance model 'Ongeschikt' is voor de geselecteerde variant
                  const isSelectedModelUnsuitable = selectedGovernanceModelData
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsNietgeschikt) &&
                        v.governanceModelsNietgeschikt.some(g => g.sys?.id === selectedGovernanceModelData.id)
                      )
                    : false;
                  if (isSelectedModelUnsuitable) {
                    const relevance = getVariantRelevance();
                    return (
                      <div className="mb-3">
                        <p className="text-gray-700 mb-3">
                          Het geselecteerde governance model wordt niet aanbevolen voor de geselecteerde vervoersoplossing. Overweeg onderstaande acties:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                          <li>Controleer of er in het kader van andere gemeenschappelijke voorzieningen (bijvoorbeeld energie) al een rechtsvorm wordt opgezet of aanwezig is waarbij kan worden aangesloten.</li>
                          <li>Update het huidige governance model naar één van de geadviseerde rechtsvormen en laat u daarin begeleiden door een specialist (check governance model factsheet voor concrete eerste stappen).</li>
                        </ul>
                        <div className="mb-3"><p>Indien u toch dit governance model wilt gebruiken, kunt u de volgende punten in acht nemen:</p></div>
                        {relevance && (
                          <div className="text-gray-700 mb-3">
                            <MarkdownContent content={processMarkdownText(relevance)} />
                          </div>
                        )}
                      </div>
                    );
                  }
                  const notSuitable = currentGovernanceModelId
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsNietgeschikt) &&
                        v.governanceModelsNietgeschikt.some(g => g.sys?.id === currentGovernanceModelId)
                      )
                    : false;
                  const isConditionalSelected = selectedGovernanceModelData
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsMits) &&
                        v.governanceModelsMits.some(g => g.sys?.id === selectedGovernanceModelData.id)
                      )
                    : false;

                  // 1) Toon bij 'Aanbevolen, mits' altijd de relevantie-tekst, ongeacht huidig vs gekozen model
                  if (isConditionalSelected) {
                    const relevance = getVariantRelevance();
                    return (
                      <div className="mb-3">
                        <p className="text-gray-700 mb-3">
                          Het geselecteerde governance model is mogelijk minder geschikt voor de geselecteerde vervoersoplossing. Besteed extra aandacht aan de onderstaande punten.
                        </p>
                        {relevance && (
                          <div className="text-gray-700 mb-3">
                            <MarkdownContent content={processMarkdownText(relevance)} />
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2) Indien het gekozen model afwijkt van het huidige, toon begeleidende melding
                  if (!isSameGovernanceModel) {
                    return (
                      <p className="text-gray-700 mb-3">
                        U heeft een ander governance model gekozen dan het huidige model. Het is belangrijk om eerst de governance-structuur op orde te hebben voordat u verder gaat met het implementeren van de collectieve vervoersoplossing.
                      </p>
                    );
                  }

                  if (isSameGovernanceModel && !notSuitable) {
                    return (
                      <p className="text-gray-700 mb-3">
                        Het huidige governance model voldoet en u kunt verder met de implementatiestappen voor het implementeren van de collectieve vervoersoplossing.
                      </p>
                    );
                  }

                  return null;
                })()}

                {/* Implementatiestappen (toon alleen als huidig model niet simpelweg voldoet) */}
                {(() => {
                  // Bij "Niet aanbevolen" tonen we óók de implementatiestappen (zoals bij 'Aanbevolen, mits'),
                  // behalve wanneer het geselecteerde model gelijk is aan het huidige model.
                  const isSelectedModelUnsuitable = selectedGovernanceModelData
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsNietgeschikt) &&
                        v.governanceModelsNietgeschikt.some(g => g.sys?.id === selectedGovernanceModelData.id)
                      )
                    : false;
                  if (isSelectedModelUnsuitable) {
                    if (isSameGovernanceModel) return null;
                    const items = extractH2Headings(selectedGovernanceModelData.implementatie);
                    return items.length > 0 ? (
                      <div className="text-gray-700">
                        <h4 className="text-md font-semibold mb-2">Implementatiestappen governance model</h4>
                        <p className="text-gray-700 mb-4">
                          Om het geselecteerde governance model succesvol te implementeren, moet u globaal de volgende stappen doorvoeren. Voor een gedetailleerde uitleg, raadpleeg de factsheet via de downloadknop.
                        </p>
                        {items.map((txt, idx) => (
                          <div key={`imp-${idx}`}>{txt}</div>
                        ))}
                      </div>
                    ) : null;
                  }
                  const notSuitable = currentGovernanceModelId
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsNietgeschikt) &&
                        v.governanceModelsNietgeschikt.some(g => g.sys?.id === currentGovernanceModelId)
                      )
                    : false;
                  const isConditionalSelected = selectedGovernanceModelData
                    ? selectedVariationsData.some(v =>
                        Array.isArray(v.governanceModelsMits) &&
                        v.governanceModelsMits.some(g => g.sys?.id === selectedGovernanceModelData.id)
                      )
                    : false;
                  const currentModelSufficient = isSameGovernanceModel && !notSuitable && !isConditionalSelected;
                  if (currentModelSufficient) return null;
                  const items = extractH2Headings(selectedGovernanceModelData.implementatie);
                  return items.length > 0 ? (
                    <div className="text-gray-700">
                      <h4 className="text-md font-semibold mb-2">Implementatiestappen governance model</h4>
                      <p className="text-gray-700 mb-4">
                        Om het geselecteerde governance model succesvol te implementeren, moet u globaal de volgende stappen doorvoeren. Voor een gedetailleerde uitleg, raadpleeg de factsheet via de downloadknop.
                      </p>
                      {items.map((txt, idx) => (
                        <div key={`imp-${idx}`}>{txt}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700">Implementatiestappen voor het gekozen governance model worden later toegevoegd.</p>
                  );
                })()}
                {/* Link naar factsheet */}
                <p className="text-gray-700 mt-4">
                  Meer informatie over dit governance model vindt u in de factsheet {selectedGovernanceModelData.title}.
                </p>
                <div className="mt-4">
                  {isClient && (
                    <PDFDownloadLink
                      document={(
                        <GovernanceModelFactsheetPdf
                          model={selectedGovernanceModelData}
                          variations={selectedVariationsData}
                          governanceTitleToFieldName={governanceTitleToFieldName}
                          stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                        />
                      )}
                      fileName={`Factsheet_Governance_Model_${(selectedGovernanceModelData.title || 'model').replace(/[^\s\w-]/gi, '_').replace(/\s+/g, '_')}.pdf`}
                    >
                      {({ loading }: { loading: boolean }) => (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                          <DocumentTextIcon className="h-4 w-4" />
                          {loading ? 'Even geduld…' : `Download factsheet ${selectedGovernanceModelData.title}`}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              </div>
            )}
            {/* Algemene vervolgstappen verplaatst naar eigen sectie */}

            {/* Einde governance container */}
          </div>

          {/* Losse kaarten per oplossing-variant combinatie */}
          {isLoading && <p>Oplossingen en varianten laden...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {/* Algemene vervolgstappen eigen sectie */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h3 className="text-2xl font-semibold mb-2">Algemene vervolgstappen</h3>
            <p className="text-gray-700 mt-4 mb-4">
                  Nadat u de governance model keuze hebt gemaakt, kunt u verdergaan met de volgende stappen, maar voordat u verder gaat, is het belangrijk om de volgende punten te controleren:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Check of relevante bereikbaarheidsdata (o.a. type bedrijf, begin- en eindtijden van werknemers, inzicht in bezoekersstromen, woon-werkverkeer en zakelijk verkeer, locatie, aanwezigheid infrastructuur etc.) aanwezig is binnen (een deel van) de aangesloten bedrijven en/of is geïnventariseerd vanuit een mobiliteitsmakelaar in uw regio. Controleer of deze data actueel en betrouwbaar is.</li>
              <li>Indien niet aanwezig, voer een mobiliteitsscan uit. In sommige regio's kan dit gratis via een mobiliteitsmakelaar. Het alternatief is dit onderdeel te maken van de inkoop of een risico te lopen in het gebruik in de praktijk te toetsen.</li>
              <li>Neem de bedrijven mee in de plannen en breng samen het proces goed in kaart. Bepaal of de kennis, kunde en capaciteit aanwezig is binnen de bedrijfsvereniging en/of dat specialisten ingeschakeld moeten worden. De moeilijkheidsgraad in de vorige stappen geeft hiervoor een indicatie.</li>
              <li>Peil het draagvlak: Voer enquêtes of interviews uit onder medewerkers om hun interesse en bereidheid te meten voor deelname aan collectieve vervoersoplossingen. Zorg ervoor dat dit ook gericht is op de praktische aspecten zoals routes, tijden en kosten.</li>
              <li>
                Check de wenselijkheid en mogelijkheden van de 
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('cover-subsidie');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-blue-600 underline hover:text-blue-800 ml-1"
                >
                  COVER subsidie
                </button>
                {' '}m.b.t. de inkoopmodellen. Onderaan deze pagina vindt u meer informatie over deze subsidie.
              </li>
              <li>Vergeet hierbij niet om afspraken te maken over wie verantwoordelijk is voor de communicatie naar de gebruikers!</li>
            </ul>
          </div>

          {!isLoading && !error && Object.keys(selectedSolutionsData).length === 0 && (
            <div className="bg-white rounded-lg p-8 shadow-even">
              <p>Geen oplossingen geselecteerd.</p>
            </div>
          )}
          {!isLoading && !error && Object.keys(selectedSolutionsData).length > 0 && (
            <>
              {solutionsList.map((solution) => {
                const solutionVariants = selectedVariationsData.filter(v => v.mobiliteitsdienstVariantId === solution.id);
                return solutionVariants.map((variation) => {
                  const displayVariantTitle = stripSolutionPrefixFromVariantTitle(variation.title);
                  return (
                    <div key={`${solution.id}-${variation.id}`} className="bg-white rounded-lg p-8 shadow-even">
                      <h2 className="text-2xl font-bold mb-4">{solution.title} - {displayVariantTitle}</h2>
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
                      <p className="text-gray-700 mt-4">
                        Meer informatie over deze vervoersoplossing vindt u in de factsheet {solution.title} en over deze implementatievariant in de factsheet {displayVariantTitle}.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {isClient && (
                          <PDFDownloadLink
                            document={<MobilitySolutionFactsheetPdf solution={solution} />}
                            fileName={`Factsheet_${solution.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}
                          >
                            {({ loading }) => (
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                <DocumentTextIcon className="h-4 w-4" />
                                {loading ? 'Even geduld…' : `Download factsheet ${solution.title}`}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        )}
                        {isClient && (
                          <PDFDownloadLink
                            document={<ImplementationVariantFactsheetPdf variation={variation} />}
                            fileName={`Factsheet_Variant_${variation.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}
                          >
                            {({ loading }) => (
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                <DocumentTextIcon className="h-4 w-4" />
                                {loading ? 'Even geduld…' : `Download factsheet ${displayVariantTitle}`}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        )}
                      </div>
                    </div>
                  );
                });
              })}
            </>
          )}

          {/* COVER Subsidie sectie - altijd zichtbaar */}
          <div id="cover-subsidie" className="bg-white rounded-lg p-8 shadow-even">
          <h2 className="text-2xl font-bold mb-4">Subsidie: COVER (Collectieven mkb Verduurzaming Reisgedrag)</h2>
              <p className="text-gray-700 mb-4">De COVER subsidie is bedoeld voor organisaties die het mkb vertegenwoordigen, zoals parkmanagers. Met behulp van de subsidie kunnen stappen gezet worden naar blijvend duurzaam reisgedrag van werknemers. De subsidie dekt maximaal 75% van de kosten van het project waar de subsidie voor is aangevraagd, met een maximumbedrag van €100.000.
              Er zitten een aantal voorwaarden aan het aanvragen van de COVER subsidie.</p>
              <div className="space-y-3 text-gray-800">                
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Uw organisatie...</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <li>Treedt op namens een groep werkgever.</li>
                    <li>Is een rechtspersoon.</li>
                    <li>Vertegenwoordigt het mkb - uw achterban bestaat voor minimaal 50% uit werkgevers met minder dan 250 werknemers.</li>
                    <li>Vraagt minimaal € 10.000 aan voor uw project of activiteit.</li>
                    <li>Heeft de afgelopen 3 jaar maximaal € 300.000 De-minimissteun (staatssteun) ontvangen.</li>
                  </ul>
                </details>
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Uw project of activiteit...</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <li>Richt zich op het wegnemen van belemmeringen bij de uitvoer van duurzame werkmobiliteit van werknemers.</li>
                    <li>Vraagt per kilogram bespaarde CO2 niet meer dan € 0,75 subsidie.</li>
                    <li>Heeft een berekening hoeveel kilogram CO2 u ermee vermindert.</li>
                    <li>Heeft een structureel, blijvend resultaat.</li>
                    <li>Is omschreven in het verplichte format van het projectplan.</li>
                    <li>Heeft een begroting.</li>
                    <li>Is afgerond binnen 24 maanden nadat uw subsidie is toegekend.</li>
                  </ul>
                </details>
                <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                  <summary className="font-medium cursor-pointer select-none">Aan te leveren documenten</summary>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                    <p>Voor de aanvraag van de subsidie dient u de volgende documenten ingevuld aan te leveren:</p>
                    <li>Projectplan COVER</li>
                    <li>Berekening CO2-besparing COVER</li>
                    <li>Onderbouwing voor blijvend resultaat</li>
                    <li>Modelbegroting project/activiteiten</li>
                    <li>
                      Voor al deze benodigdheden kunt u formats vinden op de{' '}
                      <a
                        className="text-blue-600 underline"
                        href="https://www.rvo.nl/subsidies-financiering/cover#uw-aanvraag-voorbereiden"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        website van de RVO
                      </a>
                      .
                    </li>
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