import { BusinessParkReason, TrafficType } from '../domain/models';
import { useWizardStore } from '@/store/wizard-store';
import { useMemo } from 'react';

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
  const { setEmployeePickupPreference, businessParkInfo } = useWizardStore();
  const isWoonWerkSelected = (businessParkInfo?.trafficTypes || []).includes('woon-werkverkeer' as any) || selectedTrafficTypes.includes('woon-werkverkeer' as any);
  const currentPref = businessParkInfo?.employeePickupPreference || null;
  // Sort reasons by order property before rendering
  const sortedReasons = useMemo(() => {
    if (!reasons) return [];
    return [...reasons].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    });
  }, [reasons]);

  // Organiseer redenen per categorie - Gebruik gesorteerde redenen
  const reasonsByCategory: Record<string, BusinessParkReason[]> = {};
  
  // Iterate over the sorted list for grouping
  sortedReasons.forEach(reason => { 
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
          Gebruik onderstaande filters om de getoonde collectieve vervoersoplossingen aan te passen op uw situatie
        </p>
      </div>
      
      <div className="mb-6 pb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Type verkeer</h4>
        <div className="space-y-2">
          {Object.values(TrafficType).map((type) => (
            <div key={type} className="flex items-start">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 mt-1 rounded border-gray-300 focus:ring-blue-600 accent-blue-600"
                  checked={activeTrafficTypes.includes(type)}
                  onChange={() => onTrafficTypeFilterChange(type)}
                />
                <div className="ml-2">
                  <span 
                    className={`block text-sm ${activeTrafficTypes.includes(type) ? 'font-medium text-blue-600' : ''}`}
                  >
                    {type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  {selectedTrafficTypes.includes(type) && (
                    <span className="text-xs text-blue-600">
                      Geselecteerd in stap 1
                    </span>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
        {isWoonWerkSelected && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Deel van de woon-werkreis</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="pickup-pref"
                    className="h-4 w-4 mt-1 rounded border-gray-300 focus:ring-blue-600 accent-blue-600"
                    checked={currentPref === 'thuis'}
                    onChange={() => setEmployeePickupPreference('thuis')}
                  />
                  <div className="ml-2">
                    <span className="block text-sm">Voor de hele reis</span>
                  </div>
                </label>
              </div>
              <div className="flex items-start">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="pickup-pref"
                    className="h-4 w-4 mt-1 rounded border-gray-300 focus:ring-blue-600 accent-blue-600"
                    checked={currentPref === 'locatie'}
                    onChange={() => setEmployeePickupPreference('locatie')}
                  />
                  <div className="ml-2">
                    <span className="block text-sm">Tussen OV-knooppunt of P+R terrein en bedrijventerrein</span>
                  </div>
                </label>
              </div>
              <div className="flex items-start">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="pickup-pref"
                    className="h-4 w-4 mt-1 rounded border-gray-300 focus:ring-blue-600 accent-blue-600"
                    checked={currentPref === 'ov'}
                    onChange={() => setEmployeePickupPreference('ov')}
                  />
                  <div className="ml-2">
                    <span className="block text-sm">Aansluiting bedrijventerrein op OV (als onderdeel hele OV-reis)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {Object.entries(reasonsByCategory).map(([category, categoryReasons]) => (
          <div key={category} className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">{category === 'Overig' ? 'Aanleidingen' : category}</h4>
            <ul className="space-y-2">
              {categoryReasons.map(reason => {
                const isSelected = selectedReasonIds.includes(reason.id);
                const isActive = activeFilterIds.includes(reason.id);
                
                return (
                  <li key={reason.id}>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1 rounded border-gray-300 focus:ring-blue-600 accent-blue-600"
                        checked={isActive}
                        onChange={() => onReasonFilterChange(reason.id)}
                      />
                      <div className="ml-2">
                        <span 
                          className={`block text-sm ${isActive ? 'font-medium text-blue-600' : ''}`}
                          title={reason.description}
                        >
                          {reason.title}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-blue-600">
                            Geselecteerd in stap 2
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
      
      {/* Actieve filters sectie is verborgen op verzoek */}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Selecteer aanleidingen uit de lijst om te zien welke collectieve vervoersoplossingen daarbij passen.
          Aanleidingen met <span className="text-blue-600">blauw label</span> heeft u in stap 1 geselecteerd.
        </p>
      </div>
    </div>
  );
} 