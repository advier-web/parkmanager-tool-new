'use client';

import { useWizardStore } from '../../../lib/store';
import { useMobilitySolutions } from '../../../hooks/use-domain-models';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Accordion } from '../../../components/accordion'; // If needed for layout
import { BiInfoCircle, BiCheckCircle } from 'react-icons/bi';
import { WizardChoicesSummary } from '@/components/wizard-choices-summary'; // Import choices summary
import { extractImplementationText, extractVariantNamesInOrder } from '../../../utils/wizard-helpers'; // Import helper
import { MarkdownContent, processMarkdownText } from '../../../components/markdown-content'; // Import markdown renderer

export default function ImplementationVariantPage() {
  const { 
    selectedSolutions,
    selectedVariants,
    setSelectedVariant
  } = useWizardStore();
  
  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();

  // Get selected solutions data with variant info
  const selectedSolutionsData = mobilitySolutions
    ? mobilitySolutions.filter(solution => selectedSolutions.includes(solution.id))
    : [];

  const isLoading = isLoadingSolutions;
  const error = solutionsError;

  // Determine if the next button should be disabled
  const isNextDisabled = selectedSolutionsData.some(solution => 
    // Check if the solution HAS variants AND no variant is selected for it
    solution.implementatievarianten && 
    solution.implementatievarianten.length > 0 && 
    !selectedVariants[solution.id]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Add Choices Summary above Info */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
           <WizardChoicesSummary /> {/* Add choices summary here */}
           {/* Original informational content */}
           <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
              <p className="text-gray-600 text-sm">
                Voor sommige mobiliteitsoplossingen zijn er verschillende manieren om ze te implementeren (varianten).
                Uw keuze hier kan invloed hebben op de meest geschikte governance modellen in de volgende stap.
              </p>
            </div>
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Kies per oplossing de gewenste variant.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-8 shadow-even mb-8">
            <h2 className="text-2xl font-bold mb-4">Stap 2b: Kies Implementatievariant</h2>
            <p className="mb-6">
              Selecteer hieronder voor elke gekozen mobiliteitsoplossing de gewenste implementatievariant, indien beschikbaar.
            </p>
            
            {isLoading && <p>Oplossingen laden...</p>}
            {error && <p className="text-red-500">Fout bij laden oplossingen.</p>}
            
            {!isLoading && !error && selectedSolutionsData.length > 0 ? (
              <div className="space-y-6">
                {selectedSolutionsData
                  .filter(solution => solution.implementatievarianten && solution.implementatievarianten.length > 0)
                  .map(solution => {
                    // Use the new helper to get variant names in markdown order
                    const orderedVariantNames = extractVariantNamesInOrder(solution.uitvoeringsmogelijkheden);
                    
                    // Keep this for checking selection state
                    const selectedVariantName = selectedVariants[solution.id] || null;
                    
                    // Optional: You could filter orderedVariantNames based on solution.implementatievarianten 
                    // if you want to ensure only variants listed in BOTH places are shown.
                    // For now, we'll trust the markdown order as requested.

                    return (
                      <div key={solution.id} className="p-4 rounded-md space-y-4">
                        <Label className="font-semibold block text-lg mb-4">{solution.title}</Label>
                        
                        {/* Variant Selection Cards - Iterate over ordered names */}
                        <div className="grid grid-cols-1 gap-4">
                          {orderedVariantNames.map(variantName => {
                            const isSelected = selectedVariantName === variantName;
                            // Get the specific text for this variant using the existing helper
                            const variantText = extractImplementationText(solution.uitvoeringsmogelijkheden, variantName);

                            return (
                              <div 
                                key={variantName} 
                                onClick={() => setSelectedVariant(solution.id, variantName)}
                                className={`relative flex flex-col p-6 border rounded-lg cursor-pointer transition-all duration-150 ${isSelected 
                                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' 
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {/* Variant Name Title */} 
                                <span className="text-lg font-semibold mb-3">
                                  {variantName}
                                </span>
                                
                                {/* Uitvoeringsmogelijkheden Content inside card, filtered by variant */}
                                <div className="text-sm text-gray-600 prose prose-sm max-w-none mt-2 flex-grow">
                                  <MarkdownContent 
                                    content={processMarkdownText(variantText)} // Use the extracted text 
                                  />
                                </div>
                                
                                {isSelected && (
                                  <BiCheckCircle className="absolute top-3 right-3 h-6 w-6 text-blue-600" /> // Slightly larger/repositioned check
                                )}
                                {/* Hidden Radio Input */}
                                <input 
                                  type="radio" 
                                  name={`variant-${solution.id}`} 
                                  id={`${solution.id}-${variantName}`} 
                                  value={variantName} 
                                  checked={isSelected} 
                                  onChange={() => setSelectedVariant(solution.id, variantName)} 
                                  className="sr-only" 
                                /> 
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                {/* Message if no solutions have variants */}
                {selectedSolutionsData.every(s => !s.implementatievarianten || s.implementatievarianten.length === 0) && (
                  <p className="text-gray-500">Geen van de geselecteerde oplossingen heeft specifieke implementatievarianten.</p>
                )}
              </div>
            ) : (
              !isLoading && !error && <p className="text-gray-500">Geen mobiliteitsoplossingen geselecteerd in de vorige stap.</p>
            )}
          </div>
        </div>
      </div>

      <WizardNavigation
        previousStep="/wizard/stap-2"
        nextStep="/wizard/stap-3"
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
} 