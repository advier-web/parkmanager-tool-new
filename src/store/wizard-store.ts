import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TrafficType, AcquisitionType, BusinessParkInfo } from '@/domain/models';

interface WizardState {
  currentStep: number;
  selectedReasons: string[]; // IDs of selected BusinessParkReason
  selectedSolutions: string[]; // IDs of selected MobilitySolution
  selectedGovernanceModel: string | null; // ID of selected GovernanceModel
  currentGovernanceModelId: string | null; // ID of *existing* governance model, set at start
  // selectedAcquisitionType: AcquisitionType | null; // Verwijderd
  selectedVariants: { [solutionId: string]: string | null }; // Gekozen variant per solutionId
  // trafficTypes: TrafficType[]; // Verwijderd
  businessParkInfo: BusinessParkInfo; // Re-add businessParkInfo state

  // Actions
  setCurrentStep: (step: number) => void;
  setSelectedReasons: (reasons: string[]) => void;
  toggleReason: (reasonId: string) => void;
  setSelectedSolutions: (solutions: string[]) => void;
  toggleSolution: (solutionId: string) => void;
  setSelectedGovernanceModel: (modelId: string | null) => void;
  setCurrentGovernanceModelId: (modelId: string | null) => void;
  // setAcquisitionType: (type: AcquisitionType | null) => void; // Verwijderd
  setSelectedVariant: (solutionId: string, variant: string | null) => void; // Nieuwe action
  // setTrafficTypes: (types: TrafficType[]) => void; // Verwijder losse action
  setBusinessParkInfo: (info: Partial<BusinessParkInfo>) => void; // Re-add action
  reset: () => void;
}

// Default initial state for BusinessParkInfo
const initialBusinessParkInfo: BusinessParkInfo = {
  numberOfCompanies: 0,
  numberOfEmployees: 0,
  trafficTypes: [],
  // Optional fields can be omitted or set to undefined
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      selectedReasons: [],
      selectedSolutions: [],
      selectedGovernanceModel: null,
      currentGovernanceModelId: null, // Initialize current governance model ID
      // selectedAcquisitionType: null, // Verwijderd
      selectedVariants: {}, // Initialize selected variants map
      // trafficTypes: [], // Verwijderd
      businessParkInfo: initialBusinessParkInfo, // Initialize with default object

      // --- Actions --- 
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setSelectedReasons: (reasons) => set({ selectedReasons: reasons }),
      toggleReason: (reasonId) => set((state) => ({
        selectedReasons: state.selectedReasons.includes(reasonId)
          ? state.selectedReasons.filter(id => id !== reasonId)
          : [...state.selectedReasons, reasonId]
      })),

      setSelectedSolutions: (solutions) => set({ selectedSolutions: solutions }),
      toggleSolution: (solutionId) => set((state) => {
        const newSelectedSolutions = state.selectedSolutions.includes(solutionId)
          ? state.selectedSolutions.filter(id => id !== solutionId)
          : [...state.selectedSolutions, solutionId];
        // Als een oplossing wordt verwijderd, verwijder ook de variant keuze
        const newSelectedVariants = { ...state.selectedVariants };
        if (!newSelectedSolutions.includes(solutionId)) {
          delete newSelectedVariants[solutionId];
        }
        return { selectedSolutions: newSelectedSolutions, selectedVariants: newSelectedVariants };
      }),
      
      setSelectedGovernanceModel: (modelId) => set({ selectedGovernanceModel: modelId }),
      
      setCurrentGovernanceModelId: (modelId) => set({ currentGovernanceModelId: modelId }),

      // setAcquisitionType: (type) => set({ selectedAcquisitionType: type }), // Verwijderd
      
      // Nieuwe action om variant per solution op te slaan
      setSelectedVariant: (solutionId, variant) => set((state) => ({
        selectedVariants: {
          ...state.selectedVariants,
          [solutionId]: variant
        }
      })),

      // Re-add setBusinessParkInfo action (merges partial updates)
      setBusinessParkInfo: (info) => set((state) => ({ 
        businessParkInfo: { ...state.businessParkInfo, ...info }
      })),

      // setTrafficTypes: (types) => set({ trafficTypes: types }), // Verwijderd

      reset: () => set({
        currentStep: 0,
        selectedReasons: [],
        selectedSolutions: [],
        selectedGovernanceModel: null,
        currentGovernanceModelId: null, 
        selectedVariants: {},
        // trafficTypes: [], // Verwijderd
        businessParkInfo: initialBusinessParkInfo, // Reset to initial state
      }),
    }),
    {
      name: 'wizard-storage', 
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
); 