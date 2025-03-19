import { MobilitySolution } from '../domain/models';

interface SolutionCardProps {
  solution: MobilitySolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
}

export function SolutionCard({ solution, isSelected, onToggleSelect }: SolutionCardProps) {
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
          
          <p className="text-gray-600 mb-4">{solution.description}</p>
          
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <span className="text-sm font-semibold block mb-1">Voordelen:</span>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {solution.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="text-sm font-semibold block mb-1">Uitdagingen:</span>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {solution.challenges.map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            <div className="flex items-center">
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Kosten: {solution.costs}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Implementatietijd: {solution.implementationTime}
              </span>
            </div>
            {solution.category && (
              <div className="flex items-center">
                <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {solution.category}
                </span>
              </div>
            )}
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