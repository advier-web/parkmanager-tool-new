'use client';

import { useRef } from 'react';
import { GovernanceModel } from '../domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';
import { PdfDownloadButton } from './pdf-download-button';

interface GovernanceModelAccordionProps {
  model: GovernanceModel;
}

export function GovernanceModelAccordion({ model }: GovernanceModelAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Functie om content voor te bereiden voor PDF-generatie
  const prepareContentForPdf = () => {
    if (contentRef.current) {
      // Zorg ervoor dat alle afbeeldingen correct geladen zijn
      const images = contentRef.current.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete) {
          (img as HTMLImageElement).style.display = 'none'; // Verberg niet-geladen afbeeldingen
        }
      });
      
      // Verwijder alle interactieve elementen tijdelijk
      const interactiveElements = contentRef.current.querySelectorAll('button, input, select');
      interactiveElements.forEach(el => {
        el.setAttribute('data-pdf-hidden', 'true');
        (el as HTMLElement).style.display = 'none';
      });
    }
  };
  
  // Ensure advantages and disadvantages are arrays or convert them
  const advantages = Array.isArray(model.advantages) ? model.advantages : 
                    (model.advantages ? [String(model.advantages)] : []);
  
  const disadvantages = Array.isArray(model.disadvantages) ? model.disadvantages : 
                       (model.disadvantages ? [String(model.disadvantages)] : []);

  // Process Contentful asset format for contracts
  const formatContractForDisplay = (contract: any): string => {
    if (typeof contract === 'string') {
      // Check if this is a JSON string
      if (contract.trim().startsWith('{') && contract.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(contract);
          
          // If it has fields like title, it might be a Contentful asset
          if (parsed.fields && parsed.fields.title) {
            const title = parsed.fields.title;
            const description = parsed.fields.description || '';
            let url = '#';
            
            if (parsed.fields.file && parsed.fields.file.url) {
              url = parsed.fields.file.url.startsWith('//') 
                ? `https:${parsed.fields.file.url}` 
                : parsed.fields.file.url;
            }
            
            return `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-medium">${title}</a>${description ? `: <span class="text-gray-600">${description}</span>` : ''}`;
          }
          
          // General JSON display - format it nicely 
          return extractContractInfo(parsed);
        } catch (e) {
          // Not valid JSON, just return the string
          return contract;
        }
      }
      return contract;
    }
    
    // Handle complex objects
    if (typeof contract === 'object' && contract !== null) {
      return extractContractInfo(contract);
    }
    
    // Fallback
    return String(contract);
  };
  
  // Helper function to extract useful info from contract data
  const extractContractInfo = (data: any): string => {
    // If it has metadata and fields with title, it's likely a Contentful asset
    if (data.metadata && data.fields && data.fields.title) {
      const title = data.fields.title;
      const description = data.fields.description || '';
      let url = '#';
      
      if (data.fields.file && data.fields.file.url) {
        url = data.fields.file.url.startsWith('//') 
          ? `https:${data.fields.file.url}` 
          : data.fields.file.url;
      }
      
      return `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-medium">${title}</a>${description ? `: <span class="text-gray-600">${description}</span>` : ''}`;
    }
    
    // If it has url and title properties directly
    if (data.url && data.title) {
      return `<a href="${data.url}" target="_blank" class="text-blue-600 hover:underline font-medium">${data.title}</a>${data.description ? `: <span class="text-gray-600">${data.description}</span>` : ''}`;
    }
    
    // Handle Contentful asset format
    if (data.sys && data.sys.type === 'Asset' && data.fields) {
      const title = data.fields.title || 'Document';
      const description = data.fields.description || '';
      let url = '#';
      
      if (data.fields.file && data.fields.file.url) {
        url = data.fields.file.url.startsWith('//') 
          ? `https:${data.fields.file.url}` 
          : data.fields.file.url;
      }
      
      return `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-medium">${title}</a>${description ? `: <span class="text-gray-600">${description}</span>` : ''}`;
    }
    
    // If nothing else works, return a simplified JSON string
    return JSON.stringify(data)
      .replace(/[{}]/g, '')
      .replace(/,"([^"]+)":/g, ', <span class="text-gray-500">$1</span>:')
      .replace(/^"([^"]+)":/g, '<span class="text-gray-500">$1</span>:')
      .replace(/"/g, '')
      .replace(/:/g, ': ');
  };

  return (
    <Accordion title={model.title}>
      <div ref={contentRef} className="space-y-8 py-2">
        {model.description && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Beschrijving</h2>
            <ItemWithMarkdown content={model.description} />
          </div>
        )}
        
        {model.aansprakelijkheid && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Aansprakelijkheid</h2>
            <ItemWithMarkdown content={model.aansprakelijkheid} />
          </div>
        )}
        
        {advantages.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Voordelen</h2>
            <div className="mt-3">
              <ul className="list-disc pl-5 space-y-2">
                {advantages.map((advantage, index) => (
                  <li key={index}>
                    <ItemWithMarkdown content={advantage} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {disadvantages.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Nadelen</h2>
            <div className="mt-3">
              <ul className="list-disc pl-5 space-y-2">
                {disadvantages.map((disadvantage, index) => (
                  <li key={index}>
                    <ItemWithMarkdown content={disadvantage} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {model.benodigdhedenOprichting && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Benodigdheden oprichting</h2>
            {Array.isArray(model.benodigdhedenOprichting) ? (
              <div className="mt-3">
                <ul className="list-disc pl-5 space-y-2">
                  {model.benodigdhedenOprichting.map((item, index) => (
                    <li key={index}>
                      <ItemWithMarkdown content={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ItemWithMarkdown content={model.benodigdhedenOprichting} />
            )}
          </div>
        )}
        
        {/* Doorlooptijd sectie */}
        {(model.doorlooptijdLang || model.doorlooptijd) && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Doorlooptijd</h2>
            <ItemWithMarkdown content={model.doorlooptijdLang || model.doorlooptijd || ""} />
          </div>
        )}
        
        {model.implementatie && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Implementatie</h2>
            <ItemWithMarkdown content={model.implementatie} />
          </div>
        )}
        
        {model.links && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Links</h2>
            {Array.isArray(model.links) ? (
              <div className="mt-3">
                <ul className="list-disc pl-5 space-y-2">
                  {model.links.map((link, index) => (
                    <li key={index}>
                      <ItemWithMarkdown content={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ItemWithMarkdown content={model.links} />
            )}
          </div>
        )}
        
        {model.voorbeeldContracten && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Voorbeeld contracten</h2>
            {Array.isArray(model.voorbeeldContracten) && model.voorbeeldContracten.length > 0 ? (
              <div className="mt-3">
                <ul className="list-disc pl-5 space-y-2">
                  {model.voorbeeldContracten.map((contract, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: formatContractForDisplay(contract) }} />
                  ))}
                </ul>
              </div>
            ) : (
              <p dangerouslySetInnerHTML={{ __html: formatContractForDisplay(model.voorbeeldContracten) }} />
            )}
          </div>
        )}
        
        <PdfDownloadButton 
          contentRef={contentRef} 
          fileName={`governance-model-${model.title.toLowerCase().replace(/\s+/g, '-')}`} 
          title={model.title}
          onBeforeDownload={prepareContentForPdf}
        />
      </div>
    </Accordion>
  );
} 