'use client';

import { useState, useEffect } from 'react';
import { useMobilitySolutions, useBusinessParkReasons, useGovernanceModels } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { FilterPanel } from '../../../components/filter-panel';
import { groupBy } from '../../../utils/helper';
import { MobilitySolution, GovernanceModel } from '../../../domain/models';
import { useContentfulContentTypes } from '../../../hooks/use-contentful-models';
import { shouldUseContentful } from '../../../utils/env';
import { useDialog } from '../../../contexts/dialog-context';

// Deze map wordt dynamisch opgebouwd op basis van de geladen reasons
let reasonIdToIdentifierMap: Record<string, string> = {};

// Helper function om score te vinden voor een identifier (case-insensitief)
const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
  // Directe match
  const directValue = solution[identifier as keyof MobilitySolution];
  if (typeof directValue === 'number') {
    return directValue;
  }
  
  // Case-insensitive match
  const matchingKey = Object.keys(solution).find(key => 
    key.toLowerCase() === identifier.toLowerCase()
  );
  
  if (matchingKey) {
    const value = solution[matchingKey as keyof MobilitySolution];
    if (typeof value === 'number') {
      return value;
    }
  }
  
  // Normalized match (spaces to underscores)
  const normalizedIdentifier = identifier
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const normalizedValue = solution[normalizedIdentifier as keyof MobilitySolution];
  if (typeof normalizedValue === 'number') {
    return normalizedValue;
  }
  
  // Hardcoded mappings voor bekende inconsistenties
  const mappings: Record<string, string[]> = {
    'gezondheid': ['gezondheid', 'Gezondheid', 'health'],
    'personeelszorg_en_behoud': ['personeelszorg_en_behoud', 'Personeelszorg en -behoud', 'personeel'],
    'parkeer_bereikbaarheidsproblemen': ['parkeer_bereikbaarheidsproblemen', 'Parkeer- en bereikbaarheidsprobleem']
  };
  
  if (identifier && mappings[identifier.toLowerCase()]) {
    // Probeer alle mogelijke varianten
    for (const variant of mappings[identifier.toLowerCase()]) {
      const value = solution[variant as keyof MobilitySolution];
      if (typeof value === 'number') {
        return value;
      }
    }
  }
  
  // Geen match gevonden
  return 0;
};

