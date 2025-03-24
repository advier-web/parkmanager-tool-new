'use client';

import { BusinessParkReason } from '../domain/models';
import { BusinessParkReasonAccordion } from './business-park-reason-accordion';

interface BusinessParkReasonsSectionProps {
  reasons: BusinessParkReason[];
}

export function BusinessParkReasonsSection({ reasons }: BusinessParkReasonsSectionProps) {
  // Sorteer de redenen op titel voor consistente volgorde
  const sortedReasons = [...reasons].sort((a, b) => 
    a.title.localeCompare(b.title, 'nl', { sensitivity: 'base' })
  );

  return (
    <div>
      {sortedReasons.length === 0 ? (
        <div className="py-4 px-4 bg-gray-50 text-gray-600 rounded-md">
          <p>Geen aanleidingen gevonden.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReasons.map(reason => (
            <BusinessParkReasonAccordion key={reason.id} reason={reason} />
          ))}
        </div>
      )}
    </div>
  );
} 