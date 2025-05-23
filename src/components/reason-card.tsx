import { BusinessParkReason } from '../domain/models';
import { useDialog } from '../contexts/dialog-context';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ReasonCardProps {
  reason: BusinessParkReason;
  isSelected: boolean;
  onToggleSelect: (reasonId: string) => void;
}

export function ReasonCard({ reason, isSelected, onToggleSelect }: ReasonCardProps) {
  const { openReasonDialog } = useDialog();
  
  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Voorkom dat de kaart wordt geselecteerd/gedeselecteerd
    openReasonDialog(reason);
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
      onClick={() => onToggleSelect(reason.id)}
    >
      <div className="flex items-center mb-4">
        {reason.icon && (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600 text-xl">{getIconDisplay(reason.icon)}</span>
          </div>
        )}
        <h3 className="text-lg font-medium">{reason.title}</h3>
      </div>
      
      <p className="text-gray-600">
        {reason.summary || reason.description}
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleMoreInfoClick}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          Meer informatie
        </button>
        
        <input
          type="checkbox"
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={isSelected}
          onChange={() => onToggleSelect(reason.id)}
          onClick={(e) => e.stopPropagation()}
        />
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
  };
  
  return iconMap[icon] || '📍';
} 