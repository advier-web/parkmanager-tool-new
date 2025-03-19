'use client';

import { useEffect } from 'react';
import { useImplementationPlans, useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';

export default function ImplementationPlanPage() {
  const { data: implementationPlans, isLoading: isLoadingPlans, error: plansError } = useImplementationPlans();
  const { data: governanceModels, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();
  const { data: mobilitySolutions, isLoading: isLoadingSolutions } = useMobilitySolutions();
  
  const { 
    selectedGovernanceModel,
    selectedSolutions,
    selectedImplementationPlan,
    setSelectedImplementationPlan 
  } = useWizardStore();
  
  // Get selected governance model title for display
  const selectedGovernanceModelData = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)
    : null;
    
  // Get selected solutions
  const selectedSolutionsData = mobilitySolutions
    ? mobilitySolutions.filter(solution => selectedSolutions.includes(solution.id))
    : [];
    
  // Automatisch het eerste implementatieplan selecteren als er nog geen is geselecteerd
  useEffect(() => {
    if (implementationPlans && implementationPlans.length > 0 && !selectedImplementationPlan) {
      setSelectedImplementationPlan(implementationPlans[0].id);
    }
  }, [implementationPlans, selectedImplementationPlan, setSelectedImplementationPlan]);
  
  // Get the selected/default implementation plan
  const implementationPlan = implementationPlans && selectedImplementationPlan
    ? implementationPlans.find(plan => plan.id === selectedImplementationPlan)
    : null;
  
  const isLoading = isLoadingPlans || isLoadingModels || isLoadingSolutions;
  const error = plansError || modelsError;
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 4: Implementatieplan</h2>
        <p className="mb-6">
          Op basis van uw gekozen mobiliteitsoplossingen en governance model is een implementatieplan opgesteld.
          Dit plan beschrijft de stappen die nodig zijn om de mobiliteitsoplossingen succesvol te implementeren.
        </p>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Implementatieplan wordt geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van het implementatieplan.</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Context van eerdere keuzes */}
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="text-md font-semibold mb-2">Uw keuzes</h3>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium">Governance model:</h4>
                {selectedGovernanceModelData ? (
                  <p className="text-blue-800">{selectedGovernanceModelData.title}</p>
                ) : (
                  <p className="text-gray-500 italic">Geen governance model geselecteerd</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Geselecteerde mobiliteitsoplossingen:</h4>
                {selectedSolutionsData.length > 0 ? (
                  <ul className="list-disc pl-5 text-blue-800">
                    {selectedSolutionsData.map(solution => (
                      <li key={solution.id}>{solution.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Geen mobiliteitsoplossingen geselecteerd</p>
                )}
              </div>
            </div>
            
            {/* Implementatieplan content */}
            {implementationPlan ? (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{implementationPlan.title}</h3>
                <p className="text-gray-700 mb-6">{implementationPlan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold mr-2">Geschatte doorlooptijd:</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {implementationPlan.estimatedDuration}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Fasen</h4>
                  <div className="space-y-8">
                    {implementationPlan.phases.map((phase, index) => (
                      <div key={phase.id} className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="text-md font-medium mb-2">{phase.title}</h5>
                          <p className="text-gray-600 mb-4">{phase.description}</p>
                          
                          <div className="bg-gray-50 rounded-md p-4">
                            <h6 className="text-sm font-medium mb-2">Taken:</h6>
                            <ul className="space-y-2">
                              {phase.tasks.map(task => (
                                <li key={task.id} className="flex">
                                  <span className="mr-2">•</span>
                                  <div>
                                    <span className="font-medium">{task.title}</span>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {task.responsible.map((person, idx) => (
                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                          {person}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="text-md font-semibold mb-2">Benodigde middelen:</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      {implementationPlan.requiredResources.map((resource, index) => (
                        <li key={index}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold mb-2">Succesfactoren:</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      {implementationPlan.keySuccessFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Geen implementatieplan beschikbaar.</p>
              </div>
            )}
            
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Let op:</span> Dit implementatieplan is een richtlijn gebaseerd op uw gekozen 
                oplossingen en governance model. De specifieke invulling kan per situatie verschillen.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-3"
        nextStep="/wizard/samenvatting"
      />
    </div>
  );
} 