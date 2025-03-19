import { MobilitySolution } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface SolutionCardProps {
  solution: MobilitySolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
  onMoreInfo?: (solution: MobilitySolution) => void;
}

export function SolutionCard({ solution, isSelected, onToggleSelect, onMoreInfo }: SolutionCardProps) {
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
          <div className="flex items-center mb-4">
            {solution.icon && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">{getIconDisplay(solution.icon)}</span>
              </div>
            )}
            <h3 className="text-lg font-medium">{solution.title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4">{solution.summary || solution.description}</p>
          
          <div className="flex flex-col gap-2 mb-4">
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
          
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
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
            
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  checked={isSelected}
                  onChange={() => onToggleSelect(solution.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="ml-2 text-sm text-gray-700">Selecteren</span>
              </label>
            </div>
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
// In a real app, this would use an icon library
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