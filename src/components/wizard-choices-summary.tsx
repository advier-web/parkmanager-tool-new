'use client';

import { usePathname } from 'next/navigation';
import { useWizardStore } from '@/store/wizard-store';
import { useBusinessParkReasons, useGovernanceModels, useMobilitySolutions, useImplementationVariations } from '@/hooks/use-domain-models';
import { useMemo, useState, useEffect } from 'react';
import { ImplementationVariation } from '@/domain/models';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

// Helper to map pathname to a numeric step index
// Supports both legacy `/wizard/stap-*` routes and new semantic routes
const getStepFromPathname = (pathname: string): number => {
  // Normalize to exclude query/hash
  const path = pathname.split('?')[0].split('#')[0];

  // New semantic routes
  if (/^\/wizard\/bedrijventerrein$/.test(path)) return 0;
  if (/^\/wizard\/aanleidingen$/.test(path)) return 1;
  if (/^\/wizard\/oplossingen$/.test(path)) return 2;
  if (/^\/wizard\/implementatievarianten$/.test(path)) return 3; // was 2b
  if (/^\/wizard\/governance-modellen$/.test(path)) return 4;   // was 3
  if (/^\/wizard\/vervolgstappen$/.test(path)) return 5;

  // Legacy numeric routes fallback
  const legacy = path.match(/\/wizard\/(?:stap-(\d+[ab]?)|(bedrijventerrein)|(samenvatting))/);
  if (legacy) {
    if (legacy[2]) return 0; // bedrijventerrein
    if (legacy[3]) return 6; // samenvatting last
    if (legacy[1]) {
      return parseInt(legacy[1].replace(/[ab]/, ''), 10) + (legacy[1].includes('b') ? 1 : 0) - 0; // handle 2b -> 3
    }
  }
  return 0;
};

// Add variationsData prop
interface WizardChoicesSummaryProps {
  variationsData?: ImplementationVariation[];
}

