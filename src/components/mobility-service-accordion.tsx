'use client';

import { MobilitySolution } from '@/domain/models';
import { Accordion } from './accordion';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import MobilitySolutionFactsheetButton from './mobility-solution-factsheet-button';

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
            <MarkdownContent content={processMarkdownText(solution.description)} />
          </div>
        )}
        <div className="border-b pb-6">
          <h2 className="font-semibold text-lg mb-3">PDF Informatie</h2>
          <p className="text-gray-700">
            Download meer informatie over deze mobiliteitsoplossing via onderstaande PDF. In deze PDF staat meer informatie over het collectief oppakken van deze dienst, aan wat voor investering je moet denken en stappen die genomen moeten worden voor het implementeren van deze mobiliteitsoplossing.
          </p>
        </div>
        {solution.benefits && solution.benefits.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Voordelen</h2>
            <MarkdownContent content={processMarkdownText(solution.benefits.map(benefit => `- ${benefit}`).join('\n'))} />
          </div>
        )}
        {solution.challenges && solution.challenges.length > 0 && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Uitdagingen</h2>
            <MarkdownContent content={processMarkdownText(solution.challenges.map(challenge => `- ${challenge}`).join('\n'))} />
          </div>
        )}
        {solution.implementationTime && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Implementatietijd</h2>
            <MarkdownContent content={processMarkdownText(solution.implementationTime)} />
          </div>
        )}
        {solution.costs && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Kosten</h2>
            <MarkdownContent content={processMarkdownText(solution.costs)} />
          </div>
        )}
        <MobilitySolutionFactsheetButton
          solution={solution}
          buttonColorClassName="bg-blue-600 hover:bg-blue-700 text-white"
        />
      </div>
    </Accordion>
  );
} 