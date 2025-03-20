'use client';

import { useRef } from 'react';
import { MobilitySolution } from '../domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';
import { PdfDownloadButton } from './pdf-download-button';

interface MobilityServiceAccordionProps {
  service: MobilitySolution;
}

export function MobilityServiceAccordion({ service }: MobilityServiceAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Functie om lange content af te kappen voor PDF-weergave om problemen te voorkomen
  const prepareContentForPdf = () => {
    if (contentRef.current) {
      // Zorg ervoor dat alle afbeeldingen correct geladen zijn
      const images = contentRef.current.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete) {
          (img as HTMLImageElement).style.display = 'none'; // Verberg niet-geladen afbeeldingen
        }
      });
    }
  };
  
  return (
    <Accordion title={service.title}>
      <div ref={contentRef} className="space-y-8 py-2">
        {service.paspoort && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Paspoort</h2>
            <ItemWithMarkdown content={service.paspoort} />
          </div>
        )}
        
        {service.description && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Beschrijving</h2>
            <ItemWithMarkdown content={service.description} />
          </div>
        )}
        
        {service.collectiefVsIndiviueel && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Collectief vs. Individueel</h2>
            <ItemWithMarkdown content={service.collectiefVsIndiviueel} />
          </div>
        )}
        
        {service.effecten && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Effecten</h2>
            <ItemWithMarkdown content={service.effecten} />
          </div>
        )}
        
        {service.investering && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Investering</h2>
            <ItemWithMarkdown content={service.investering} />
          </div>
        )}
        
        {service.implementatie && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Implementatie</h2>
            <ItemWithMarkdown content={service.implementatie} />
          </div>
        )}
        
        {service.governancemodellenToelichting && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Toelichting bestuursvormen</h2>
            <ItemWithMarkdown content={service.governancemodellenToelichting} />
          </div>
        )}

        <PdfDownloadButton 
          contentRef={contentRef} 
          fileName={`mobiliteitsoplossing-${service.title.toLowerCase().replace(/\s+/g, '-')}`} 
          title={service.title}
          onBeforeDownload={prepareContentForPdf}
        />
      </div>
    </Accordion>
  );
} 