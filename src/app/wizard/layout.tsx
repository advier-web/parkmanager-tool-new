import type { Metadata } from 'next';
import React from 'react';
import { WizardProgress } from '../../components/wizard-progress';

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">ParkManager Tool</h1>
        <p className="text-center text-gray-600 mt-2">
          Creëer optimale mobiliteitsoplossingen voor uw bedrijfsterrein
        </p>
      </header>
      
      {/* Wizard Progress will only show on wizard step pages, not the index */}
      <WizardProgress />
      
      <main>
        {children}
      </main>
      
      <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ParkManager Tool</p>
      </footer>
    </div>
  );
} 