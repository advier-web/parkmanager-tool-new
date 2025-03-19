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
  
  // Bouw de mapping tussen reden ID en identifier wanneer de redenen ingeladen zijn
  useEffect(() => {
    if (reasons) {
      // Bouw de mapping tussen reden ID en identifier
      const newMapping: Record<string, string> = {};
      
      // DIRECT HARDCODED FIX: Map het specifieke Contentful ID naar gezondheid
      newMapping['5tKI2Y1ydgJAsj7bGjuTEX'] = 'gezondheid';
      
      reasons.forEach(reason => {
        if (reason.identifier) {
          // Gebruik de identifier als koppeling naar de mobility solution
          newMapping[reason.id] = reason.identifier;
          
          // Als de identifier spaties bevat, vervang deze door underscores
          if (reason.identifier.includes(' ')) {
            const normalizedIdentifier = reason.identifier
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/-/g, '_');
            
            newMapping[reason.id] = normalizedIdentifier;
          }
          
          // Als de identifier een hoofdletter heeft, voeg ook een lowercase variant toe
          if (/[A-Z]/.test(reason.identifier)) {
            const lowercaseIdentifier = reason.identifier.toLowerCase();
            newMapping[reason.id] = lowercaseIdentifier;
          }
        } else {
          // Als title aanwezig is, gebruik deze als fallback voor de identifier
          if (reason.title) {
            // Zet de title om naar een identifier-achtige string
            const titleIdentifier = reason.title
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/-/g, '_');
            
            newMapping[reason.id] = titleIdentifier;
            
            // GEZONDHEID SPECIAL CASE: Als de titel "Gezondheid" is, of er op lijkt
            if (reason.title.toLowerCase().includes('gezond')) {
              newMapping[reason.id] = 'gezondheid';
            }
          } else {
            // Fallback voor mock data
            if (reason.id === 'reason-1') newMapping[reason.id] = 'parkeer_bereikbaarheidsproblemen';
            else if (reason.id === 'reason-2') newMapping[reason.id] = 'milieuverordening';
            else if (reason.id === 'reason-3') newMapping[reason.id] = 'parkeer_bereikbaarheidsproblemen';
            else if (reason.id === 'reason-4') newMapping[reason.id] = 'personeelszorg_en_behoud';
          }
        }
      });
      
      // Map voor contentful-specifieke velden (hardcoded)
      const contentfulFieldMap: Record<string, string> = {
        'Gezondheid': 'gezondheid',
        'gezondheid': 'gezondheid',
        'Personeelszorg en -behoud': 'personeelszorg_en_behoud',
        'personeelszorg_en_behoud': 'personeelszorg_en_behoud',
        'Parkeer- en bereikbaarheidsprobleem': 'parkeer_bereikbaarheidsproblemen',
        'parkeer_bereikbaarheidsproblemen': 'parkeer_bereikbaarheidsproblemen',
        'Imago / MVO': 'imago',
        'imago': 'imago',
        'Milieuverordening': 'milieuverordening'
      };
      
      // Ga door alle redenen en kijk of we een contentful-specifieke mapping moeten toevoegen
      reasons.forEach(reason => {
        if (reason.title && contentfulFieldMap[reason.title]) {
          newMapping[reason.id] = contentfulFieldMap[reason.title];
        }
      });
      
      // Update de mapping
      reasonIdToIdentifierMap = newMapping;
    }
  }, [reasons]);
  
  // Initialiseer activeFilters met de selectedReasons uit stap 1
  useEffect(() => {
    if (reasons) {
      // Alleen selecteren redenen die bestaan in de redenen lijst
      const validReasonIds = selectedReasons.filter(id => reasons.some(reason => reason.id === id));
      setActiveFilters(validReasonIds);
    } else {
      // Als redenen nog niet geladen zijn, gebruik alle geselecteerde redenen voorlopig
      setActiveFilters([...selectedReasons]);
    }
  }, [selectedReasons, reasons]);
  
  // Filter de oplossingen op basis van geselecteerde redenen
  useEffect(() => {
    if (allSolutions && reasons) {
      // Filter out any activeFilters that don't have a corresponding reason
      const validActiveFilters = activeFilters.filter(id => reasons.some(reason => reason.id === id));
      
      // Geen sortering hier, alleen filtering als er geen filters zijn
      const filtered = allSolutions;
      
      setFilteredSolutions(filtered);
    }
  }, [allSolutions, activeFilters, reasons]);
  
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
                      {(() => {
                        const validFilterCount = activeFilters.filter(id => reasons?.some(r => r.id === id)).length;
                        return `${validFilterCount} ${validFilterCount === 1 ? 'filter' : 'filters'} actief.`;
                      })()}
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
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep="/wizard/stap-3"
        isNextDisabled={!hasSelectedSolutions}
      />
    </div>
  );
} 