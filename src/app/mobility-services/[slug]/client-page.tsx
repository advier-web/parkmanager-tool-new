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

  // Functie om governance model informatie te extraheren
  const extractModelIds = (refs: Array<{sys: {id: string}} | string> | undefined) => {
    if (!Array.isArray(refs) || refs.length === 0) return [];
    return refs.map(ref => {
      if (typeof ref === 'string') return ref;
      if (ref && typeof ref === 'object' && ref.sys && ref.sys.id) return ref.sys.id;
      return null;
    }).filter(Boolean);
  };

  // Bereid de governance model ID lijsten voor
  const recommendedIds = extractModelIds(solution.governanceModels) || [];
  const conditionalIds = extractModelIds(solution.governanceModelsMits) || [];
  const unsuitableIds = extractModelIds(solution.governanceModelsNietgeschikt) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Terug naar overzicht
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{solution.title}</h1>
          
          {solution.paspoort && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Paspoort</h2>
              <ItemWithMarkdown content={solution.paspoort} />
            </div>
          )}
          
          {solution.description && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Beschrijving</h2>
              <ItemWithMarkdown content={solution.description} />
            </div>
          )}

          {solution.collectiefVsIndiviueel && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Collectief vs. Individueel</h2>
              <ItemWithMarkdown content={solution.collectiefVsIndiviueel} />
            </div>
          )}
          
          {/* Governance modellen sectie - aangepast om te lijken op de popup */}
          <div className="border-b pb-6 mb-6">
            <h2 className="font-semibold text-xl mb-3">Geschikte governance modellen</h2>

            {/* Aanbevolen governance modellen */}
            {recommendedIds.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-green-700 border-b pb-2 mb-2">Aanbevolen modellen</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deze modellen worden aanbevolen voor deze mobiliteitsoplossing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedIds.map((modelId, index) => (
                    <div key={index} className="p-3 border rounded-md bg-green-50 border-green-200 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Governance Model</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                          Aanbevolen
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>ID:</strong> {String(modelId)}
                      </div>
                      {solution.vereniging && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p>{solution.vereniging}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aanbevolen mits governance modellen */}
            {conditionalIds.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-700 border-b pb-2 mb-2">Aanbevolen, mits...</h3>
                <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                  <p className="text-blue-800">
                    Deze modellen zijn geschikt voor deze mobiliteitsoplossing, maar vereisen extra aandacht of aanpassingen.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conditionalIds.map((modelId, index) => (
                    <div key={index} className="p-3 border rounded-md bg-blue-50 border-blue-200 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Governance Model</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                          Aanbevolen, mits...
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>ID:</strong> {String(modelId)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Niet geschikte governance modellen */}
            {unsuitableIds.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-700 border-b pb-2 mb-2">Ongeschikte governance modellen</h3>
                <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-200">
                  <p className="text-red-800">
                    Deze modellen zijn minder geschikt voor deze mobiliteitsoplossing.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unsuitableIds.map((modelId, index) => (
                    <div key={index} className="p-3 border rounded-md bg-red-50 border-red-200 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Governance Model</h4>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2 shrink-0">
                          Niet geschikt
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>ID:</strong> {String(modelId)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!recommendedIds.length && !conditionalIds.length && !unsuitableIds.length && (
              <p className="text-gray-500 italic my-4">Geen specifieke governance modellen gevonden voor deze oplossing.</p>
            )}
          </div>

          {/* PDF Download sectie met groene achtergrond */}
          <div className="bg-teal-600 text-white rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-xl mb-3">PDF Informatie</h2>
            <p className="mb-4">
              Download meer informatie over deze mobilitietsoplossing. In deze PDF staat meer informatie over het collectief oppakken van deze dienst, wat de effecten er van zijn, aan wat voor investering je moet denken en stappen die genomen moeten worden voor het implementeren van deze mobiliteitsoplossing.
            </p>
            <PdfDownloadButtonContentful
              mobilityServiceId={solution.id}
              fileName={`${solution.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
              className="bg-white text-teal-600 hover:bg-gray-100 hover:text-teal-700 py-2 px-6 rounded-md font-semibold transition-colors"
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