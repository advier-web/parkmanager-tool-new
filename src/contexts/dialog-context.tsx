'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { MobilitySolution, GovernanceModel, BusinessParkReason } from '../domain/models';

interface DialogContextType {
  isOpen: boolean;
  dialogType: 'solution' | 'governance' | 'reason' | null;
  currentSolution: MobilitySolution | null;
  compatibleGovernanceModels: GovernanceModel[] | null;
  currentGovernanceModel: GovernanceModel | null;
  currentReason: BusinessParkReason | null;
  openSolutionDialog: (solution: MobilitySolution, governanceModels: GovernanceModel[]) => void;
  openGovernanceDialog: (model: GovernanceModel) => void;
  openReasonDialog: (reason: BusinessParkReason) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'solution' | 'governance' | 'reason' | null>(null);
  const [currentSolution, setCurrentSolution] = useState<MobilitySolution | null>(null);
  const [compatibleGovernanceModels, setCompatibleGovernanceModels] = useState<GovernanceModel[] | null>(null);
  const [currentGovernanceModel, setCurrentGovernanceModel] = useState<GovernanceModel | null>(null);
  const [currentReason, setCurrentReason] = useState<BusinessParkReason | null>(null);

  const openSolutionDialog = (solution: MobilitySolution, governanceModels: GovernanceModel[]) => {
    setCurrentSolution(solution);
    setCompatibleGovernanceModels(governanceModels);
    setCurrentGovernanceModel(null);
    setCurrentReason(null);
    setDialogType('solution');
    setIsOpen(true);
  };

  const openGovernanceDialog = (model: GovernanceModel) => {
    setCurrentGovernanceModel(model);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentReason(null);
    setDialogType('governance');
    setIsOpen(true);
  };

  const openReasonDialog = (reason: BusinessParkReason) => {
    setCurrentReason(reason);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentGovernanceModel(null);
    setDialogType('reason');
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        dialogType,
        currentSolution,
        compatibleGovernanceModels,
        currentGovernanceModel,
        currentReason,
        openSolutionDialog,
        openGovernanceDialog,
        openReasonDialog,
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