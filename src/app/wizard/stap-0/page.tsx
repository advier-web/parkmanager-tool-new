'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../../../store/wizard-store';
import { useGovernanceModels } from '../../../hooks/use-domain-models';
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { AcquisitionType, GovernanceModel } from '../../../domain/models'; // Keep for reference if needed elsewhere, but not for the removed select

export default function StartPage() {
  const router = useRouter();
  const {
    setCurrentStep,
    currentStep,
    currentGovernanceModelId, // Needed for the select
    setCurrentGovernanceModelId, // Needed for the select
    // selectedAcquisitionType, // Verwijderd
    // setAcquisitionType, // Verwijderd
    reset, // Optional: Reset on load?
  } = useWizardStore();

  const { data: governanceModels, isLoading, error } = useGovernanceModels();

  // Optional: Reset state when navigating back to step 0?
  // useEffect(() => {
  //   reset(); 
  // }, [reset]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    router.push('/wizard/stap-1');
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><p>Huidige governance modellen laden...</p></div>;
  if (error) return <div className="text-red-600">Fout bij laden governance modellen: {error.message}</div>;
  if (!governanceModels) return <div>Geen governance modellen gevonden.</div>; // Added check

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Start de Keuzehulp</h1>
      <Progress value={(currentStep / 5) * 100} className="mb-8" />
      
      <p className="mb-6 text-lg text-gray-700">
        Welkom bij de keuzehulp voor mobiliteitsoplossingen en governance modellen.
        Beantwoord een paar vragen om te ontdekken welke opties het beste bij uw situatie passen.
      </p>

      {/* Current Governance Model Selection */}
      <div className="mb-6">
        <label htmlFor="currentGovernanceModel" className="block text-lg font-semibold mb-2 text-gray-800">
          Wat is de huidige governance structuur?
        </label>
        <select
          id="currentGovernanceModel"
          value={currentGovernanceModelId || ''}
          onChange={(e) => setCurrentGovernanceModelId(e.target.value || null)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">Selecteer een model (optioneel)</option>
          {governanceModels.map((model: GovernanceModel) => (
            <option key={model.id} value={model.id}>{model.title}</option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Selecteer het huidige governance model als dat bekend is. Dit helpt bij het vergelijken met nieuwe opties.
        </p>
      </div>

      {/* Acquisition Type Selection - REMOVED */}
      {/* 
      <div className="mb-6">
         ... (blijft verwijderd)
      </div> 
      */}

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleNext}>
          Start de Keuzehulp (Volgende)
        </Button>
      </div>
    </div>
  );
} 