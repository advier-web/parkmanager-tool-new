'use client';

import { useState, useEffect } from 'react';
import { MobilitySolution, GovernanceModel } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful';
import Link from 'next/link';
import { useGovernanceModels } from '@/hooks/use-domain-models';
import { SiteHeader } from '@/components/site-header';
import { MarkdownWithAccordions } from '@/components/markdown-with-accordions';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { SimpleAccordion } from '@/components/simple-accordion';
import { BiEuro } from 'react-icons/bi';

interface MobilityServiceClientPageProps {
  solution: MobilitySolution | null;
}

export default function MobilityServiceClientPage({ solution }: MobilityServiceClientPageProps) {
  const { data: governanceModels, isLoading } = useGovernanceModels();
  const [recommendedModels, setRecommendedModels] = useState<GovernanceModel[]>([]);
  const [conditionalModels, setConditionalModels] = useState<GovernanceModel[]>([]);
  const [unsuitableModels, setUnsuitableModels] = useState<GovernanceModel[]>([]);

  useEffect(() => {
    if (solution && governanceModels) {
      // Functie om governance model ID's te extraheren
      const extractModelIds = (refs: Array<{sys: {id: string}} | string> | undefined) => {
        if (!Array.isArray(refs) || refs.length === 0) return [];
        return refs.map(ref => {
          if (typeof ref === 'string') return ref;
          if (ref && typeof ref === 'object' && ref.sys && ref.sys.id) return ref.sys.id;
          return null;
        }).filter(Boolean) as string[];
      };

      // Extract IDs
      const recommendedIds = extractModelIds(solution.governanceModels);
      const conditionalIds = extractModelIds(solution.governanceModelsMits);
      const unsuitableIds = extractModelIds(solution.governanceModelsNietgeschikt);

      // Filter de governance modellen op basis van de ID's
      setRecommendedModels(governanceModels.filter(model => recommendedIds.includes(model.id)));
      setConditionalModels(governanceModels.filter(model => conditionalIds.includes(model.id)));
      setUnsuitableModels(governanceModels.filter(model => unsuitableIds.includes(model.id)));
    }
  }, [solution, governanceModels]);

  if (!solution) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p>Deze mobiliteitsoplossing kon niet worden gevonden.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Terug naar home
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Helper functie om de juiste rechtsvorm tekst op te halen voor een governance model
  const getRechtsvormText = (model: GovernanceModel) => {
    if (!solution) return '';
    
    // Eerst controleren of er een expliciete legalForm in het model staat
    if (model.legalForm) {
      const legalForm = model.legalForm.toLowerCase();
      if (legalForm.includes('vereniging')) return solution.vereniging;
      if (legalForm.includes('stichting')) return solution.stichting;
      if (legalForm.includes('ondernemers biz') || legalForm.includes('ondernemersbiz')) return solution.ondernemersBiz;
      if (legalForm.includes('vastgoed biz') || legalForm.includes('vastgoedbiz')) return solution.vastgoedBiz;
      if (legalForm.includes('gemengde biz') || legalForm.includes('gemengdebiz')) return solution.gemengdeBiz;
      if (legalForm.includes('coöperatie') || legalForm.includes('cooperatie')) return solution.cooperatieUa;
      if (legalForm.includes('bv') || legalForm.includes('besloten vennootschap')) return solution.bv;
      if (legalForm.includes('ondernemersfonds')) return solution.ondernemersfonds;
    }
    
    // Als er geen match is op legalForm, dan matchen op titel
    const title = model.title.toLowerCase();
    if (title.includes('vereniging')) return solution.vereniging;
    if (title.includes('stichting')) return solution.stichting;
    if (title.includes('ondernemers biz') || title.includes('ondernemersbiz')) return solution.ondernemersBiz;
    if (title.includes('vastgoed biz') || title.includes('vastgoedbiz')) return solution.vastgoedBiz;
    if (title.includes('gemengde biz') || title.includes('gemengdebiz')) return solution.gemengdeBiz;
    if (title.includes('coöperatie') || title.includes('cooperatie')) return solution.cooperatieUa;
    if (title.includes('bv') || title.includes('besloten vennootschap')) return solution.bv;
    if (title.includes('ondernemersfonds')) return solution.ondernemersfonds;
    
    return solution.geenRechtsvorm;
  };

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Terug naar overzicht
          </Link>
          
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">{solution.title}</h1>
            {solution.subtitle && (
              <p className="text-xl text-gray-600">{solution.subtitle}</p>
            )}
          </div>

          {solution.paspoort && (
            <div className="mb-8 rounded-lg bg-gray-100 p-6 text-gray-900">
              <h2 className="text-xl font-semibold mb-3">Pitch</h2>
              <MarkdownWithAccordions content={solution.paspoort} />
            </div>
          )}

          {solution.description && (
            <div className="mb-12 rounded-lg bg-white p-6">
              <MarkdownWithAccordions content={solution.description} />
            </div>
          )}

          {solution.uitvoeringsmogelijkheden && (
            <div className="mb-8 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold mb-3">Uitvoeringsmogelijkheden</h2>
              <MarkdownWithAccordions content={solution.uitvoeringsmogelijkheden} />
            </div>
          )}

          {solution.collectiefVsIndiviueel && (
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl mb-3">Collectief versus Individueel</h2>
              <MarkdownContent content={processMarkdownText(solution.collectiefVsIndiviueel)} />
            </div>
          )}
          
          {/* --- NEW: Investering Section --- */}
          {solution.investering && (
            <div className="mb-8 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <BiEuro className="h-5 w-5 mr-2 text-green-600" />
                Investering
              </h2>
              <MarkdownWithAccordions content={processMarkdownText(solution.investering)} />
            </div>
          )}
          {/* --- END NEW --- */}

          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-3">Geschikte governance modellen</h2>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Governance modellen worden geladen...</p>
              </div>
            )}

            {!isLoading && (
              <>
                {/* Aanbevolen governance modellen */}
                {recommendedModels.length > 0 && (
                  <div className="mb-6 border-b pb-6">
                    <h3 className="font-semibold text-green-700 border-b pb-2 mb-2">Aanbevolen modellen</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Deze modellen worden aanbevolen voor deze mobiliteitsoplossing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedModels.map((model) => {
                        const rechtsvormText = getRechtsvormText(model);
                        return (
                          <div key={model.id} className="p-3 border rounded-md bg-green-50 border-green-200 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{model.title}</h4>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                                Aanbevolen
                              </span>
                            </div>
                            {rechtsvormText ? (
                              <div className="text-sm text-gray-600">
                                <p>{rechtsvormText}</p>
                              </div>
                            ) : (
                              model.summary && <p className="text-sm text-gray-600">{model.summary}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Aanbevolen mits governance modellen */}
                {conditionalModels.length > 0 && (
                  <SimpleAccordion title="Aanbevolen, mits...">
                    <div className="pt-2">
                      <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                          Deze modellen zijn geschikt voor deze mobiliteitsoplossing, maar vereisen extra aandacht of aanpassingen.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conditionalModels.map((model) => {
                          const rechtsvormText = getRechtsvormText(model);
                          return (
                            <div key={model.id} className="p-3 border rounded-md bg-blue-50 border-blue-200 h-full flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{model.title}</h4>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                                  Aanbevolen, mits...
                                </span>
                              </div>
                              {rechtsvormText ? (
                                <div className="text-sm text-gray-600">
                                  <p>{rechtsvormText}</p>
                                </div>
                              ) : (
                                model.summary && <p className="text-sm text-gray-600">{model.summary}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SimpleAccordion>
                )}

                {/* Niet geschikte governance modellen */}
                {unsuitableModels.length > 0 && (
                  <SimpleAccordion title="Ongeschikte governance modellen">
                    <div className="pt-2">
                      <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-200">
                        <p className="text-sm text-red-800">
                          Deze modellen zijn minder geschikt voor deze mobiliteitsoplossing.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unsuitableModels.map((model) => {
                          const rechtsvormText = getRechtsvormText(model);
                          return (
                            <div key={model.id} className="p-3 border rounded-md bg-red-50 border-red-200 h-full flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{model.title}</h4>
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                                  Niet geschikt
                                </span>
                              </div>
                              {rechtsvormText ? (
                                <div className="text-sm text-gray-600">
                                  <p>{rechtsvormText}</p>
                                </div>
                              ) : (
                                model.summary && <p className="text-sm text-gray-600">{model.summary}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SimpleAccordion>
                )}

                {!recommendedModels.length && !conditionalModels.length && !unsuitableModels.length && (
                  <p className="text-gray-500 italic my-4">Geen specifieke governance modellen gevonden voor deze oplossing.</p>
                )}
              </>
            )}
          </div>

          <div className="bg-teal-600 text-white rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-lg mb-3">PDF Informatie</h2>
            <p className="mb-6">
              Download meer informatie over deze mobilitietsoplossing via onderstaande PDF. In deze PDF staat meer informatie over het collectief oppakken van deze dienst, aan wat voor investering je moet denken en stappen die genomen moeten worden voor het implementeren van deze mobiliteitsoplossing.
            </p>
            <PdfDownloadButtonContentful
              mobilityServiceId={solution.id}
              fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
              className="bg-white text-teal-600 hover:bg-gray-100 hover:text-teal-700 py-2 px-6 rounded-md font-semibold transition-colors"
            />
          </div>

          {solution.benefits && solution.benefits.length > 0 && (
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <MarkdownContent content={processMarkdownText(solution.benefits.map(benefit => `- ${benefit}`).join('\n'))} />
            </div>
          )}

          {solution.challenges && solution.challenges.length > 0 && (
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl mb-3">Uitdagingen</h2>
              <MarkdownContent content={processMarkdownText(solution.challenges.map(challenge => `- ${challenge}`).join('\n'))} />
            </div>
          )}

          {solution.implementationTime && (
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl mb-3">Implementatietijd</h2>
              <MarkdownContent content={processMarkdownText(solution.implementationTime)} />
            </div>
          )}

          {solution.costs && (
            <div className="bg-white rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-xl mb-3">Kosten</h2>
              <MarkdownContent content={processMarkdownText(solution.costs)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 