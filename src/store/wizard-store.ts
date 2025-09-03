import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import { TrafficType, AcquisitionType, BusinessParkInfo } from '@/domain/models'; // Removed unused TrafficType, AcquisitionType
import { BusinessParkInfo, TrafficType } from '@/domain/models'; // Re-added TrafficType

interface WizardState {
  _hasHydrated: boolean;
  currentStep: number;
  selectedReasons: string[]; // IDs of selected BusinessParkReason
  selectedSolutions: string[]; // IDs of selected MobilitySolution
  selectedGovernanceModel: string | null; // ID of selected GovernanceModel
  currentGovernanceModelId: string | null; // ID of *existing* governance model, set at start
  // selectedAcquisitionType: AcquisitionType | null; // Verwijderd
  selectedVariants: { [solutionId: string]: string | null }; // Gekozen variant per solutionId
  // trafficTypes: TrafficType[]; // Verwijderd
  businessParkInfo: BusinessParkInfo; // Re-add businessParkInfo state
  businessParkName: string; // <-- ADDED
  // Extra convenience for step-3 filter: update pickup preference

  // Actions
  setHasHydrated: (state: boolean) => void;
  setCurrentStep: (step: number) => void;
  setSelectedReasons: (reasons: string[]) => void;
  toggleReason: (reasonId: string) => void;
  setSelectedSolutions: (solutions: string[]) => void;
  toggleSolution: (solutionId: string) => void;
  setSelectedGovernanceModel: (modelId: string | null) => void;
  setCurrentGovernanceModelId: (modelId: string | null) => void;
  // setAcquisitionType: (type: AcquisitionType | null) => void; // Verwijderd
  setSelectedVariant: (solutionId: string, variant: string | null) => void; // Nieuwe action
  // setTrafficTypes: (types: TrafficType[]) => void; // Verwijderd
  setBusinessParkInfo: (info: Partial<BusinessParkInfo>) => void; // Re-add action
  setBusinessParkName: (name: string) => void; // <-- ADDED
  setEmployeePickupPreference: (pref: 'thuis' | 'locatie' | null) => void;
  reset: () => void;
  // Add missing actions from previous state
  updateTrafficTypes: (types: TrafficType[]) => void;
  resetWizard: () => void; // Alias for reset?
}

// Default initial state for BusinessParkInfo
const initialBusinessParkInfo: BusinessParkInfo = {
  numberOfCompanies: 0,
  numberOfEmployees: 0,
  trafficTypes: [],
  // Optional fields can be omitted or set to undefined
};

