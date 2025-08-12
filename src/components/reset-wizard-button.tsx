'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/wizard-store';
import { useRouter } from 'next/navigation';

interface ResetWizardButtonProps {
  className?: string;
}

export default function ResetWizardButton({ className }: ResetWizardButtonProps) {
  const [done, setDone] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer border-red-600 text-red-600 hover:bg-red-50 focus-visible:ring-red-500"
        disabled={isResetting}
        onClick={async () => {
          setIsResetting(true);
          try {
            // Clear persisted state
            localStorage.removeItem('wizard-storage');
            // Reset in-memory state as well
            useWizardStore.getState().reset();
            setDone(true);
            // Navigate to first step (empty wizard)
            router.push('/wizard/bedrijventerrein');
          } catch (e) {
            console.error('Kon de wizardopslag niet resetten:', e);
          } finally {
            setIsResetting(false);
          }
        }}
      >
        {isResetting ? 'Resetten…' : 'Reset wizard'}
      </Button>
      {done && (
        <p className="mt-2 text-sm text-gray-600">
          Uw ingevulde gegevens en keuzes zijn verwijderd van dit apparaat. De wizard begint opnieuw.
        </p>
      )}
    </div>
  );
}


