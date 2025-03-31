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

  // Functie om governance modellen weer te geven als die beschikbaar zijn
  const renderGovernanceModels = (modelRefs: Array<{sys: {id: string}} | string> | undefined, title: string) => {
    if (!modelRefs || modelRefs.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {title === "Geschikte governance modellen" && "Deze governance modellen zijn het meest geschikt voor deze mobiliteitsoplossing."}
          {title === "Voorwaardelijk geschikte governance modellen" && "Deze governance modellen zijn onder bepaalde voorwaarden geschikt."}
          {title === "Niet geschikte governance modellen" && "Deze governance modellen zijn minder geschikt voor deze mobiliteitsoplossing."}
        </p>
        <ul className="list-disc pl-5">
          {modelRefs.map((ref, idx) => {
            // Type check om te zien of het een object of string is
            const modelId = typeof ref === 'object' && ref.sys?.id ? ref.sys.id : ref;
            return <li key={idx} className="text-gray-700">Governance model ID: {String(modelId)}</li>;
          })}
        </ul>
      </div>
    );
  };

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
          
          {/* Governance modellen sectie */}
          <div className="border-b pb-6 mb-6">
            <h2 className="font-semibold text-xl mb-3">Governance Modellen</h2>
            
            {renderGovernanceModels(solution.governanceModels, "Geschikte governance modellen")}
            {renderGovernanceModels(solution.governanceModelsMits, "Voorwaardelijk geschikte governance modellen")}
            {renderGovernanceModels(solution.governanceModelsNietgeschikt, "Niet geschikte governance modellen")}
            
            {!solution.governanceModels && !solution.governanceModelsMits && !solution.governanceModelsNietgeschikt && (
              <p className="text-gray-600">Geen governance model informatie beschikbaar.</p>
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