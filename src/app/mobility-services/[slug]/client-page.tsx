'use client';

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MobilitySolution, ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
// import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful'; // Commenting out or removing if not used elsewhere on this page for this purpose
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { MarkdownWithAccordions } from '@/components/markdown-with-accordions';
import { Button } from '@/components/ui/button';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';
import { getMobilitySolutionsFromContentful, getMobilitySolutionById, getImplementationVariationsForSolution } from '@/services/contentful-service';
import MobilitySolutionFactsheetButton from '@/components/mobility-solution-factsheet-button';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid'; // Added import

interface MobilityServiceClientPageProps {
  solution: MobilitySolution | null;
  variations: ImplementationVariation[];
}

const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export default function MobilityServiceClientPage({ solution, variations }: MobilityServiceClientPageProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  React.useEffect(() => {
    // Verwijder deze log eventueel ook, of houd hem als nuttig
    // console.log("Variations received in client page:", JSON.stringify(variations, null, 2));
  }, [variations]);

  if (!solution) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p>Deze mobiliteitsoplossing kon niet correct geladen worden.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Terug naar home
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Helper: stars renderer like in vergelijkers
  const StarsRow: React.FC<{ count: number }> = ({ count }) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.801 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.801-2.034a1 1 0 00-1.175 0l-2.801 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const renderStarsAndText = (raw?: string) => {
    const value = (raw || '').trim();
    if (!value) return <span className="text-gray-500">-</span>;
    const starPrefix = value.match(/^\s*\*+/);
    if (!starPrefix) {
      return <div className="prose prose-sm max-w-none text-gray-700"><MarkdownContent content={processMarkdownText(value)} /></div>;
    }
    const stars = starPrefix[0].replace(/\s/g, '').length;
    const text = value.replace(/^\s*\*+\s*/, '').trim();
    return (
      <div className="text-gray-700">
        <StarsRow count={stars} />
        {text && (
          <div className="prose prose-sm max-w-none mt-1">
            <MarkdownContent content={processMarkdownText(text)} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Terug naar overzicht
          </Link>
          
          <div className="mb-10 mt-6">
            <h1 className="mb-4 text-3xl font-bold">{solution.title}</h1>
            {solution.subtitle && (
              <p className="text-xl text-gray-600">{solution.subtitle}</p>
            )}
          </div>

          {/* Intro + Vuistregels in 2/3 - 1/3 layout */}
          {(solution.introTekstTool || solution.wanneerRelevant || solution.minimaleInvestering || solution.bandbreedteKosten || solution.dekkingsmogelijkheid || solution.minimumAantalPersonen || solution.schaalbaarheid || solution.moeilijkheidsgraad || solution.impact || solution.ruimtebeslag || solution.afhankelijkheidExternePartijen) && (
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left: 2/3 Intro */}
                <div className="md:col-span-2">
                  {solution.introTekstTool && (
                    <div className="bg-white rounded-lg p-6">
                      <h2 className="text-3xl font-semibold mb-3">Introductie</h2>
                      {/* Ensure normal paragraph size (override parent text-sm) */}
                      <div className="prose max-w-none text-gray-900 text-[18px] leading-relaxed">
                        <MarkdownContent content={processMarkdownText(solution.introTekstTool)} />
                      </div>
                      {isClient && (
                        <div className="mt-4">
                          <MobilitySolutionFactsheetButton 
                            solution={solution} 
                            className="px-4 py-2 rounded-md font-semibold text-sm cursor-pointer shadow-sm"
                            buttonColorClassName="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            {`Download factsheet ${solution.title}`}
                          </MobilitySolutionFactsheetButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Right: 1/3 Vuistregels */}
                <div className="space-y-3 text-sm bg-blue-100 rounded-lg p-6">
                  <h2 className="text-3xl font-semibold">Vuistregels</h2>
                  {solution.wanneerRelevant && (
                    <div>
                      <div className="font-semibold text-gray-900">Wanneer relevant:</div>
                      <div className="text-gray-800 mt-0.5">{solution.wanneerRelevant}</div>
                    </div>
                  )}
                  {solution.minimaleInvestering && (
                    <div>
                      <div className="font-semibold text-gray-900">Investering:</div>
                      <div className="text-gray-800 mt-0.5">{solution.minimaleInvestering}</div>
                    </div>
                  )}
                  {solution.bandbreedteKosten && (
                    <div>
                      <div className="font-semibold text-gray-900">Bandbreedte kosten:</div>
                      <div className="text-gray-800 mt-0.5">{solution.bandbreedteKosten}</div>
                    </div>
                  )}
                  {solution.dekkingsmogelijkheid && (
                    <div>
                      <div className="font-semibold text-gray-900">Dekkingsmogelijkheid:</div>
                      <div className="text-gray-800 mt-0.5">{solution.dekkingsmogelijkheid}</div>
                    </div>
                  )}
                  {solution.minimumAantalPersonen && (
                    <div>
                      <div className="font-semibold text-gray-900">Minimum aantal personen:</div>
                      <div className="text-gray-800 mt-0.5">{solution.minimumAantalPersonen}</div>
                    </div>
                  )}
                  {solution.schaalbaarheid && (
                    <div>
                      <div className="font-semibold text-gray-900">Schaalbaarheid:</div>
                      <div className="text-gray-800 mt-0.5">{solution.schaalbaarheid}</div>
                    </div>
                  )}
                  {solution.moeilijkheidsgraad && (
                    <div>
                      <div className="font-semibold text-gray-900">Moeilijkheidsgraad:</div>
                      <div className="text-gray-800 mt-0.5">{solution.moeilijkheidsgraad}</div>
                    </div>
                  )}
                  {solution.impact && (
                    <div>
                      <div className="font-semibold text-gray-900">Impact:</div>
                      <div className="text-gray-800 mt-0.5">{solution.impact}</div>
                    </div>
                  )}
                  {solution.ruimtebeslag && (
                    <div>
                      <div className="font-semibold text-gray-900">Ruimtebeslag:</div>
                      <div className="text-gray-800 mt-0.5">{solution.ruimtebeslag}</div>
                    </div>
                  )}
                  {solution.afhankelijkheidExternePartijen && (
                    <div>
                      <div className="font-semibold text-gray-900">Afhankelijkheid externe partijen:</div>
                      <div className="text-gray-800 mt-0.5">{solution.afhankelijkheidExternePartijen}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 border-b border-gray-200" />
            </section>
          )}

          

          {/* Beschrijving eerst; val terug op samenvatting indien geen description */}
          {solution.description ? (
            <div className="mb-10 text-gray-900 bg-white rounded-lg p-6">
              <div className="prose max-w-none">
                <MarkdownWithAccordions content={solution.description} />
              </div>
            </div>
          ) : (
            solution.samenvattingLang && (
              <div className="mb-10 text-gray-900 bg-white rounded-lg p-6">
                <div className="text-2xl font-semibold">
                  <MarkdownContent content={processMarkdownText(solution.samenvattingLang)} />
                </div>
              </div>
            )
          )}
          
          {/* Vergelijk implementatievarianten komt onderaan als vervanger van de kaart-grid */}

          {solution.uitvoering && (
            <div className="mb-10 rounded-lg bg-white p-6">
              <h2 className="text-3xl font-semibold mb-6">Uitvoering</h2>
              <div className="prose max-w-none">
                 <MarkdownContent content={processMarkdownText(solution.uitvoering)} />
              </div>
            </div>
          )}
          {solution.inputBusinesscase && (
            <div className="mb-10 rounded-lg bg-white p-6">
              <h2 className="text-3xl font-semibold mb-6">Input voor uw businesscase</h2>
              <div className="prose max-w-none">
                 <MarkdownContent content={processMarkdownText(solution.inputBusinesscase)} />
              </div>
            </div>
          )}
          {solution.collectiefVsIndiviueel && (
            <div className="bg-white rounded-lg mb-10 p-6">
              <h2 className="font-semibold text-3xl mb-3">Collectief versus Individueel</h2>
              <MarkdownContent content={processMarkdownText(solution.collectiefVsIndiviueel)} />
            </div>
          )}
          
          {variations && variations.length > 0 && (
            <section className="mb-10 bg-white rounded-lg p-6">
              <h2 className="text-3xl font-semibold mb-2">Vergelijk implementatievarianten</h2>
              <p className="text-sm text-gray-600 mb-4">Voor elk van de inkoopvormen is in de onderstaande tabel samengevat in hoeverre elke inkoopvorm scoort op verschillende criteria. De sterren geven aan hoe de implementatievariant zich verhoudt tot de andere varianten, waarbij 1 ster negatief is en 5 sterren positief..</p>
              <div className="grid rounded-lg" style={{ gridTemplateColumns: `160px repeat(${variations.length}, 1fr)` }}>
                {/* Header row */}
                <div className="contents">
                  <div className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Categorie</div>
                  {variations.map((v, idx) => {
                    const displayTitle = stripSolutionPrefixFromVariantTitle(v.title);
                    return (
                      <div key={`vh-${v.id || idx}`} className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900">
                        {displayTitle}
                      </div>
                    );
                  })}
                </div>

                {/* Controle en flexibiliteit */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Controle en flexibiliteit</div>
                  {variations.map((v, idx) => (
                    <div key={`cf-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                      {renderStarsAndText(v.controleEnFlexibiliteit || '-')}
                    </div>
                  ))}
                </div>

                {/* Maatwerk */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Maatwerk</div>
                  {variations.map((v, idx) => (
                    <div key={`mw-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                      {renderStarsAndText(v.maatwerk || '-')}
                    </div>
                  ))}
                </div>

                {/* Kosten en schaalvoordelen */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Kosten en schaalvoordelen</div>
                  {variations.map((v, idx) => (
                    <div key={`ks-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                      {renderStarsAndText(v.kostenEnSchaalvoordelen || '-')}
                    </div>
                  ))}
                </div>

                {/* Operationele complexiteit */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Operationele complexiteit</div>
                  {variations.map((v, idx) => (
                    <div key={`oc-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                      {renderStarsAndText(v.operationeleComplexiteit || '-')}
                    </div>
                  ))}
                </div>

                {/* Juridische en compliance risico's */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Juridische en compliance risico's</div>
                  {variations.map((v, idx) => (
                    <div key={`jr-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                      {renderStarsAndText(v.juridischeEnComplianceRisicos || '-')}
                    </div>
                  ))}
                </div>

                {/* Risico van onvoldoende gebruik */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Risico van onvoldoende gebruik</div>
                  {variations.map((v, idx) => (
                    <div key={`rg-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                      {renderStarsAndText(v.risicoVanOnvoldoendeGebruik || '-')}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Gedetailleerd advies section */}
          <div className="bg-white rounded-lg p-6 mb-10">
            <h2 className="font-semibold text-xl mb-3">Gedetailleerd advies</h2>
            <p className="mb-4 text-gray-700">
              Wil u gedetailleerd advies over het implementeren van deze mobiliteitsoplossing binnen uw bedrijfsvereniging?{' '}
              <Link href="/wizard/bedrijventerrein" className="text-blue-600 hover:text-blue-700 underline font-medium">
                Start de tool!
              </Link>
            </p>
          </div>

          

          {solution.benefits && solution.benefits.length > 0 && (
            <div className="bg-white rounded-lg p-6 mb-10">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <MarkdownContent content={processMarkdownText(solution.benefits.map(benefit => `- ${benefit}`).join('\n'))} />
            </div>
          )}

          {solution.challenges && solution.challenges.length > 0 && (
            <div className="bg-white rounded-lg p-6 mb-10">
              <h2 className="font-semibold text-xl mb-3">Uitdagingen</h2>
              <MarkdownContent content={processMarkdownText(solution.challenges.map(challenge => `- ${challenge}`).join('\n'))} />
            </div>
          )}

          {solution.implementationTime && (
            <div className="bg-white rounded-lg p-6 mb-10">
              <h2 className="font-semibold text-xl mb-3">Implementatietijd</h2>
              <MarkdownContent content={processMarkdownText(solution.implementationTime)} />
            </div>
          )}

          {solution.costs && (
            <div className="bg-white rounded-lg p-6 mb-10">
              <h2 className="font-semibold text-xl mb-3">Kosten</h2>
              <MarkdownContent content={processMarkdownText(solution.costs)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 