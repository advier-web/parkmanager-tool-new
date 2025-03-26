import { BusinessParkReason, TrafficType } from '../domain/models';

interface FilterPanelProps {
  reasons: BusinessParkReason[];
  selectedReasonIds: string[];
  activeFilterIds: string[];
  onReasonFilterChange: (reasonId: string) => void;
  activeTrafficTypes: TrafficType[];
  selectedTrafficTypes: TrafficType[];
  onTrafficTypeFilterChange: (type: TrafficType) => void;
}

export function FilterPanel({ 
  reasons, 
  selectedReasonIds, 
  activeFilterIds,
  onReasonFilterChange,
  activeTrafficTypes,
  selectedTrafficTypes,
  onTrafficTypeFilterChange
}: FilterPanelProps) {
  // Organiseer redenen per categorie
  const reasonsByCategory: Record<string, BusinessParkReason[]> = {};
  
  reasons.forEach(reason => {
    const category = reason.category || 'Overig';
    if (!reasonsByCategory[category]) {
      reasonsByCategory[category] = [];
    }
    reasonsByCategory[category].push(reason);
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Filter op aanleidingen</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">
          Filter de oplossingen op basis van verschillende aanleidingen om te zien welke oplossingen passen.
        </p>
      </div>
      
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Type vervoer</h4>
        <div className="space-y-2">
          {Object.values(TrafficType).map((type) => (
            <div key={type} className="flex items-start">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={activeTrafficTypes.includes(type)}
                  onChange={() => onTrafficTypeFilterChange(type)}
                />
                <div className="ml-2">
                  <span 
                    className={`block text-sm ${activeTrafficTypes.includes(type) ? 'font-medium text-blue-800' : ''}`}
                  >
                    {type}
                  </span>
                  {selectedTrafficTypes.includes(type) && (
                    <span className="text-xs text-blue-600">
                      Geselecteerd in stap 0
                    </span>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(reasonsByCategory).map(([category, categoryReasons]) => (
          <div key={category} className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">{category}</h4>
            <ul className="space-y-2">
              {categoryReasons.map(reason => {
                const isSelected = selectedReasonIds.includes(reason.id);
                const isActive = activeFilterIds.includes(reason.id);
                
                return (
                  <li key={reason.id}>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={isActive}
                        onChange={() => onReasonFilterChange(reason.id)}
                      />
                      <div className="ml-2">
                        <span 
                          className={`block text-sm ${isActive ? 'font-medium text-blue-800' : ''}`}
                          title={reason.description}
                        >
                          {reason.title}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-blue-600">
                            Geselecteerd in stap 1
                          </span>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      {(activeFilterIds.length > 0 || activeTrafficTypes.length > 0) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Actieve filters:</span>
            <button
              onClick={() => {
                activeFilterIds.forEach(id => onReasonFilterChange(id));
                activeTrafficTypes.forEach(type => onTrafficTypeFilterChange(type));
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Wis filters
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeTrafficTypes.map(type => (
              <span 
                key={`traffic-${type}`}
                className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {type}
                <button
                  onClick={() => onTrafficTypeFilterChange(type)}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
            
            {activeFilterIds
              .filter(id => reasons.some(r => r.id === id))
              .map(id => {
                const reason = reasons.find(r => r.id === id);
                return (
                  <span 
                    key={id}
                    className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {reason?.title}
                    <button
                      onClick={() => onReasonFilterChange(id)}
                      className="ml-1 text-blue-800 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Selecteer aanleidingen uit de lijst om te zien welke mobiliteitsoplossingen daarbij passen.
          Aanleidingen met <span className="text-blue-600">blauw label</span> heeft u in stap 1 geselecteerd.
        </p>
      </div>
    </div>
  );
} 