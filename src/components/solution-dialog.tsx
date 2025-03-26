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
      
      // Detailed debugging for Governance Models structure
      if (Array.isArray(currentSolution.governanceModels)) {
        console.log('DETAILED GM:', currentSolution.governanceModels.map(ref => {
          return { type: typeof ref, isObject: typeof ref === 'object', value: ref, id: typeof ref === 'string' ? ref : ref?.sys?.id };
        }));
      }
      
      if (Array.isArray(currentSolution.governanceModelsMits)) {
        console.log('DETAILED GM-Mits:', currentSolution.governanceModelsMits.map(ref => {
          return { type: typeof ref, isObject: typeof ref === 'object', value: ref, id: typeof ref === 'string' ? ref : ref?.sys?.id };
        }));
      }
      
      if (Array.isArray(currentSolution.governanceModelsNietgeschikt)) {
        console.log('DETAILED GM-Niet:', currentSolution.governanceModelsNietgeschikt.map(ref => {
          return { type: typeof ref, isObject: typeof ref === 'object', value: ref, id: typeof ref === 'string' ? ref : ref?.sys?.id };
        }));
      }
      
      // Debug all available compatible governance models
      if (Array.isArray(compatibleGovernanceModels)) {
        console.log('ALL COMPATIBLE MODELS:', compatibleGovernanceModels.map(model => ({ id: model.id, title: model.title })));
      }
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
              
              {/* Render models helper function */}
              {(() => {
                // Check if we have the necessary data
                if (!compatibleGovernanceModels || !Array.isArray(compatibleGovernanceModels) || compatibleGovernanceModels.length === 0) {
                  return <p className="text-gray-500 italic my-4">Geen governance modellen beschikbaar.</p>;
                }
                
                // Helper functie om de juiste rechtsvorm tekst te bepalen voor een specifiek governance model
                const getRechtsvormText = (model: any) => {
                  if (!currentSolution) return '';
                  
                  console.log('Rechtsvorm velden in currentSolution:', {
                    vereniging: currentSolution.vereniging,
                    stichting: currentSolution.stichting,
                    ondernemersBiz: currentSolution.ondernemersBiz,
                    vastgoedBiz: currentSolution.vastgoedBiz,
                    gemengdeBiz: currentSolution.gemengdeBiz,
                    cooperatieUa: currentSolution.cooperatieUa,
                    bv: currentSolution.bv,
                    ondernemersfonds: currentSolution.ondernemersfonds,
                    geenRechtsvorm: currentSolution.geenRechtsvorm
                  });
                  
                  // Eerst controleren of er een expliciete legalForm in het model staat
                  if (model.legalForm) {
                    const legalForm = model.legalForm.toLowerCase();
                    if (legalForm.includes('vereniging')) return currentSolution.vereniging;
                    if (legalForm.includes('stichting')) return currentSolution.stichting;
                    if (legalForm.includes('ondernemers biz') || legalForm.includes('ondernemersbiz')) return currentSolution.ondernemersBiz;
                    if (legalForm.includes('vastgoed biz') || legalForm.includes('vastgoedbiz')) return currentSolution.vastgoedBiz;
                    if (legalForm.includes('gemengde biz') || legalForm.includes('gemengdebiz')) return currentSolution.gemengdeBiz;
                    if (legalForm.includes('coöperatie') || legalForm.includes('cooperatie')) return currentSolution.cooperatieUa;
                    if (legalForm.includes('bv') || legalForm.includes('besloten vennootschap')) return currentSolution.bv;
                    if (legalForm.includes('ondernemersfonds')) return currentSolution.ondernemersfonds;
                  }
                  
                  // Als er geen match is op legalForm, dan matchen op titel
                  const title = model.title.toLowerCase();
                  if (title.includes('vereniging')) return currentSolution.vereniging;
                  if (title.includes('stichting')) return currentSolution.stichting;
                  if (title.includes('ondernemers biz') || title.includes('ondernemersbiz')) return currentSolution.ondernemersBiz;
                  if (title.includes('vastgoed biz') || title.includes('vastgoedbiz')) return currentSolution.vastgoedBiz;
                  if (title.includes('gemengde biz') || title.includes('gemengdebiz')) return currentSolution.gemengdeBiz;
                  if (title.includes('coöperatie') || title.includes('cooperatie')) return currentSolution.cooperatieUa;
                  if (title.includes('bv') || title.includes('besloten vennootschap')) return currentSolution.bv;
                  if (title.includes('ondernemersfonds')) return currentSolution.ondernemersfonds;
                  
                  return currentSolution.geenRechtsvorm;
                };
                
                // Extract model IDs from different categories
                const extractModelIds = (refs: any[] | undefined) => {
                  if (!Array.isArray(refs) || refs.length === 0) return [];
                  return refs.map(ref => {
                    if (typeof ref === 'string') return ref;
                    if (ref && typeof ref === 'object' && ref.sys && ref.sys.id) return ref.sys.id;
                    return null;
                  }).filter(Boolean);
                };
                
                const recommendedIds = extractModelIds(currentSolution.governanceModels) || [];
                const conditionalIds = extractModelIds(currentSolution.governanceModelsMits) || [];
                const unsuitableIds = extractModelIds(currentSolution.governanceModelsNietgeschikt) || [];
                
                console.log('Extracted IDs:', { 
                  recommendedIds, 
                  conditionalIds, 
                  unsuitableIds,
                  compatibleCount: compatibleGovernanceModels.length
                });
                
                // Get models for each category
                const recommendedModels = compatibleGovernanceModels.filter(model => recommendedIds.includes(model.id));
                const conditionalModels = compatibleGovernanceModels.filter(model => conditionalIds.includes(model.id));
                const unsuitableModels = compatibleGovernanceModels.filter(model => unsuitableIds.includes(model.id));
                
                console.log('Filtered Models:', { 
                  recommended: recommendedModels.length, 
                  conditional: conditionalModels.length, 
                  unsuitable: unsuitableModels.length 
                });
                
                const hasAnyModels = recommendedModels.length > 0 || conditionalModels.length > 0 || unsuitableModels.length > 0;
                
                if (!hasAnyModels) {
                  return <p className="text-gray-500 italic my-4">Geen specifieke governance modellen gevonden voor deze oplossing.</p>;
                }
                
                return (
                  <>
                    {/* Aanbevolen governance modellen */}
                    {recommendedModels.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-green-700 border-b pb-2 mb-2">Aanbevolen modellen</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Deze modellen worden aanbevolen voor de door u geselecteerde mobiliteitsoplossingen.
                        </p>
                        <div className="space-y-3">
                          {recommendedModels.map((model) => {
                            const rechtsvormText = getRechtsvormText(model);
                            return (
                              <div key={model.id} className="p-3 border rounded-md bg-green-50 border-green-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{model.title}</h4>
                                    {rechtsvormText ? (
                                      <div className="text-sm text-gray-600 mt-1">
                                        <p>{rechtsvormText}</p>
                                      </div>
                                    ) : (
                                      model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>
                                    )}
                                  </div>
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    Aanbevolen
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Aanbevolen mits governance modellen */}
                    {conditionalModels.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-blue-700 border-b pb-2 mb-2">Aanbevolen, mits...</h3>
                        <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                          <p className="text-blue-800">
                            Deze modellen zijn geschikt voor uw mobiliteitsoplossingen, maar vereisen extra aandacht of aanpassingen.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {conditionalModels.map((model) => {
                            const rechtsvormText = getRechtsvormText(model);
                            console.log(`Rechtsvorm text voor ${model.title}:`, rechtsvormText);
                            return (
                              <div key={model.id} className="p-3 border rounded-md bg-blue-50 border-blue-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{model.title}</h4>
                                    {rechtsvormText ? (
                                      <div className="text-sm text-gray-600 mt-1">
                                        <p>{rechtsvormText}</p>
                                      </div>
                                    ) : (
                                      model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>
                                    )}
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    Aanbevolen, mits...
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Niet geschikte governance modellen */}
                    {unsuitableModels.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-red-700 border-b pb-2 mb-2">Ongeschikte governance modellen</h3>
                        <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-200">
                          <p className="text-red-800">
                            Deze modellen zijn minder geschikt voor de door u geselecteerde mobiliteitsoplossingen.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {unsuitableModels.map((model) => {
                            const rechtsvormText = getRechtsvormText(model);
                            return (
                              <div key={model.id} className="p-3 border rounded-md bg-red-50 border-red-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{model.title}</h4>
                                    {rechtsvormText ? (
                                      <div className="text-sm text-gray-600 mt-1">
                                        <p>{rechtsvormText}</p>
                                      </div>
                                    ) : (
                                      model.summary && <p className="text-sm text-gray-600 mt-1">{model.summary}</p>
                                    )}
                                  </div>
                                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    Niet geschikt
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              
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