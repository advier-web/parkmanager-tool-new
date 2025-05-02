'use client';

import React from 'react';
import { useDialog } from '../contexts/dialog-context';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { MarkdownWithAccordions } from './markdown-with-accordions';
import { useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { BiDollar } from 'react-icons/bi';
import { GovernanceModel } from '@/domain/models';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

export function SolutionDialog() {
  const { isOpen, dialogType, currentSolution, compatibleGovernanceModels, currentGovernanceModel, currentReason, currentVariations, closeDialog } = useDialog();

  // Debug logs for troubleshooting
  useEffect(() => {
    if (dialogType === 'solution' && currentSolution) {
      console.log('Current Solution:', currentSolution);
      console.log('Compatible Governance Models:', compatibleGovernanceModels);
      console.log('Current Variations:', currentVariations);
      
      // Debug all available compatible governance models
      if (Array.isArray(compatibleGovernanceModels)) {
        console.log('ALL COMPATIBLE MODELS:', compatibleGovernanceModels.map(model => ({ id: model.id, title: model.title })));
      }
    }
  }, [dialogType, currentSolution, compatibleGovernanceModels, currentVariations]);

  if (!isOpen) {
    return null;
  }

  // Show business park reason information dialog
  if (dialogType === 'reason' && currentReason) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">{currentReason.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Reason description */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Beschrijving</h2>
              <MarkdownContent content={currentReason.description} />
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

  // Show solution information dialog
  if (dialogType === 'solution' && currentSolution) {
    // Keep needed variables
    const samenvattingLang = currentSolution.samenvattingLang;
    const description = currentSolution.description;
    const uitvoering = currentSolution.uitvoering;
    const inputBusinesscase = currentSolution.inputBusinesscase;
    const collectiefVsIndiviueel = currentSolution.collectiefVsIndiviueel;

    // Remove unused variables
    // const paspoort = currentSolution.paspoort || '';
    // const investering = currentSolution.costs || '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">{currentSolution.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="p-6 space-y-6"> 

            {/* Samenvatting Lang */}
            {samenvattingLang && (
              <section>
                <h2 className="text-xl font-bold mb-2">Samenvatting</h2>
                <MarkdownWithAccordions content={samenvattingLang} />
              </section>
            )}

            {/* Beschrijving */}
            {description && (
              <section>
                <h2 className="text-xl font-bold mb-2">Beschrijving</h2>
                <MarkdownWithAccordions content={description} />
              </section>
            )}

            {/* Uitvoering */}
            {uitvoering && (
              <section>
                <h2 className="text-xl font-bold mb-2">Uitvoering</h2>
                <MarkdownWithAccordions content={uitvoering} />
              </section>
            )}

            {/* Input Business Case */}
            {inputBusinesscase && (
              <section>
                <h2 className="text-xl font-bold mb-2">Input voor Business Case</h2>
                <MarkdownWithAccordions content={inputBusinesscase} />
              </section>
            )}

            {/* Implementatievarianten - Render met details uit currentVariations */}
            {currentVariations && currentVariations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-2">Implementatievarianten</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentVariations.map((variation, index) => { 
                    const displayTitle = stripSolutionPrefixFromVariantTitle(variation.title);
                    return (
                     <div key={variation.id || index} className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                       <h3 className="text-xl font-semibold mb-3 text-teal-700">{displayTitle}</h3>
                       {variation.samenvatting ? (
                         <div className="prose prose-sm max-w-none text-gray-600">
                           <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
                         </div>
                       ) : (
                         <p className="text-gray-500 italic text-sm">Geen samenvatting beschikbaar.</p>
                       )}
                     </div>
                   );
                  })}
                </div>
              </section>
            )}

            {/* Collectief vs Individueel */}
            {collectiefVsIndiviueel && (
              <section>
                <h2 className="text-xl font-bold mb-2">Collectief vs Individueel</h2>
                <MarkdownWithAccordions content={collectiefVsIndiviueel} />
              </section>
            )}

            {/* Uitgecommenteerde secties */}
            {/*
            {paspoort && (<section>...</section>)} // Paspoort is uit
            {investering && (<section>...</section>)} // Investering (costs) is uit
            {currentSolution?.investering && (...)} // Dubbele investering is uit
            <section><h2>Geschikte governance modellen</h2>...</section> // Governance modellen is uit
            */}

          </div>
          
          {/* Footer */}
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
  
  // Helper function for rendering list items with markdown support
  const renderListItem = (text: string, index: number) => {
    return <li key={index}><MarkdownContent content={processMarkdownText(text)} disableListStyles={true} /></li>;
  };

  // Show governance model information dialog
  if (dialogType === 'governance' && currentGovernanceModel) {
    // REMOVED Debug logs for model data
    
    // Use GovernanceModel type where possible, cast to any for potential Contentful fields
    const typedModel = currentGovernanceModel as GovernanceModel;
    const anyModel = currentGovernanceModel as any;
    
    const advantages = typedModel.advantages || anyModel.voordelen || [];
    const disadvantages = typedModel.disadvantages || anyModel.nadelen || [];
    const benodigdheden = typedModel.benodigdhedenOprichting || anyModel.benodigdhedenOprichting || [];
    const links = typedModel.links || anyModel.links || [];
    const doorlooptijdLang = typedModel.doorlooptijdLang || anyModel.doorlooptijdLang || '';
    const aansprakelijkheid = typedModel.aansprakelijkheid || anyModel.aansprakelijkheid || '';
    
    // const contentfulFields = (currentGovernanceModel as any).fields || {}; // Keep this approach for direct field access if needed
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">{currentGovernanceModel.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-4 text-sm text-gray-700">
            {/* Use the typed variables */} 
            {typedModel.description && (
              <div>
                <h3 className="text-base font-semibold mb-1">Beschrijving</h3>
                <MarkdownContent content={processMarkdownText(typedModel.description)} />
              </div>
            )}
            {/* ADDED Aansprakelijkheid section */} 
            {aansprakelijkheid && (
              <div>
                <h3 className="text-base font-semibold mb-1">Aansprakelijkheid</h3>
                <MarkdownContent content={processMarkdownText(aansprakelijkheid)} />
              </div>
            )}
            {/* Render advantages as Markdown if it's a string (or first element of array) */}
            {advantages && advantages.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-1">Voordelen</h3>
                {typeof advantages[0] === 'string' ? (
                  <MarkdownContent content={processMarkdownText(advantages[0])} />
                ) : (
                  /* Optional: Handle array case differently if needed later */ 
                  <ul className="list-disc pl-5">
                    {advantages.map(renderListItem)}
                  </ul>
                )}
              </div>
            )}
             {/* Render disadvantages as Markdown if it's a string (or first element of array) */}
            {disadvantages && disadvantages.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-1">Nadelen</h3>
                 {typeof disadvantages[0] === 'string' ? (
                  <MarkdownContent content={processMarkdownText(disadvantages[0])} />
                ) : (
                   /* Optional: Handle array case differently if needed later */ 
                  <ul className="list-disc pl-5">
                    {disadvantages.map(renderListItem)}
                  </ul>
                )}
              </div>
            )}
            {/* Render benodigdheden based on type */} 
            {benodigdheden && (
              <div>
                <h3 className="text-base font-semibold mb-1">Benodigdheden Oprichting</h3>
                {Array.isArray(benodigdheden) ? (
                  <ul className="list-disc pl-5">
                    {benodigdheden.map(renderListItem)}
                  </ul>
                ) : typeof benodigdheden === 'string' ? (
                  <MarkdownContent content={processMarkdownText(benodigdheden)} />
                ) : (
                  <p className="text-sm italic text-gray-500">Kon benodigdheden niet weergeven (onverwacht type).</p>
                )}
              </div>
            )}
            {/* REMOVED Links section */}
            {/* REMOVED Doorlooptijd section */}
            {/* ... Potentially render other fields from typedModel ... */}
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
  
  return null;
} 