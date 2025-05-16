'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GovernanceModel } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/24/outline';
import { SiteHeader } from '@/components/site-header';
import { SimpleAccordion } from '@/components/simple-accordion';
import GovernanceModelFactsheetButton from '@/components/governance-model-factsheet-button';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';

interface GovernanceModelClientPageProps {
  model: GovernanceModel | any | null;
}

export default function GovernanceModelClientPage({ model }: GovernanceModelClientPageProps) {
  // State voor accordions wordt nu intern door SimpleAccordion afgehandeld
  // const [isVoordelenOpen, setIsVoordelenOpen] = useState(false);
  // const [isNadelenOpen, setIsNadelenOpen] = useState(false);

  if (!model) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p>Dit bestuursmodel kon niet worden gevonden.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Terug naar home
            </Link>
          </div>
        </div>
      </>
    );
  }

  console.log('Rendering governance model:', model);

  const contentfulFields = model.fields as Record<string, any> || {};
  
  // Get advantages/disadvantages data - add types if possible
  const links: unknown[] | string | null = model.links || 
               (model as any).links || 
               contentfulFields.links || 
               null;

  // Placeholder helper functions for GovernanceModelFactsheetButton
  const placeholderGovernanceTitleToFieldName = (title: string | undefined) => title; 
  const placeholderStripSolutionPrefixFromVariantTitle = (title: string) => title;

  // Refined getFieldData function
  const getFieldData = (fieldName: string): string | string[] => {
    let data: any;
    // Priority 1: Direct property on model object (e.g., model.voordelen)
    if (model && typeof model === 'object' && fieldName in model) {
      data = (model as any)[fieldName];
    } 
    // Priority 2: Property within model.fields (e.g., model.fields.voordelen)
    else if (model && typeof model === 'object' && (model as any).fields && typeof (model as any).fields === 'object' && fieldName in (model as any).fields) {
      data = (model as any).fields[fieldName];
    }

    if (typeof data === 'string') {
      return data; 
    }
    if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
      return data; 
    }
    return ""; // Default to empty string 
  };

  const voordelen = getFieldData('voordelen');
  const nadelen = getFieldData('nadelen');

  // Debug logs - PLEASE CHECK YOUR BROWSER CONSOLE FOR THESE
  console.log('[Debug] getFieldData("voordelen") returned:', voordelen, "| type:", typeof voordelen);
  console.log('[Debug] getFieldData("nadelen") returned:', nadelen, "| type:", typeof nadelen);

  // Get lead time data
  const doorlooptijd: string = model.doorlooptijdLang || 
                      (model as any).doorlooptijdLang || 
                      (contentfulFields.doorlooptijdLang as string) || 
                      '';

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Terug naar overzicht
          </Link>
          
          <h1 className="text-3xl font-bold mb-4">{model.title}</h1>

          {/* Styled Summary Section */}
          {(model.summary || model.description) && (
            <div className="mb-4 text-gray-900"> {/* Reduced margin */}
              <div className="text-2xl font-semibold">
                <MarkdownContent content={processMarkdownText(model.summary || model.description || '')} />
              </div>
            </div>
          )}

          {/* Download Factsheet Button (under summary) */}
          {model && (
            <div className="mb-4"> {/* Reduced margin */}
              <GovernanceModelFactsheetButton
                governanceModel={model}
                selectedVariations={[]} // No specific variations on this page
                governanceTitleToFieldName={placeholderGovernanceTitleToFieldName}
                stripSolutionPrefixFromVariantTitle={placeholderStripSolutionPrefixFromVariantTitle}
                className="inline-flex items-center text-sm cursor-pointer focus:outline-none"
                buttonColorClassName="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer shadow-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {`Download factsheet ${model.title || 'Governance Model'}`}
              </GovernanceModelFactsheetButton>
            </div>
          )}
            
          {/* Original Description section - re-added */}
          {model.description && (model.summary ? model.description !== model.summary : true) && (
            <div className="mb-4 rounded-lg bg-white px-1 py-2"> {/* Reduced margin & padding */}
              <h2 className="font-semibold text-xl mb-2">Beschrijving</h2>
              <MarkdownContent content={processMarkdownText(model.description)} />
            </div>
          )}

          {model.aansprakelijkheid && (
            <div className="mb-4 rounded-lg bg-white px-1 py-2"> {/* Reduced margin & padding */}
              <h2 className="font-semibold text-xl mb-2">Aansprakelijkheid</h2>
              <MarkdownContent content={processMarkdownText(model.aansprakelijkheid || '')} />
            </div>
          )}

          {/* Voordelen */}
          {((Array.isArray(voordelen) && voordelen.length > 0) || (typeof voordelen === 'string' && voordelen.trim() !== '')) && (
            <div className="mb-4"> {/* Adjusted to mb-4 for spacing between accordions */}
              <SimpleAccordion title="Voordelen">
                <div className="mt-1 pl-1">
                  {Array.isArray(voordelen) && voordelen.length > 0 && (
                    voordelen.map((voordeel, index) => (
                      <div key={index} className={index < voordelen.length - 1 ? "mb-3" : ""}> {/* Added mb-3, except for last item */}
                        <MarkdownContent content={processMarkdownText(voordeel)} />
                      </div>
                    ))
                  )}
                  {typeof voordelen === 'string' && voordelen && ( 
                    <MarkdownContent content={processMarkdownText(voordelen)} />
                  )}
                </div>
              </SimpleAccordion>
            </div>
          )}

          {/* Nadelen */}
          {((Array.isArray(nadelen) && nadelen.length > 0) || (typeof nadelen === 'string' && nadelen.trim() !== '')) && (
            <div className="mb-8"> {/* Kept at mb-8 for space below this entire accordion block */}
              <SimpleAccordion title="Nadelen">
                <div className="mt-1 pl-1">
                  {Array.isArray(nadelen) && nadelen.length > 0 && (
                    nadelen.map((nadeel, index) => (
                      <div key={index} className={index < nadelen.length - 1 ? "mb-3" : ""}> {/* Added mb-3, except for last item */}
                        <MarkdownContent content={processMarkdownText(nadeel)} />
                      </div>
                    ))
                  )}
                  {typeof nadelen === 'string' && nadelen && (
                    <MarkdownContent content={processMarkdownText(nadelen)} />
                  )}
                </div>
              </SimpleAccordion>
            </div>
          )}

          {model.benodigdhedenOprichting && Array.isArray(model.benodigdhedenOprichting) && model.benodigdhedenOprichting.length > 0 && (
            <div className="mb-4 rounded-lg bg-white px-1 py-2"> 
              <h2 className="font-semibold text-xl mb-2">Benodigdheden voor oprichting</h2>
              <div className="">
                {model.benodigdhedenOprichting.map((item: string, index: number) => (
                  <div key={index}>
                    <MarkdownContent content={processMarkdownText(item)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(Array.isArray(links) && links.length > 0 || typeof links === 'string' && links) && (
            <div className="mb-4 rounded-lg bg-white px-1 py-2"> {/* Reduced margin & padding */}
              <h2 className="font-semibold text-xl mb-2">Relevante links</h2>
              
              {Array.isArray(links) && links.length > 0 && (
                <div className="space-y-4">
                  {/* Render plain tekst content */}
                  {links.some(link => typeof link === 'string' && !link.match(/https?:\/\//) && !link.match(/\[.+\]\(.+\)/)) && (
                    <div className="mb-2">
                      {links.map((link, index) => {
                        if (typeof link === 'string' && !link.match(/https?:\/\//) && !link.match(/\[.+\]\(.+\)/)) {
                          return (
                            <div key={index} className="mb-2">
                              <MarkdownContent content={processMarkdownText(link)} />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                  
                  {/* Render alle URL links met icoontjes */}
                  <ul className="list-none space-y-3">
                    {links.map((link, index) => {
                      // Check voor markdown links in formaat [titel](url)
                      if (typeof link === 'string' && link.match(/\[.+\]\(.+\)/)) {
                        // Extract titel en url uit de markdown link
                        const matches = link.match(/\[(.+)\]\((.+)\)/);
                        if (matches && matches.length === 3) {
                          const title = matches[1];
                          const url = matches[2];
                          
                          return (
                            <li key={index} className="flex items-center">
                              <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-teal-600 hover:underline"
                              >
                                {title}
                              </a>
                            </li>
                          );
                        }
                      }
                      
                      // Object check
                      if (typeof link === 'object' && link !== null && 'url' in link) {
                        const url = link.url as string;
                        // Check if title exists and is a string
                        const title = (typeof (link as any).title === 'string') 
                                        ? (link as any).title as string 
                                        : extractUrlTitle(url); // Fallback to extracting from URL
                        
                        return (
                          <li key={index} className="flex items-center">
                            <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-teal-600 hover:underline"
                            >
                              {title}
                            </a>
                          </li>
                        );
                      }
                      // Voor directe URLs als strings
                      else if (typeof link === 'string' && link.match(/^https?:\/\//)) {
                        return (
                          <li key={index} className="flex items-center">
                            <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-teal-600 hover:underline"
                            >
                              {extractUrlTitle(link)}
                            </a>
                          </li>
                        );
                      }
                      
                      return null;
                    })}
                  </ul>
                </div>
              )}
              
              {/* Als links een enkele string is, check of het een markdown link is */}
              {typeof links === 'string' && links && (
                <div>
                  {links.match(/\[.+\]\(.+\)/) ? (
                    (() => {
                      const matches = links.match(/\[(.+)\]\((.+)\)/);
                      if (matches && matches.length === 3) {
                        const title = matches[1];
                        const url = matches[2];
                        
                        return (
                          <div className="flex items-center">
                            <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-teal-600 hover:underline"
                            >
                              {title}
                            </a>
                          </div>
                        );
                      }
                      return <MarkdownContent content={processMarkdownText(links)} />;
                    })()
                  ) : (
                    links.match(/^https?:\/\//) ? (
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                        <a 
                          href={links} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-teal-600 hover:underline"
                        >
                          {extractUrlTitle(links)}
                        </a>
                      </div>
                    ) : (
                      <MarkdownContent content={processMarkdownText(links)} />
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Doorlooptijd */}
          {doorlooptijd && (
            <div className="mb-4 rounded-lg bg-white px-1 py-2"> {/* Reduced margin & padding */}
              <h2 className="font-semibold text-xl mb-2">Doorlooptijd</h2>
              <MarkdownContent content={processMarkdownText(doorlooptijd)} />
            </div>
          )}
          
          {/* New Download Factsheet button at the bottom */}
          {model && (
            <div className="mt-6 mb-4 text-left"> {/* Changed text-center to text-left */}
              <GovernanceModelFactsheetButton
                governanceModel={model}
                selectedVariations={[]} // No specific variations on this page
                governanceTitleToFieldName={placeholderGovernanceTitleToFieldName}
                stripSolutionPrefixFromVariantTitle={placeholderStripSolutionPrefixFromVariantTitle}
                className="inline-flex items-center text-sm cursor-pointer focus:outline-none"
                buttonColorClassName="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer shadow-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {`Download factsheet ${model.title || 'Governance Model'}`}
              </GovernanceModelFactsheetButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper functie om URL titles te extraheren of te genereren uit URL
function extractUrlTitle(url: string): string {
  // Bekende URLs herkennen
  if (url.includes('ondernemersplein.overheid.nl/bedrijven-investeringszone-biz-oprichten')) {
    return 'Ondernemersplein - BIZ (Bedrijven Investeringszone) oprichten';
  }
  
  if (url.includes('ondernemersplein.kvk.nl/de-vereniging')) {
    return 'Ondernemersplein - De vereniging';
  }
  
  try {
    // Generieke URL parser voor overige URLs
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');
    
    // Bepaal een mooie titel op basis van pathname
    const path = parsed.pathname.replace(/\/$/, ''); // Verwijder trailing slash
    if (path && path !== '/') {
      const pathSegments = path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1]
          .replace(/-/g, ' ')
          .replace(/\.(html|php|aspx)$/, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return `${hostname} - ${lastSegment}`;
      }
    }
    
    return hostname;
  } catch (e) {
    // Fallback als URL parsen mislukt
    return url;
  }
} 