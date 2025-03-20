'use client';

import { useDialog } from '../contexts/dialog-context';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';

export function SolutionDialog() {
  const { isOpen, dialogType, currentSolution, compatibleGovernanceModels, currentGovernanceModel, closeDialog } = useDialog();

  if (!isOpen) {
    return null;
  }

  // Show solution information dialog
  if (dialogType === 'solution' && currentSolution) {
    // Nieuwe velden uit Contentful toegevoegd
    const paspoort = currentSolution.paspoort || '';
    const collectiefVsIndiviueel = currentSolution.collectiefVsIndiviueel || '';
    const effecten = currentSolution.effecten || '';
    const investering = currentSolution.investering || '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
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
              {compatibleGovernanceModels && Array.isArray(compatibleGovernanceModels) && compatibleGovernanceModels.length > 0 ? (
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
    
    const doorlooptijd = currentGovernanceModel.doorlooptijd || 
                        (currentGovernanceModel as any).doorlooptijd || 
                        '';
    
    // If fields contains a direct contentful fields object, try to use it
    const contentfulFields = (currentGovernanceModel as any).fields || {};
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
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
                {doorlooptijd || contentfulFields.doorlooptijd ? (
                  <MarkdownContent content={processMarkdownText(doorlooptijd || contentfulFields.doorlooptijd)} />
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