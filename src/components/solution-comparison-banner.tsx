'use client';

import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SolutionComparisonBannerProps {
  onCompare: () => void;
  selectedSolutionsCount: number;
  topSolutionsCount: number;
}

export function SolutionComparisonBanner({ 
  onCompare, 
  selectedSolutionsCount, 
  topSolutionsCount 
}: SolutionComparisonBannerProps) {
  const hasSelections = selectedSolutionsCount > 0;
  const comparisonCount = hasSelections ? selectedSolutionsCount : topSolutionsCount;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900">
              Vergelijk oplossingen
            </h3>
          </div>
          <p className="text-blue-700 text-sm">
            {hasSelections 
              ? `Vergelijk uw ${comparisonCount} geselecteerde collectieve vervoersoplossingen naast elkaar om de verschillen te zien`
              : `Bekijk de ${comparisonCount} meest relevante collectieve vervoersoplossingen voor uw situatie naast elkaar`
            }
          </p>
        </div>
        <div className="ml-6">
          <button
            onClick={onCompare}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Vergelijk {comparisonCount} oplossingen
          </button>
        </div>
      </div>
    </div>
  );
}
