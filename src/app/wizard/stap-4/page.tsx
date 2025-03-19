'use client';

import { useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { BiTimeFive, BiLinkExternal, BiFile, BiCheckShield, BiListCheck, BiTask, BiInfoCircle } from 'react-icons/bi';

export default function ImplementationPlanPage() {
  const { data: governanceModels, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();
  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  
  const { 
    selectedGovernanceModel,
    selectedSolutions
  } = useWizardStore();
  
  // Get selected governance model data
  const selectedGovernanceModelData = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)
    : null;
    
  // Get selected solutions data
  const selectedSolutionsData = mobilitySolutions
    ? mobilitySolutions.filter(solution => selectedSolutions.includes(solution.id))
    : [];
    
  const isLoading = isLoadingModels || isLoadingSolutions;
  const error = modelsError || solutionsError;
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 4: Implementatieplan</h2>
        <p className="mb-6">
          Op basis van uw gekozen mobiliteitsoplossingen en governance model is een implementatieplan opgesteld.
          Dit plan biedt richtlijnen voor het implementeren van de gekozen oplossingen en bestuursmodel.
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
          <div className="space-y-8">
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
            
            {/* Implementatieplan voor bestuursmodel */}
            {selectedGovernanceModelData && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Implementatieplan bestuursmodel</h3>
                
                {/* Samenvatting */}
                {selectedGovernanceModelData.samenvatting && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiInfoCircle className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Samenvatting</h4>
                    </div>
                    <p className="text-gray-700 pl-7">{selectedGovernanceModelData.samenvatting}</p>
                  </div>
                )}
                
                {/* Aansprakelijkheid */}
                {selectedGovernanceModelData.aansprakelijkheid && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiCheckShield className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Aansprakelijkheid</h4>
                    </div>
                    <p className="text-gray-700 pl-7">{selectedGovernanceModelData.aansprakelijkheid}</p>
                  </div>
                )}
                
                {/* Benodigdheden Oprichting */}
                {selectedGovernanceModelData.benodigdhedenOprichting && selectedGovernanceModelData.benodigdhedenOprichting.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiListCheck className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Benodigdheden voor oprichting</h4>
                    </div>
                    <ul className="list-disc pl-12 text-gray-700">
                      {selectedGovernanceModelData.benodigdhedenOprichting.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Doorlooptijd */}
                {selectedGovernanceModelData.doorlooptijd && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiTimeFive className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Doorlooptijd</h4>
                    </div>
                    <p className="text-gray-700 pl-7">{selectedGovernanceModelData.doorlooptijd}</p>
                  </div>
                )}
                
                {/* Implementatie */}
                {selectedGovernanceModelData.implementatie && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiTask className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Implementatie</h4>
                    </div>
                    <p className="text-gray-700 pl-7">{selectedGovernanceModelData.implementatie}</p>
                  </div>
                )}
                
                {/* Links */}
                {selectedGovernanceModelData.links && selectedGovernanceModelData.links.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiLinkExternal className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Links</h4>
                    </div>
                    <ul className="list-disc pl-12 text-gray-700">
                      {selectedGovernanceModelData.links.map((link, index) => (
                        <li key={index}>
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Voorbeeld Contracten */}
                {selectedGovernanceModelData.voorbeeldContracten && selectedGovernanceModelData.voorbeeldContracten.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiFile className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Voorbeeld Contracten</h4>
                    </div>
                    <ul className="list-disc pl-12 text-gray-700">
                      {selectedGovernanceModelData.voorbeeldContracten.map((contract, index) => (
                        <li key={index}>
                          <a href={contract} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {contract}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Implementatieplan voor mobiliteitsoplossingen */}
            {selectedSolutionsData.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Implementatieplan mobiliteitsoplossingen</h3>
                
                {selectedSolutionsData.map(solution => (
                  <div key={solution.id} className="mb-6 border-l-4 border-blue-200 pl-4">
                    <h4 className="text-lg font-medium mb-2">{solution.title}</h4>
                    
                    {solution.implementatie ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <BiTask className="text-blue-600 text-xl mr-2" />
                          <h5 className="font-semibold">Implementatie</h5>
                        </div>
                        <p className="text-gray-700 pl-7">{solution.implementatie}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Geen implementatiedetails beschikbaar</p>
                    )}
                  </div>
                ))}
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