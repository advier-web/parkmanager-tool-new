'use client';

import { useState, useEffect } from 'react';
import { useMobilitySolutions, useBusinessParkReasons, useGovernanceModels } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { FilterPanel } from '../../../components/filter-panel';
import { groupBy } from '../../../utils/helper';
import { MobilitySolution, GovernanceModel, TrafficType } from '../../../domain/models';
import { useContentfulContentTypes } from '../../../hooks/use-contentful-models';
import { shouldUseContentful } from '../../../utils/env';
import { useDialog } from '../../../contexts/dialog-context';
import { useRouter } from 'next/navigation';

// Deze map wordt dynamisch opgebouwd op basis van de geladen reasons
let reasonIdToIdentifierMap: Record<string, string> = {};

// Helper function om score te vinden voor een identifier (case-insensitief)
const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
  // Standaard debug waarde voor belangrijke oplossingen
  const debugEnabled = solution.title && (
    solution.title.includes('Vanpool') || 
    solution.title.includes('fiets')
  );
  
  if (debugEnabled) {
    console.log(`\n--- findScoreForIdentifier voor ${solution.title} - ${identifier} ---`);
  }
  
  // 1. Directe match
  const directValue = solution[identifier as keyof MobilitySolution];
  if (typeof directValue === 'number') {
    if (debugEnabled) console.log(`✅ Directe match gevonden voor '${identifier}': ${directValue}`);
    return directValue;
  } else if (debugEnabled) {
    console.log(`❌ Geen directe match voor '${identifier}'`);
  }
  
  // 2. Case-insensitive match
  const matchingKey = Object.keys(solution).find(key => 
    key.toLowerCase() === identifier.toLowerCase()
  );
  
  if (matchingKey) {
    const value = solution[matchingKey as keyof MobilitySolution];
    if (typeof value === 'number') {
      if (debugEnabled) console.log(`✅ Case-insensitive match gevonden voor '${identifier}' via '${matchingKey}': ${value}`);
      return value;
    }
  } else if (debugEnabled) {
    console.log(`❌ Geen case-insensitive match voor '${identifier}'`);
  }
  
  // 3. Normalized match (spaces to underscores)
  const normalizedIdentifier = identifier
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  if (debugEnabled) console.log(`Genormaliseerde identifier: '${normalizedIdentifier}'`);
  
  const normalizedValue = solution[normalizedIdentifier as keyof MobilitySolution];
  if (typeof normalizedValue === 'number') {
    if (debugEnabled) console.log(`✅ Genormaliseerde match gevonden voor '${normalizedIdentifier}': ${normalizedValue}`);
    return normalizedValue;
  } else if (debugEnabled) {
    console.log(`❌ Geen genormaliseerde match voor '${normalizedIdentifier}'`);
  }
  
  // 4. Bekend mappings voor ingebouwde inconsistenties
  const mappings: Record<string, string[]> = {
    'gezondheid': ['gezondheid', 'Gezondheid', 'health'],
    'personeelszorg_en_behoud': ['personeelszorg_en_behoud', 'Personeelszorg en -behoud', 'personeel'],
    'parkeer_bereikbaarheidsproblemen': [
      'parkeer_bereikbaarheidsproblemen', 
      'Parkeer- en bereikbaarheidsprobleem',
      'Parkeer- en bereikbaarheidsproblemen',
      'parkeer_en_bereikbaarheidsproblemen',
      'Parkeer en bereikbaarheidsprobleem',
      'parkeerprobleem',
      'bereikbaarheidsprobleem'
    ]
  };
  
  if (identifier && mappings[identifier.toLowerCase()]) {
    if (debugEnabled) console.log(`Probeert mappings voor '${identifier.toLowerCase()}': ${mappings[identifier.toLowerCase()].join(', ')}`);
    
    // Probeer alle mogelijke varianten
    for (const variant of mappings[identifier.toLowerCase()]) {
      const value = solution[variant as keyof MobilitySolution];
      if (typeof value === 'number') {
        if (debugEnabled) console.log(`✅ Match gevonden via mapping: '${variant}' = ${value}`);
        return value;
      } else if (debugEnabled) {
        console.log(`❌ Geen waarde gevonden voor mapping '${variant}'`);
      }
    }
  } else if (debugEnabled) {
    console.log(`❌ Geen mappings gevonden voor '${identifier.toLowerCase()}'`);
  }
  
  // 5. Zoek deels overeenkomende velden (voor parkeerproblemen, gezondheid, etc.)
  const potentialMatches = Object.keys(solution).filter(key => {
    // Controleert of de key de identifier bevat, of andersom
    return key.toLowerCase().includes(identifier.toLowerCase()) || 
           identifier.toLowerCase().includes(key.toLowerCase());
  });
  
  if (potentialMatches.length > 0 && debugEnabled) {
    console.log(`🔍 Potentiële partial matches gevonden: ${potentialMatches.join(', ')}`);
  }
  
  for (const match of potentialMatches) {
    const value = solution[match as keyof MobilitySolution];
    if (typeof value === 'number') {
      if (debugEnabled) console.log(`✅ Partial match gevonden: '${match}' = ${value}`);
      return value;
    }
  }
  
  // Geen match gevonden
  if (debugEnabled) console.log(`❌ Geen match gevonden voor '${identifier}', retourneer 0`);
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
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<TrafficType[]>([]);
  const [groupedSolutions, setGroupedSolutions] = useState<Record<string, MobilitySolution[]>>({});
  
  // Get store data
  const { 
    selectedReasons, 
    selectedSolutions, 
    toggleSolution, 
    setSelectedSolutions, 
    resetWizard,
    businessParkInfo,  // Add this to get traffic types
    updateTrafficTypes
  } = useWizardStore();
  
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
  
  // Initialize activeFilters with selectedReasons when component mounts
  useEffect(() => {
    if (selectedReasons && selectedReasons.length > 0) {
      setActiveFilters(selectedReasons);
    }
  }, [selectedReasons]);
  
  // Initialize activeTrafficTypes with businessParkInfo.trafficTypes when component mounts
  useEffect(() => {
    if (businessParkInfo && businessParkInfo.trafficTypes && businessParkInfo.trafficTypes.length > 0) {
      setActiveTrafficTypes(businessParkInfo.trafficTypes);
    }
  }, [businessParkInfo]);
  
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
    if (mobilitySolutions) {
      // Instead of filtering out solutions, we'll show all of them
      // but sort them appropriately in the sortSolutionsByScore function
      setFilteredSolutions(mobilitySolutions);
    }
  }, [mobilitySolutions, activeFilters, activeTrafficTypes, reasons]);
  
  // Handle showing solution details in dialog
  const handleShowMoreInfo = (solution: MobilitySolution) => {
    if (!governanceModels) return;
    
    // Pass ALL governance models to the dialog, not just the ones referenced in governanceModels
    // The filtering will happen inside the dialog based on all three arrays:
    // governanceModels, governanceModelsMits, and governanceModelsNietgeschikt
    openSolutionDialog(solution, governanceModels);
  };
  
  // Functie om bekend incorrecte scores handmatig te corrigeren
  const applyScoreCorrections = (solution: MobilitySolution): MobilitySolution => {
    // Maak een veilige kopie van de oplossing om de originele niet te wijzigen
    const correctedSolution = { ...solution };
    return correctedSolution;
  };
  
  // Bereken scores direct met de gecorrigeerde waarden
  const calculateScoreForSolution = (solution: MobilitySolution, filters: string[]): number => {
    // Bijhouden welke filters al verwerkt zijn
    const processedFilters = new Set<string>();
    let score = 0;
    let scoreBreakdown: Record<string, number> = {};

    // Debug logging voor belangrijke oplossingen
    const isDebugSolution = solution.title && (
      solution.title.includes('Vanpool') || 
      solution.title.includes('fiets')
    );

    if (isDebugSolution) {
      console.log(`===== DEBUG SCORE VOOR ${solution.title} =====`);
      console.log(`Solution ID: ${solution.id}`);
      console.log(`Filters: ${filters.join(', ')}`);
      console.log(`Filter mappings:`);
      filters.forEach(filterId => {
        const identifier = reasonIdToIdentifierMap[filterId];
        console.log(`- Filter ID: ${filterId}, Mapped to: ${identifier}`);
      });
      
      // Log alle score velden in de solution
      console.log(`Beschikbare score velden in solution:`);
      Object.keys(solution).forEach(key => {
        if (typeof (solution as any)[key] === 'number') {
          console.log(`- ${key}: ${(solution as any)[key]}`);
        }
      });
    }
    
    // Verwerk alle filters
    filters.forEach(reasonId => {
      // Skip als deze filter al verwerkt is
      if (processedFilters.has(reasonId)) {
        if (isDebugSolution) {
          console.log(`- Filter ${reasonId} is al verwerkt, wordt overgeslagen`);
        }
        return;
      }
      
      // Haal de identifier op die bij deze reden hoort
      const identifier = reasonIdToIdentifierMap[reasonId];
      
      if (identifier) {
        // Gebruik de gedeelde helper functie
        const fieldScore = findScoreForIdentifier(solution, identifier);
        
        if (fieldScore > 0) {
          score += fieldScore;
          scoreBreakdown[identifier] = fieldScore;
          
          if (isDebugSolution) {
            console.log(`Score voor ${identifier} toegevoegd: ${fieldScore}`);
          }
        } else if (isDebugSolution) {
          console.log(`Geen score gevonden voor ${identifier}`);
        }
        
        // Markeer deze filter als verwerkt
        processedFilters.add(reasonId);
      }
    });
    
    // Eindresultaat loggen voor debug oplossingen
    if (isDebugSolution) {
      console.log(`Score breakdown voor ${solution.title}:`);
      Object.entries(scoreBreakdown).forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });
      console.log(`Totale score voor ${solution.title}: ${score}`);
      console.log(`===============================`);
    }
    
    return score;
  };
  
  // Function to calculate how well a solution matches the active traffic types
  const getTrafficTypeMatchScore = (solution: MobilitySolution): number => {
    // If no active traffic types are selected, don't affect sorting
    if (activeTrafficTypes.length === 0) {
      return 0;
    }
    
    if (!solution.typeVervoer || solution.typeVervoer.length === 0) {
      return 0; // No traffic types to match
    }
    
    // Count how many of the active traffic types match the solution's traffic types
    const matchCount = solution.typeVervoer.filter(type => 
      activeTrafficTypes.includes(type)
    ).length;
    
    // Higher score for solutions that match all selected traffic types
    if (matchCount === activeTrafficTypes.length) {
      return 1000 + matchCount; // Massive bonus to ensure these always come first
    }
    
    // Solutions with at least one match still get a high score
    if (matchCount > 0) {
      return 500 + matchCount;
    }
    
    return 0;
  };
  
  // Sorteer de gefilterde oplossingen op basis van hun scores en traffic types
  const sortSolutionsByScore = (solutions: MobilitySolution[]): MobilitySolution[] => {
    if (!reasons) return solutions;
    
    const validActiveFilters = activeFilters.filter(id => reasons.some(reason => reason.id === id));
    
    return [...solutions].sort((a, b) => {
      // Calculate reason-based scores
      const aReasonScore = validActiveFilters.length > 0 ? 
        calculateScoreForSolution(a, validActiveFilters) : 0;
      const bReasonScore = validActiveFilters.length > 0 ? 
        calculateScoreForSolution(b, validActiveFilters) : 0;
      
      // Calculate traffic type matches
      const aTrafficMatches = getTrafficTypeMatchScore(a);
      const bTrafficMatches = getTrafficTypeMatchScore(b);
      
      // First prioritize traffic type matches
      if (aTrafficMatches !== bTrafficMatches) {
        return bTrafficMatches - aTrafficMatches; // Higher traffic matches first
      }
      
      // If traffic matches are the same, then compare reason scores
      if (aReasonScore !== bReasonScore) {
        return bReasonScore - aReasonScore; // Higher reason score first
      }
      
      // If both scores are equal, maintain original order
      return 0;
    });
  };
  
  // Generate a tag indicating why a solution is ranked highly
  const getSolutionRankingTag = (solution: MobilitySolution): { text: string, type: 'traffic' | 'reason' | 'both' | null } => {
    if ((!solution.typeVervoer || solution.typeVervoer.length === 0) && activeTrafficTypes.length === 0) {
      return { text: '', type: null };
    }
    
    const trafficMatches = solution.typeVervoer?.filter(type => 
      activeTrafficTypes.includes(type)
    ) || [];
    
    const reasonScore = reasons && activeFilters.length > 0 ? 
      calculateScoreForSolution(solution, activeFilters) : 0;
    
    // If there are traffic types selected, prioritize those in the tags
    if (activeTrafficTypes.length > 0) {
      if (trafficMatches.length > 0) {
        if (trafficMatches.length === activeTrafficTypes.length) {
          // Perfect match on all traffic types
          return { 
            text: `Perfecte match op ${trafficMatches.length} type${trafficMatches.length > 1 ? 's' : ''} vervoer`, 
            type: reasonScore > 6 ? 'both' : 'traffic' 
          };
        } else {
          // Partial match on traffic types
          return { 
            text: `Match op ${trafficMatches.length} van ${activeTrafficTypes.length} type${activeTrafficTypes.length > 1 ? 's' : ''} vervoer`, 
            type: reasonScore > 6 ? 'both' : 'traffic' 
          };
        }
      } else if (reasonScore > 6) {
        // No traffic match but high reason score
        return { 
          text: 'Hoge score op aanleidingen',
          type: 'reason' 
        };
      }
    } else if (reasonScore > 6) {
      // Only reason filters are active
      return { 
        text: 'Hoge score op aanleidingen', 
        type: 'reason' 
      };
    }
    
    return { text: '', type: null };
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
  
  // Handle filter changes for reason filters
  const handleFilterChange = (reasonId: string) => {
    setActiveFilters(prev => {
      // Toggle het filter
      return prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId];
    });
  };
  
  // Handle filter changes for traffic type filters
  const handleTrafficTypeFilterChange = (type: TrafficType) => {
    setActiveTrafficTypes(prev => {
      // Toggle the filter
      const newTrafficTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      
      return newTrafficTypes;
    });
  };
  
  // Update the store when activeTrafficTypes change
  useEffect(() => {
    // Only update the store if activeTrafficTypes has been initialized (not empty after first render)
    if (activeTrafficTypes.length > 0 || businessParkInfo.trafficTypes?.length > 0) {
      updateTrafficTypes(activeTrafficTypes);
    }
  }, [activeTrafficTypes, updateTrafficTypes]);
  
  // Check if any solutions are selected
  const hasSelectedSolutions = selectedSolutions.length > 0;
  
  // Log selectedSolutions voor debug doeleinden
  console.log("Geselecteerde oplossingen:", selectedSolutions);
  console.log("Active traffic types:", activeTrafficTypes);
  console.log("Selected traffic types from step 0:", businessParkInfo.trafficTypes);
  
  const router = useRouter();
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Filters en Information */}
        <div className="lg:col-span-1">
          {/* Filter panel - Nu bovenaan */}
          {reasons && (
            <div className="mb-6">
              <FilterPanel
                reasons={reasons}
                selectedReasonIds={selectedReasons}
                activeFilterIds={activeFilters}
                onReasonFilterChange={handleFilterChange}
                activeTrafficTypes={activeTrafficTypes}
                selectedTrafficTypes={businessParkInfo.trafficTypes || []}
                onTrafficTypeFilterChange={handleTrafficTypeFilterChange}
              />
            </div>
          )}
          
          {/* Informatieve tekst - Nu onderaan */}
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Mobiliteitsoplossingen helpen uw bedrijventerrein bereikbaar te houden. 
                Kies oplossingen die passen bij de redenen die u in de vorige stap heeft geselecteerd.
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
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-even">
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
            
            {/* Display solutions */}
            <div className="grid grid-cols-1 gap-6 mt-8">
              {!filteredSolutions || isLoadingSolutions ? (
                // Loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <div 
                    key={index}
                    className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))
              ) : filteredSolutions.length === 0 ? (
                // No solutions found
                <div>
                  <p className="text-center text-gray-500 my-8">
                    Geen mobiliteitsoplossingen gevonden die voldoen aan de geselecteerde criteria.
                  </p>
                </div>
              ) : (
                // Solutions found
                sortSolutionsByScore(filteredSolutions).map(solution => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    isSelected={selectedSolutions.includes(solution.id)}
                    onToggleSelect={toggleSolution}
                    onMoreInfo={handleShowMoreInfo}
                    selectedReasons={reasons ? reasons.filter(reason => activeFilters.includes(reason.id)) : []}
                    rankingTag={getSolutionRankingTag(solution)}
                    activeTrafficTypes={activeTrafficTypes}
                  />
                ))
              )}
            </div>
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
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.push("/wizard/stap-1")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Vorige stap
        </button>

        <button
          onClick={() => {
            if (hasSelectedSolutions) {
              console.log("Navigating to next step, solutions selected:", selectedSolutions);
              router.push("/wizard/stap-3");
            } else {
              console.log("Cannot navigate, no solutions selected");
              // Optioneel: toon een melding of markeer de waarschuwing duidelijker
            }
          }}
          disabled={!hasSelectedSolutions}
          className={`px-4 py-2 rounded-md ${
            !hasSelectedSolutions
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
          aria-disabled={!hasSelectedSolutions}
        >
          Volgende stap
        </button>
      </div>
    </div>
  );
} 