"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMobilitySolutions, useBusinessParkReasons, useGovernanceModels, useImplementationVariations } from '../../../hooks/use-domain-models';
import { useWizardStore } from '@/store/wizard-store';
import { SolutionCard } from '../../../components/solution-card';
import { WizardNavigation } from '@/components/wizard-navigation';
import { FilterPanel } from '../../../components/filter-panel';
import { MobilitySolution, TrafficType, ImplementationVariation } from '../../../domain/models';
import { shouldUseContentful } from '../../../utils/env';
import { useDialog } from '../../../contexts/dialog-context';
import { useRouter } from 'next/navigation';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';
import { SolutionComparisonModal } from '@/components/solution-comparison-modal';
import { SolutionComparisonBanner } from '@/components/solution-comparison-banner';

let reasonIdToIdentifierMap: Record<string, string> = {};

export default function MobilitySolutionsPage() {
  if (shouldUseContentful()) {
    // placeholder for potential debug hooks
  }
  
  const hasHydrated = useWizardStore(state => state._hasHydrated);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

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

  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  const { data: reasons, isLoading: isLoadingReasons, error: reasonsError } = useBusinessParkReasons();
  const { data: governanceModels, isLoading: isLoadingModels } = useGovernanceModels();
  const { data: allVariations, isLoading: isLoadingVariations, error: variationsError } = useImplementationVariations();
  
  const { openSolutionDialog } = useDialog();
  const router = useRouter();
  
  useEffect(() => {
    if (selectedReasons && selectedReasons.length > 0) {
      setActiveFilters(selectedReasons);
    }
  }, [selectedReasons]);
  
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
  
  const getTrafficTypeMatchScore = useCallback((solution: MobilitySolution): number => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];
    if (currentTrafficTypes.length === 0 || !solution.typeVervoer) return 0;
    const matches = solution.typeVervoer.filter(type => currentTrafficTypes.includes(type));
    if (matches.length > 0 && matches.length === currentTrafficTypes.length) {
        return 1000 + matches.length; // Bonus for matching all
    }
    return matches.length;
  }, [businessParkInfo.trafficTypes]);
  
  const getPickupPreferenceMatch = useCallback((solution: MobilitySolution): boolean => {
    const userPreference = businessParkInfo.employeePickupPreference;
    if (!userPreference || !solution.ophalen) return true; // No preference set or no pickup options - show all
    
    if (userPreference === 'thuis') {
      return solution.ophalen.some(option => option.toLowerCase().includes('thuis'));
    } else if (userPreference === 'locatie') {
      return solution.ophalen.some(option => option.toLowerCase().includes('locatie'));
    }
    
    return true; // Default to showing solution if unclear
  }, [businessParkInfo.employeePickupPreference]);
  
  const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
    if (!identifier) return 0;
    const solutionFields = solution as any;
    return typeof solutionFields[identifier] === 'number' ? solutionFields[identifier] : 0;
  };
  
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
  ) => {
    if (!solutions) return [] as { solution: MobilitySolution, score: number, trafficMatch: number, pickupMatch: boolean, contributingReasons: { [reasonId: string]: number } }[];
    const scoredSolutions = solutions.map(solution => ({
      solution,
      score: calculateScoreForSolution(solution, currentFilters),
      trafficMatch: getTrafficTypeMatchScore(solution),
      pickupMatch: getPickupPreferenceMatch(solution),
      contributingReasons: getReasonScores(solution, currentFilters)
    }));
    scoredSolutions.sort((a, b) => {
      if (a.pickupMatch !== b.pickupMatch) return b.pickupMatch ? 1 : -1;
      if (b.trafficMatch !== a.trafficMatch) return b.trafficMatch - a.trafficMatch;
      return b.score - a.score;
    });
    return scoredSolutions;
  }, [calculateScoreForSolution, getTrafficTypeMatchScore, getPickupPreferenceMatch, getReasonScores]);
  
  const processedSolutions = useMemo(() => {
    if (!mobilitySolutions || !reasons) {
      return { filtered: [], grouped: {} as Record<string, any[]> };
    }
    
    let filteredSolutions = [...mobilitySolutions]; 
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];
    
    let reasonsToScoreBy: string[] = activeFilters;
    if (activeFilters.length > 0) {
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
    
    const sortedAndScored = sortSolutionsByScore(filteredSolutions, reasonsToScoreBy, currentTrafficTypes); 
    
    type ScoredSolutionItem = { solution: MobilitySolution, score: number, trafficMatch: number, pickupMatch: boolean, contributingReasons: { [reasonId: string]: number } };
    const grouped: Record<string, ScoredSolutionItem[]> = sortedAndScored.reduce((acc, item) => {
      const category = item.solution.category || 'Onbekend';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ScoredSolutionItem[]>);
    
    return { filtered: sortedAndScored, grouped };
  }, [mobilitySolutions, reasons, businessParkInfo.trafficTypes, businessParkInfo.employeePickupPreference, activeFilters, calculateScoreForSolution, getTrafficTypeMatchScore, getPickupPreferenceMatch, getReasonScores, sortSolutionsByScore]);
  
  const getComparisonSolutions = useCallback(() => {
    const hasSelectedSolutions = selectedSolutions.length > 0;
    if (hasSelectedSolutions) {
      const selectedSolutionObjects = mobilitySolutions?.filter(sol => selectedSolutions.includes(sol.id)) || [];
      const selectedContributingReasons: { [solutionId: string]: { [reasonId: string]: number } } = {};
      selectedSolutionObjects.forEach(solution => {
        selectedContributingReasons[solution.id] = getReasonScores(solution, activeFilters);
      });
      return { solutions: selectedSolutionObjects, contributingReasons: selectedContributingReasons };
    } else {
      const topSolutions = processedSolutions.filtered.slice(0, 3).map(item => item.solution);
      const topContributingReasons: { [solutionId: string]: { [reasonId: string]: number } } = {};
      topSolutions.forEach(solution => {
        topContributingReasons[solution.id] = getReasonScores(solution, activeFilters);
      });
      return { solutions: topSolutions, contributingReasons: topContributingReasons };
    }
  }, [selectedSolutions, mobilitySolutions, processedSolutions.filtered, getReasonScores, activeFilters]);
  
  const handleOpenComparison = () => setIsComparisonModalOpen(true);
  const handleCloseComparison = () => setIsComparisonModalOpen(false);
  
  const handleShowMoreInfo = (solution: MobilitySolution) => {
    if (!governanceModels) return;
    const relevantVariationsForDialog = allVariations?.filter((v: ImplementationVariation) => v.title?.startsWith(solution.title)) || [];
    openSolutionDialog(solution, governanceModels, relevantVariationsForDialog);
  };
  
  const handleFilterChange = (reasonId: string) => {
    const nextActiveFilters = activeFilters.includes(reasonId)
      ? activeFilters.filter(id => id !== reasonId)
      : [...activeFilters, reasonId];
    setActiveFilters(nextActiveFilters);
    setSelectedReasons(nextActiveFilters);
  };
  
  const handleTrafficTypeFilterChange = (type: TrafficType) => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || []; 
    const newTypes = currentTrafficTypes.includes(type)
      ? currentTrafficTypes.filter(t => t !== type)
      : [...currentTrafficTypes, type];
    updateTrafficTypes(newTypes);
  };
  
  const hasSelectedSolutions = selectedSolutions.length > 0;
  
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
          <div className="md:col-span-1 space-y-8 md:sticky md:top-28">
            <WizardChoicesSummary />
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
            <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
                <p className="text-gray-600 text-sm">
                  Op basis van uw gekozen aanleidingen, presenteren we hier de meest relevante collectieve vervoersoplossingen. 
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
                  <span>Selecteer één oplossing om door te gaan</span>
                </div>
              </div>
            </div>
          </div>
  
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg p-8 shadow-even">
              <h2 className="text-2xl font-bold mb-4">Oplossingen</h2>
              <p className="mb-6">
                Op basis van de door u geselecteerde aanleidingen, kunt u hier de gewenste collectieve vervoersoplossing selecteren.
              </p>
  
              {processedSolutions.filtered.length > 0 && (
                <SolutionComparisonBanner
                  onCompare={handleOpenComparison}
                  selectedSolutionsCount={selectedSolutions.length}
                  topSolutionsCount={Math.min(3, processedSolutions.filtered.length)}
                />
              )}
  
              <div className="space-y-8 mt-8">
                {Object.entries(processedSolutions.grouped).length > 0 ? (
                  Object.entries(processedSolutions.grouped).map(([group, solutions]) => (
                    <div key={group} className="mb-6">
                      {group && group.toLowerCase() !== 'onbekend' && (
                        <h3 className="text-xl font-semibold mb-3 text-blue-600">{group}</h3>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {solutions.map((scoredSolution: any) => {
                          const { solution, score, trafficMatch, pickupMatch, contributingReasons } = scoredSolution;
                          const relevantVariationsForCard = allVariations?.filter((v: ImplementationVariation) => v.title?.startsWith(solution.title)) || [];
                          return (
                            <SolutionCard
                              key={solution.id}
                              solution={solution}
                              isSelected={selectedSolutions.includes(solution.id)}
                              onToggleSelect={() => toggleSolution(solution.id)}
                              variationsData={relevantVariationsForCard}
                              score={score}
                              trafficTypeMatchScore={trafficMatch}
                              pickupPreferenceMatch={pickupMatch}
                              userPickupPreference={businessParkInfo.employeePickupPreference}
                              contributingReasons={contributingReasons}
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
          previousStep="/wizard/aanleidingen"
          nextStep="/wizard/implementatievarianten"
          isNextDisabled={!hasSelectedSolutions}
        />
  
        {(() => {
          const comparisonData = getComparisonSolutions();
          return (
            <SolutionComparisonModal
              isOpen={isComparisonModalOpen}
              onClose={handleCloseComparison}
              solutions={comparisonData.solutions}
              reasonsData={reasons || []}
              activeReasonFilters={activeFilters}
              activeTrafficTypes={businessParkInfo.trafficTypes || []}
              userPickupPreference={businessParkInfo.employeePickupPreference}
              contributingReasons={comparisonData.contributingReasons}
            />
          );
        })()}
      </div>
    </>
  );
}

 


