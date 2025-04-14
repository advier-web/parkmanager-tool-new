'use client';

import { useRef } from 'react';
import { GovernanceModel } from '../domain/models';
import { Accordion } from './accordion';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import PdfDownloadButtonContentful from './pdf-download-button-contentful';

interface GovernanceModelAccordionProps {
  model: GovernanceModel;
}

export function GovernanceModelAccordion({ model }: GovernanceModelAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Ensure advantages and disadvantages are arrays or convert them
  const advantages = Array.isArray(model.advantages) ? model.advantages : 
                    (model.advantages ? [String(model.advantages)] : []);
  
  const disadvantages = Array.isArray(model.disadvantages) ? model.disadvantages : 
                       (model.disadvantages ? [String(model.disadvantages)] : []);

  return (
    <Accordion title={model.title}>
      <div ref={contentRef} className="space-y-8 py-2">
        {/* Beschrijving */}
        {model.description && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Beschrijving</h2>
            <MarkdownContent content={processMarkdownText(model.description)} />
          </div>
        )}
        
        {/* Aansprakelijkheid */}
        {model.aansprakelijkheid && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Aansprakelijkheid</h2>
            <MarkdownContent content={processMarkdownText(model.aansprakelijkheid)} />
          </div>
        )}
        
        {/* Voordelen en Nadelen naast elkaar */}
        {(advantages.length > 0 || disadvantages.length > 0) && (
          <div className="border-b pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voordelen */}
              {advantages.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3">Voordelen</h2>
                  <div className="space-y-4">
                    {advantages.map((advantage, index) => (
                      <div key={index} className="voordeel">
                        <MarkdownContent content={processMarkdownText(advantage)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Nadelen */}
              {disadvantages.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3">Nadelen</h2>
                  <div className="space-y-4">
                    {disadvantages.map((disadvantage, index) => (
                      <div key={index} className="nadeel">
                        <MarkdownContent content={processMarkdownText(disadvantage)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Doorlooptijd sectie */}
        {(model.doorlooptijdLang || model.doorlooptijd) && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Doorlooptijd</h2>
            <MarkdownContent content={processMarkdownText(model.doorlooptijdLang || model.doorlooptijd || "")} />
          </div>
        )}
        
        {/* Informatietekst voor de PDF download */}
        <div className="mt-6 mb-4 text-gray-700">
          <p>
            Download meer informatie over dit bestuursmodel via onderstaande PDF. In deze PDF staat meer informatie over de benodigdheden voor oprichting en stappen die genomen moeten worden voor het implementeren van dit bestuursmodel.
          </p>
        </div>
        
        <PdfDownloadButtonContentful
          mobilityServiceId={model.id}
          fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
          contentType="governanceModel"
        />
      </div>
    </Accordion>
  );
} 