'use client';

import { BusinessParkReason } from '../domain/models';
import { Accordion } from './accordion';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface BusinessParkReasonAccordionProps {
  reason: BusinessParkReason;
}

export function BusinessParkReasonAccordion({ reason }: BusinessParkReasonAccordionProps) {
  return (
    <Accordion title={reason.title}>
      <div className="prose max-w-none">
        <MarkdownContent content={processMarkdownText(reason.description)} />
      </div>
    </Accordion>
  );
} 