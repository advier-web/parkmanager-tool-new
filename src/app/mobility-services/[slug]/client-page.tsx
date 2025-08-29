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
import MobilitySolutionFactsheetButton from '@/components/mobility-solution-factsheet-button'; // Added import
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid'; // Added import

interface MobilityServiceClientPageProps {
  solution: MobilitySolution | null;
  variations: ImplementationVariation[];
}

const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export default function MobilityServiceClientPage({ solution, variations }: MobilityServiceClientPageProps) {
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

          {/* Vuistregels (top meta) in 2 kolommen, gelijk aan popup */}
          {(
            solution.wanneerRelevant ||
            solution.minimaleInvestering ||
            solution.minimumAantalPersonen ||
            solution.schaalbaarheid ||
            solution.moeilijkheidsgraad ||
            solution.impact ||
            solution.ruimtebeslag ||
            solution.afhankelijkheidExternePartijen
          ) && (
            <section className="text-sm mb-8 bg-white rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="mt-4 border-b border-gray-200" />
            </section>
          )}

           {/* PDF Download Link for the main solution factsheet */}
           {(solution.samenvattingLang || solution.description) && ( 
            <div className="mt-6 mb-10"> {/* Adjusted top margin for more space */}
              <MobilitySolutionFactsheetButton
                solution={solution}
                className="inline-flex items-center text-sm cursor-pointer focus:outline-none" // Removed text color classes from wrapper
                buttonColorClassName="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer shadow-sm" // New button styling
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" /> {/* Adjusted icon size and margin */}
                {`Download factsheet ${solution.title}`}
              </MobilitySolutionFactsheetButton>
            </div>
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
              <p className="text-sm text-gray-600 mb-4">In de tabel hieronder kunt u de verschillende implementatievarianten met elkaar vergelijken.</p>
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
                    <div key={`cf-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none">
                      <MarkdownContent content={processMarkdownText(v.controleEnFlexibiliteit || '-')} />
                    </div>
                  ))}
                </div>

                {/* Maatwerk */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Maatwerk</div>
                  {variations.map((v, idx) => (
                    <div key={`mw-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50">
                      <MarkdownContent content={processMarkdownText(v.maatwerk || '-')} />
                    </div>
                  ))}
                </div>

                {/* Kosten en schaalvoordelen */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Kosten en schaalvoordelen</div>
                  {variations.map((v, idx) => (
                    <div key={`ks-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none">
                      <MarkdownContent content={processMarkdownText(v.kostenEnSchaalvoordelen || '-')} />
                    </div>
                  ))}
                </div>

                {/* Operationele complexiteit */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Operationele complexiteit</div>
                  {variations.map((v, idx) => (
                    <div key={`oc-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50">
                      <MarkdownContent content={processMarkdownText(v.operationeleComplexiteit || '-')} />
                    </div>
                  ))}
                </div>

                {/* Juridische en compliance risico's */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Juridische en compliance risico's</div>
                  {variations.map((v, idx) => (
                    <div key={`jr-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none">
                      <MarkdownContent content={processMarkdownText(v.juridischeEnComplianceRisicos || '-')} />
                    </div>
                  ))}
                </div>

                {/* Risico van onvoldoende gebruik */}
                <div className="contents">
                  <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Risico van onvoldoende gebruik</div>
                  {variations.map((v, idx) => (
                    <div key={`rg-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50">
                      <MarkdownContent content={processMarkdownText(v.risicoVanOnvoldoendeGebruik || '-')} />
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
                Start de wizard!
              </Link>
            </p>
          </div>

          {/* Add the new Download Factsheet button here, styled as the previous one */}
          {solution && (
            <div className="mb-10"> {/* Consistent spacing */}
              <MobilitySolutionFactsheetButton
                solution={solution}
                className="inline-flex items-center text-sm cursor-pointer focus:outline-none"
                buttonColorClassName="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer shadow-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {`Download factsheet ${solution.title}`}
              </MobilitySolutionFactsheetButton>
            </div>
          )}

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