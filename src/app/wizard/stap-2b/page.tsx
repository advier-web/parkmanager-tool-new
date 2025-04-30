'use client';

import { useEffect, useState } from 'react';
import { useWizardStore } from '@/lib/store';
import { getImplementationVariationsForSolution, getMobilitySolutionById } from '@/services/contentful-service'; // Assuming getMobilitySolutionById exists
import { ImplementationVariation, MobilitySolution } from '@/domain/models';
import { WizardNavigation } from '@/components/wizard-navigation';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { ImplementationVariationCard } from '@/components/implementation-variation-card'; // Assuming this component will be created

interface SolutionWithVariations {
  solution: MobilitySolution | null;
  variations: ImplementationVariation[];
}

export default function SelectImplementationVariantPage() {
  console.log('[Stap 2b Page] Component mounting...'); // Log component mount
  const { selectedSolutions, selectedVariants, setSelectedVariant } = useWizardStore();
  const [data, setData] = useState<Record<string, SolutionWithVariations>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Stap 2b Page] useEffect triggered.'); // Log useEffect trigger
    async function fetchData() {
      console.log('[Stap 2b Page] fetchData called. selectedSolutions:', selectedSolutions); // Log selectedSolutions
      if (selectedSolutions.length === 0) {
        console.log('[Stap 2b Page] No solutions selected, skipping fetch.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const fetchedData: Record<string, SolutionWithVariations> = {};

      try {
        for (const solutionId of selectedSolutions) {
          console.log(`[Stap 2b] Attempting to fetch solution with ID: ${solutionId}`);
          // Fetch solution details (optional, for context)
          const solution = await getMobilitySolutionById(solutionId);
          // Fetch variations for this solution
          const variations = await getImplementationVariationsForSolution(solutionId);
          fetchedData[solutionId] = { solution, variations };
        }
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching data for Stap 2b:", err);
        setError("Kon de implementatievarianten niet laden.");
      } finally {
        console.log('[Stap 2b Page] fetchData finished.'); // Log fetch data end
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedSolutions]);

  const handleSelectVariation = (solutionId: string, variationId: string) => {
    setSelectedVariant(solutionId, variationId);
  };

  // Check if a variation is selected for every solution
  const allVariationsSelected = selectedSolutions.every(
    solutionId => selectedVariants[solutionId]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary />
          {/* Optional Info Panel */}
          <div className="bg-white rounded-lg p-6 shadow-even space-y-4">
            <h3 className="text-lg font-semibold">Kies een Implementatievariant</h3>
            <p className="text-gray-600 text-sm">
              Voor elke gekozen mobiliteitsoplossing zijn er vaak meerdere manieren om deze te implementeren.
              Kies per oplossing de variant die het beste bij uw situatie past.
            </p>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-6">Stap 2b: Kies Implementatievariant</h2>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Varianten worden geladen...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Fout!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {!isLoading && !error && Object.keys(data).length === 0 && selectedSolutions.length > 0 && (
              <p className="text-gray-500">Geen varianten gevonden voor de geselecteerde oplossingen.</p>
            )}

            {!isLoading && !error && (
              <div className="space-y-10">
                {selectedSolutions.map(solutionId => (
                  <div key={solutionId}>
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">{data[solutionId]?.solution?.title || 'Oplossing'}</h3>
                    {data[solutionId]?.variations.length > 0 ? (
                      <div className="space-y-4">
                        {data[solutionId].variations.map(variation => (
                          <ImplementationVariationCard
                            key={variation.id}
                            variation={variation}
                            isSelected={selectedVariants[solutionId] === variation.id}
                            onSelect={() => handleSelectVariation(solutionId, variation.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Geen specifieke implementatievarianten gevonden voor deze oplossing.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <WizardNavigation
        previousStep="/wizard/stap-2"
        nextStep="/wizard/stap-3"
        isNextDisabled={!allVariationsSelected}
      />
    </div>
  );
} 