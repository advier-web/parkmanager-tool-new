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
                <div className="space-y-4">
                  {/* Render plain tekst content */}
                  {links.some(link => typeof link === 'string' && !link.match(/https?:\/\//) && !link.match(/\[.+\]\(.+\)/)) && (
                    <div className="mb-2">
                      {links.map((link, index) => {
                        if (typeof link === 'string' && !link.match(/https?:\/\//) && !link.match(/\[.+\]\(.+\)/)) {
                          return (
                            <div key={index} className="mb-2">
                              <ItemWithMarkdown content={link} />
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
                      
                      // Voor objecten met url/title properties
                      if (typeof link === 'object' && link !== null && 'url' in link) {
                        const url = link.url as string;
                        const title = link.title as string || extractUrlTitle(url);
                        
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
                      return <ItemWithMarkdown content={links} />;
                    })()
                  ) : (
                    <ItemWithMarkdown content={links} />
                  )}
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
          
          {/* PDF download sectie - met verbeterde styling */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-100">
            <h2 className="font-semibold text-xl mb-3 text-blue-700">PDF Informatie</h2>
            <p className="text-gray-700 mb-4">
              Download meer informatie over dit bestuursmodel via onderstaande PDF. In deze PDF staat meer informatie over de benodigdheden voor oprichting en stappen die genomen moeten worden voor het implementeren van dit bestuursmodel.
            </p>
            <div className="mt-4">
              <PdfDownloadButtonContentful
                mobilityServiceId={model.id}
                fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                contentType="governanceModel"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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