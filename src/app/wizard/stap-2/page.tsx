'use client';

import { useState, useEffect } from 'react';
import { useMobilitySolutions, useBusinessParkReasons } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { groupBy } from '../../../utils/helper';

export default function MobilitySolutionsPage() {
  const { data: solutions, isLoading, error } = useMobilitySolutions();
  const { data: reasons } = useBusinessParkReasons();
  const { selectedReasons, selectedSolutions, toggleSolution } = useWizardStore();
  const [groupedSolutions, setGroupedSolutions] = useState<Record<string, typeof solutions>>({});
  
  // Group solutions by category when data is loaded
  useEffect(() => {
    if (solutions) {
      // Create a default category for solutions without a category
      const solutionsWithCategory = solutions.map(solution => ({
        ...solution,
        category: solution.category || 'overig'
      }));
      
      // Group by category
      const grouped = groupBy(solutionsWithCategory, 'category');
      setGroupedSolutions(grouped);
    }
  }, [solutions]);
  
  // Check if any solutions are selected
  const hasSelectedSolutions = selectedSolutions.length > 0;
  
  // Get selected reason titles for display
  const selectedReasonTitles = reasons
    ? reasons
        .filter(reason => selectedReasons.includes(reason.id))
        .map(reason => reason.title)
    : [];
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 2: Mobiliteitsoplossingen</h2>
        <p className="mb-6">
          Op basis van de door u geselecteerde redenen, kunt u hier de gewenste mobiliteitsoplossingen selecteren.
          U kunt meerdere oplossingen kiezen.
        </p>
        
        {selectedReasonTitles.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-semibold mb-2">Uw geselecteerde redenen:</h3>
            <ul className="list-disc pl-5">
              {selectedReasonTitles.map((title, index) => (
                <li key={index} className="text-blue-800">{title}</li>
              ))}
            </ul>
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Mobiliteitsoplossingen worden geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van de mobiliteitsoplossingen.</p>
          </div>
        )}
        
        {solutions && solutions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Geen mobiliteitsoplossingen gevonden.</p>
          </div>
        )}
        
        {Object.entries(groupedSolutions).map(([category, categorySolutions]) => (
          <div key={category} className="mt-8">
            <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
            <div className="grid grid-cols-1 gap-6">
              {categorySolutions?.map(solution => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  isSelected={selectedSolutions.includes(solution.id)}
                  onToggleSelect={toggleSolution}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep="/wizard/stap-3"
        isNextDisabled={!hasSelectedSolutions}
      />
    </div>
  );
} 