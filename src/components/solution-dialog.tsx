'use client';

import { useDialog } from '../contexts/dialog-context';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { useEffect } from 'react';

export function SolutionDialog() {
  const { isOpen, dialogType, currentSolution, compatibleGovernanceModels, currentGovernanceModel, currentReason, closeDialog } = useDialog();

  // Debug logs for troubleshooting
  useEffect(() => {
    if (dialogType === 'solution' && currentSolution) {
      console.log('Current Solution:', currentSolution);
      console.log('Governance Models:', currentSolution.governanceModels);
      console.log('Governance Models Mits:', currentSolution.governanceModelsMits);
      console.log('Governance Models Niet Geschikt:', currentSolution.governanceModelsNietgeschikt);
      console.log('Compatible Governance Models:', compatibleGovernanceModels);
      
      console.log('GM Type:', Array.isArray(currentSolution.governanceModels));
      console.log('GM Length:', currentSolution.governanceModels?.length);
      console.log('GM-Mits Type:', Array.isArray(currentSolution.governanceModelsMits));
      console.log('GM-Mits Length:', currentSolution.governanceModelsMits?.length);
      console.log('GM-Niet Type:', Array.isArray(currentSolution.governanceModelsNietgeschikt));
      console.log('GM-Niet Length:', currentSolution.governanceModelsNietgeschikt?.length);
    }
  }, [dialogType, currentSolution, compatibleGovernanceModels]);

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
    // Nieuwe velden uit Contentful toegevoegd
    const paspoort = currentSolution.paspoort || '';
    const collectiefVsIndiviueel = currentSolution.collectiefVsIndiviueel || '';
    const effecten = currentSolution.effecten || '';
    const investering = currentSolution.investering || '';
    const governancemodellenToelichting = currentSolution.governancemodellenToelichting || '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            {/* Paspoort (nieuw veld) */}
            {paspoort && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Paspoort</h2>
                <MarkdownContent content={paspoort} />
                <div className="border-b border-gray-200 mt-6"></div>
              </section>
            )}
            
            {/* Solution description */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Beschrijving</h2>
              <MarkdownContent content={currentSolution.description} />
              <div className="border-b border-gray-200 mt-6"></div>
            </section>
            
            {/* Collectief vs Individueel (nieuw veld) */}
            {collectiefVsIndiviueel && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Collectief vs Individueel</h2>
                <MarkdownContent content={collectiefVsIndiviueel} />
                <div className="border-b border-gray-200 mt-6"></div>
              </section>
            )}
            
            {/* Effecten (nieuw veld) */}
            {effecten && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Effecten</h2>
                <MarkdownContent content={effecten} />
                <div className="border-b border-gray-200 mt-6"></div>
              </section>
            )}
            
            {/* Investering (nieuw veld) */}
            {investering && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Investering</h2>
                <MarkdownContent content={investering} />
                <div className="border-b border-gray-200 mt-6"></div>
              </section>
            )}
            
            {/* Compatible governance models */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Geschikte governance modellen</h2>
              
              {/* Aanbevolen governance modellen */}
              {Array.isArray(currentSolution.governanceModels) && currentSolution.governanceModels.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-green-700 border-b pb-2 mb-2">Aanbevolen modellen</h3>
                  <div className="space-y-3">
                    {compatibleGovernanceModels
                      ?.filter(model => {
                        return currentSolution.governanceModels?.some(
                          ref => typeof ref === 'string' ? ref === model.id : ref?.sys?.id === model.id
                        );
                      })
                      .map((model) => (
                        <div key={model.id} className="p-3 border rounded-md bg-green-50 border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{model.title}</h4>
                              {model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>}
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Aanbevolen
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Aanbevolen mits governance modellen */}
              {Array.isArray(currentSolution.governanceModelsMits) && currentSolution.governanceModelsMits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-700 border-b pb-2 mb-2">Aanbevolen, mits...</h3>
                  <div className="space-y-3">
                    {compatibleGovernanceModels
                      ?.filter(model => {
                        return currentSolution.governanceModelsMits?.some(
                          ref => typeof ref === 'string' ? ref === model.id : ref?.sys?.id === model.id
                        );
                      })
                      .map((model) => (
                        <div key={model.id} className="p-3 border rounded-md bg-blue-50 border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{model.title}</h4>
                              {model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>}
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Aanbevolen, mits...
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Niet geschikte governance modellen */}
              {Array.isArray(currentSolution.governanceModelsNietgeschikt) && currentSolution.governanceModelsNietgeschikt.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-700 border-b pb-2 mb-2">Ongeschikte governance modellen</h3>
                  <div className="space-y-3">
                    {compatibleGovernanceModels
                      ?.filter(model => {
                        return currentSolution.governanceModelsNietgeschikt?.some(
                          ref => typeof ref === 'string' ? ref === model.id : ref?.sys?.id === model.id
                        );
                      })
                      .map((model) => (
                        <div key={model.id} className="p-3 border rounded-md bg-red-50 border-red-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{model.title}</h4>
                              {model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>}
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Niet geschikt
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Toon bericht als er geen modellen zijn */}
              {(!Array.isArray(currentSolution.governanceModels) || currentSolution.governanceModels.length === 0) &&
               (!Array.isArray(currentSolution.governanceModelsMits) || currentSolution.governanceModelsMits.length === 0) &&
               (!Array.isArray(currentSolution.governanceModelsNietgeschikt) || currentSolution.governanceModelsNietgeschikt.length === 0) && (
                <p className="text-gray-500 italic my-4">Geen specifieke governance modellen gevonden voor deze oplossing.</p>
              )}
              
              <div className="border-b border-gray-200 mt-6"></div>
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
  
  // Helper function for rendering list items with markdown support
  const renderListItem = (text: string, index: number) => {
    return <li key={index}><MarkdownContent content={processMarkdownText(text)} disableListStyles={true} /></li>;
  };

  // Show governance model information dialog
  if (dialogType === 'governance' && currentGovernanceModel) {
    // Log model data for debugging
    console.log('Governance model data - title:', currentGovernanceModel.title);
    console.log('Governance model data - description:', currentGovernanceModel.description);
    
    // Try to access fields from both standard model structure and contentful-specific structure
    const advantages = currentGovernanceModel.advantages || 
                      (currentGovernanceModel as any).voordelen || 
                      [];
    
    const disadvantages = currentGovernanceModel.disadvantages || 
                         (currentGovernanceModel as any).nadelen || 
                         [];
    
    // Special fields access
    const benodigdheden = currentGovernanceModel.benodigdhedenOprichting || 
                         (currentGovernanceModel as any).benodigdhedenOprichting ||
                         [];
                         
    const links = currentGovernanceModel.links || 
                 (currentGovernanceModel as any).links || 
                 [];
    
    const doorlooptijdLang = currentGovernanceModel.doorlooptijdLang || 
                        (currentGovernanceModel as any).doorlooptijdLang || 
                        '';
    
    // If fields contains a direct contentful fields object, try to use it
    const contentfulFields = (currentGovernanceModel as any).fields || {};
    
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
          
          <div className="p-6">
            {/* Governance model description */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Beschrijving</h2>
              <MarkdownContent content={processMarkdownText(currentGovernanceModel.description)} />
              <div className="border-b border-gray-200 mt-6"></div>
            </section>
            
            {/* Advantages and disadvantages */}
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">Voordelen</h2>
                  {Array.isArray(advantages) && advantages.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {advantages.map((advantage, index) => renderListItem(advantage, index))}
                    </ul>
                  ) : contentfulFields.voordelen && Array.isArray(contentfulFields.voordelen) ? (
                    <ul className="list-disc pl-5">
                      {contentfulFields.voordelen.map((item: string, idx: number) => renderListItem(item, idx))}
                    </ul>
                  ) : contentfulFields.voordelen && typeof contentfulFields.voordelen === 'string' ? (
                    <ul className="list-disc pl-5">
                      <li><MarkdownContent content={processMarkdownText(contentfulFields.voordelen)} /></li>
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Geen voordelen beschikbaar</p>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-2">Nadelen</h2>
                  {Array.isArray(disadvantages) && disadvantages.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {disadvantages.map((disadvantage, index) => renderListItem(disadvantage, index))}
                    </ul>
                  ) : contentfulFields.nadelen && Array.isArray(contentfulFields.nadelen) ? (
                    <ul className="list-disc pl-5">
                      {contentfulFields.nadelen.map((item: string, idx: number) => renderListItem(item, idx))}
                    </ul>
                  ) : contentfulFields.nadelen && typeof contentfulFields.nadelen === 'string' ? (
                    <ul className="list-disc pl-5">
                      <li><MarkdownContent content={processMarkdownText(contentfulFields.nadelen)} /></li>
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Geen nadelen beschikbaar</p>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-200 mt-6"></div>
            </section>
            
            {/* Setup requirements */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Benodigdheden voor oprichting</h2>
              <div className="text-gray-700">
                {typeof benodigdheden === 'string' ? (
                  <MarkdownContent content={processMarkdownText(benodigdheden)} />
                ) : Array.isArray(benodigdheden) && benodigdheden.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {benodigdheden.map((item, index) => renderListItem(item, index))}
                  </ul>
                ) : contentfulFields.benodigdhedenOprichting && typeof contentfulFields.benodigdhedenOprichting === 'string' ? (
                  <MarkdownContent content={processMarkdownText(contentfulFields.benodigdhedenOprichting)} />
                ) : contentfulFields.benodigdhedenOprichting && Array.isArray(contentfulFields.benodigdhedenOprichting) ? (
                  <ul className="list-disc pl-5">
                    {contentfulFields.benodigdhedenOprichting.map((item: string, idx: number) => renderListItem(item, idx))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">Geen benodigdheden beschikbaar</p>
                )}
              </div>
              <div className="border-b border-gray-200 mt-6"></div>
            </section>
            
            {/* Timeline */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Doorlooptijd</h2>
              <div className="text-gray-700">
                {doorlooptijdLang || contentfulFields.doorlooptijdLang ? (
                  <MarkdownContent content={processMarkdownText(doorlooptijdLang || contentfulFields.doorlooptijdLang)} />
                ) : (
                  <span className="text-gray-500 italic">Niet gespecificeerd</span>
                )}
              </div>
              <div className="border-b border-gray-200 mt-6"></div>
            </section>
            
            {/* Links */}
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-2">Links</h2>
              <div className="text-gray-700">
                {typeof links === 'string' ? (
                  <MarkdownContent content={processMarkdownText(links)} />
                ) : Array.isArray(links) && links.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {links.map((link, index) => {
                      // Controleer of het een URL is en converteer indien nodig
                      const isUrl = link.match(/https?:\/\/[^\s]+/);
                      if (isUrl) {
                        return (
                          <li key={index}>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {link}
                            </a>
                          </li>
                        );
                      }
                      return renderListItem(link, index);
                    })}
                  </ul>
                ) : contentfulFields.links && typeof contentfulFields.links === 'string' ? (
                  <MarkdownContent content={processMarkdownText(contentfulFields.links)} />
                ) : contentfulFields.links && Array.isArray(contentfulFields.links) ? (
                  <ul className="list-disc pl-5">
                    {contentfulFields.links.map((link: string, idx: number) => {
                      // Controleer of het een URL is en converteer indien nodig
                      const isUrl = link.match(/https?:\/\/[^\s]+/);
                      if (isUrl) {
                        return (
                          <li key={idx}>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {link}
                            </a>
                          </li>
                        );
                      }
                      return renderListItem(link, idx);
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">Geen links beschikbaar</p>
                )}
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
  
  return null;
} 