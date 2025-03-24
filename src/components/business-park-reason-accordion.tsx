'use client';

import { BusinessParkReason } from '../domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';

interface BusinessParkReasonAccordionProps {
  reason: BusinessParkReason;
}

export function BusinessParkReasonAccordion({ reason }: BusinessParkReasonAccordionProps) {
  return (
    <Accordion title={reason.title}>
      <div className="prose max-w-none">
        <ItemWithMarkdown content={reason.description} />
      </div>
    </Accordion>
  );
} 