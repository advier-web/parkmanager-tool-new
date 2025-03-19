'use client';

import { useState, useEffect } from 'react';
import { useMobilitySolutions, useBusinessParkReasons } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { FilterPanel } from '../../../components/filter-panel';
import { groupBy } from '../../../utils/helper';
import { MobilitySolution } from '../../../domain/models';
import { useContentfulContentTypes } from '../../../hooks/use-contentful-models';
import { shouldUseContentful } from '../../../utils/env';

export default function MobilitySolutionsPage() {
  // Use the debug hook to log content types if using Contentful
  if (shouldUseContentful()) {
    useContentfulContentTypes();
  }
  
  const { data: allSolutions, isLoading, error } = useMobilitySolutions();
  const { data: reasons } = useBusinessParkReasons();
  const { selectedReasons, selectedSolutions, toggleSolution } = useWizardStore();
  
  // State voor de filter selectie (standaard alle geselecteerde redenen)
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<MobilitySolution[] | null>(null);
  const [groupedSolutions, setGroupedSolutions] = useState<Record<string, typeof filteredSolutions>>({});
  
  // Log error details for debugging
  useEffect(() => {
    if (error) {
      console.error('Mobility solutions error details:', error);
    }
  }, [error]);
  
  // Initialiseer activeFilters met de selectedReasons uit stap 1
  useEffect(() => {
    // Selecteer standaard de aanleidingen die in stap 1 zijn gekozen
    setActiveFilters([...selectedReasons]);
  }, [selectedReasons]);
  
  // Filter de oplossingen op basis van geselecteerde redenen (dummy filter logica)
  useEffect(() => {
    if (allSolutions) {
      // Als er actieve filters zijn, filter dan de oplossingen
      // Dit is een dummy implementatie, in de toekomst komt hier de echte logica van Contentful
      const filtered = activeFilters.length > 0
        ? allSolutions.filter((solution, index) => {
            // DUMMY FILTER LOGICA:
            // Om te simuleren dat verschillende aanleidingen verschillende oplossingen filteren,
            // gebruiken we een modulo-bewerking met de index van de oplossing en de lengte van activeFilters
            // Dit zorgt ervoor dat sommige oplossingen worden gefilterd op basis van de geselecteerde redenen
            const solutionNumber = index + 1;
            
            // Als de aangegeven filter een veelvoud is van het oplossing-nummer, toon dan de oplossing
            return activeFilters.some((_, filterIndex) => {
              const filterNumber = filterIndex + 1;
              return solutionNumber % filterNumber === 0;
            });
          })
        : allSolutions;
      
      setFilteredSolutions(filtered);
    }
  }, [allSolutions, activeFilters]);
  
  // Group solutions by category when data is loaded
  useEffect(() => {
    if (filteredSolutions) {
      // Create a default category for solutions without a category
      const solutionsWithCategory = filteredSolutions.map(solution => ({
        ...solution,
        category: solution.category || 'overig'
      }));
      
      // Group by category
      const grouped = groupBy(solutionsWithCategory, 'category');
      setGroupedSolutions(grouped);
    }
  }, [filteredSolutions]);
  
  // Handle filter changes
  const handleFilterChange = (reasonId: string) => {
    setActiveFilters(prev => {
      // Toggle het filter
      return prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId];
    });
  };
  
  // Check if any solutions are selected
  const hasSelectedSolutions = selectedSolutions.length > 0;
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 2: Mobiliteitsoplossingen</h2>
        <p className="mb-6">
          Op basis van de door u geselecteerde redenen, kunt u hier de gewenste mobiliteitsoplossingen selecteren.
          U kunt meerdere oplossingen kiezen.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Links: Filter paneel */}
          <div className="lg:w-1/4">
            {reasons && (
              <FilterPanel
                reasons={reasons}
                selectedReasonIds={selectedReasons}
                activeFilterIds={activeFilters}
                onReasonFilterChange={handleFilterChange}
              />
            )}
          </div>
          
          {/* Rechts: Oplossingen */}
          <div className="lg:w-3/4">
            {/* Filter status banner */}
            <div className="mb-6">
              {activeFilters.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <p className="text-yellow-800">
                    <span className="font-medium">Geen filters actief.</span>{' '}
                    Gebruik het filter panel links om aanleidingen te selecteren en te zien welke mobiliteitsoplossingen daarbij passen.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-blue-800">
                    <span className="font-medium">
                      {activeFilters.length} {activeFilters.length === 1 ? 'filter' : 'filters'} actief.
                    </span>{' '}
                    {filteredSolutions?.length ?? 0} passende mobiliteitsoplossingen gevonden.
                  </p>
                </div>
              )}
            </div>
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Mobiliteitsoplossingen worden geladen...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 p-4 rounded-md space-y-2">
                <p className="text-red-600">Er is een fout opgetreden bij het laden van de mobiliteitsoplossingen.</p>
                <p className="text-red-500 text-sm">
                  De mobiliteitsoplossingen worden tijdelijk geladen vanuit mock data.
                </p>
              </div>
            )}
            
            {filteredSolutions && filteredSolutions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Geen mobiliteitsoplossingen gevonden die aan uw criteria voldoen.</p>
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
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep="/wizard/stap-3"
        isNextDisabled={!hasSelectedSolutions}
      />
    </div>
  );
} 