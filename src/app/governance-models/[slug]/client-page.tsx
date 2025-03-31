'use client';

import { GovernanceModel } from '@/domain/models';
import { ItemWithMarkdown } from '@/components/item-with-markdown';
import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/24/outline';

interface GovernanceModelClientPageProps {
  model: GovernanceModel | null;
}

export default function GovernanceModelClientPage({ model }: GovernanceModelClientPageProps) {
  if (!model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Dit bestuursmodel kon niet worden gevonden.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  console.log('Rendering governance model:', model);

  // Benader de velden voor verschillende databronnen
  const contentfulFields = (model as any).fields || {};
  
  // Haal voordelen/nadelen data op - probeer eerst normale velden en dan contentful specifieke velden
  const voordelen = model.advantages || 
                    (model as any).voordelen || 
                    (contentfulFields.voordelen) || 
                    [];
                    
  const nadelen = model.disadvantages || 
                 (model as any).nadelen || 
                 (contentfulFields.nadelen) || 
                 [];
  
  // Haal doorlooptijd data op
  const doorlooptijd = model.doorlooptijdLang || 
                      model.doorlooptijd || 
                      (model as any).doorlooptijdLang || 
                      (contentfulFields.doorlooptijdLang) || 
                      '';
  
  // Haal links data op
  const links = model.links || 
               (model as any).links || 
               (contentfulFields.links) || 
               [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Terug naar overzicht
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{model.title}</h1>
          
          {model.description && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Beschrijving</h2>
              <ItemWithMarkdown content={model.description} />
            </div>
          )}

          {model.aansprakelijkheid && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Aansprakelijkheid</h2>
              <ItemWithMarkdown content={model.aansprakelijkheid} />
            </div>
          )}

          {/* Voordelen - verschillende formats ondersteunen */}
          {Array.isArray(voordelen) && voordelen.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <ul className="list-disc pl-5">
                {voordelen.map((voordeel, index) => (
                  <li key={index}>
                    <ItemWithMarkdown content={voordeel} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeof voordelen === 'string' && voordelen && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <ItemWithMarkdown content={voordelen} />
            </div>
          )}

          {/* Nadelen - verschillende formats ondersteunen */}
          {Array.isArray(nadelen) && nadelen.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Nadelen</h2>
              <ul className="list-disc pl-5">
                {nadelen.map((nadeel, index) => (
                  <li key={index}>
                    <ItemWithMarkdown content={nadeel} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeof nadelen === 'string' && nadelen && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Nadelen</h2>
              <ItemWithMarkdown content={nadelen} />
            </div>
          )}

          {model.benodigdhedenOprichting && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Benodigdheden voor oprichting</h2>
              <ItemWithMarkdown content={typeof model.benodigdhedenOprichting === 'string' 
                ? model.benodigdhedenOprichting 
                : Array.isArray(model.benodigdhedenOprichting) 
                  ? model.benodigdhedenOprichting.join('\n- ') 
                  : ''} 
              />
            </div>
          )}

          {/* Links - verschillende formats ondersteunen */}
          {(Array.isArray(links) && links.length > 0 || typeof links === 'string' && links) && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Relevante links</h2>
              {Array.isArray(links) && links.length > 0 && (
                <ul className="list-none space-y-2">
                  {links.map((link, index) => {
                    if (typeof link === 'object' && link !== null && 'url' in link) {
                      return (
                        <li key={index} className="flex items-center">
                          <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                          <a 
                            href={link.url as string} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-teal-600 hover:underline"
                          >
                            {(link.title as string) || formatUrl(link.url as string)}
                          </a>
                        </li>
                      );
                    }
                    else if (typeof link === 'string') {
                      const isUrl = link.match(/https?:\/\/[^\s]+/);
                      if (isUrl) {
                        return (
                          <li key={index} className="flex items-center">
                            <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0" />
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-teal-600 hover:underline"
                            >
                              {formatUrl(link)}
                            </a>
                          </li>
                        );
                      }
                      return (
                        <li key={index} className="flex items-start">
                          <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0 mt-1" />
                          <div className="flex-1">
                            <ItemWithMarkdown content={link} />
                          </div>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              )}
              {typeof links === 'string' && links && (
                <div className="flex items-start">
                  <LinkIcon className="h-4 w-4 text-teal-600 mr-2 shrink-0 mt-1" />
                  <div className="flex-1">
                    <ItemWithMarkdown content={links} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Doorlooptijd - ondersteuning voor verschillende formaten */}
          {doorlooptijd && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Doorlooptijd</h2>
              <ItemWithMarkdown content={doorlooptijd} />
            </div>
          )}
          
          <div className="pb-6">
            <h2 className="font-semibold text-xl mb-3">PDF Informatie</h2>
            <p className="text-gray-700 mb-4">
              Download meer informatie over dit bestuursmodel via onderstaande PDF. In deze PDF staat meer informatie over de benodigdheden voor oprichting en stappen die genomen moeten worden voor het implementeren van dit bestuursmodel.
            </p>
            <PdfDownloadButtonContentful
              mobilityServiceId={model.id}
              fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
              contentType="governanceModel"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functie om URL's mooier weer te geven
function formatUrl(url: string): string {
  try {
    // Probeer de URL te parsen
    const parsed = new URL(url);
    // Verwijder protocol en trailing slash
    let formatted = parsed.hostname;
    
    if (parsed.pathname && parsed.pathname !== '/') {
      // Voeg pathname toe maar verkort deze indien heel lang
      const path = parsed.pathname;
      formatted += path.length > 20 ? path.substring(0, 20) + '...' : path;
    }
    
    return formatted;
  } catch (e) {
    // Als het parsen mislukt, toon gewoon de originele URL
    return url;
  }
} 