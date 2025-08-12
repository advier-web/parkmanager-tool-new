import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';

interface VariantComparisonModalProps {
  variations: ImplementationVariation[];
  isOpen: boolean;
  onClose: () => void;
}

export function VariantComparisonModal({ variations, isOpen, onClose }: VariantComparisonModalProps) {
  if (!variations || variations.length === 0) return null;

  const stripSolutionPrefixFromVariantTitle = (title: string): string => {
    // Remove solution name prefix if it exists (e.g., "Pendeldienst - " from "Pendeldienst - Variant 1")
    const parts = title.split(' - ');
    if (parts.length > 1) {
      return parts.slice(1).join(' - '); // Return everything after the first " - "
    }
    return title; // Return original if no prefix found
  };

  const getDisplayTitle = (variation: ImplementationVariation): string => {
    return stripSolutionPrefixFromVariantTitle(variation.title);
  };

  // (Voorheen) helper voor komma-gescheiden lijsten is verwijderd omdat de betreffende velden niet meer worden vergeleken

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter={`${MODAL_OVERLAY_ENTER}`} leave={`${MODAL_OVERLAY_LEAVE}`}>
          <div className={`${MODAL_OVERLAY_BASE}`} />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter={`${MODAL_PANEL_ENTER}`}
              enterFrom={`${MODAL_PANEL_ENTER_FROM}`}
              enterTo={`${MODAL_PANEL_ENTER_TO}`}
              leave={`${MODAL_PANEL_LEAVE}`}
              leaveFrom={`${MODAL_PANEL_LEAVE_FROM}`}
              leaveTo={`${MODAL_PANEL_LEAVE_TO}`}
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Vergelijk Implementatievarianten
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Sluiten</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Bekijk de belangrijkste verschillen tussen de geselecteerde implementatievarianten
                  </p>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-auto p-6 max-h-[80vh]">
                  <div className="space-y-1">
                    
                    {/* Variant Title Row (sticky) */}
                    <div className="grid bg-gray-50 rounded-lg p-3 sticky top-0 z-10 shadow-sm" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Implementatievariant</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-title`} className="border-l border-gray-200 pl-4 flex items-center">
                          <div>
                            <h4 className="font-semibold text-lg text-blue-600 leading-tight">
                              {getDisplayTitle(variation)}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Geschatte jaarlijkse kosten Row */}
                    <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Geschatte jaarlijkse kosten</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-yearly-costs`} className="border-l border-gray-200 pl-4 flex items-center">
                          <div className="text-sm text-gray-700">
                            {variation.geschatteJaarlijkseKosten || '-'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kosten per km per persoon Row */}
                    <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Kosten per km per persoon</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-km-costs`} className="border-l border-gray-200 pl-4 flex items-center">
                          <div className="text-sm text-gray-700">
                            {variation.geschatteKostenPerKmPp || '-'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kosten per rit Row */}
                    <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Kosten per rit</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-trip-costs`} className="border-l border-gray-200 pl-4 flex items-center">
                          <div className="text-sm text-gray-700">
                            {variation.geschatteKostenPerRit || '-'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Verantwoordelijkheid, Contractvormen, Voordelen en Nadelen zijn verwijderd uit de vergelijking */}

                    {/* Controle en flexibiliteit Row */}
                    <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Controle en flexibiliteit</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-control-flex`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.controleEnFlexibiliteit || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Maatwerk Row */}
                    <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Maatwerk</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-maatwerk`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.maatwerk || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kosten en schaalvoordelen Row */}
                    <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Kosten en schaalvoordelen</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-cost-scale`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.kostenEnSchaalvoordelen || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Operationele complexiteit Row */}
                    <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Operationele complexiteit</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-operational-complexity`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.operationeleComplexiteit || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Juridische en compliance risico's Row */}
                    <div className="grid bg-white rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Juridische en compliance risico's</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-legal-compliance-risks`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.juridischeEnComplianceRisicos || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Risico van onvoldoende gebruik Row */}
                    <div className="grid bg-gray-50 rounded-lg p-3" style={{ gridTemplateColumns: `200px repeat(${variations.length}, 1fr)` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Risico van onvoldoende gebruik</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-underutilization-risk`} className="border-l border-gray-200 pl-4">
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none overflow-hidden">
                            <MarkdownContent content={processMarkdownText(variation.risicoVanOnvoldoendeGebruik || '-')} />
                          </div>
                        </div>
                      ))}
                    </div>

                    

                  </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      Sluiten
                    </button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
