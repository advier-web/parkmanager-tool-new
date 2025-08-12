import { ImplementationVariation } from '@/domain/models';

interface VariantComparisonBannerProps {
  selectedVariations: ImplementationVariation[];
  totalVariations: ImplementationVariation[];
  onOpenComparison: () => void;
}

export function VariantComparisonBanner({ selectedVariations, totalVariations, onOpenComparison }: VariantComparisonBannerProps) {
  const hasSelectedVariations = selectedVariations.length > 0;
  const canCompare = totalVariations.length >= 2;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-900">
              Vergelijk Implementatievarianten
            </h3>
            <p className="text-sm text-blue-700">
              {hasSelectedVariations 
                ? `Vergelijk alle ${totalVariations.length} beschikbare varianten om de beste keuze te maken.`
                : `Vergelijk alle ${totalVariations.length} beschikbare implementatievarianten op kosten, verantwoordelijkheden en voor-/nadelen.`
              }
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onOpenComparison}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
              canCompare 
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                : 'bg-blue-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            disabled={!canCompare}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Vergelijk Alle Varianten ({totalVariations.length})
          </button>
        </div>
      </div>
    </div>
  );
}
