'use client';

import { useState } from 'react';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { useBusinessParkReasons, useMobilitySolutions, useGovernanceModels, useImplementationPlans } from '../../../hooks/use-domain-models';
import { isValidEmail } from '../../../utils/helper';

export default function SummaryPage() {
  const [userInfo, setUserInfo] = useState({
    businessParkName: '',
    contactPerson: '',
    contactEmail: ''
  });
  const [formErrors, setFormErrors] = useState({
    businessParkName: '',
    contactPerson: '',
    contactEmail: ''
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const {
    businessParkInfo,
    currentGovernanceModelId,
    selectedReasons,
    selectedSolutions,
    selectedGovernanceModel,
    selectedImplementationPlan,
    setBusinessParkDetails
  } = useWizardStore();
  
  const { data: reasons } = useBusinessParkReasons();
  const { data: solutions } = useMobilitySolutions();
  const { data: governanceModels } = useGovernanceModels();
  const { data: implementationPlans } = useImplementationPlans();
  
  // Get selected item titles
  const selectedReasonTitles = reasons
    ? reasons
        .filter(reason => selectedReasons.includes(reason.id))
        .map(reason => reason.title)
    : [];
    
  const selectedSolutionTitles = solutions
    ? solutions
        .filter(solution => selectedSolutions.includes(solution.id))
        .map(solution => solution.title)
    : [];
  
  const selectedGovernanceModelTitle = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)?.title || ''
    : '';
    
  const selectedImplementationPlanTitle = implementationPlans && selectedImplementationPlan
    ? implementationPlans.find(plan => plan.id === selectedImplementationPlan)?.title || ''
    : '';
    
  const currentGovernanceModelTitle = governanceModels && currentGovernanceModelId
    ? governanceModels.find(model => model.id === currentGovernanceModelId)?.title || ''
    : '';
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {
      businessParkName: '',
      contactPerson: '',
      contactEmail: ''
    };
    
    if (!userInfo.businessParkName.trim()) {
      errors.businessParkName = 'Voer de naam van het bedrijfsterrein in';
    }
    
    if (!userInfo.contactPerson.trim()) {
      errors.contactPerson = 'Voer een contactpersoon in';
    }
    
    if (!userInfo.contactEmail.trim()) {
      errors.contactEmail = 'Voer een e-mailadres in';
    } else if (!isValidEmail(userInfo.contactEmail)) {
      errors.contactEmail = 'Voer een geldig e-mailadres in';
    }
    
    setFormErrors(errors);
    
    // Return true if there are no errors
    return !Object.values(errors).some(error => error);
  };
  
  // Handle PDF export
  const handleExportPdf = async () => {
    const isValid = validateForm();
    
    if (isValid) {
      try {
        setIsGeneratingPdf(true);
        
        // Save user info to store
        setBusinessParkDetails(
          userInfo.businessParkName,
          userInfo.contactPerson,
          userInfo.contactEmail
        );
        
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, we would generate the PDF here using jsPDF
        // For now, just log a message
        console.log('Generating PDF with data:', {
          userInfo,
          selectedReasons: selectedReasonTitles,
          selectedSolutions: selectedSolutionTitles,
          governanceModel: selectedGovernanceModelTitle,
          implementationPlan: selectedImplementationPlanTitle
        });
        
        alert('Het PDF-document is succesvol gegenereerd! In een echte implementatie zou dit worden gedownload.');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Er is een fout opgetreden bij het genereren van de PDF.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Samenvatting</h2>
        <p className="mb-6">
          Een overzicht van uw geselecteerde opties voor het mobiliteitsplan van uw bedrijfsterrein.
        </p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Informatie over het bedrijventerrein</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Aantal bedrijven:</p>
                <p>{businessParkInfo.numberOfCompanies}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Aantal werknemers:</p>
                <p>{businessParkInfo.numberOfEmployees}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Verkeerstypen:</p>
              <ul className="list-disc pl-5">
                {(businessParkInfo.trafficTypes || []).map(type => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </div>
            {currentGovernanceModelTitle && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Huidig bestuursmodel:</p>
                <p>{currentGovernanceModelTitle}</p>
              </div>
            )}
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Geselecteerde redenen</h3>
            {selectedReasonTitles.length > 0 ? (
              <ul className="list-disc pl-5">
                {selectedReasonTitles.map((title, index) => (
                  <li key={index}>{title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Geen redenen geselecteerd.</p>
            )}
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Geselecteerde mobiliteitsoplossingen</h3>
            {selectedSolutionTitles.length > 0 ? (
              <ul className="list-disc pl-5">
                {selectedSolutionTitles.map((title, index) => (
                  <li key={index}>{title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Geen mobiliteitsoplossingen geselecteerd.</p>
            )}
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Gekozen governance model</h3>
            {selectedGovernanceModelTitle ? (
              <p>{selectedGovernanceModelTitle}</p>
            ) : (
              <p className="text-gray-500">Geen governance model geselecteerd.</p>
            )}
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Implementatieplan</h3>
            {selectedImplementationPlanTitle ? (
              <p>{selectedImplementationPlanTitle}</p>
            ) : (
              <p className="text-gray-500">Geen implementatieplan beschikbaar.</p>
            )}
          </section>
          
          <section className="pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Uw gegevens</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vul uw gegevens in om het mobiliteitsplan te personaliseren en als PDF te exporteren.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="businessParkName" className="block text-sm font-medium text-gray-700 mb-1">
                  Naam bedrijfsterrein
                </label>
                <input
                  type="text"
                  id="businessParkName"
                  name="businessParkName"
                  value={userInfo.businessParkName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                    formErrors.businessParkName ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.businessParkName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.businessParkName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Contactpersoon
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={userInfo.contactPerson}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                    formErrors.contactPerson ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactPerson}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={userInfo.contactEmail}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm px-3 py-2 border ${
                    formErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactEmail}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isGeneratingPdf ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                `}
              >
                {isGeneratingPdf ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PDF wordt gegenereerd...
                  </>
                ) : (
                  'Exporteer als PDF'
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-4"
      />
    </div>
  );
} 