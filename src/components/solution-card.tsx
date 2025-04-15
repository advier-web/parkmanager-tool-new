import { MobilitySolution, BusinessParkReason, TrafficType } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface SolutionCardProps {
  solution: MobilitySolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
  onMoreInfo?: (solution: MobilitySolution) => void;
  selectedReasons?: BusinessParkReason[];
  activeTrafficTypes?: TrafficType[];
}

export function SolutionCard({ solution, isSelected, onToggleSelect, onMoreInfo, selectedReasons = [], activeTrafficTypes = [] }: SolutionCardProps) {
  // State om bij te houden welke tooltips zichtbaar zijn
  const [visibleTooltips, setVisibleTooltips] = useState<Record<string, boolean>>({});
  
  // Helper function om score te vinden voor een identifier (case-insensitief)
  const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
    console.log(`[findScoreForIdentifier] Searching for identifier: '${identifier}' in solution: ${solution.title}`);
    if (!identifier) {
      console.log(`[findScoreForIdentifier] Identifier is empty, returning 0.`);
      return 0;
    }
    
    const identifierLower = identifier.toLowerCase();
    
    // Bekende mappings
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
      ],
      'bereikbaarheidsproblemen': [
        'parkeer_bereikbaarheidsproblemen', 
        'Parkeer- en bereikbaarheidsprobleem',
        'Parkeer- en bereikbaarheidsproblemen',
        'parkeer_en_bereikbaarheidsproblemen',
        'Parkeer en bereikbaarheidsprobleem',
        'parkeerprobleem',
        'bereikbaarheidsprobleem'
      ],
      'imago': ['imago', 'Imago'],
      'milieuverordening': ['milieuverordening', 'Milieuverordening'],
      'waarde_vastgoed': ['waarde_vastgoed', 'waardeVastgoed'],
      // Add other identifiers if needed
    };
    
    // Probeer eerst directe match (lowercase)
    let directValue = solution[identifierLower as keyof MobilitySolution];
    if (typeof directValue === 'number') {
      console.log(`[findScoreForIdentifier] Found direct match (lowercase key): '${identifierLower}' with score: ${directValue}`);
      return directValue;
    }

    // Probeer via mappings
    const variants = mappings[identifierLower] || [identifierLower]; 
    console.log(`[findScoreForIdentifier] Checking variants based on mapping for '${identifierLower}': ${variants.join(', ')}`);

    for (const variant of variants) {
      // Check exact variant key
      let value = solution[variant as keyof MobilitySolution];
      if (typeof value === 'number') {
        console.log(`[findScoreForIdentifier] Found score via variant '${variant}': ${value}`);
        return value;
      }
      // Check lowercase variant key
      value = solution[variant.toLowerCase() as keyof MobilitySolution];
       if (typeof value === 'number') {
        console.log(`[findScoreForIdentifier] Found score via lowercase variant '${variant.toLowerCase()}': ${value}`);
        return value;
      }
    }
    
    console.log(`[findScoreForIdentifier] No score found for identifier '${identifier}' or its variants.`);
    return 0;
  };
  
  // Toggle tooltip zichtbaarheid
  const toggleTooltip = (reasonId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Voorkom dat de kaart wordt geselecteerd bij klikken op tooltip
    setVisibleTooltips(prev => ({
      ...prev,
      [reasonId]: !prev[reasonId]
    }));
  };
  
  // Helper functie om verklarende tekst voor een score te genereren
  const getExplanationText = (score: number, reasonIdentifier: string, reasonTitle: string) => {
    // Map van identifier naar toelichting veld naam
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
    
    // Haal het juiste toelichting veld op basis van de IDENTIFIER
    const explanationField = reasonIdentifier ? explanationFieldMap[reasonIdentifier.toLowerCase()] : undefined;
    if (explanationField && solution[explanationField]) {
      return solution[explanationField] as string;
    }
    
    // Fallback tekst als er geen toelichting beschikbaar is (gebruik reasonTitle voor leesbaarheid)
    const displayIdentifier = reasonTitle || reasonIdentifier;
    if (score >= 7) {
      return `Deze oplossing scoort hoog (${score}/10) voor ${displayIdentifier} omdat het direct bijdraagt aan het verminderen van deze problematiek.`;
    } else if (score >= 4) {
      return `Deze oplossing scoort gemiddeld (${score}/10) voor ${displayIdentifier} omdat het een gedeeltelijke bijdrage levert aan het verminderen van deze problematiek.`;
    } else {
      return `Deze oplossing scoort laag (${score}/10) voor ${displayIdentifier} omdat het maar een beperkte bijdrage levert aan het verminderen van deze problematiek.`;
    }
  };
  
  // Render de score indicator voor een aanleiding
  const renderScoreIndicator = (reason: BusinessParkReason) => {
    console.log(`[renderScoreIndicator] Rendering for reason: '${reason.title}', ID: '${reason.id}', Identifier: '${reason.identifier}'`);
    // Skip rendering voor "Ik weet het nog niet" aanleiding
    if (reason.title.toLowerCase() === "ik weet het nog niet") {
      return null;
    }
    
    const reasonIdentifier = reason.identifier || ''; // Use identifier if available
    if (!reasonIdentifier) {
       console.warn(`[renderScoreIndicator] Reason '${reason.title}' has no identifier! Cannot determine score reliably.`);
       // Optionally, you could try to derive identifier from title, but it's error-prone
    }

    const score = findScoreForIdentifier(solution, reasonIdentifier);
    console.log(`[renderScoreIndicator] Score found for '${reasonIdentifier}': ${score}`);
    const isTooltipVisible = !!visibleTooltips[reason.id];
    
    let color = '';
    let label = '';
    
    // Bepaal kleur en label op basis van de score
    if (score >= 7) {
      color = 'bg-green-500';
      label = `Deze oplossing draagt veel bij aan ${reason.title.toLowerCase()}`;
    } else if (score >= 4) {
      color = 'bg-orange-500';
      label = `Deze oplossing draagt enigszins bij aan ${reason.title.toLowerCase()}`;
    } else {
      color = 'bg-red-500';
      label = `Deze oplossing draagt weinig bij aan ${reason.title.toLowerCase()}`;
    }
    console.log(`[renderScoreIndicator] Determined color: ${color}`);
    
    return (
      <div key={reason.id} className="mt-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
          <span className="text-xs text-gray-600">{label}</span>
          <button 
            onClick={(e) => toggleTooltip(reason.id, e)}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Toon uitleg"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>
        
        {isTooltipVisible && (
          <div className="ml-5 mt-2 p-3 bg-gray-50 text-xs text-gray-600 rounded border border-gray-200">
            {/* Pass both identifier and title to getExplanationText */}
            {getExplanationText(score, reasonIdentifier, reason.title)}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      className={`
        p-6 rounded-lg transition-all cursor-pointer 
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
      `}
      onClick={() => onToggleSelect(solution.id)}
    >
      <div className="flex items-start">
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            {solution.icon && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">{getIconDisplay(solution.icon)}</span>
              </div>
            )}
            <h3 className="text-lg font-medium">{solution.title}</h3>
          </div>
          
          {/* Render description using MarkdownContent */}
          <div className="text-gray-600 mb-3 prose prose-sm max-w-none">
            <MarkdownContent content={processMarkdownText(solution.samenvattingLang || solution.description || '')} />
          </div>
          
          {/* Voordelen en Nadelen */}
          <div className="mb-4 space-y-2">
            {(solution.benefits || []).slice(0, 2).map((benefit, index) => (
              <div key={`benefit-${index}`} className="flex items-center text-sm text-green-700">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>{benefit}</span>
              </div>
            ))}
            {(solution.challenges || []).slice(0, 1).map((challenge, index) => (
              <div key={`challenge-${index}`} className="flex items-center text-sm text-red-700">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                <span>{challenge}</span>
              </div>
            ))}
          </div>
          
          {/* Paspoort data inline tonen (vervangen door logic hierboven) */}
          {/* <div className="mt-4 pt-3 border-t border-gray-100 mb-4"> ... </div> */}

          {/* Geschikt voor type vervoer */}
          {activeTrafficTypes && activeTrafficTypes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Geschikt voor geselecteerde type vervoer:</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {activeTrafficTypes.map(activeType => {
                  const isMatch = solution.typeVervoer?.includes(activeType);
                  return (
                    <div key={activeType} className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full ${isMatch ? 'bg-green-500' : 'bg-red-500'} mr-1.5`}
                      ></div>
                      <span className="text-xs text-gray-600 capitalize">{activeType.replace(/-/g, ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bijdrage aan geselecteerde aanleidingen */}
          {selectedReasons.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Bijdrage aan geselecteerde aanleidingen:</p>
              {selectedReasons.map(reason => renderScoreIndicator(reason))}
            </div>
          )}
          
          {/* Kosten en Implementatietijd */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
            {solution.costs && (
              <div className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded">
                <span className="font-medium mr-1">Kosten:</span>
                <span>{solution.costs}</span>
              </div>
            )}
            {solution.implementationTime && (
              <div className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded">
                <span className="font-medium mr-1">Implementatietijd:</span>
                <span>{solution.implementationTime}</span>
              </div>
            )}
          </div>
          
          {/* Meer informatie knop */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMoreInfo) onMoreInfo(solution);
              }}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Meer informatie
            </button>
          </div>
        </div>
        
        {/* Checkbox */}
        <div className="ml-4 mt-1 flex-shrink-0">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isSelected}
            onChange={() => onToggleSelect(solution.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}

function getIconDisplay(icon: string): string {
  // Basic mapping, expand as needed
  switch (icon?.toLowerCase()) {
    case 'fiets': return '🚲';
    case 'bus': return '🚌';
    case 'trein': return '🚆';
    case 'auto': return '🚗';
    case 'scooter': return '🛵';
    case 'lopen': return '🚶';
    default: return '➡️'; // Default icon
  }
} 