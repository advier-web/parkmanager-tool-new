'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/store/wizard-store';
import { useBusinessParkReasons } from '@/hooks/use-domain-models';
import { ReasonCard } from '@/components/reason-card';
import { SiteHeader } from '@/components/site-header';
import { WizardNavigation } from '@/components/wizard-navigation';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary';

export default function Step1Page() {
  const {
    selectedReasons,
    toggleReason
  } = useWizardStore();

  const { data: reasons, isLoading, error } = useBusinessParkReasons();

  // Group reasons by category for display
  const groupedReasons = reasons
    ?.sort((a, b) => { // Sort reasons by order before grouping
      const orderA = a.order ?? Infinity; // Treat undefined/null order as last
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    })
    .reduce((acc, reason) => {
      const category = reason.category || 'Overig';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(reason);
      return acc;
    }, {} as Record<string, typeof reasons>);

  // Sort categories, putting 'Overig' last
  const sortedCategories = groupedReasons ? Object.keys(groupedReasons).sort((a, b) => {
    if (a === 'Overig') return 1;
    if (b === 'Overig') return -1;
    return a.localeCompare(b);
  }) : [];

  // Form validity (optional step)
  const isFormValid = true;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
          <WizardChoicesSummary />
          <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Door te begrijpen waarom u de mobiliteit wilt verbeteren, 
                kan ik gerichter adviseren over passende collectieve vervoersoplossing. Elke reden kan leiden tot andere aanbevelingen.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Meerdere redenen</h3>
              <p className="text-gray-600 text-sm">
                Selecteer gerust meerdere redenen als die van toepassing zijn. 
                Dit helpt mij om een compleet beeld te krijgen van uw situatie en doelstellingen.
              </p>
            </div>
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>U kunt redenen selecteren, maar dit is niet verplicht</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {/* Intro sectie (alleen kop + toelichting) */}
          <div className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Aanleidingen</h2>
            <p className="mb-6">
              Selecteer de redenen waarom u de mobiliteit op uw bedrijventerrein wilt verbeteren. 
              U kunt meerdere redenen selecteren, maar dit is niet verplicht.
            </p>
          </div>

          {/* Kaarten als losse secties, buiten de witte container */}
          {isLoading && <p className="mt-6">Aanleidingen laden...</p>}
          {error && <p className="mt-6 text-red-500">Fout bij het laden van aanleidingen.</p>}

          {!isLoading && !error && groupedReasons && (
            <div className="space-y-8 mt-6">
              {sortedCategories.map(category => (
                <section key={category} className="p-0">
                  <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedReasons[category].map(reason => (
                      <ReasonCard
                        key={reason.id}
                        reason={reason}
                        isSelected={selectedReasons.includes(reason.id)}
                        onToggleSelect={() => toggleReason(reason.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/bedrijventerrein"
        nextStep="/wizard/oplossingen"
        isNextDisabled={!isFormValid}
      />
    </div>
  );
}



