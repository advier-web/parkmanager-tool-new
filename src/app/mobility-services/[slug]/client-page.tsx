'use client';

import { useState, useEffect, useMemo } from 'react';
import { MobilitySolution, GovernanceModel, ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { MarkdownWithAccordions } from '@/components/markdown-with-accordions';
import { Button } from '@/components/ui/button';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

interface MobilityServiceClientPageProps {
  solution: MobilitySolution | null;
  variations: ImplementationVariation[];
}

export default function MobilityServiceClientPage({ solution, variations }: MobilityServiceClientPageProps) {
  // Log received variations to check structure
  useEffect(() => {
    console.log("Variations received in client page:", JSON.stringify(variations, null, 2));
  }, [variations]);

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

          {/* Comment out the Paspoort section 
          {solution.paspoort && (
            <div className="mb-8 rounded-lg bg-gray-100 p-6 text-gray-900">
              <h2 className="text-xl font-semibold mb-3">Pitch</h2>
              <MarkdownWithAccordions content={solution.paspoort} />
            </div>
          )}
          */}

          {/* Add Samenvatting section here */}
          {solution.samenvattingLang && (
            <div className="mb-10 rounded-lg text-gray-900">
               {/* Increase font size */}
              <div className="text-2xl font-semibold">
                <MarkdownContent content={processMarkdownText(solution.samenvattingLang)} />
              </div>
            </div>
          )}

          {solution.description && (
            <div className="mb-12 rounded-lg bg-white">
              <MarkdownWithAccordions content={solution.description} />
            </div>
          )}

          {/* --- NEW: Uitvoering Section --- */}
          {solution.uitvoering && (
            <div className="mb-10 rounded-lg bg-white">
              <h2 className="text-3xl font-semibold mb-6">Uitvoering</h2>
              <div className="prose max-w-none">
                 <MarkdownContent content={processMarkdownText(solution.uitvoering)} />
              </div>
            </div>
          )}
          {/* --- END: Uitvoering Section --- */}

          {/* --- NEW: Input Business Case Section --- */}
          {solution.inputBusinesscase && (
            <div className="mb-10 rounded-lg bg-white">
              <h2 className="text-3xl font-semibold mb-6">Input voor uw businesscase</h2>
              <div className="prose max-w-none">
                 <MarkdownContent content={processMarkdownText(solution.inputBusinesscase)} />
              </div>
            </div>
          )}
          {/* --- END: Input Business Case Section --- */}

          {/* --- RENAMED & MODIFIED: Implementatievarianten Section --- */}
          <div className="mb-10 rounded-lg bg-white">
            <h2 className="text-3xl font-semibold mb-6">Implementatievarianten</h2>
            {variations && variations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variations.map((variation, index) => {
                  const displayTitle = stripSolutionPrefixFromVariantTitle(variation.title);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                      <h3 className="text-xl font-semibold mb-3 text-teal-700">{displayTitle}</h3>
                      {/* Render samenvatting using MarkdownContent */}
                      {variation.samenvatting ? (
                        <div className="prose prose-sm max-w-none"> {/* Use prose for styling */}
                          <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Geen samenvatting beschikbaar.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">Er zijn geen specifieke implementatievarianten gedefinieerd voor deze dienst.</p>
            )}
          </div>
          {/* --- END: Implementatievarianten Section --- */}

          {solution.collectiefVsIndiviueel && (
            <div className="bg-white rounded-lg mb-10">
              <h2 className="font-semibold text-3xl mb-3">Collectief versus Individueel</h2>
              <MarkdownContent content={processMarkdownText(solution.collectiefVsIndiviueel)} />
            </div>
          )}
          
          {/* --- Comment out Investering Section --- */}
          {/* 
          {solution.investering && (
            <div className="mb-8 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <BiEuro className="h-5 w-5 mr-2 text-green-600" />
                Investering
              </h2>
              <MarkdownWithAccordions content={processMarkdownText(solution.investering)} />
            </div>
          )}
          */}
          {/* --- END --- */}

          {/* --- NEW: Gedetailleerd Advies Section --- */}
          <div className="bg-white rounded-lg p-6 mb-10">
            <h2 className="font-semibold text-xl mb-3">Gedetailleerd advies</h2>
            <p className="mb-4 text-gray-700">
              Wil u gedetailleerd advies over het implementeren van deze mobiliteitsoplossing binnen uw bedrijfsvereniging? Start de wizard! 
            </p>
            <Link href="/wizard/bedrijventerrein">
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition-colors text-base"
              >
                Start de wizard
              </Button>
            </Link>
          </div>
          {/* --- END: Gedetailleerd Advies Section --- */}

          {/* PDF Download Section */}
          <div className="bg-teal-600 text-white rounded-lg p-6 mb-10">
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