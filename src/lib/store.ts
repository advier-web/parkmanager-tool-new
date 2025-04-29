import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WizardState, BusinessParkInfo, TrafficType } from '../domain/models';

// Define the type for the selected variants map
export type SelectedVariantMap = Record<string, string | null>;

// Initial state for the wizard
const initialState: WizardState = {
  businessParkInfo: {
    numberOfCompanies: 0,
    numberOfEmployees: 0,
    trafficTypes: [],
    employeePickupPreference: null
  },
  currentGovernanceModelId: null,
  selectedReasons: [],
  selectedSolutions: [],
  selectedGovernanceModel: null,
  selectedImplementationPlan: null,
  selectedVariants: {},
  businessParkName: '',
  contactPerson: '',
  contactEmail: '',
};

// Define the store interface with actions
interface WizardStore extends WizardState {
  // Stap 0: Bedrijventerrein informatie
  setBusinessParkInfo: (info: Partial<BusinessParkInfo>) => void;
  setCurrentGovernanceModel: (modelId: string | null) => void;
  updateTrafficTypes: (trafficTypes: TrafficType[]) => void;
  
  // Stap 1: Bedrijfsterrein-redenen
  setSelectedReasons: (reasons: string[]) => void;
  toggleReason: (reasonId: string) => void;
  
  // Stap 2: Mobiliteitsoplossingen
  setSelectedSolutions: (solutions: string[]) => void;
  toggleSolution: (solutionId: string) => void;
  
  // Stap 3: Governance modellen
  setSelectedGovernanceModel: (modelId: string | null) => void;
  
  // Stap 4: Implementatieplan
  setSelectedImplementationPlan: (planId: string | null) => void;
  setSelectedVariant: (solutionId: string, variantName: string | null) => void;
  
  // Extra gegevens
  setBusinessParkDetails: (name: string, contactPerson: string, contactEmail: string) => void;
  
  // Reset functionality
  resetWizard: () => void;
}

// Create the store with persistence
export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      // Stap 0: Bedrijventerrein informatie
      setBusinessParkInfo: (info) => set((state) => ({
        businessParkInfo: { ...state.businessParkInfo, ...info }
      })),
      setCurrentGovernanceModel: (modelId) => set({ currentGovernanceModelId: modelId }),
      updateTrafficTypes: (trafficTypes) => set((state) => ({
        businessParkInfo: { ...state.businessParkInfo, trafficTypes }
      })),
      
      // Stap 1: Bedrijfsterrein-redenen
      setSelectedReasons: (reasons) => set({ selectedReasons: reasons }),
      toggleReason: (reasonId) => set((state) => {
        const isSelected = state.selectedReasons.includes(reasonId);
        const selectedReasons = isSelected
          ? state.selectedReasons.filter(id => id !== reasonId)
          : [...state.selectedReasons, reasonId];
        return { selectedReasons };
      }),
      
      // Stap 2: Mobiliteitsoplossingen
      setSelectedSolutions: (solutions) => set({ selectedSolutions: solutions }),
      toggleSolution: (solutionId) => set((state) => {
        const isSelected = state.selectedSolutions.includes(solutionId);
        const selectedSolutions = isSelected
          ? state.selectedSolutions.filter(id => id !== solutionId)
          : [...state.selectedSolutions, solutionId];
        return { selectedSolutions };
      }),
      
      // Stap 3: Governance modellen
      setSelectedGovernanceModel: (modelId) => set({ selectedGovernanceModel: modelId }),
      
      // Stap 4: Implementatieplan
      setSelectedImplementationPlan: (planId) => set({ selectedImplementationPlan: planId }),
      setSelectedVariant: (solutionId, variantName) => set((state) => ({
        selectedVariants: { 
          ...state.selectedVariants, 
          [solutionId]: variantName 
        }
      })),
      
      // Extra gegevens
      setBusinessParkDetails: (name, contactPerson, contactEmail) => set({
        businessParkName: name,
        contactPerson,
        contactEmail
      }),
      
      // Reset functionality
      resetWizard: () => set(initialState)
    }),
    {
      name: 'parkmanager-wizard-storage',
      version: 2
    }
  )
); 