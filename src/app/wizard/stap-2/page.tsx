'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMobilitySolutions, useBusinessParkReasons, useGovernanceModels, useImplementationVariations } from '../../../hooks/use-domain-models';
import { useWizardStore } from '@/store/wizard-store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '@/components/wizard-navigation';
import { FilterPanel } from '../../../components/filter-panel';
import { groupBy } from '../../../utils/helper';
import { MobilitySolution, GovernanceModel, TrafficType, ImplementationVariation } from '../../../domain/models';
import { shouldUseContentful } from '../../../utils/env';
import { useDialog } from '../../../contexts/dialog-context';
import { useRouter } from 'next/navigation';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';

// Deze map wordt dynamisch opgebouwd op basis van de geladen reasons
let reasonIdToIdentifierMap: Record<string, string> = {};

interface GroupedSolutions {
  [category: string]: MobilitySolution[];
}

// Helper function to find score based on reason identifier
const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
  if (!identifier) return 0;
  // Explicitly cast solution to any to access dynamic properties safely
  const solutionFields = solution as any; // Keep 'any' for dynamic access, consider defining a score interface if possible
  return typeof solutionFields[identifier] === 'number' ? solutionFields[identifier] : 0;
};

// Main component for mobility solutions page
export default function MobilitySolutionsPage() {
  // Use the debug hook to log content types if using Contentful
  if (shouldUseContentful()) {
    // useContentfulContentTypes();
  }
  
  // State variables
  const hasHydrated = useWizardStore(state => state._hasHydrated);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
  const { data: allVariations, isLoading: isLoadingVariations, error: variationsError } = useImplementationVariations();
  
  // Access the dialog context
  const { openSolutionDialog } = useDialog();
  const router = useRouter();
  
  // --- Effects --- 
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
  
  // --- MEMOIZED VALUES & CALLBACKS --- 
  const getTrafficTypeMatchScore = useCallback((solution: MobilitySolution): number => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];
    if (currentTrafficTypes.length === 0 || !solution.typeVervoer) return 0;
    const matches = solution.typeVervoer.filter(type => currentTrafficTypes.includes(type));
    if (matches.length > 0 && matches.length === currentTrafficTypes.length) {
        return 1000 + matches.length; // Bonus for matching all
    }
    return matches.length;
  }, [businessParkInfo.trafficTypes]);
  
  const calculateScoreForSolution = useCallback((solution: MobilitySolution, filters: string[]): number => {
    let score = 0;
    const reasonDetails = (reasons || []).filter(r => filters.includes(r.id));
    reasonDetails.forEach(reason => {
      if (reason.identifier) {
        const reasonScore = findScoreForIdentifier(solution, reason.identifier);
        score += reasonScore * (reason.weight || 1);
      }
    });
    score += getTrafficTypeMatchScore(solution);
    return score;
  }, [reasons, getTrafficTypeMatchScore]);

  const getReasonScores = useCallback((solution: MobilitySolution, filters: string[]): { [reasonId: string]: number } => {
    const scores: { [reasonId: string]: number } = {};
    const reasonDetails = (reasons || []).filter(r => filters.includes(r.id));
    reasonDetails.forEach(reason => {
      if (reason.identifier) {
        const reasonScore = findScoreForIdentifier(solution, reason.identifier);
        scores[reason.id] = reasonScore * (reason.weight || 1);
      } else {
        scores[reason.id] = 0;
      }
    });
    return scores;
  }, [reasons]);
  
  const sortSolutionsByScore = useCallback((
    solutions: MobilitySolution[], 
    currentFilters: string[], 
    currentTrafficTypes: TrafficType[]
  ): { solution: MobilitySolution, score: number, trafficMatch: number, contributingReasons: { [reasonId: string]: number } }[] => {
    if (!solutions) return [];
    const scoredSolutions = solutions.map(solution => ({
      solution,
      score: calculateScoreForSolution(solution, currentFilters),
      trafficMatch: getTrafficTypeMatchScore(solution),
      contributingReasons: getReasonScores(solution, currentFilters) // Calculate contributing reasons here
    }));
    scoredSolutions.sort((a, b) => {
      if (b.trafficMatch !== a.trafficMatch) return b.trafficMatch - a.trafficMatch;
      return b.score - a.score;
    });
    return scoredSolutions; // Return the full scored objects
  }, [calculateScoreForSolution, getTrafficTypeMatchScore, getReasonScores]);
  
  const processedSolutions = useMemo(() => {
    if (!mobilitySolutions || !reasons) {
      return { filtered: [], grouped: {} };
    }

    let filteredSolutions = [...mobilitySolutions]; 
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];

    let reasonsToScoreBy: string[] = activeFilters;
    if (activeFilters.length > 0) {
      const initialCount = filteredSolutions.length;
      filteredSolutions = filteredSolutions.filter(sol => 
        activeFilters.some(reasonId => {
          const identifier = reasonIdToIdentifierMap[reasonId];
          const score = identifier ? findScoreForIdentifier(sol, identifier) : 0;
          return identifier && score > 0;
        })
      );
    } else {
      reasonsToScoreBy = [];
    }

    // Sort Solutions - Now returns richer objects
    const sortedAndScored = sortSolutionsByScore(filteredSolutions, reasonsToScoreBy, currentTrafficTypes); 

    // Group by category using the solution within the scored object - Manual implementation
    type ScoredSolutionItem = { solution: MobilitySolution, score: number, trafficMatch: number, contributingReasons: { [reasonId: string]: number } };
    const grouped: Record<string, ScoredSolutionItem[]> = sortedAndScored.reduce((acc, item) => {
      const category = item.solution.category || 'Onbekend'; // Get category, default to 'Onbekend'
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ScoredSolutionItem[]>);

    // Return the sorted list of richer objects and the grouped version
    return { filtered: sortedAndScored, grouped };

  }, [mobilitySolutions, reasons, businessParkInfo.trafficTypes, activeFilters, calculateScoreForSolution, getTrafficTypeMatchScore, getReasonScores, sortSolutionsByScore]); // Added dependencies
  
  // --- EVENT HANDLERS & DERIVED STATE --- 
  const handleShowMoreInfo = (solution: MobilitySolution) => {
    if (!governanceModels) return;
    
    // Bepaal de relevante variaties voor deze specifieke solution
    const relevantVariationsForDialog = allVariations?.filter(
      (v: ImplementationVariation) => v.title?.startsWith(solution.title)
    ) || [];

    // Geef de relevante variaties nu mee aan openSolutionDialog
    openSolutionDialog(solution, governanceModels, relevantVariationsForDialog);
  };
  
  // Functie om bekend incorrecte scores handmatig te corrigeren
  const applyScoreCorrections = (solution: MobilitySolution): MobilitySolution => {
    // Maak een veilige kopie van de oplossing om de originele niet te wijzigen
    const correctedSolution = { ...solution };
    return correctedSolution;
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
  
  // --- EARLY RETURNS (AFTER HOOKS) --- 
  if (isLoadingSolutions || isLoadingReasons || isLoadingModels || isLoadingVariations) {
    return <div>Loading data...</div>;
  }

  if (solutionsError || reasonsError || variationsError) {
    return <div>Error loading data. Please try again later.</div>;
  }
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column - Add Choices Summary above FilterPanel/Info */}
          <div className="md:col-span-1 space-y-8 md:sticky md:top-28">
            <WizardChoicesSummary />
            {/* Filter panel - Wait for hydration */}
            {hasHydrated && reasons && (
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
            {!hasHydrated && (
               <div className="mb-6 p-6 bg-white rounded-lg shadow-even">
                 <p className="text-sm text-gray-500">Filters laden...</p>
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
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h2 className="text-2xl font-bold mb-4">Stap 2: Mobiliteitsoplossingen</h2>
              <p className="mb-6">
                Op basis van de door u geselecteerde redenen, kunt u hier de gewenste mobiliteitsoplossingen selecteren.
                U kunt meerdere oplossingen kiezen.
              </p>
              
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
                        {solutions.map((scoredSolution) => { // Iterate over scoredSolution objects
                          const { solution, score, trafficMatch, contributingReasons } = scoredSolution; // Destructure
                          const relevantVariationsForCard = allVariations?.filter(
                            (v: ImplementationVariation) => v.title?.startsWith(solution.title)
                          ) || [];
                          return (
                            <SolutionCard
                              key={solution.id}
                              solution={solution} // Pass the actual solution object
                              isSelected={selectedSolutions.includes(solution.id)}
                              onToggleSelect={() => toggleSolution(solution.id)}
                              variationsData={relevantVariationsForCard}
                              score={score} // Pass score directly
                              trafficTypeMatchScore={trafficMatch} // Pass trafficMatch directly
                              contributingReasons={contributingReasons} // Pass calculated contributingReasons
                              reasonsData={reasons || []}
                              activeTrafficTypes={businessParkInfo.trafficTypes || []}
                              activeReasonFilters={activeFilters} 
                              onMoreInfo={() => handleShowMoreInfo(solution)}
                            />
                          );
                        })}
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
    </>
  );
} 