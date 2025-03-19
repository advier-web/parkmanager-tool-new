'use client';

import { useDialog } from '../contexts/dialog-context';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function SolutionDialog() {
  const { isOpen, currentSolution, compatibleGovernanceModels, closeDialog } = useDialog();

  if (!isOpen || !currentSolution) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{currentSolution.title}</h2>
          <button
            onClick={closeDialog}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Solution description */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Beschrijving</h3>
            <p className="text-gray-700">{currentSolution.description}</p>
          </section>
          
          {/* Compatible governance models */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Geschikte governance modellen</h3>
            {compatibleGovernanceModels && compatibleGovernanceModels.length > 0 ? (
              <div className="space-y-3">
                {compatibleGovernanceModels.map((model) => (
                  <div key={model.id} className="p-3 border rounded-md bg-blue-50">
                    <h4 className="font-medium">{model.title}</h4>
                    {model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Geen specifieke governance modellen gevonden voor deze oplossing.</p>
            )}
          </section>
          
          {/* Additional information */}
          <section className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-semibold mb-2">Voordelen</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {currentSolution.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2">Uitdagingen</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {currentSolution.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={closeDialog}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
} 