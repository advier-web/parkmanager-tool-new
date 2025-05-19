'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { MobilitySolution, GovernanceModel, BusinessParkReason, ImplementationVariation } from '../domain/models';

interface DialogContextType {
  isOpen: boolean;
  dialogType: 'solution' | 'governance' | 'reason' | 'implementation-variant' | null;
  currentSolution: MobilitySolution | null;
  compatibleGovernanceModels: GovernanceModel[] | null;
  currentGovernanceModel: GovernanceModel | null;
  currentReason: BusinessParkReason | null;
  currentVariations: ImplementationVariation[] | null;
  currentImplementationVariant: ImplementationVariation | null;
  openSolutionDialog: (solution: MobilitySolution, governanceModels: GovernanceModel[], variations: ImplementationVariation[]) => void;
  openGovernanceDialog: (model: GovernanceModel) => void;
  openReasonDialog: (reason: BusinessParkReason) => void;
  openImplementationVariantDialog: (variant: ImplementationVariation) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'solution' | 'governance' | 'reason' | 'implementation-variant' | null>(null);
  const [currentSolution, setCurrentSolution] = useState<MobilitySolution | null>(null);
  const [compatibleGovernanceModels, setCompatibleGovernanceModels] = useState<GovernanceModel[] | null>(null);
  const [currentGovernanceModel, setCurrentGovernanceModel] = useState<GovernanceModel | null>(null);
  const [currentReason, setCurrentReason] = useState<BusinessParkReason | null>(null);
  const [currentVariations, setCurrentVariations] = useState<ImplementationVariation[] | null>(null);
  const [currentImplementationVariant, setCurrentImplementationVariant] = useState<ImplementationVariation | null>(null);

  const openSolutionDialog = (solution: MobilitySolution, governanceModels: GovernanceModel[], variations: ImplementationVariation[]) => {
    setCurrentSolution(solution);
    setCompatibleGovernanceModels(governanceModels);
    setCurrentVariations(variations);
    setCurrentGovernanceModel(null);
    setCurrentReason(null);
    setCurrentImplementationVariant(null);
    setDialogType('solution');
    setIsOpen(true);
  };

  const openGovernanceDialog = (model: GovernanceModel) => {
    setCurrentGovernanceModel(model);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentReason(null);
    setCurrentImplementationVariant(null);
    setDialogType('governance');
    setIsOpen(true);
  };

  const openReasonDialog = (reason: BusinessParkReason) => {
    setCurrentReason(reason);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentGovernanceModel(null);
    setCurrentImplementationVariant(null);
    setDialogType('reason');
    setIsOpen(true);
  };

  const openImplementationVariantDialog = (variant: ImplementationVariation) => {
    setCurrentImplementationVariant(variant);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentGovernanceModel(null);
    setCurrentReason(null);
    setDialogType('implementation-variant');
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentSolution(null);
    setCompatibleGovernanceModels(null);
    setCurrentGovernanceModel(null);
    setCurrentReason(null);
    setCurrentImplementationVariant(null);
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
        currentVariations,
        currentImplementationVariant,
        openSolutionDialog,
        openGovernanceDialog,
        openReasonDialog,
        openImplementationVariantDialog,
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