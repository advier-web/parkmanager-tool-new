'use client';

import React from 'react';
import { ImplementationVariation } from '@/domain/models';
import SolutionVariantComparisonTable from '@/components/solution-variant-comparison-table';

export function SolutionComparisonSection({ variations }: { variations: ImplementationVariation[] }) {
  if (!variations || variations.length === 0) return null;
  return <SolutionVariantComparisonTable variations={variations} />;
}