export function WizardChoicesSummary({ variationsData }: WizardChoicesSummaryProps) {
  // --- Client-side mount state ---
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  // --- End client-side mount state ---

  const hasHydrated = useWizardStore(state => state._hasHydrated);
  const pathname = usePathname();
  // Handle potential null pathname
  const currentStep = pathname ? getStepFromPathname(pathname) : 0; 

  const {
    businessParkInfo,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel: selectedGovernanceModelId, // Rename for clarity
    selectedVariants, // Get selected variants map
  } = useWizardStore();

  const { data: reasons, isLoading: isLoadingReasons } = useBusinessParkReasons();
  const { data: solutions, isLoading: isLoadingSolutions } = useMobilitySolutions();
  const { data: governanceModels, isLoading: isLoadingModels } = useGovernanceModels();
  // Fetch all variations within the component
  const { data: allImplementationVariations, isLoading: isLoadingVariations } = useImplementationVariations();

  // --- Process selected data ---
  const currentGovernanceModelTitle = useMemo(() => {
    if (isLoadingModels || !currentGovernanceModelId || !governanceModels) return '';
    return governanceModels.find(m => m.id === currentGovernanceModelId)?.title || 'Geen bestuursvorm';
  }, [governanceModels, currentGovernanceModelId, isLoadingModels]);

  const selectedReasonTitles = useMemo(() => {
    if (isLoadingReasons || !selectedReasons.length || !reasons) return [];
    return reasons
      .filter(r => selectedReasons.includes(r.id))
      .map(r => r.title);
  }, [reasons, selectedReasons, isLoadingReasons]);
  
  const selectedSolutionTitles = useMemo(() => {
    if (isLoadingSolutions || !selectedSolutions.length || !solutions) return [];
    return solutions
      .filter(s => selectedSolutions.includes(s.id))
      .map(s => s.title);
  }, [solutions, selectedSolutions, isLoadingSolutions]);

  const selectedGovernanceModelTitle = useMemo(() => {
    if (isLoadingModels || !selectedGovernanceModelId || !governanceModels) return '';
    return governanceModels.find(m => m.id === selectedGovernanceModelId)?.title || '';
  }, [governanceModels, selectedGovernanceModelId, isLoadingModels]);
  
  // --- Loading State ---
  // Add isLoadingVariations to the check
  const isLoadingRelevantData = 
     !hasHydrated || // Wait for hydration first
     (currentStep > 0 && isLoadingModels) || 
     (currentStep > 1 && isLoadingReasons) || 
     (currentStep > 2 && (isLoadingSolutions || isLoadingVariations)); // Add variation loading check for steps >= 3

  // Don't render anything for step 0 or if not hydrated
  if (currentStep === 0 || !hasHydrated) { 
    // Render loading state until hydrated (and not step 0)
    return (
       <div className="bg-white rounded-lg p-6 shadow-even space-y-5 mb-8">
         <h3 className="text-lg font-semibold border-b pb-2 mb-3">Uw keuzes</h3>
         <p className="text-sm text-gray-500">Keuzes laden...</p>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-even space-y-5 mb-8">
      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Uw keuzes</h3>
      
      {isLoadingRelevantData && <p className="text-sm text-gray-500">Keuzes laden...</p>}
      
      {!isLoadingRelevantData && (
        <>
          {/* Stap 0: Bedrijventerrein Info */}
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-700">Bedrijventerrein:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Bedrijven: {businessParkInfo.numberOfCompanies || 'N.v.t.'}</li>
              <li>Werknemers: {businessParkInfo.numberOfEmployees || 'N.v.t.'}</li>
              {currentGovernanceModelTitle && <li>Huidig model: {currentGovernanceModelTitle}</li>}
              {businessParkInfo.trafficTypes?.length > 0 && (
                <li>Verkeer: {businessParkInfo.trafficTypes.join(', ')}</li>
              )}
               {businessParkInfo.employeePickupPreference && (
                <li>
                  Deel van de woon-werkreis: {businessParkInfo.employeePickupPreference === 'thuis' ? 'Voor de hele reis' : businessParkInfo.employeePickupPreference === 'locatie' ? 'Tussen OV-knooppunt of P+R terrein en bedrijventerrein' : 'Aansluiting bedrijventerrein op OV (als onderdeel hele OV-reis)'}
                </li>
              )}
            </ul>
          </div>

          {/* Stap 1: Aanleidingen */}
          {currentStep > 1 && selectedReasonTitles.length > 0 && (
            <div className="space-y-2 text-sm border-t pt-4 mt-4">
              <p className="font-medium text-gray-700">Aanleidingen:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {selectedReasonTitles.map(title => <li key={title}>{title}</li>)}
              </ul>
            </div>
          )}

          {/* Stap 2: Oplossingen - Show starting from Step 2 */}
          {currentStep >= 2 && selectedSolutionTitles.length > 0 && (
             <div className="space-y-2 text-sm border-t pt-4 mt-4">
              <p className="font-medium text-gray-700">Collectieve mobiliteitsoplossing:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {selectedSolutionTitles.map(title => <li key={title}>{title}</li>)}
              </ul>
            </div>
          )}
          
          {/* Stap 2b: Implementatievarianten - Show starting from Step 3 */}
          {currentStep >= 3 && Object.keys(selectedVariants).length > 0 && selectedSolutionTitles.length > 0 && (
            <div className="space-y-2 text-sm border-t pt-4 mt-4">
              <p className="font-medium text-gray-700">Implementatievariant:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {solutions
                  ?.filter(s => selectedSolutions.includes(s.id) && selectedVariants[s.id])
                  .map(s => {
                    const variantId = selectedVariants[s.id];
                    // Find variation details in the fetched list
                    const variation = allImplementationVariations?.find(v => v.id === variantId);
                    // REMOVED Debug Log
                    const displayTitle = variation ? stripSolutionPrefixFromVariantTitle(variation.title) : variantId; // Fallback remains ID
                    return (
                      <li key={s.id}>{displayTitle || 'Niet gevonden'}</li> // Show title or fallback
                    );
                  })}
              </ul>
            </div>
          )}
          
           {/* Stap 3: Governance Model */}
          {currentStep > 3 && selectedGovernanceModelTitle && (
             <div className="space-y-2 text-sm border-t pt-4 mt-4">
              <p className="font-medium text-gray-700">Gekozen governance model:</p>
              <p className="pl-5 text-gray-600">{selectedGovernanceModelTitle}</p>
            </div>
          )}
          
          {/* Add sections for Stap 4 (Implementatieplan/varianten) if needed later */}
        </>
      )}
    </div>
  );
} 