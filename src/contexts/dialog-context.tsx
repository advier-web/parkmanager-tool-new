'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { MobilitySolution, GovernanceModel } from '../domain/models';

interface DialogContextType {
  isOpen: boolean;
  currentSolution: MobilitySolution | null;
  compatibleGovernanceModels: GovernanceModel[] | null;
  openDialog: (solution: MobilitySolution, governanceModels: GovernanceModel[]) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<MobilitySolution | null>(null);
  const [compatibleGovernanceModels, setCompatibleGovernanceModels] = useState<GovernanceModel[] | null>(null);

  const openDialog = (solution: MobilitySolution, governanceModels: GovernanceModel[]) => {
    setCurrentSolution(solution);
    setCompatibleGovernanceModels(governanceModels);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        currentSolution,
        compatibleGovernanceModels,
        openDialog,
        closeDialog
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
} 