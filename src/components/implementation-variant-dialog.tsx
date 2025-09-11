import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';

interface ImplementationVariantDialogProps {
  variation: ImplementationVariation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImplementationVariantDialog({ variation, isOpen, onClose }: ImplementationVariantDialogProps) {
  if (!variation) return null;

  // Helper function to split comma-separated text into list items
  const renderCommaSeparatedList = (text: string | undefined, className: string = '') => {
    if (!text) return <span className="text-gray-400">Geen informatie beschikbaar</span>;
    
    const items = text.split(',').map(item => item.trim()).filter(item => item.length > 0);
    
    if (items.length === 0) return <span className="text-gray-400">Geen informatie beschikbaar</span>;
    
    return (
      <ul className={`${className} space-y-1`}>
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                      {variation.title}
                    </Dialog.Title>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Samenvatting</h3>
                        <div className="mt-2 prose prose-sm max-w-none">
                          {(() => {
                            // Specifiek voor deze popup: verwijder eventuele rating-asterisken aan het begin van regels
                            const stripLeadingStars = (txt: string) =>
                              (txt || '')
                                .split('\n')
                                .map(line => line.replace(/^\s*\*{1,5}\s+/, ''))
                                .join('\n');
                            const cleaned = stripLeadingStars(variation.samenvatting || '');
                            return <MarkdownContent content={processMarkdownText(cleaned)} />;
                          })()}
                        </div>
                      </div>

                      {/* Cost information grid */}
                      {(variation.geschatteJaarlijkseKosten || variation.geschatteKostenPerKmPp || variation.geschatteKostenPerRit) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Kosteninformatie</h3>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {variation.geschatteJaarlijkseKosten && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-1">Geschatte jaarlijkse kosten</h4>
                                <p className="text-gray-700">{variation.geschatteJaarlijkseKosten}</p>
                              </div>
                            )}
                            {variation.geschatteKostenPerKmPp && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-1">Kosten per km per persoon</h4>
                                <p className="text-gray-700">{variation.geschatteKostenPerKmPp}</p>
                              </div>
                            )}
                            {variation.geschatteKostenPerRit && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-1">Kosten per rit</h4>
                                <p className="text-gray-700">{variation.geschatteKostenPerRit}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Verantwoordelijkheid, contractvormen, voordelen en nadelen zijn verwijderd uit het content type en worden hier niet meer getoond */}

                      {/* Vuistregels blok met lichtblauwe achtergrond */}
                      <div className="bg-blue-100 rounded-lg p-4 border border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {variation.controleEnFlexibiliteit && (
                            <div>
                              <div className="font-semibold text-gray-900">Controle en flexibiliteit:</div>
                              <div className="text-gray-800 mt-0.5">{variation.controleEnFlexibiliteit.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                          {variation.maatwerk && (
                            <div>
                              <div className="font-semibold text-gray-900">Maatwerk:</div>
                              <div className="text-gray-800 mt-0.5">{variation.maatwerk.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                          {variation.kostenEnSchaalvoordelen && (
                            <div>
                              <div className="font-semibold text-gray-900">Kosten en schaalvoordelen:</div>
                              <div className="text-gray-800 mt-0.5">{variation.kostenEnSchaalvoordelen.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                          {variation.operationeleComplexiteit && (
                            <div>
                              <div className="font-semibold text-gray-900">Operationele complexiteit:</div>
                              <div className="text-gray-800 mt-0.5">{variation.operationeleComplexiteit.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                          {variation.juridischeEnComplianceRisicos && (
                            <div>
                              <div className="font-semibold text-gray-900">Juridische en compliance-risico’s:</div>
                              <div className="text-gray-800 mt-0.5">{variation.juridischeEnComplianceRisicos.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                          {variation.risicoVanOnvoldoendeGebruik && (
                            <div>
                              <div className="font-semibold text-gray-900">Risico van onvoldoende gebruik:</div>
                              <div className="text-gray-800 mt-0.5">{variation.risicoVanOnvoldoendeGebruik.replace(/^\s*\*{1,5}\s*/, '')}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {variation.investering && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Investering</h3>
                          <div className="mt-2 prose prose-sm max-w-none">
                            <MarkdownContent content={processMarkdownText(variation.investering)} />
                          </div>
                        </div>
                      )}
                      {variation.realisatieplan && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Realisatieplan</h3>
                          <div className="mt-2 prose prose-sm max-w-none">
                            <MarkdownContent content={processMarkdownText(variation.realisatieplan)} />
                          </div>
                        </div>
                      )}
                    </div>
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