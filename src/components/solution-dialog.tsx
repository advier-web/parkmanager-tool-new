'use client';

import React, { Fragment } from 'react';
import { useDialog } from '../contexts/dialog-context';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Transition } from '@headlessui/react';
import {
  MODAL_OVERLAY_BASE,
  MODAL_OVERLAY_ENTER,
  MODAL_OVERLAY_LEAVE,
  MODAL_PANEL_ENTER,
  MODAL_PANEL_ENTER_FROM,
  MODAL_PANEL_ENTER_TO,
  MODAL_PANEL_LEAVE,
  MODAL_PANEL_LEAVE_FROM,
  MODAL_PANEL_LEAVE_TO,
} from '@/components/ui/modal-anim';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { MarkdownWithAccordions } from './markdown-with-accordions';
import { useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { BiDollar } from 'react-icons/bi';
import { GovernanceModel } from '@/domain/models';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

export function SolutionDialog() {
  const { isOpen, dialogType, currentSolution, compatibleGovernanceModels, currentGovernanceModel, currentReason, currentVariations, currentImplementationVariant, closeDialog } = useDialog();

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

  const ANIMATION_MS = 600;
  // Utility: strip any asterisks used as ratings in plain text fields
  const stripAsterisks = (text?: string) => {
    if (!text) return '';
    return text.replace(/\*/g, '').trim();
  };
  // Helper to render leading '*' as stars and the rest of the text below
  const renderStarsAndText = (raw: string) => {
    const source = typeof raw === 'string' ? raw : String(raw ?? '');
    const m = source.match(/^\s*(\*{1,5})\s*([\s\S]*)$/);
    if (!m) {
      return (
        <div className="prose prose-sm max-w-none">
          <MarkdownContent content={processMarkdownText(source || '-')} />
        </div>
      );
    }
    const starsCount = m[1].length;
    const remainingText = m[2] || '';
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: starsCount }).map((_, i) => (
            <svg key={i} className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.95 13.93a1 1 0 00-1.175 0L6.615 16.281c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <div className="prose prose-sm max-w-none">
          <MarkdownContent content={processMarkdownText(remainingText)} />
        </div>
      </div>
    );
  };
  if (!isOpen) return null;

  // Show business park reason information dialog
  if (dialogType === 'reason' && currentReason) {
    return (
      <Transition show={true} as={Fragment} appear>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter={`${MODAL_OVERLAY_ENTER}`} leave={`${MODAL_OVERLAY_LEAVE}`}>
            <div className={`${MODAL_OVERLAY_BASE}`} />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter={`${MODAL_PANEL_ENTER}`}
            enterFrom={`${MODAL_PANEL_ENTER_FROM}`}
            enterTo={`${MODAL_PANEL_ENTER_TO}`}
            leave={`${MODAL_PANEL_LEAVE}`}
            leaveFrom={`${MODAL_PANEL_LEAVE_FROM}`}
            leaveTo={`${MODAL_PANEL_LEAVE_TO}`}
          >
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
              {/* <h2 className="text-xl font-bold mb-2">Beschrijving</h2> */}
              <MarkdownContent content={currentReason.description} />
            </section>
          </div>
          
          <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
            <button
              onClick={closeDialog}
              className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              Sluiten
            </button>
          </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    );
  }

  // Show solution information dialog
  if ((dialogType === 'solution' || dialogType === 'solution-cases') && currentSolution) {
    // Keep needed variables
    // const samenvattingLang = currentSolution.samenvattingLang; // removed from popup
    const description = currentSolution.description;
    const uitvoering = currentSolution.uitvoering;
    const inputBusinesscase = currentSolution.inputBusinesscase;
    const collectiefVsIndiviueel = currentSolution.collectiefVsIndiviueel;
    const showOnlyCases = dialogType === 'solution-cases';

    // Enforce fixed column order for implementation variations in the comparison table
    const normalize = (s: string) => (s || '').toLowerCase().trim();
    const desiredOrder = [
      'zelf aanschaffen door bedrijfsvereniging',
      'inkoop door één aangesloten organisatie met deelname van anderen',
      'aanbevolen serviceprovider door de bedrijfsvereniging',
      'centrale inkoop door de bedrijfsvereniging via één serviceprovider',
    ];
    const getVariantKey = (v: any) => normalize(stripSolutionPrefixFromVariantTitle(v?.title || ''));
    const variationsForTable = (currentVariations || []).slice().sort((a: any, b: any) => {
      const ai = desiredOrder.indexOf(getVariantKey(a));
      const bi = desiredOrder.indexOf(getVariantKey(b));
      const as = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
      const bs = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
      if (as !== bs) return as - bs;
      return getVariantKey(a).localeCompare(getVariantKey(b));
    });

    // Remove unused variables
    // const paspoort = currentSolution.paspoort || '';
    // const investering = currentSolution.costs || '';

    return (
      <Transition show={true} as={Fragment} appear>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter={`${MODAL_OVERLAY_ENTER}`} leave={`${MODAL_OVERLAY_LEAVE}`}>
            <div className={`${MODAL_OVERLAY_BASE}`} />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter={`${MODAL_PANEL_ENTER}`}
            enterFrom={`${MODAL_PANEL_ENTER_FROM}`}
            enterTo={`${MODAL_PANEL_ENTER_TO}`}
            leave={`${MODAL_PANEL_LEAVE}`}
            leaveFrom={`${MODAL_PANEL_LEAVE_FROM}`}
            leaveTo={`${MODAL_PANEL_LEAVE_TO}`}
          >
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">{showOnlyCases ? `${currentSolution.title} casebeschrijving` : currentSolution.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="p-6 space-y-6"> 

            {/* Top meta fields */}
            {!showOnlyCases && (
              <section className="text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSolution.wanneerRelevant && (
                    <div>
                      <div className="font-semibold text-gray-900">Wanneer relevant:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.wanneerRelevant}</div>
                    </div>
                  )}
                  {currentSolution.minimaleInvestering && (
                    <div>
                      <div className="font-semibold text-gray-900">Investering:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.minimaleInvestering}</div>
                    </div>
                  )}
                  {currentSolution.bandbreedteKosten && (
                    <div>
                      <div className="font-semibold text-gray-900">Bandbreedte kosten:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.bandbreedteKosten}</div>
                    </div>
                  )}
                  {currentSolution.minimumAantalPersonen && (
                    <div>
                      <div className="font-semibold text-gray-900">Minimum aantal personen:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.minimumAantalPersonen}</div>
                    </div>
                  )}
                  {currentSolution.schaalbaarheid && (
                    <div>
                      <div className="font-semibold text-gray-900">Schaalbaarheid:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.schaalbaarheid}</div>
                    </div>
                  )}
                  {currentSolution.moeilijkheidsgraad && (
                    <div>
                      <div className="font-semibold text-gray-900">Moeilijkheidsgraad:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.moeilijkheidsgraad}</div>
                    </div>
                  )}
                  {currentSolution.impact && (
                    <div>
                      <div className="font-semibold text-gray-900">Impact:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.impact}</div>
                    </div>
                  )}
                  {currentSolution.ruimtebeslag && (
                    <div>
                      <div className="font-semibold text-gray-900">Ruimtebeslag:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.ruimtebeslag}</div>
                    </div>
                  )}
                  {currentSolution.afhankelijkheidExternePartijen && (
                    <div>
                      <div className="font-semibold text-gray-900">Afhankelijkheid externe partijen:</div>
                      <div className="text-gray-800 mt-0.5">{currentSolution.afhankelijkheidExternePartijen}</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-b border-gray-200" />
              </section>
            )}

            {/* Beschrijving */}
            {!showOnlyCases && description && (
              <section>
                {/* <h1 className="text-2xl font-bold mb-2">Beschrijving</h1> */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <MarkdownWithAccordions content={description} />
                  </div>
                </div>
              </section>
            )}

            {/* Uitvoering */}
            {!showOnlyCases && uitvoering && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Uitvoering</h1>
                <div className="overflow-x-auto"><div className="min-w-full"><MarkdownWithAccordions content={uitvoering} /></div></div>
              </section>
            )}

            {/* Input Business Case */}
            {!showOnlyCases && inputBusinesscase && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Input voor Business Case</h1>
                <div className="overflow-x-auto"><div className="min-w-full"><MarkdownWithAccordions content={inputBusinesscase} /></div></div>
              </section>
            )}

            {/* Uitdagingen en Aanleidingen verwijderd op verzoek */}

            {/* Implementatievarianten - Render met details uit currentVariations */}
            {/* {!showOnlyCases && currentVariations && currentVariations.length > 0 && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Implementatievarianten</h1>
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
            )} */}

            {/* Collectief vs Individueel */}
            {!showOnlyCases && collectiefVsIndiviueel && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Collectief vs Individueel</h1>
                <div className="overflow-x-auto"><div className="min-w-full"><MarkdownWithAccordions content={collectiefVsIndiviueel} /></div></div>
              </section>
            )}

            {/* Vergelijk implementatievarianten - table inside popup before cases */}
            {!showOnlyCases && currentVariations && currentVariations.length > 0 && (
              <section className="bg-white rounded-lg py-4">
                <h1 className="text-3xl font-bold mb-1">Vergelijk implementatievarianten</h1>
                <p className="text-sm text-gray-600 mb-3">Voor elk van de inkoopvormen is in de onderstaande tabel samengevat in hoeverre elke inkoopvorm scoort op verschillende criteria. De sterren geven aan hoe de implementatievariant zich verhoudt tot de andere varianten, waarbij 1 ster negatief is en 5 sterren positief.</p>
                <div className="overflow-x-auto">
                  <div className="grid rounded-lg min-w-[640px] md:min-w-0" style={{ gridTemplateColumns: `160px repeat(${currentVariations.length}, minmax(180px, 1fr))` }}>
                  {/* Header row */}
                  <div className="contents">
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Categorie</div>
                    {variationsForTable.map((v, idx) => {
                      const title = stripSolutionPrefixFromVariantTitle(v.title);
                      return (
                        <div key={`vh-${v.id || idx}`} className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900">{title}</div>
                      );
                    })}
                  </div>

                  {/* Controle en flexibiliteit */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Controle en flexibiliteit</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`cf-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                        {renderStarsAndText(v.controleEnFlexibiliteit || '-')}
                      </div>
                    ))}
                  </div>

                  {/* Maatwerk */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Maatwerk</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`mw-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                        {renderStarsAndText(v.maatwerk || '-')}
                      </div>
                    ))}
                  </div>

                  {/* Kosten en schaalvoordelen */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Kosten en schaalvoordelen</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`ks-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                        {renderStarsAndText(v.kostenEnSchaalvoordelen || '-')}
                      </div>
                    ))}
                  </div>

                  {/* Operationele complexiteit */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Operationele complexiteit</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`oc-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                        {renderStarsAndText(v.operationeleComplexiteit || '-')}
                      </div>
                    ))}
                  </div>

                  {/* Juridische en compliance risico's */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Juridische en compliance risico's</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`jr-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                        {renderStarsAndText(v.juridischeEnComplianceRisicos || '-')}
                      </div>
                    ))}
                  </div>

                  {/* Risico van onvoldoende gebruik */}
                  <div className="contents">
                    <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Risico van onvoldoende gebruik</div>
                    {variationsForTable.map((v, idx) => (
                      <div key={`rg-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                        {renderStarsAndText(v.risicoVanOnvoldoendeGebruik || '-')}
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </section>
            )}

            {/* ADDED Casebeschrijving section AT THE BOTTOM of content */}
            {showOnlyCases && currentSolution.casebeschrijving && (
              <section>
                {/* Titel in header verwerkt; subtitel hier weggelaten */}
                <MarkdownWithAccordions content={currentSolution.casebeschrijving} /> 
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
              className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              Sluiten
            </button>
          </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
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
    
    const advantages: string[] = (anyModel.voordelen || []) as string[];
    const disadvantages: string[] = (anyModel.nadelen || []) as string[];
    const benodigdheden = typedModel.benodigdhedenOprichting || anyModel.benodigdhedenOprichting || [];
    const links = typedModel.links || anyModel.links || [];
    const doorlooptijdLang = typedModel.doorlooptijdLang || anyModel.doorlooptijdLang || '';
    const aansprakelijkheid = typedModel.aansprakelijkheid || anyModel.aansprakelijkheid || '';
    
    // const contentfulFields = (currentGovernanceModel as any).fields || {}; // Keep this approach for direct field access if needed
    
    return (
      <Transition show={true} as={Fragment} appear>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter={`${MODAL_OVERLAY_ENTER}`} leave={`${MODAL_OVERLAY_LEAVE}`}>
            <div className={`${MODAL_OVERLAY_BASE}`} />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter={`${MODAL_PANEL_ENTER}`}
            enterFrom={`${MODAL_PANEL_ENTER_FROM}`}
            enterTo={`${MODAL_PANEL_ENTER_TO}`}
            leave={`${MODAL_PANEL_LEAVE}`}
            leaveFrom={`${MODAL_PANEL_LEAVE_FROM}`}
            leaveTo={`${MODAL_PANEL_LEAVE_TO}`}
          >
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
          
          <div className="p-6 space-y-6">
            {/* Use the typed variables */} 
            {typedModel.description && (
              <div>
                {/* <h3 className="text-xl font-bold mb-2">Beschrijving</h3> */}
                <MarkdownContent variant="modal" content={processMarkdownText(typedModel.description)} />
              </div>
            )}
            {/* ADDED Aansprakelijkheid section */} 
            {aansprakelijkheid && (
              <div>
                <h3 className="text-xl font-bold mb-2">Aansprakelijkheid</h3>
                <MarkdownContent variant="modal" content={processMarkdownText(aansprakelijkheid)} />
              </div>
            )}
            {/* Render advantages as Markdown if it's a string (or first element of array) */}
            {advantages && advantages.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Voordelen</h3>
                {advantages.map((adv: string, idx: number) => (
                  <MarkdownContent key={idx} variant="modal" content={processMarkdownText(adv)} />
                ))}
              </div>
            )}
             {/* Render disadvantages as Markdown if it's a string (or first element of array) */}
            {disadvantages && disadvantages.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Nadelen</h3>
                {disadvantages.map((nad: string, idx: number) => (
                  <MarkdownContent key={idx} variant="modal" content={processMarkdownText(nad)} />
                ))}
              </div>
            )}
            {/* Render benodigdheden based on type */} 
            {benodigdheden && (
              <div>
                <h3 className="text-xl font-bold mb-2">Benodigdheden Oprichting</h3>
                {Array.isArray(benodigdheden) ? (
                  <ul className="list-disc pl-5">
                    {benodigdheden.map(renderListItem)}
                  </ul>
                ) : typeof benodigdheden === 'string' ? (
                  <MarkdownContent variant="modal" content={processMarkdownText(benodigdheden)} />
                ) : (
                  <p className="text-sm italic text-gray-500">Kon benodigdheden niet weergeven (onverwacht type).</p>
                )}
              </div>
            )}
            {/* Doorlooptijd */}
            {doorlooptijdLang && (
              <div>
                <h3 className="text-xl font-bold mb-2">Doorlooptijd</h3>
                <MarkdownContent variant="modal" content={processMarkdownText(doorlooptijdLang)} />
              </div>
            )}
            {/* Links */}
            {((Array.isArray(links) && links.length > 0) || (typeof links === 'string' && links)) && (
              <div>
                <h3 className="text-xl font-bold mb-2">Relevante links</h3>
                {Array.isArray(links) ? (
                  <ul className="list-none space-y-2">
                    {links.map((link: any, index: number) => {
                      // Markdown style [title](url)
                      if (typeof link === 'string' && /\[.+\]\(.+\)/.test(link)) {
                        const m = link.match(/\[(.+)\]\((.+)\)/);
                        if (m && m.length === 3) {
                          const title = m[1];
                          const url = m[2];
                          return (
                            <li key={index}>
                              <a className="text-teal-600 hover:underline" href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                            </li>
                          );
                        }
                      }
                      // Direct URL string
                      if (typeof link === 'string' && /^https?:\/\//.test(link)) {
                        return (
                          <li key={index}>
                            <a className="text-teal-600 hover:underline" href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                          </li>
                        );
                      }
                      // Object with url and optional title
                      if (link && typeof link === 'object' && 'url' in link) {
                        const url = (link as any).url as string;
                        const title = (link as any).title || url;
                        return (
                          <li key={index}>
                            <a className="text-teal-600 hover:underline" href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                          </li>
                        );
                      }
                      // Fallback: render as markdown text
                      return (
                        <li key={index}>
                          <MarkdownContent variant="modal" content={processMarkdownText(String(link))} />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <MarkdownContent variant="modal" content={processMarkdownText(String(links))} />
                )}
              </div>
            )}
            {/* ... Potentially render other fields from typedModel ... */}
          </div>
          
          <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
            <button
              onClick={closeDialog}
              className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              Sluiten
            </button>
          </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    );
  }
  
  // Show implementation variant information dialog
  if (dialogType === 'implementation-variant' && currentImplementationVariant) {
    const variant = currentImplementationVariant;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">{variant.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {/* Content Area */}
          <div className="p-6 space-y-6">
            {/* Top meta fields (aligned with factsheet) */}
            <section className="text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variant.controleEnFlexibiliteit && (
                  <div>
                    <div className="font-semibold text-gray-900">Controle en flexibiliteit:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.controleEnFlexibiliteit)}</div>
                  </div>
                )}
                {variant.maatwerk && (
                  <div>
                    <div className="font-semibold text-gray-900">Maatwerk:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.maatwerk)}</div>
                  </div>
                )}
                {variant.kostenEnSchaalvoordelen && (
                  <div>
                    <div className="font-semibold text-gray-900">Kosten en schaalvoordelen:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.kostenEnSchaalvoordelen)}</div>
                  </div>
                )}
                {variant.operationeleComplexiteit && (
                  <div>
                    <div className="font-semibold text-gray-900">Operationele complexiteit:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.operationeleComplexiteit)}</div>
                  </div>
                )}
                {variant.juridischeEnComplianceRisicos && (
                  <div>
                    <div className="font-semibold text-gray-900">Juridische en compliance-risico’s:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.juridischeEnComplianceRisicos)}</div>
                  </div>
                )}
                {variant.risicoVanOnvoldoendeGebruik && (
                  <div>
                    <div className="font-semibold text-gray-900">Risico van onvoldoende gebruik:</div>
                    <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.risicoVanOnvoldoendeGebruik)}</div>
                  </div>
                )}
              </div>
              <div className="mt-4 border-b border-gray-200" />
            </section>

            {variant.samenvatting && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Hoe werkt het</h1>
                {(() => {
                  const stripLeadingStars = (txt: string) =>
                    (txt || '')
                      .split('\n')
                      .map(line => line.replace(/^\s*\*{1,5}\s+/, ''))
                      .join('\n');
                  const cleaned = stripLeadingStars(variant.samenvatting || '');
                  return <MarkdownContent variant="modal" content={processMarkdownText(cleaned)} />;
                })()}
              </section>
            )}
            {variant.investering && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Exploitatie</h1>
                <MarkdownContent variant="modal" content={variant.investering} />
              </section>
            )}
            {/* {variant.realisatieplan && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Realisatieplan</h1>
                <MarkdownContent variant="modal" content={variant.realisatieplan} />
              </section>
            )} */}
            {variant.realisatieplanLeveranciers && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Leveranciers</h1>
                <MarkdownContent variant="modal" content={variant.realisatieplanLeveranciers} />
              </section>
            )}
            {variant.realisatieplanContractvormen && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Contractvormen</h1>
                <MarkdownContent variant="modal" content={variant.realisatieplanContractvormen} />
              </section>
            )}
            {variant.realisatieplanKrachtenveld && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Krachtenveld</h1>
                <MarkdownContent variant="modal" content={variant.realisatieplanKrachtenveld} />
              </section>
            )}
            {variant.realisatieplanVoorsEnTegens && (
              <section>
                <h1 className="text-3xl font-bold mb-2">Voors en Tegens</h1>
                <MarkdownContent variant="modal" content={variant.realisatieplanVoorsEnTegens} />
              </section>
            )}
            {/* Aandachtspunten tijdelijk verborgen op verzoek */}
            {variant.realisatieplanChecklist && (
              <section>
                <h2 className="text-2xl font-bold mb-2">Checklist</h2>
                <MarkdownContent variant="modal" content={variant.realisatieplanChecklist} />
              </section>
            )}
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
  
  return null;
} 