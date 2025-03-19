'use client';

import { useState, useEffect } from 'react';
import { useBusinessParkReasons } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { ReasonCard } from '../../../components/reason-card';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { groupBy } from '../../../utils/helper';

export default function BusinessParkReasonsPage() {
  const { data: reasons, isLoading, error } = useBusinessParkReasons();
  const { selectedReasons, toggleReason } = useWizardStore();
  const [groupedReasons, setGroupedReasons] = useState<Record<string, typeof reasons>>({});
  
  // Group reasons by category when data is loaded
  useEffect(() => {
    if (reasons) {
      // Create a default category for reasons without a category
      const reasonsWithCategory = reasons.map(reason => ({
        ...reason,
        category: reason.category || 'overig'
      }));
      
      // Group by category
      const grouped = groupBy(reasonsWithCategory, 'category');
      setGroupedReasons(grouped);
    }
  }, [reasons]);
  
  // Check if any reasons are selected
  const hasSelectedReasons = selectedReasons.length > 0;
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 1: Bedrijfsterrein-redenen</h2>
        <p className="mb-6">
          Selecteer de redenen waarom u de mobiliteit op uw bedrijfsterrein wilt verbeteren.
          U kunt meerdere redenen selecteren.
        </p>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Redenen worden geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van de redenen.</p>
          </div>
        )}
        
        {reasons && reasons.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Geen redenen gevonden.</p>
          </div>
        )}
        
        {Object.entries(groupedReasons).map(([category, categoryReasons]) => (
          <div key={category} className="mt-8">
            <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryReasons?.map(reason => (
                <ReasonCard
                  key={reason.id}
                  reason={reason}
                  isSelected={selectedReasons.includes(reason.id)}
                  onToggleSelect={toggleReason}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <WizardNavigation
        previousStep="/wizard"
        nextStep="/wizard/stap-2"
        isNextDisabled={!hasSelectedReasons}
      />
    </div>
  );
} 