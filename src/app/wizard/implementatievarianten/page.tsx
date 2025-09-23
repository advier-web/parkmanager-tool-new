'use client';

import { useEffect, useState, useMemo } from 'react';
import { useWizardStore } from '@/store/wizard-store';
import { getImplementationVariationsForSolution, getMobilitySolutionById } from '@/services/contentful-service';
import { ImplementationVariation, MobilitySolution } from '@/domain/models';
import { WizardNavigation } from '@/components/wizard-navigation';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { ImplementationVariationCard } from '@/components/implementation-variation-card';
import { VariantComparisonBanner } from '@/components/variant-comparison-banner';
import { VariantComparisonModal } from '@/components/variant-comparison-modal';

interface SolutionWithVariations {
  solution: MobilitySolution | null;
  variations: ImplementationVariation[];
}

export default function SelectImplementationVariantPage() {
  const { selectedSolutions, selectedVariants, setSelectedVariant, _hasHydrated } = useWizardStore();
  const [data, setData] = useState<Record<string, SolutionWithVariations>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    async function fetchData() {
      if (selectedSolutions.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const fetchedData: Record<string, SolutionWithVariations> = {};
      try {
        for (const solutionId of selectedSolutions) {
          const solution = await getMobilitySolutionById(solutionId);
          let variations = await getImplementationVariationsForSolution(solutionId);
          // Extra safeguard: sort by numeric 'order' (0 highest), then by title
          variations = [...variations].sort((a, b) => {
            const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
            const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
            if (ao !== bo) return ao - bo;
            return a.title.localeCompare(b.title);
          });
          fetchedData[solutionId] = { solution, variations };
        }
        setData(fetchedData);
      } catch (err) {
        setError('Kon de implementatievarianten niet laden.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedSolutions, _hasHydrated]);

  const handleSelectVariation = (solutionId: string, variationId: string) => {
    setSelectedVariant(solutionId, variationId);
  };

  const allVariationsSelected = selectedSolutions.every(solutionId => selectedVariants[solutionId]);

  const allVariations = useMemo(() => {
    const variations: ImplementationVariation[] = [];
    Object.values(data).forEach(solutionData => {
      if (solutionData.variations) {
        variations.push(...solutionData.variations);
      }
    });
    return variations;
  }, [data]);

  const selectedVariations = useMemo(() => {
    return allVariations.filter(variation => Object.values(selectedVariants).includes(variation.id));
  }, [allVariations, selectedVariants]);

  const getComparisonVariations = (): ImplementationVariation[] => {
    return allVariations;
  };

  const handleOpenComparison = () => setIsComparisonModalOpen(true);
  const handleCloseComparison = () => setIsComparisonModalOpen(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary />
          <div className="bg-white rounded-lg p-6 shadow-even space-y-4">
            <h3 className="text-lg font-semibold">Kies een Implementatievariant</h3>
            <p className="text-gray-600 text-sm">
              Voor elke gekozen collectieve vervoersoplossing zijn er vaak meerdere manieren om deze te implementeren.
              Kies de implementatievariant die het beste bij uw situatie past.
            </p>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          {/* Intro sectie (alleen kop + vergelijk-balk) */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Implementatievarianten</h2>
              <p className="mb-6">
                Voor de door u geselecteerde vervoersoplossing zijn onderstaande implementatievarianten beschikbaar. Om verder te gaan selecteert u één implementatievariant. Implementatievarianten komen ook terug in de <a href="https://www.rvo.nl/subsidies-financiering/cover" target="_blank" rel="noreferrer noopener" className="text-blue-600 underline">COVER-subsidie aanvraag</a> in deel 5 en 6.2.
              </p>

            {!isLoading && !error && allVariations.length >= 2 && (
              <VariantComparisonBanner
                selectedVariations={selectedVariations}
                totalVariations={allVariations}
                onOpenComparison={handleOpenComparison}
              />
            )}

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
          </div>

          {/* Variatie-kaarten als eigen secties (geen container eromheen) */}
          {!isLoading && !error && (
            <div className="space-y-10 mt-6">
              {selectedSolutions.map(solutionId => (
                <div key={solutionId}>
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2">{data[solutionId]?.solution?.title || 'Oplossing'}</h3>
                  {data[solutionId]?.variations.length > 0 ? (
                    <div className="space-y-6">
                      {data[solutionId].variations.map(variation => (
                        <section key={variation.id} className="p-0">
                          <ImplementationVariationCard
                            variation={variation}
                            isSelected={selectedVariants[solutionId] === variation.id}
                            onSelect={() => handleSelectVariation(solutionId, variation.id)}
                            solutionTitle={data[solutionId]?.solution?.title || 'Oplossing'}
                          />
                        </section>
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

      <WizardNavigation
        previousStep="/wizard/oplossingen"
        nextStep="/wizard/governance-modellen"
        isNextDisabled={!allVariationsSelected}
      />

      <VariantComparisonModal
        variations={getComparisonVariations()}
        isOpen={isComparisonModalOpen}
        onClose={handleCloseComparison}
      />
    </div>
  );
}

 


