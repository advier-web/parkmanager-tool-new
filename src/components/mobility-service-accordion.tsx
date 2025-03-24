'use client';

import { MobilitySolution } from '@/domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';
import { PdfDownloadButtonContentful } from './pdf-download-button-contentful';

interface MobilityServiceAccordionProps {
  solution: MobilitySolution;
}

export function MobilityServiceAccordion({ solution }: MobilityServiceAccordionProps) {
  return (
    <Accordion title={solution.title}>
      <div className="space-y-8 py-2">
        {solution.description && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Beschrijving</h2>
            <ItemWithMarkdown content={solution.description} />
          </div>
        )}
        {solution.summary && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Samenvatting</h2>
            <ItemWithMarkdown content={solution.summary} />
          </div>
        )}
        {solution.benefits && solution.benefits.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Voordelen</h2>
            <ItemWithMarkdown content={solution.benefits.map(benefit => `- ${benefit}`).join('\n')} />
          </div>
        )}
        {solution.challenges && solution.challenges.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Uitdagingen</h2>
            <ItemWithMarkdown content={solution.challenges.map(challenge => `- ${challenge}`).join('\n')} />
          </div>
        )}
        {solution.implementationTime && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Implementatietijd</h2>
            <ItemWithMarkdown content={solution.implementationTime} />
          </div>
        )}
        {solution.costs && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Kosten</h2>
            <ItemWithMarkdown content={solution.costs} />
          </div>
        )}
        <PdfDownloadButtonContentful
          mobilityServiceId={solution.id}
          fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
        />
      </div>
    </Accordion>
  );
} 