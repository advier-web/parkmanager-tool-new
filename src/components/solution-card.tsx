import { MobilitySolution, BusinessParkReason, TrafficType, GovernanceModel, ImplementationVariation } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { useDialog } from '../contexts/dialog-context';
import MobilitySolutionFactsheetButton from './mobility-solution-factsheet-button';
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';

interface SolutionCardProps {
  solution: MobilitySolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
  onMoreInfo?: (solution: MobilitySolution) => void;
  activeTrafficTypes?: TrafficType[];
  reasonsData: BusinessParkReason[];
  contributingReasons: { [reasonId: string]: number };
  activeReasonFilters: string[];
  score: number;
  trafficTypeMatchScore: number;
  pickupPreferenceMatch?: boolean;
  userPickupPreference?: 'thuis' | 'locatie' | null;
  variationsData?: ImplementationVariation[];
}

export function SolutionCard({ 
  solution, 
  isSelected, 
  onToggleSelect, 
  onMoreInfo, 
  activeTrafficTypes = [], 
  variationsData = [], 
  reasonsData,
  contributingReasons,
  activeReasonFilters,
  score,
  trafficTypeMatchScore,
  pickupPreferenceMatch = true,
  userPickupPreference = null,
}: SolutionCardProps) {
  const { openSolutionDialog } = useDialog();
  const [visibleTooltips, setVisibleTooltips] = useState<Record<string, boolean>>({});
  
  // Toggle tooltip zichtbaarheid
  const toggleTooltip = (reasonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleTooltips(prev => ({ ...prev, [reasonId]: !prev[reasonId] }));
  };
  
  // Helper functie om verklarende tekst voor een score te genereren
  const getExplanationText = (score: number, reasonIdentifier: string | undefined, reasonTitle: string) => {
    const explanationFieldMap: Record<string, keyof MobilitySolution> = {
      'parkeer_bereikbaarheidsproblemen': 'parkeerBereikbaarheidsproblemenToelichting',
      'bereikbaarheidsproblemen': 'bereikbaarheidsproblemenToelichting',
      'waarde_vastgoed': 'waardeVastgoedToelichting',
      'personeelszorg_en_behoud': 'personeelszorgEnBehoudToelichting',
      'vervoerkosten': 'vervoerkostenToelichting',
      'gezondheid': 'gezondheidToelichting',
      'gastvrijheid': 'gastvrijheidToelichting',
      'imago': 'imagoToelichting',
      'milieuverordening': 'milieuverordeningToelichting',
      'bedrijfsverhuizing': 'bedrijfsverhuizingToelichting',
      'energiebalans': 'energiebalansToelichting'
    };
    
    const explanationField = reasonIdentifier ? explanationFieldMap[reasonIdentifier.toLowerCase()] : undefined;
    const explanation = explanationField ? solution[explanationField] : undefined;
    
    if (explanation && typeof explanation === 'string') {
      return explanation;
    }
    
    const displayTitle = reasonTitle || reasonIdentifier || 'deze aanleiding';
    if (score >= 7) {
      return `Deze oplossing scoort hoog (${score}/10) voor ${displayTitle} omdat het direct bijdraagt aan het verminderen van deze problematiek.`;
    } else if (score >= 4) {
      return `Deze oplossing scoort gemiddeld (${score}/10) voor ${displayTitle} omdat het een gedeeltelijke bijdrage levert aan het verminderen van deze problematiek.`;
    } else {
      return `Deze oplossing scoort laag (${score}/10) voor ${displayTitle} omdat het maar een beperkte bijdrage levert aan het verminderen van deze problematiek.`;
    }
  };
  
  // Render de score indicator voor een AANLEIDING ID
  const renderScoreIndicator = (reasonId: string) => {
    const reason = reasonsData.find(r => r.id === reasonId);
    if (!reason || reason.title.toLowerCase() === "ik weet het nog niet") {
      return null;
    }

    const reasonIdentifier = reason.identifier;
    const scoreForReason = contributingReasons[reasonId] ?? 0;

    const isTooltipVisible = !!visibleTooltips[reason.id];
    let color = 'bg-gray-400';
    let label = '';

    const reasonTitleLower = reason.title.toLowerCase();

    if (scoreForReason >= 7) {
      color = 'bg-green-500';
      label = `Deze oplossing draagt veel bij aan ${reasonTitleLower}`;
    } else if (scoreForReason >= 4) {
      color = 'bg-orange-500';
      label = `Deze oplossing draagt enigszins bij aan ${reasonTitleLower}`;
    } else if (scoreForReason > 0) {
      color = 'bg-red-500';
      label = `Deze oplossing draagt weinig bij aan ${reasonTitleLower}`;
    } else {
       label = `Deze oplossing draagt niet/nauwelijks bij aan ${reasonTitleLower}`;
    }

    return (
      <div key={reason.id} className="mt-1">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
          <span className="text-xs text-gray-600">{label}</span>
          <button 
            onClick={(e) => toggleTooltip(reason.id, e)}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={`Toon uitleg voor ${reason.title}`}
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>
        
        {isTooltipVisible && (
          <div className="ml-5 mt-1 p-2 bg-gray-50 text-xs text-gray-600 rounded border border-gray-200 shadow-sm">
            {getExplanationText(scoreForReason, reasonIdentifier, reason.title)}
          </div>
        )}
      </div>
    );
  };
  
  const handleShowMoreInfo = () => {
    const placeholderGovernanceModels: GovernanceModel[] = []; 
    openSolutionDialog(solution, placeholderGovernanceModels, variationsData);
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg transition-all cursor-pointer 
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-lg' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
      onClick={() => onToggleSelect(solution.id)}
    >
      <div className="flex items-start pr-8">
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            {solution.icon && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-600 text-xl">{getIconDisplay(solution.icon)}</span>
              </div>
            )}
            <h3 className="text-lg font-medium text-gray-900">{solution.title}</h3>
          </div>
          
          <div className="text-gray-600 mb-3 prose prose-sm max-w-none">
             <MarkdownContent content={processMarkdownText(solution.samenvattingKort || solution.samenvattingLang || solution.description || '')} />
          </div>

          {/* Two-column details layout */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-3 text-xs">
              {solution.minimumAantalPersonen && (
                <div className="text-gray-700">
                  <div className="font-medium mb-1">Minimum aantal personen:</div>
                  <div>{solution.minimumAantalPersonen}</div>
                </div>
              )}
              {solution.minimaleInvestering && (
                <div className="text-gray-700">
                  <div className="font-medium mb-1">Minimale investering:</div>
                  <div>{solution.minimaleInvestering}</div>
                </div>
              )}
              {solution.afstand && (
                <div className="text-gray-700">
                  <div className="font-medium mb-1">Afstand:</div>
                  <div>{solution.afstand}</div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-3 text-xs">
              {activeTrafficTypes && activeTrafficTypes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Geschikt voor vervoer:</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {activeTrafficTypes.map(activeType => {
                      const isMatch = solution.typeVervoer?.includes(activeType);
                      return (
                        <div key={activeType} className="flex items-center">
                          <div 
                            className={`w-2.5 h-2.5 rounded-full ${isMatch ? 'bg-green-500' : 'bg-red-500'} mr-1`}
                          ></div>
                          <span className="text-xs text-gray-600 capitalize">{activeType.replace(/-/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeReasonFilters.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Bijdrage aan selectie:</p>
                  {activeReasonFilters.map(reasonId => renderScoreIndicator(reasonId))}
                </div>
              )}

              {solution.ophalen && solution.ophalen.length > 0 && userPickupPreference && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Deel van de woon-werkreis:</p>
                  <div className="space-y-1">
                    {solution.ophalen.map((ophalenOptie, index) => {
                      let optionMatches = false;
                      if (userPickupPreference && ophalenOptie) {
                        if (userPickupPreference === 'thuis' && ophalenOptie.toLowerCase().includes('thuis')) {
                          optionMatches = true;
                        } else if (userPickupPreference === 'locatie' && ophalenOptie.toLowerCase().includes('locatie')) {
                          optionMatches = true;
                        }
                      }
                      return (
                        <div key={index} className="flex items-center">
                          <div 
                            className={`w-2.5 h-2.5 rounded-full ${optionMatches ? 'bg-green-500' : 'bg-red-500'} mr-1`}
                          ></div>
                          <span className="text-xs text-gray-600">
                            {ophalenOptie && ophalenOptie.toLowerCase().includes('thuis')
                              ? 'Voor de hele reis'
                              : ophalenOptie && ophalenOptie.toLowerCase().includes('locatie')
                              ? 'Voor een gedeelte van de reis'
                              : ophalenOptie}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Benefits/Challenges moved below the two-column layout */}
          <div className="mb-4 space-y-1 text-xs">
            {(solution.benefits || []).slice(0, 1).map((benefit, index) => (
              <div key={`benefit-${index}`} className="flex items-center text-green-700">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>{benefit}</span>
              </div>
            ))}
            {(solution.challenges || []).slice(0, 1).map((challenge, index) => (
              <div key={`challenge-${index}`} className="flex items-center text-red-700">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                <span>{challenge}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 text-xs">
            {solution.costs && (
              <div className="flex items-center bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                <span className="font-medium mr-1">Kosten:</span>
                <span>{solution.costs}</span>
              </div>
            )}
            {solution.implementationTime && (
              <div className="flex items-center bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                <span className="font-medium mr-1">Tijd:</span>
                <span>{solution.implementationTime}</span>
              </div>
            )}
          </div>

          {onMoreInfo && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleShowMoreInfo();
                }}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none"
              >
                <InformationCircleIcon className="h-3.5 w-3.5 mr-1" />
                Meer informatie & Varianten
              </button>
              <div onClick={(e) => e.stopPropagation()} /* Prevent card click */>
                <MobilitySolutionFactsheetButton
                  solution={solution}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none"
                  buttonColorClassName="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 p-0 shadow-none font-normal cursor-pointer text-sm"
                >
                  <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                  {`Download factsheet ${solution.title}`}
                </MobilitySolutionFactsheetButton>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 mt-[22px]">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded shadow-sm"
            checked={isSelected}
            onChange={() => { /* Outer div handles toggle */ }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}

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