'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Accordion } from '@/components/accordion';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';
import { Button } from '@/components/ui/button';

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

  // --- ADD: Parse Uitvoeringsmogelijkheden into Accordion structure ---
  const uitvoeringsmogelijkhedenAccordions = useMemo(() => {
    if (!solution?.uitvoeringsmogelijkheden) return [];

    const markdown = solution.uitvoeringsmogelijkheden;
    const variants: { title: string; content: string }[] = [];
    // Corrected Regex: Find :::variant[Title] block, capture Title and Content until next :::variant or end
    const regex = /:::variant\[([^\]]+)\]([\s\S]*?)(?=:::variant|$)/g;
    
    let match;
    let lastIndex = 0;
    while ((match = regex.exec(markdown)) !== null) {
      const title = match[1]?.trim();
      // Content is captured until the lookahead stops, so no need to remove trailing :::
      let content = match[2]?.trim();
      
      if (title) {
        variants.push({ title, content: content || '' });
      }
      lastIndex = regex.lastIndex; // Keep track for potential text after last variant
    }

    // Optional: Capture text after the last variant block if needed
    // const remainingText = markdown.substring(lastIndex).trim();
    // if (remainingText) { ... handle remaining text ... }

    return variants;
  }, [solution?.uitvoeringsmogelijkheden]);
  // --- END: Parse --- 

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

          {solution.uitvoeringsmogelijkheden && (
            <div className="mb-10 rounded-lg bg-white">
              <h2 className="text-3xl font-semibold mb-3">Uitvoeringsmogelijkheden</h2>
              <div className="space-y-2">
                {uitvoeringsmogelijkhedenAccordions.map((variant, index) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                     <div key={index} className="bg-teal-50 rounded-md p-4 border border-teal-100">
                        <button
                          className="w-full flex items-center justify-between text-left"
                          onClick={() => setIsOpen(!isOpen)}
                        >
                          <h4 className="text-base font-semibold text-teal-800">{variant.title}</h4> 
                          <span className="text-xl text-teal-700">
                            {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                          </span>
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${ 
                            isOpen ? 'mt-3 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="text-gray-700 prose prose-sm max-w-none pt-2 border-t border-teal-200">
                            <MarkdownContent content={processMarkdownText(variant.content)} />
                          </div>
                        </div>
                    </div>
                  );
                })}
                {uitvoeringsmogelijkhedenAccordions.length === 0 && (
                  <p className="text-gray-500 italic">Geen specifieke uitvoeringsmogelijkheden gevonden in het verwachte formaat.</p>
                )}
              </div>
            </div>
          )}

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

          {/* Governance Modellen Section REMOVED */}

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