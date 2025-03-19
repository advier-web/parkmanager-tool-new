import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WizardState } from '../domain/models';

// Initial state for the wizard
const initialState: WizardState = {
  selectedReasons: [],
  selectedSolutions: [],
  selectedGovernanceModel: null,
  selectedImplementationPlan: null,
  businessParkName: '',
  contactPerson: '',
  contactEmail: ''
};

// Define the store interface with actions
interface WizardStore extends WizardState {
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
      version: 1
    }
  )
); 