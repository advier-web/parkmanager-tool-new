import type { Metadata } from 'next';
import React from 'react';
import { WizardProgress } from '../../components/wizard-progress';
import { DialogProvider } from '../../contexts/dialog-context';
import { SolutionDialog } from '../../components/solution-dialog';
import { SiteHeader } from '../../components/site-header';

export const metadata: Metadata = {
  title: 'ParkManager Tool - Wizard',
  description: 'Creëer uw optimale mobiliteitsplan voor uw bedrijfsterrein',
};

export default function WizardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DialogProvider>
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Wizard Progress will only show on wizard step pages, not the index */}
        <WizardProgress />
        
        <main className="mt-8">
          {children}
        </main>
        
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ParkManager Tool</p>
        </footer>
      </div>
      
      {/* Global dialog that can be used across all wizard steps */}
      <SolutionDialog />
    </DialogProvider>
  );
} 