'use client';

import { useRef } from 'react';
import { BusinessParkReason } from '../domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';
import { PdfDownloadButton } from './pdf-download-button';

interface BusinessParkReasonAccordionProps {
  reason: BusinessParkReason;
}

export function BusinessParkReasonAccordion({ reason }: BusinessParkReasonAccordionProps) {
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

  return (
    <Accordion title={reason.title}>
      <div ref={contentRef} className="space-y-4">
        {/* Beschrijving */}
        {reason.description && (
          <div>
            <ItemWithMarkdown content={reason.description} />
          </div>
        )}
        
        {/* PDF Download button */}
        <div className="mt-6 flex justify-end">
          <PdfDownloadButton
            contentRef={contentRef}
            fileName={`aanleiding-${reason.title.toLowerCase().replace(/\s+/g, '-')}`}
            title={reason.title}
          />
        </div>
      </div>
    </Accordion>
  );
} 