// Main component for mobility solutions page
export default function MobilitySolutionsPage() {
  // Use the debug hook to log content types if using Contentful
  if (shouldUseContentful()) {
    useContentfulContentTypes();
  }
  
  // State variables
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [groupedSolutions, setGroupedSolutions] = useState<Record<string, MobilitySolution[]>>({});
  
  // Get store data
  const { selectedReasons, selectedSolutions, toggleSolution } = useWizardStore();
  
  // Fetch mobility solutions and reasons data
  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  const { data: reasons, isLoading: isLoadingReasons, error: reasonsError } = useBusinessParkReasons();
  const { data: governanceModels, isLoading: isLoadingModels } = useGovernanceModels();
  
  // Access the dialog context
  const { openSolutionDialog } = useDialog();
  
  // Show all solutions initially
  const [showAllSolutions, setShowAllSolutions] = useState(true);
  
  // Get the filtered solutions
  const [filteredSolutions, setFilteredSolutions] = useState<MobilitySolution[] | null>(null);
  
  // Build the reason identifier mapping
  useEffect(() => {
    if (reasons) {
      reasonIdToIdentifierMap = {};
      reasons.forEach(reason => {
        const identifier = reason.identifier || '';
        if (identifier) {
          reasonIdToIdentifierMap[reason.id] = identifier.toLowerCase();
        }
      });
    }
  }, [reasons]);
  
  // Update filtered solutions when mobility solutions or filters change
  useEffect(() => {
    if (mobilitySolutions && reasons) {
      // Filter out any activeFilters that don't have a corresponding reason
      const validActiveFilters = activeFilters.filter(id => reasons.some(reason => reason.id === id));
      
      // Set filtered solutions
      setFilteredSolutions(mobilitySolutions);
    }
  }, [mobilitySolutions, activeFilters, reasons]);
  
  // Handle showing solution details in dialog
  const handleShowMoreInfo = (solution: MobilitySolution) => {
    if (!governanceModels) return;
    
    // Filter governance models that are compatible with this solution
    let compatibleModels: GovernanceModel[] = [];
    
    if (solution.governanceModels && solution.governanceModels.length > 0) {
      // Extract governance model IDs from the solution
      const governanceModelIds = solution.governanceModels.map(model => {
        if (typeof model === 'string') {
          return model;
        } else if (model.sys && model.sys.id) {
          return model.sys.id;
        }
        return '';
      }).filter(id => id !== '');
      
      // Find matching governance models
      compatibleModels = governanceModels.filter((model: GovernanceModel) => 
        governanceModelIds.includes(model.id)
      );
    }
    
    // Open the dialog with solution info and compatible governance models
    openSolutionDialog(solution, compatibleModels);
  };
  
  // Bereken scores voor oplossingen op basis van geselecteerde redenen
  const calculateScoreForSolution = (solution: MobilitySolution, filters: string[]): number => {
    let score = 0;
    // Bijhouden welke filters al verwerkt zijn
    const processedFilters = new Set<string>();
    
    // SPECIAL CASE voor gezondheid - controleer of 5tKI2Y1ydgJAsj7bGjuTEX in de filters zit
    if (filters.includes('5tKI2Y1ydgJAsj7bGjuTEX')) {
      // Controleer direct of er een gezondheid score is
      if (typeof solution.gezondheid === 'number') {
        score += solution.gezondheid;
        // Markeer als verwerkt
        processedFilters.add('5tKI2Y1ydgJAsj7bGjuTEX');
      } else if (typeof (solution as any)['Gezondheid'] === 'number') {
        score += (solution as any)['Gezondheid'];
        // Markeer als verwerkt
        processedFilters.add('5tKI2Y1ydgJAsj7bGjuTEX');
      }
    }
    
    filters.forEach(reasonId => {
      // Skip als deze filter al verwerkt is in een speciale case
      if (processedFilters.has(reasonId)) {
        return;
      }
      
      // Haal de identifier op die bij deze reden hoort
      const identifier = reasonIdToIdentifierMap[reasonId];
      
      if (identifier) {
        // Gebruik de gedeelde helper functie
        const fieldScore = findScoreForIdentifier(solution, identifier);
        
        if (fieldScore > 0) {
          score += fieldScore;
        }
      }
    });
    
    return score;
  };
  
  // Sorteer de gefilterde oplossingen op basis van hun scores
  const sortSolutionsByScore = (solutions: MobilitySolution[]): MobilitySolution[] => {
    if (!reasons) return solutions;
    
    const validActiveFilters = activeFilters.filter(id => reasons.some(reason => reason.id === id));
    
    if (validActiveFilters.length === 0) return solutions;
    
    return [...solutions].sort((a, b) => {
      const aScore = calculateScoreForSolution(a, validActiveFilters);
      const bScore = calculateScoreForSolution(b, validActiveFilters);
      
      return bScore - aScore; // Hoogste score eerst
    });
  };
  
  // Sorteer en groepeer de oplossingen
  const sortedAndGroupedSolutions = (() => {
    if (!filteredSolutions) return {};
    
    // Sorteer eerst op basis van score
    const sortedSolutions = sortSolutionsByScore(filteredSolutions);
    
    // Groepeer daarna op categorie
    const solutionsWithCategory = sortedSolutions.map(solution => ({
      ...solution,
      category: solution.category || 'overig'
    }));
    
    return groupBy(solutionsWithCategory, 'category');
  })();
  
  // Group solutions by category when data is loaded and apply sorting
  useEffect(() => {
    if (filteredSolutions && reasons) {
      setGroupedSolutions(sortedAndGroupedSolutions);
    }
  }, [filteredSolutions, activeFilters, reasons]);
  
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
  
  // Log selectedSolutions voor debug doeleinden
  console.log("Geselecteerde oplossingen:", selectedSolutions);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Mobiliteitsoplossingen helpen uw bedrijventerrein bereikbaar te houden. 
                Kies oplossingen die passen bij de redenen die u in de vorige stap heeft geselecteerd.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Categorieën</h3>
              <p className="text-gray-600 text-sm">
                De oplossingen zijn ingedeeld in categorieën zoals vervoer, infrastructuur, 
                en gedragsverandering. U ziet de categorie bij elke oplossing vermeld.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Filteren</h3>
              <p className="text-gray-600 text-sm">
                Gebruik de filteropties links om de oplossingen te sorteren op 
                basis van de door u geselecteerde redenen.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Selecteer minimaal één oplossing om door te gaan</span>
              </div>
            </div>
          </div>
          
          {/* Filter panel */}
          {reasons && (
            <div className="mt-6">
              <FilterPanel
                reasons={reasons}
                selectedReasonIds={selectedReasons}
                activeFilterIds={activeFilters}
                onReasonFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Stap 2: Mobiliteitsoplossingen</h2>
            <p className="mb-6">
              Op basis van de door u geselecteerde redenen, kunt u hier de gewenste mobiliteitsoplossingen selecteren.
              U kunt meerdere oplossingen kiezen.
            </p>
            
            {isLoadingSolutions && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Mobiliteitsoplossingen worden geladen...</p>
              </div>
            )}
            
            {solutionsError && (
              <div className="bg-red-50 p-4 rounded-md space-y-2">
                <p className="text-red-600">Er is een fout opgetreden bij het laden van de mobiliteitsoplossingen.</p>
                <p className="text-red-500 text-sm">
                  De mobiliteitsoplossingen worden tijdelijk geladen vanuit mock data.
                </p>
              </div>
            )}
            
            {selectedReasons.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-2">Uw geselecteerde redenen:</h3>
                <ul className="list-disc pl-5">
                  {selectedReasons.map(reasonId => {
                    const reason = reasons?.find(r => r.id === reasonId);
                    return reason ? (
                      <li key={reasonId} className="text-blue-800">{reason.title}</li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
            
            {filteredSolutions && filteredSolutions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Geen mobiliteitsoplossingen gevonden die aan uw criteria voldoen.</p>
              </div>
            )}
            
            {Object.entries(sortedAndGroupedSolutions).map(([category, categorySolutions]) => (
              <div key={category} className="mt-8">
                <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
                <div className="grid grid-cols-1 gap-6">
                  {categorySolutions?.map(solution => {
                    // Bereken score voor deze oplossing
                    const validActiveFilters = reasons ? 
                      activeFilters.filter(id => reasons.some(reason => reason.id === id)) : [];
                    const score = calculateScoreForSolution(solution, validActiveFilters);
                    
                    return (
                      <div key={solution.id} className="relative">
                        {validActiveFilters.length > 0 && (
                          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md z-10">
                            Score: {score}
                          </div>
                        )}
                        <SolutionCard
                          solution={solution}
                          isSelected={selectedSolutions.includes(solution.id)}
                          onToggleSelect={toggleSolution}
                          onMoreInfo={handleShowMoreInfo}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {!hasSelectedSolutions && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800 mb-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>
              <strong>Selecteer minimaal één mobiliteitsoplossing</strong> voordat u naar de volgende stap gaat.
            </p>
          </div>
        </div>
      )}
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep={hasSelectedSolutions ? "/wizard/stap-3" : undefined}
        isNextDisabled={!hasSelectedSolutions}
      />
    </div>
  );
} 