// --- ADDED INITIAL VALUE ---
const initialBusinessParkName: string = '';

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      currentStep: 0,
      selectedReasons: [],
      selectedSolutions: [],
      selectedGovernanceModel: null,
      currentGovernanceModelId: null, // Initialize current governance model ID
      // selectedAcquisitionType: null, // Verwijderd
      selectedVariants: {}, // Initialize selected variants map
      // trafficTypes: [], // Verwijderd
      businessParkInfo: initialBusinessParkInfo, // Initialize with default object
      businessParkName: initialBusinessParkName, // <-- ADDED INITIALIZATION

      // --- Actions --- 
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setSelectedReasons: (reasons) => set({ selectedReasons: reasons }),
      toggleReason: (reasonId) => set((state) => ({
        selectedReasons: state.selectedReasons.includes(reasonId)
          ? state.selectedReasons.filter(id => id !== reasonId)
          : [...state.selectedReasons, reasonId]
      })),

      setSelectedSolutions: (solutions) => set({ selectedSolutions: solutions }),
      toggleSolution: (solutionId) => set((state) => {
        // Single-select behavior: pick this solution, deselect others if selecting; toggle off if same
        const isAlreadySelected = state.selectedSolutions.includes(solutionId);
        const newSelectedSolutions = isAlreadySelected ? [] : [solutionId];
        const newSelectedVariants = { ...state.selectedVariants };
        if (!newSelectedSolutions.includes(solutionId)) {
          delete newSelectedVariants[solutionId];
        }
        // --- REMOVED DEBUG LOG --- 
        
        // --- MANUAL LOCALSTORAGE SAVE (WORKAROUND) --- 
        try {
          const currentState = get();
          const stateToSave = { 
            ...currentState, 
            selectedSolutions: newSelectedSolutions, // Include updated solutions
            selectedVariants: newSelectedVariants // Include updated variants
          };
          localStorage.setItem('wizard-storage', JSON.stringify({ state: stateToSave, version: 0 }));
          // REMOVED console.log('[toggleSolution] Manually saved state to localStorage.');
        } catch (e) {
          console.error('[toggleSolution] Error manually saving to localStorage:', e);
        }
        // --- END MANUAL LOCALSTORAGE SAVE --- 

        return { selectedSolutions: newSelectedSolutions, selectedVariants: newSelectedVariants };
      }),
      
      setSelectedGovernanceModel: (modelId) => set({ selectedGovernanceModel: modelId }),
      
      setCurrentGovernanceModelId: (modelId) => set({ currentGovernanceModelId: modelId }),

      // setAcquisitionType: (type) => set({ selectedAcquisitionType: type }), // Verwijderd
      
      // Nieuwe action om variant per solution op te slaan
      setSelectedVariant: (solutionId, variant) => set((state) => { 
        // --- REMOVED DEBUG LOG --- 
        const newState = {
          selectedVariants: {
            ...state.selectedVariants,
            [solutionId]: variant
          }
        };
        // --- REMOVED DEBUG LOG --- 

        // --- MANUAL LOCALSTORAGE SAVE (WORKAROUND) --- 
        try {
          const currentState = get();
          const stateToSave = { 
            ...currentState, 
            selectedVariants: newState.selectedVariants // Merge the new variants map
          };
          localStorage.setItem('wizard-storage', JSON.stringify({ state: stateToSave, version: 0 }));
          // REMOVED console.log('[setSelectedVariant] Manually saved state to localStorage.');
        } catch (e) {
          console.error('[setSelectedVariant] Error manually saving to localStorage:', e);
        }
        // --- END MANUAL LOCALSTORAGE SAVE --- 

        return newState;
      }),

      // Re-add setBusinessParkInfo action (merges partial updates)
      setBusinessParkInfo: (info) => set((state) => { 
        const newState = { 
          businessParkInfo: { ...state.businessParkInfo, ...info }
        };
        // --- REMOVED DEBUG LOG --- 
        return newState;
      }),

      // setTrafficTypes: (types) => set({ trafficTypes: types }), // Verwijderd

      // <-- ADDED ACTION IMPLEMENTATION ---
      setBusinessParkName: (name) => set ({ businessParkName: name }),

      setEmployeePickupPreference: (pref) => set((state) => ({
        businessParkInfo: { ...state.businessParkInfo, employeePickupPreference: pref }
      })),

      // Add implementation for updateTrafficTypes
      updateTrafficTypes: (types) => set((state) => ({
        businessParkInfo: { ...state.businessParkInfo, trafficTypes: types }
      })),

      reset: () => set({
        _hasHydrated: get()._hasHydrated,
        currentStep: 0,
        selectedReasons: [],
        selectedSolutions: [],
        selectedGovernanceModel: null,
        currentGovernanceModelId: null, 
        selectedVariants: {},
        // trafficTypes: [], // Verwijderd
        businessParkInfo: initialBusinessParkInfo, // Reset to initial state
        businessParkName: initialBusinessParkName, // <-- ADDED RESET
      }),
      // Add alias resetWizard pointing to reset
      resetWizard: () => get().reset(), 
    }),
    {
      name: 'wizard-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // REMOVED console.log('[Zustand] Hydration finished.');
          state.setHasHydrated(true);
        }
      },
    }
  )
); 