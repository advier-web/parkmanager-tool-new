import { MobilitySolution, BusinessParkReason } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface SolutionCardProps {
  solution: MobilitySolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
  onMoreInfo?: (solution: MobilitySolution) => void;
  selectedReasons?: BusinessParkReason[];
}

export function SolutionCard({ solution, isSelected, onToggleSelect, onMoreInfo, selectedReasons = [] }: SolutionCardProps) {
  // State om bij te houden welke tooltips zichtbaar zijn
  const [visibleTooltips, setVisibleTooltips] = useState<Record<string, boolean>>({});
  
  // Helper function om score te vinden voor een identifier (case-insensitief)
  const findScoreForIdentifier = (solution: MobilitySolution, identifier: string): number => {
    if (!identifier) return 0;
    
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
    
    // Bekende mappings voor ingebouwde inconsistenties
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
      'imago': ['imago', 'Imago'],
      'milieuverordening': ['milieuverordening', 'Milieuverordening']
    };
    
    if (mappings[identifier.toLowerCase()]) {
      // Probeer alle mogelijke varianten
      for (const variant of mappings[identifier.toLowerCase()]) {
        const value = solution[variant as keyof MobilitySolution];
        if (typeof value === 'number') {
          return value;
        }
      }
    }
    
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
  const getExplanationText = (score: number, reasonIdentifier: string) => {
    // Map van identifier naar toelichting veld naam
    const explanationFieldMap: Record<string, keyof MobilitySolution> = {
      'parkeer_bereikbaarheidsproblemen': 'parkeerBereikbaarheidsproblemenToelichting',
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
    
    // Haal het juiste toelichting veld op
    const explanationField = explanationFieldMap[reasonIdentifier.toLowerCase()];
    if (explanationField && solution[explanationField]) {
      return solution[explanationField] as string;
    }
    
    // Fallback tekst als er geen toelichting beschikbaar is
    if (score >= 7) {
      return `Deze oplossing scoort hoog (${score}/10) voor ${reasonIdentifier} omdat het direct bijdraagt aan het verminderen van deze problematiek.`;
    } else if (score >= 4) {
      return `Deze oplossing scoort gemiddeld (${score}/10) voor ${reasonIdentifier} omdat het een gedeeltelijke bijdrage levert aan het verminderen van deze problematiek.`;
    } else {
      return `Deze oplossing scoort laag (${score}/10) voor ${reasonIdentifier} omdat het maar een beperkte bijdrage levert aan het verminderen van deze problematiek.`;
    }
  };
  
  // Render de score indicator voor een aanleiding
  const renderScoreIndicator = (reason: BusinessParkReason) => {
    const score = findScoreForIdentifier(solution, reason.identifier || '');
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
            {getExplanationText(score, reason.identifier || reason.title)}
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
          
          <p className="text-gray-600 mb-3">{solution.summary || solution.description}</p>
          
          <div className="flex flex-col gap-1 mb-2">
            <div>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {solution.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {solution.challenges.map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Toon scores voor geselecteerde aanleidingen */}
          {selectedReasons.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Bijdrage aan geselecteerde aanleidingen:</p>
              {selectedReasons.map(reason => renderScoreIndicator(reason))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-700 px-2 py-1">
                {solution.costs}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-700 px-2 py-1">
                {solution.implementationTime}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
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

// Simple function to display an emoji based on icon string
function getIconDisplay(icon: string): string {
  const iconMap: Record<string, string> = {
    'road': '🛣️',
    'leaf': '🍃',
    'parking': '🅿️',
    'users': '👥',
    'bike': '🚲',
    'bus': '🚌',
    'car': '🚗',
    'train': '🚆',
    'walking': '🚶',
    'scooter': '🛴',
  };
  
  return iconMap[icon] || '📍';
} 