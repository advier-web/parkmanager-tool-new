import { GovernanceModel } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface GovernanceCardProps {
  model: GovernanceModel;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  isRecommended?: boolean;
  isCurrent?: boolean;
  onMoreInfo?: (model: GovernanceModel) => void;
}

export function GovernanceCard({ 
  model, 
  isSelected, 
  onSelect, 
  isRecommended = false, 
  isCurrent = false,
  onMoreInfo
}: GovernanceCardProps) {
  // Helper function for rendering list items with markdown support
  const renderListItem = (text: string, index: number) => {
    return <li key={index}><MarkdownContent content={processMarkdownText(text)} /></li>;
  };

  return (
    <div
      className={`
        p-6 rounded-lg transition-all relative
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
        ${isRecommended ? 'border-l-4 border-l-green-500' : ''}
        ${isCurrent ? 'border-r-4 border-r-purple-500' : ''}
      `}
    >
      <div className="absolute top-0 right-0 flex">
        {isRecommended && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md mr-1">
            Aanbevolen
          </span>
        )}
        
        {isCurrent && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Huidige model
          </span>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="radio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
            checked={isSelected}
            onChange={() => onSelect(model.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="ml-3 flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{model.title}</h3>
            
            {/* Select button for smaller screens */}
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className="md:hidden inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
          
          <div className="text-gray-600 mt-2 mb-4">
            <MarkdownContent content={processMarkdownText(model.summary || model.description)} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Voordelen:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {Array.isArray(model.advantages) && model.advantages.length > 0 ? 
                  model.advantages.map((advantage, index) => renderListItem(advantage, index)) : 
                  <li>Informatie beschikbaar via 'Meer informatie'</li>
                }
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Nadelen:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {Array.isArray(model.disadvantages) && model.disadvantages.length > 0 ? 
                  model.disadvantages.map((disadvantage, index) => renderListItem(disadvantage, index)) : 
                  <li>Informatie beschikbaar via 'Meer informatie'</li>
                }
              </ul>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1">Toepasselijke scenario&apos;s:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {Array.isArray(model.applicableScenarios) && model.applicableScenarios.length > 0 ? 
                model.applicableScenarios.map((scenario, index) => renderListItem(scenario, index)) : 
                <li>Informatie beschikbaar via 'Meer informatie'</li>
              }
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {model.organizationalStructure && (
              <div>
                <span className="font-semibold">Organisatiestructuur:</span>{' '}
                <span className="text-gray-600">
                  <MarkdownContent 
                    content={processMarkdownText(model.organizationalStructure)} 
                    className="inline-block"
                  />
                </span>
              </div>
            )}
            
            {model.legalForm && (
              <div>
                <span className="font-semibold">Rechtsvorm:</span>{' '}
                <span className="text-gray-600">
                  <MarkdownContent 
                    content={processMarkdownText(model.legalForm)} 
                    className="inline-block"
                  />
                </span>
              </div>
            )}
          </div>
          
          {model.stakeholders && model.stakeholders.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-1">Belanghebbenden:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(model.stakeholders) ? 
                  model.stakeholders.map((stakeholder, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                    >
                      {stakeholder}
                    </span>
                  )) : 
                  <span className="text-sm text-gray-600">Informatie beschikbaar via 'Meer informatie'</span>
                }
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6 pt-3 border-t">
            {/* More info button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMoreInfo) onMoreInfo(model);
              }}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Meer informatie
            </button>
            
            {/* Select button for larger screens */}
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className="hidden md:inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 