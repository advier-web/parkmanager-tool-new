'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';

// Deze map wordt dynamisch opgebouwd op basis van de geladen reasons
let reasonIdToIdentifierMap: Record<string, string> = {};

// Helper function om score te vinden voor een identifier (case-insensitief)
const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
  // Standaard debug waarde voor belangrijke oplossingen
  const debugEnabled = false; // solution.title && (solution.title.includes('Vanpool') || solution.title.includes('fiets'));
  
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
  const [groupedSolutions, setGroupedSolutions] = useState<Record<string, MobilitySolution[]>>({});
  
  // Get store data
  const { 
    selectedReasons, 
    selectedSolutions, 
    toggleSolution, 
    setSelectedSolutions, 
    resetWizard,
    businessParkInfo,
    updateTrafficTypes,
    setSelectedReasons
  } = useWizardStore();
  
  // Fetch mobility solutions and reasons data
  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  const { data: reasons, isLoading: isLoadingReasons, error: reasonsError } = useBusinessParkReasons();
  const { data: governanceModels, isLoading: isLoadingModels } = useGovernanceModels();
  
  // Access the dialog context
  const { openSolutionDialog } = useDialog();
  
  // Initialize activeFilters with selectedReasons from the store
  useEffect(() => {
    if (selectedReasons && selectedReasons.length > 0) {
      setActiveFilters(selectedReasons);
    }
  }, [selectedReasons]);
  
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
  
  // Calculate score based on selected reasons and their weights
  const calculateScoreForSolution = (solution: MobilitySolution, filters: string[]): number => {
    let score = 0;
    // Ensure reasons is not null before filtering
    const reasonDetails = (reasons || []).filter(r => filters.includes(r.id));

    reasonDetails.forEach(reason => {
      // Assume criteriaScores exists, add explicit type for cs
      const criteriaScore = solution.criteriaScores?.find((cs: { reasonId: string; score: number }) => cs.reasonId === reason.id);
      if (criteriaScore) {
        // Assume weight exists or default to 1
        score += criteriaScore.score * (reason.weight || 1);
      }
    });

    // Add traffic type match score
    score += getTrafficTypeMatchScore(solution);

    return score;
  };

  // Calculate individual scores for each reason
  const getReasonScores = (solution: MobilitySolution, filters: string[]): { [reasonId: string]: number } => {
    const scores: { [reasonId: string]: number } = {};
    // Ensure reasons is not null before filtering
    const reasonDetails = (reasons || []).filter(r => filters.includes(r.id));

    reasonDetails.forEach(reason => {
      // Assume criteriaScores exists, add explicit type for cs
      const criteriaScore = solution.criteriaScores?.find((cs: { reasonId: string; score: number }) => cs.reasonId === reason.id);
      if (criteriaScore) {
        // Assume weight exists or default to 1
        scores[reason.id] = criteriaScore.score * (reason.weight || 1);
      } else {
        scores[reason.id] = 0; // Assign 0 if no score found for the reason
      }
    });
    return scores;
  };
  
  // Match score based on selected traffic types (use store value)
  const getTrafficTypeMatchScore = (solution: MobilitySolution): number => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];
    if (currentTrafficTypes.length === 0 || !solution.typeVervoer) return 0;
    const matches = solution.typeVervoer.filter(type => currentTrafficTypes.includes(type));
    if (matches.length > 0 && matches.length === currentTrafficTypes.length) {
        return 1000 + matches.length; // Bonus for matching all
    }
    return matches.length;
  };

  // Sorting function
  const sortSolutionsByScore = (solutions: MobilitySolution[], currentFilters: string[], currentTrafficTypes: TrafficType[]): MobilitySolution[] => {
    if (!solutions) return [];
    const scoredSolutions = solutions.map(solution => ({
      solution,
      score: calculateScoreForSolution(solution, currentFilters),
      trafficMatch: getTrafficTypeMatchScore(solution)
    }));
    scoredSolutions.sort((a, b) => {
      if (b.trafficMatch !== a.trafficMatch) return b.trafficMatch - a.trafficMatch;
      return b.score - a.score;
    });
    return scoredSolutions.map(item => item.solution);
  };
  
  // Filtering and Sorting Logic using useMemo
  const processedSolutions = useMemo(() => {
    if (!mobilitySolutions || !reasons) return { filtered: [], grouped: {} };

    let filtered = [...mobilitySolutions]; // Start with all solutions
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];

    // Filter by Selected Reasons (Only if reasons are selected)
    let reasonsToScoreBy: string[] = activeFilters;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(sol => 
        activeFilters.some(reasonId => {
          const identifier = reasonIdToIdentifierMap[reasonId];
          return identifier && findScoreForIdentifier(sol, identifier) > 0;
        })
      );
    } else {
      reasonsToScoreBy = []; // Don't score by reason if none selected
    }

    // Sort Solutions
    const sorted = sortSolutionsByScore(filtered, reasonsToScoreBy, currentTrafficTypes); 

    // Group by category
    const grouped = groupBy(sorted, 'category');
    return { filtered: sorted, grouped };

  }, [mobilitySolutions, reasons, businessParkInfo.trafficTypes, activeFilters]);
  
  // Ranking Tag Logic (use store value)
  const getSolutionRankingTag = (solution: MobilitySolution, activeFilters: string[]): { text: string, type: 'traffic' | 'reason' | 'both' | null } | null => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || []; // Get from store
    const trafficMatchScore = getTrafficTypeMatchScore(solution);
    const trafficMatch = trafficMatchScore > 0;
    const reasonScore = reasons && activeFilters.length > 0 ? 
      calculateScoreForSolution(solution, activeFilters) : 0;
    const isRelevant = reasonScore > 0;

    // Prioritize perfect traffic match tag
    if (trafficMatchScore >= 1000) {
        return { text: `Perfecte match op vervoer`, type: isRelevant ? 'both' : 'traffic' };
    }
    if (trafficMatch && isRelevant) return { text: "Relevant & Matcht Vervoer", type: 'both' };
    if (trafficMatch) return { text: "Matcht Vervoer", type: 'traffic' };
    if (isRelevant) return { text: "Relevant", type: 'reason' };
    return null;
  };
  
  // RE-ADD handleFilterChange 
  const handleFilterChange = (reasonId: string) => {
    const nextActiveFilters = activeFilters.includes(reasonId)
        ? activeFilters.filter(id => id !== reasonId)
        : [...activeFilters, reasonId];
    setActiveFilters(nextActiveFilters); // Update local state for UI
    setSelectedReasons(nextActiveFilters); // Update store state as well
  };

  // Modify traffic type filter handling to only update store
  const handleTrafficTypeFilterChange = (type: TrafficType) => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || []; // Get current types from store
    const newTypes = currentTrafficTypes.includes(type)
      ? currentTrafficTypes.filter(t => t !== type)
      : [...currentTrafficTypes, type];
    updateTrafficTypes(newTypes); // Only update store
  };
  
  // Check if any solutions are selected
  const hasSelectedSolutions = selectedSolutions.length > 0;
  
  // Log selectedSolutions voor debug doeleinden
  console.log("Geselecteerde oplossingen:", selectedSolutions);
  console.log("Active traffic types:", businessParkInfo.trafficTypes);
  console.log("Selected traffic types from step 0:", businessParkInfo.trafficTypes);
  
  const router = useRouter();
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Add Choices Summary above FilterPanel/Info */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary />
          {/* Filter panel */}
          {reasons && (
            <div className="mb-6">
              <FilterPanel
                reasons={reasons}
                selectedReasonIds={selectedReasons}
                activeFilterIds={activeFilters}
                onReasonFilterChange={handleFilterChange}
                activeTrafficTypes={businessParkInfo.trafficTypes || []}
                selectedTrafficTypes={businessParkInfo.trafficTypes || []}
                onTrafficTypeFilterChange={handleTrafficTypeFilterChange}
              />
            </div>
          )}
          {/* Original Informational text */}
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
             <div>
               <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
               <p className="text-gray-600 text-sm">
                 Op basis van uw gekozen aanleidingen, presenteren we hier de meest relevante mobiliteitsoplossingen. 
                 Selecteer de oplossingen die u wilt overwegen.
               </p>
             </div>
             <div>
               <h3 className="text-lg font-semibold mb-2">Ontdek oplossingen</h3>
               <p className="text-gray-600 text-sm">
                 Bekijk de details van elke oplossing door erop te klikken. 
                 Selecteer de oplossingen die het beste aansluiten bij uw situatie.
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
            
            {/* Display solutions */}
            <div className="space-y-8 mt-8">
              {Object.entries(processedSolutions.grouped).length > 0 ? (
                Object.entries(processedSolutions.grouped).map(([group, solutions]) => (
                  <div key={group} className="mb-6">
                    {/* Conditionally render the group title */}
                    {group && group.toLowerCase() !== 'onbekend' && (
                       <h3 className="text-xl font-semibold mb-3 text-blue-600">{group}</h3>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {solutions.map((solution) => (
                        <SolutionCard
                          key={solution.id}
                          solution={solution}
                          reasonScores={getReasonScores(solution, activeFilters)}
                          score={calculateScoreForSolution(solution, activeFilters)}
                          trafficTypeMatchScore={getTrafficTypeMatchScore(solution)}
                          rankingTag={getSolutionRankingTag(solution, activeFilters)}
                          onMoreInfo={() => handleShowMoreInfo(solution)}
                          isSelected={selectedSolutions.includes(solution.id)}
                          onToggleSelect={(solutionId: string) => toggleSolution(solution.id)}
                          calculateScoreForSolution={(sol: MobilitySolution) => calculateScoreForSolution(sol, activeFilters)}
                          getTrafficTypeMatchScore={getTrafficTypeMatchScore}
                          selectedReasons={(reasons || []).filter(r => activeFilters.includes(r.id))}
                          activeTrafficTypes={businessParkInfo.trafficTypes || []}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Geen oplossingen gevonden die overeenkomen met uw selectie.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-1"
        nextStep="/wizard/stap-2b"
        isNextDisabled={!hasSelectedSolutions}
      />
    </div>
  );
} 