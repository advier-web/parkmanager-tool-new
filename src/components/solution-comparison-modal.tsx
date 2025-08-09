'use client';

import React from 'react';
import { MobilitySolution, BusinessParkReason, TrafficType } from '../domain/models';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface SolutionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutions: MobilitySolution[];
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
  reasonsData,
  activeReasonFilters,
  activeTrafficTypes,
  userPickupPreference,
  contributingReasons
}: SolutionComparisonModalProps) {
  if (!isOpen) return null;

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
      } else if (userPickupPreference === 'locatie' && option.toLowerCase().includes('locatie')) {
        optionMatches = true;
      }
    }
    return (
      <div className={`w-2.5 h-2.5 rounded-full ${optionMatches ? 'bg-green-500' : 'bg-red-500'}`}></div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
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
            
            {/* Solution Title Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Oplossing</h3>
              </div>
              {solutions.map((solution) => (
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
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Samenvatting</h3>
              </div>
              {solutions.map((solution) => (
                <div key={`${solution.id}-summary`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                    <MarkdownContent content={processMarkdownText(solution.samenvattingKort || solution.samenvattingLang || solution.description || '')} />
                  </div>
                </div>
              ))}
            </div>

            {/* Minimum aantal personen Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Minimum aantal personen</h3>
              </div>
              {solutions.map((solution) => (
                <div key={`${solution.id}-min-persons`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div className="text-sm text-gray-700">
                    {solution.minimumAantalPersonen || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Minimale investering Row */}
            <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">Minimale investering</h3>
              </div>
              {solutions.map((solution) => (
                <div key={`${solution.id}-investment`} className="border-l border-gray-200 pl-4 flex items-center">
                  <div className="text-sm text-gray-700">
                    {solution.minimaleInvestering || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Afstand Row */}
            <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="flex items-start">
                <h3 className="font-medium text-gray-900">Afstand</h3>
              </div>
              {solutions.map((solution) => (
                <div key={`${solution.id}-distance`} className="border-l border-gray-200 pl-4">
                  <div className="text-sm text-gray-700">
                    {solution.afstand || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Traffic Types Row */}
            {activeTrafficTypes.length > 0 && (
              <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Geschikt voor vervoer</h3>
                </div>
                {solutions.map((solution) => (
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

            {/* Reason Contributions Row */}
            {activeReasonFilters.length > 0 && (
              <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Bijdrage aan selectie</h3>
                </div>
                {solutions.map((solution) => (
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

            {/* Pickup Options Row */}
            {userPickupPreference && solutions.some(s => s.ophalen && s.ophalen.length > 0) && (
              <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
                <div className="flex items-start">
                  <h3 className="font-medium text-gray-900">Deel van de woon-werkreis</h3>
                </div>
                {solutions.map((solution) => (
                  <div key={`${solution.id}-pickup`} className="border-l border-gray-200 pl-4">
                    {solution.ophalen && solution.ophalen.length > 0 ? (
                      <div className="space-y-1">
                        {solution.ophalen.map((option, index) => {
                          const display = option === 'thuis' ? 'Voor de hele reis' : option === 'locatie' ? 'Voor een gedeelte van de reis' : option;
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
