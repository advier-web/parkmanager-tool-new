'use client';

import { BusinessParkReason } from '../domain/models';
import { BusinessParkReasonAccordion } from './business-park-reason-accordion';

interface BusinessParkReasonsSectionProps {
  reasons: BusinessParkReason[];
}

export function BusinessParkReasonsSection({ reasons }: BusinessParkReasonsSectionProps) {
  // Filter de "Ik weet het nog niet" optie en sorteer de resterende redenen op titel
  const filteredAndSortedReasons = [...reasons]
    .filter(reason => reason.title !== "Ik weet het nog niet")
    .sort((a, b) => a.title.localeCompare(b.title, 'nl', { sensitivity: 'base' }));

  return (
    <div>
      {filteredAndSortedReasons.length === 0 ? (
        <div className="py-4 px-4 bg-gray-50 text-gray-600 rounded-md">
          <p>Geen aanleidingen gevonden.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedReasons.map(reason => (
            <BusinessParkReasonAccordion key={reason.id} reason={reason} />
          ))}
        </div>
      )}
    </div>
  );
} 