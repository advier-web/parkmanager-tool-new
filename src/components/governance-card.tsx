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