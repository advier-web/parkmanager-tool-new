import { MobilitySolution, BusinessParkReason, TrafficType, GovernanceModel, ImplementationVariation } from '../domain/models';
import { InformationCircleIcon, DocumentTextIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon, CurrencyEuroIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { useDialog } from '../contexts/dialog-context';
import MobilitySolutionFactsheetButton from './mobility-solution-factsheet-button';
import { DocumentArrowDownIcon, BookOpenIcon } from '@heroicons/react/24/solid';

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
  userPickupPreference?: 'thuis' | 'locatie' | 'ov' | null;
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
  const { openSolutionCasesDialog } = useDialog() as any;
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
      label = `Draagt veel bij aan ${reasonTitleLower}`;
    } else if (scoreForReason >= 4) {
      color = 'bg-yellow-400';
      label = `Draagt enigszins bij aan ${reasonTitleLower}`;
    } else if (scoreForReason > 0) {
      color = 'bg-red-500';
      label = `Draagt weinig bij aan ${reasonTitleLower}`;
    } else {
       label = `Draagt niet/nauwelijks bij aan ${reasonTitleLower}`;
    }

    return (
      <div key={reason.id} className="mt-1">
        <div className="flex items-start gap-2">
          {scoreForReason >= 7 ? (
            // Green check
            <svg className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : scoreForReason >= 4 ? (
            // Amber question mark icon (outline) to match style of check/cross
            <QuestionMarkCircleIcon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          ) : scoreForReason > 0 ? (
            // Red cross
            <svg className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            // Gray dot for no/neutral contribution
            <div className={`w-3 h-3 rounded-full bg-gray-400 mt-0.5 flex-shrink-0`}></div>
          )}
          <div className="text-sm text-gray-600 leading-snug">
            <span>{label}</span>
            <button 
              onClick={(e) => toggleTooltip(reason.id, e)}
              className="ml-1 inline text-gray-400 hover:text-gray-600 align-middle focus:outline-none"
              aria-label={`Toon uitleg voor ${reason.title}`}
            >
              <InformationCircleIcon className="h-5 w-5 inline align-middle" />
            </button>
          </div>
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

  const openSolutionCases = () => {
    openSolutionCasesDialog(solution);
  };

  return (
    <div
      className={`
        relative p-8 rounded-lg transition-all cursor-pointer w-full
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-lg' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
      onClick={() => onToggleSelect(solution.id)}
    >
      <div className="flex items-start pr-8">
        <div className="flex-grow min-w-0">
          <div className="flex items-center mb-4">
            {solution.icon && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-600 text-xl">{getIconDisplay(solution.icon)}</span>
              </div>
            )}
            <h3 className="text-lg font-medium">{solution.title}</h3>
          </div>
          
          <div className="text-gray-600 mb-3 prose prose-sm max-w-none whitespace-normal break-normal [hyphens:auto]">
             <MarkdownContent content={processMarkdownText(solution.samenvattingKort || solution.samenvattingLang || solution.description || '')} />
          </div>

          {/* Two-column details layout */}
          <div className="mt-3 pt-3 border-t border-gray-100 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: labels replaced by icons */}
            <div className="space-y-3 text-sm text-gray-700">
              {solution.minimumAantalPersonen && (
                <div className="flex items-start">
                  <UserGroupIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-semibold mr-1">Minimum aantal personen:</span>
                    <span>{solution.minimumAantalPersonen}</span>
                  </div>
                </div>
              )}
              {solution.minimaleInvestering && (
                <div className="flex items-start">
                  <CurrencyEuroIcon className="h-4 w-4 text-emerald-600 mr-2 mt-0.5" />
                  <div className="text-gray-800">
                    <span className="font-semibold mr-1">Investering:</span>
                    <span>{solution.minimaleInvestering}</span>
                  </div>
                </div>
              )}
              {solution.afhankelijkheidExternePartijen && (
                <div className="flex items-start">
                  <svg className="h-4 w-4 text-blue-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 00-4 4v2H5a3 3 0 000 6h3v-2H5a1 1 0 110-2h1v2a4 4 0 008 0v-2h1a3 3 0 100-6h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4zm2 2h1a1 1 0 110 2h-1v-2z" /></svg>
                  <div className="text-gray-800">
                    <span className="font-semibold mr-1">Afhankelijkheid externe partijen:</span>
                    <span>{solution.afhankelijkheidExternePartijen}</span>
                  </div>
                </div>
              )}
              {/* Afstand veld verwijderd uit app */}
            </div>

            {/* Right column */}
            <div className="space-y-3 text-sm">
              {activeTrafficTypes && activeTrafficTypes.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {activeTrafficTypes.map(activeType => {
                      const isMatch = solution.typeVervoer?.includes(activeType);
                      return (
                        <div key={activeType} className="flex items-center">
                          {isMatch ? (
                            <svg className="h-4 w-4 text-emerald-600 mr-1.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-rose-600 mr-1.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          <span className="text-sm text-gray-600 capitalize">{activeType.replace(/-/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeReasonFilters.length > 0 && (
                <div>
                  {activeReasonFilters.map(reasonId => renderScoreIndicator(reasonId))}
                </div>
              )}

              {solution.ophalen && solution.ophalen.length > 0 && userPickupPreference && (
                <div>
                  <div className="space-y-1">
                    {solution.ophalen.map((ophalenOptie, index) => {
                      let optionMatches = false;
                      if (userPickupPreference && ophalenOptie) {
                        const txt = ophalenOptie.toLowerCase();
                        const isHeleReis = txt.includes('thuis') || txt.includes('hele reis') || txt.includes('hele');
                        const isLaatsteDeel = txt.includes('ov-knooppunt') || txt.includes('ov knooppunt') || txt.includes('p+r') || txt.includes('locatie') || txt.includes('laatste');
                        const isOvAansluiting = txt.includes('ov') && (txt.includes('aansluiting') || txt.includes('ov-reis') || txt.includes('ov reis'));
                        if (userPickupPreference === 'thuis' && isHeleReis) {
                          optionMatches = true;
                        } else if (userPickupPreference === 'locatie' && isLaatsteDeel) {
                          optionMatches = true;
                        } else if (userPickupPreference === 'ov' && isOvAansluiting) {
                          optionMatches = true;
                        }
                      }
                      return (
                        <div key={index} className="flex items-center">
                          {optionMatches ? (
                            <svg className="h-4 w-4 text-emerald-600 mr-1.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-rose-600 mr-1.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          <span className="text-sm text-gray-600">
                            {(() => {
                              const txt = (ophalenOptie || '').toLowerCase();
                              if (txt.includes('thuis') || txt.includes('hele reis')) return 'Voor de hele reis';
                              if (txt.includes('ov-knooppunt') || txt.includes('ov knooppunt') || txt.includes('p+r') || txt.includes('locatie') || txt.includes('laatste')) return 'Tussen OV-knooppunt of P+R terrein en bedrijventerrein';
                              if (txt.includes('aansluiting') && txt.includes('ov')) return 'Aansluiting bedrijventerrein op OV (als onderdeel hele OV-reis)';
                              return ophalenOptie;
                            })()}
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
          <div className="mb-4 space-y-1 text-xs whitespace-normal break-normal [hyphens:auto]">
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
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-3">
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleShowMoreInfo();
                  }}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none w-full md:w-auto text-left justify-start"
                >
                  <InformationCircleIcon className="h-5 w-5 mr-1" />
                  Meer informatie
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSolutionCases();
                  }}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none w-full md:w-auto text-left justify-start"
                >
                  <EyeIcon className="h-5 w-5 mr-1" />
                  Bekijk cases
                </button>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <MobilitySolutionFactsheetButton
                  solution={solution}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none w-full md:w-auto text-left"
                    buttonColorClassName="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-700 p-0 shadow-none font-normal cursor-pointer text-sm h-auto has-[>svg]:px-0 gap-1.5 w-full md:w-auto justify-start text-left"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-1" />
                  Download factsheet
                </MobilitySolutionFactsheetButton>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-pressed={isSelected}
          onClick={(e) => { e.stopPropagation(); onToggleSelect(solution.id); }}
          className={`absolute top-2 right-2 mt-[22px] h-5 w-5 rounded border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} flex items-center justify-center shadow-sm`}
        >
          {isSelected && (
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 103.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd"/></svg>
          )}
        </button>
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