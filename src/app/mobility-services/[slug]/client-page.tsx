'use client';

import { MobilitySolution } from '@/domain/models';
import { ItemWithMarkdown } from '@/components/item-with-markdown';
import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful';
import Link from 'next/link';

interface MobilityServiceClientPageProps {
  solution: MobilitySolution | null;
}

export default function MobilityServiceClientPage({ solution }: MobilityServiceClientPageProps) {
  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Deze mobiliteitsoplossing kon niet worden gevonden.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Terug naar overzicht
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{solution.title}</h1>
          
          {solution.description && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Beschrijving</h2>
              <ItemWithMarkdown content={solution.description} />
            </div>
          )}

          <div className="border-b pb-6 mb-6">
            <h2 className="font-semibold text-xl mb-3">PDF Informatie</h2>
            <p className="text-gray-700 mb-4">
              Download meer informatie over deze mobilitietsoplossing via onderstaande PDF. In deze PDF staat meer informatie over het collectief oppakken van deze dienst, wat de effecten er van zijn, aan wat voor investering je moet denken en stappen die genomen moeten worden voor het implementeren van deze mobiliteitsoplossing.
            </p>
            <PdfDownloadButtonContentful
              mobilityServiceId={solution.id}
              fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
            />
          </div>

          {solution.benefits && solution.benefits.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <ItemWithMarkdown content={solution.benefits.map(benefit => `- ${benefit}`).join('\n')} />
            </div>
          )}

          {solution.challenges && solution.challenges.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Uitdagingen</h2>
              <ItemWithMarkdown content={solution.challenges.map(challenge => `- ${challenge}`).join('\n')} />
            </div>
          )}

          {solution.implementationTime && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Implementatietijd</h2>
              <ItemWithMarkdown content={solution.implementationTime} />
            </div>
          )}

          {solution.costs && (
            <div className="pb-6">
              <h2 className="font-semibold text-xl mb-3">Kosten</h2>
              <ItemWithMarkdown content={solution.costs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 