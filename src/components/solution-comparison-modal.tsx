'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MobilitySolution, BusinessParkReason, TrafficType } from '../domain/models';
import { buildNonHeadlessUiOverlayClasses, buildNonHeadlessUiPanelClasses } from '@/components/ui/modal-anim';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface SolutionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Pass ALL solutions here in the same order as shown on the page
  solutions: MobilitySolution[];
  // Which solutions should be selected when the modal opens
  initialSelectedIds: string[];
  reasonsData: BusinessParkReason[];
  activeReasonFilters: string[];
  activeTrafficTypes: TrafficType[];
  userPickupPreference?: 'thuis' | 'locatie' | null;
  contributingReasons: { [solutionId: string]: { [reasonId: string]: number } };
}

export function SolutionComparisonModal({
  isOpen,
  onClose,
  solutions,
  initialSelectedIds,
  reasonsData,
  activeReasonFilters,
  activeTrafficTypes,
  userPickupPreference,
  contributingReasons
}: SolutionComparisonModalProps) {
  const ANIMATION_MS = 600;

  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      setShouldRender(true);
      setIsExiting(false);
      setIsVisible(false);
      // Trigger enter transition on next frame
      requestAnimationFrame(() => setIsVisible(true));
    } else if (shouldRender) {
      setIsExiting(true);
      setIsVisible(false);
      exitTimerRef.current = window.setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, ANIMATION_MS);
    }
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, [isOpen, shouldRender]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const visibleSolutions = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const filtered = solutions.filter(s => selectedSet.size === 0 ? true : selectedSet.has(s.id));
    return filtered;
  }, [solutions, selectedIds]);

  // Helper function to get pickup preference match for a solution
  const getPickupPreferenceMatch = (solution: MobilitySolution): boolean => {
    if (!userPickupPreference || !solution.ophalen) return true;
    
    if (userPickupPreference === 'thuis') {
      return solution.ophalen.some(option => option.toLowerCase().includes('thuis'));
    } else if (userPickupPreference === 'locatie') {
      return solution.ophalen.some(option => option.toLowerCase().includes('locatie'));
    }
    
    return true;
  };

  // Helper function to render score indicator
  const renderScoreIndicator = (score: number) => {
    let color = 'bg-gray-400';
    if (score >= 7) {
      color = 'bg-green-500';
    } else if (score >= 4) {
      color = 'bg-orange-500';
    } else if (score > 0) {
      color = 'bg-red-500';
    }
    return <div className={`w-3 h-3 rounded-full ${color}`}></div>;
  };

  // Helper function to render traffic type match
  const renderTrafficTypeMatch = (solution: MobilitySolution, trafficType: TrafficType) => {
    const isMatch = solution.typeVervoer?.includes(trafficType);
    return (
      <div className={`w-2.5 h-2.5 rounded-full ${isMatch ? 'bg-green-500' : 'bg-red-500'}`}></div>
    );
  };

  // Helper function to render pickup preference match
  const renderPickupMatch = (solution: MobilitySolution, option: string) => {
    let optionMatches = false;
    if (userPickupPreference && option) {
      if (userPickupPreference === 'thuis' && option.toLowerCase().includes('thuis')) {
        optionMatches = true;
      } else if (userPickupPreference === 'locatie' && (option.toLowerCase().includes('laatste') || option.toLowerCase().includes('locatie'))) {
        optionMatches = true;
      }
    }
    return (
      <div className={`w-2.5 h-2.5 rounded-full ${optionMatches ? 'bg-green-500' : 'bg-red-500'}`}></div>
    );
  };

  const overlayClasses = buildNonHeadlessUiOverlayClasses(isVisible);
  const panelClasses = buildNonHeadlessUiPanelClasses(isVisible, 'relative bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl');

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={overlayClasses} />
      <div className={panelClasses}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vergelijk oplossingen</h2>
            <p className="text-gray-600 mt-1">Bekijk de belangrijkste verschillen tussen de oplossingen</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-1">
            
            {/* Selection controls */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Kies welke oplossingen je wilt vergelijken</h3>
                <div className="text-sm text-gray-500">{selectedIds.length} geselecteerd</div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {solutions.map((sol) => {
                    const isActive = selectedIds.includes(sol.id);
                    return (
                      <button
                        key={`select-${sol.id}`}
                        onClick={() => toggleSelected(sol.id)}
                        className={`${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-md text-sm whitespace-nowrap border border-gray-200 hover:bg-blue-600/10 hover:text-gray-900`}
                        title={sol.title || ''}
                      >
                        {sol.icon && <span className="mr-1">{getIconDisplay(sol.icon)}</span>}
                        {sol.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Solution Title Row (sticky) */}
            <div
              className="grid bg-gray-50 rounded-lg p-3 sticky top-0 z-10 shadow-sm"
              style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}
            >
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Oplossing</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-title`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div>
                    <h4 className="font-semibold text-lg text-blue-600 leading-tight">{solution.title}</h4>
                    {solution.icon && (
                      <span className="text-xl mt-0.5 block">{getIconDisplay(solution.icon)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
               <h3 className="font-medium text-gray-900">Samenvatting</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-summary`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                    <MarkdownContent content={processMarkdownText(solution.samenvattingKort || solution.samenvattingLang || solution.description || '')} />
                  </div>
                </div>
              ))}
            </div>

            {/* wanneerRelevant Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Wanneer relevant</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-wanneer`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.wanneerRelevant || '-'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Minimale investering Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Minimale investering</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-investment`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div className="text-sm text-gray-700">
                    {solution.minimaleInvestering || '-'}
                  </div>
                </div>
              ))}
            </div>            

            {/* Minimum aantal personen Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Minimum aantal personen</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-min-persons`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div className="text-sm text-gray-700">
                    {solution.minimumAantalPersonen || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Moeilijkheidsgraad Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Moeilijkheidsgraad</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-difficulty`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div className="text-sm text-gray-700">
                    {solution.moeilijkheidsgraad || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* schaalbaarheid Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Schaalbaarheid</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-schaalbaarheid`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.schaalbaarheid || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* impact Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Impact</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-impact`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.impact || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* ruimtebeslag Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Ruimtebeslag</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-ruimtebeslag`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.ruimtebeslag || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* afhankelijkheid externe partijen Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Afhankelijkheid externe partijen</h3>
              </div>
              {visibleSolutions.map((solution) => (
                <div key={`${solution.id}-extern`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.afhankelijkheidExternePartijen || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Traffic Types Row */}
            {activeTrafficTypes.length > 0 && (
              <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Geschikt voor vervoer</h3>
                </div>
                {visibleSolutions.map((solution) => (
                  <div key={`${solution.id}-traffic`} className="border-l border-gray-200 pl-4">
                    <div className="space-y-1">
                      {activeTrafficTypes.map(trafficType => (
                        <div key={trafficType} className="flex items-center gap-2">
                          {renderTrafficTypeMatch(solution, trafficType)}
                          <span className="text-xs text-gray-600 capitalize">
                            {trafficType.replace(/-/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pickup Options Row */}
            {userPickupPreference && solutions.some(s => s.ophalen && s.ophalen.length > 0) && (
              <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Deel van de woon-werkreis</h3>
                </div>
                {visibleSolutions.map((solution) => (
                  <div key={`${solution.id}-pickup`} className="border-l border-gray-200 pl-4">
                    {solution.ophalen && solution.ophalen.length > 0 ? (
                      <div className="space-y-1">
                        {solution.ophalen.map((option, index) => {
                          const lower = (option || '').toLowerCase();
                          const display = lower.includes('thuis')
                            ? 'Voor de hele reis'
                            : (lower.includes('laatste') || lower.includes('locatie'))
                            ? 'Voor het laatste deel van de reis'
                            : option;
                          return (
                            <div key={index} className="flex items-center gap-2">
                              {renderPickupMatch(solution, option)}
                              <span className="text-xs text-gray-600">{display}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reason Contributions Row (moved below pickup row) */}
            {activeReasonFilters.length > 0 && (
              <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${visibleSolutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Bijdrage aan selectie</h3>
                </div>
                {visibleSolutions.map((solution) => (
                  <div key={`${solution.id}-reasons`} className="border-l border-gray-200 pl-4">
                    <div className="space-y-1">
                      {activeReasonFilters.map(reasonId => {
                        const reason = reasonsData.find(r => r.id === reasonId);
                        if (!reason || reason.title.toLowerCase() === "ik weet het nog niet") {
                          return null;
                        }
                        const score = contributingReasons[solution.id]?.[reasonId] ?? 0;
                        return (
                          <div key={reasonId} className="flex items-center gap-2">
                            {renderScoreIndicator(score)}
                            <span className="text-xs text-gray-600">{reason.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleSolutions.length === 0 && (
              <div className="mt-4 p-4 text-center text-sm text-gray-600">Selecteer minimaal één oplossing om te vergelijken.</div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for icon display
function getIconDisplay(icon: string): string {
  switch (icon?.toLowerCase()) {
    case 'fiets': return '🚲';
    case 'bus': return '🚌';
    case 'trein': return '🚆';
    case 'auto': return '🚗';
    case 'scooter': return '🛵';
    case 'lopen': return '🚶';
    default: return '⚙️';
  }
}
