'use client';

import { useState } from 'react';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useGovernanceModels } from '../../../hooks/use-domain-models';
import { TrafficType } from '../../../domain/models';

export default function BusinessParkInfoPage() {
  const { data: governanceModels, isLoading, error } = useGovernanceModels();
  const { 
    businessParkInfo, 
    setBusinessParkInfo, 
    currentGovernanceModelId,
    setCurrentGovernanceModel 
  } = useWizardStore();
  
  const [formErrors, setFormErrors] = useState({
    numberOfCompanies: '',
    numberOfEmployees: '',
    currentGovernanceModelId: '',
    trafficTypes: ''
  });
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setBusinessParkInfo({ [name]: numValue });
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle governance model selection
  const handleGovernanceModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setCurrentGovernanceModel(value === '' ? null : value);
    
    // Clear error
    if (formErrors.currentGovernanceModelId) {
      setFormErrors(prev => ({ ...prev, currentGovernanceModelId: '' }));
    }
  };
  
  // Handle traffic type selection
  const handleTrafficTypeChange = (type: TrafficType) => {
    const currentTrafficTypes = businessParkInfo.trafficTypes || [];
    
    setBusinessParkInfo({
      trafficTypes: currentTrafficTypes.includes(type)
        ? currentTrafficTypes.filter(t => t !== type)
        : [...currentTrafficTypes, type]
    });
    
    // Clear error
    if (formErrors.trafficTypes) {
      setFormErrors(prev => ({ ...prev, trafficTypes: '' }));
    }
  };
  
  // Check if form is valid for navigation
  // Alle velden zijn nu optioneel
  const isFormValid = true;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Deze informatie helpt ons om een passend advies te geven voor uw bedrijventerrein. 
                De grootte en complexiteit van het terrein bepalen mede welke mobiliteitsoplossingen het meest geschikt zijn.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Huidige situatie</h3>
              <p className="text-gray-600 text-sm">
                Het is belangrijk om te weten wat uw huidige bestuursmodel is. 
                Dit helpt ons later te bepalen of er aanpassingen nodig zijn voor de implementatie van nieuwe mobiliteitsoplossingen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Type verkeer</h3>
              <p className="text-gray-600 text-sm">
                Door aan te geven voor welk type verkeer u oplossingen zoekt, 
                kunnen we gerichter adviseren over mobiliteitsoplossingen die aansluiten bij uw behoeften.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Deze gegevens worden gebruikt om uw advies te personaliseren</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Informatie over uw bedrijventerrein</h2>
            <p className="mb-6">
              Voordat we beginnen, hebben we wat basisinformatie nodig over het bedrijventerrein 
              waarvoor u het mobiliteitsplan wilt opstellen.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="numberOfCompanies" className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal bedrijven op het terrein
                </label>
                <input
                  type="number"
                  id="numberOfCompanies"
                  name="numberOfCompanies"
                  min="1"
                  value={businessParkInfo.numberOfCompanies || ''}
                  onChange={handleNumberChange}
                  className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                    formErrors.numberOfCompanies ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.numberOfCompanies && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.numberOfCompanies}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-1">
                  Totaal aantal werknemers
                </label>
                <input
                  type="number"
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  min="1"
                  value={businessParkInfo.numberOfEmployees || ''}
                  onChange={handleNumberChange}
                  className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                    formErrors.numberOfEmployees ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.numberOfEmployees && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.numberOfEmployees}</p>
                )}
              </div>
              
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Voor welk type verkeer zoekt u oplossingen?
                  </legend>
                  <div className="space-y-2">
                    {Object.values(TrafficType).map(type => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`traffic-${type}`}
                          name="trafficTypes"
                          type="checkbox"
                          checked={(businessParkInfo.trafficTypes || []).includes(type)}
                          onChange={() => handleTrafficTypeChange(type)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`traffic-${type}`}
                          className="ml-3 block text-sm text-gray-700 capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formErrors.trafficTypes && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.trafficTypes}</p>
                  )}
                </fieldset>
              </div>
              
              <div>
                <label htmlFor="currentGovernanceModelId" className="block text-sm font-medium text-gray-700 mb-1">
                  Huidig bestuursmodel
                </label>
                
                {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    <span>Bestuursmodellen worden geladen...</span>
                  </div>
                )}
                
                {error && (
                  <p className="text-sm text-red-600">Er is een fout opgetreden bij het laden van bestuursmodellen.</p>
                )}
                
                {!isLoading && !error && (
                  <>
                    <select
                      id="currentGovernanceModelId"
                      name="currentGovernanceModelId"
                      value={currentGovernanceModelId || ''}
                      onChange={handleGovernanceModelChange}
                      className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                        formErrors.currentGovernanceModelId ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Selecteer een bestuursmodel</option>
                      {governanceModels?.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.title}
                        </option>
                      ))}
                    </select>
                    {formErrors.currentGovernanceModelId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.currentGovernanceModelId}</p>
                    )}
                  </>
                )}
                
                {currentGovernanceModelId && governanceModels && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-semibold mb-2">
                      {governanceModels.find(model => model.id === currentGovernanceModelId)?.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {governanceModels.find(model => model.id === currentGovernanceModelId)?.samenvatting}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <WizardNavigation
        nextStep="/wizard/stap-1"
        isNextDisabled={!isFormValid}
      />
    </div>
  );
} 