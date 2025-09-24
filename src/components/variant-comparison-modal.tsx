import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
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
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
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

  // Helper: bepaalt of er voor een gegeven veld ten minste één niet-lege waarde is
  const hasAnyNonEmpty = (field: keyof ImplementationVariation): boolean => {
    return variations.some((v) => {
      const raw = (v as Record<string, unknown>)[field];
      if (raw == null) return false;
      if (typeof raw === 'string') return raw.trim() !== '';
      return Boolean(raw);
    });
  };

  // Helper: zet leading asterisks om in sterren, tekst eronder
  const renderStarsAndText = (raw: string) => {
    const source = typeof raw === 'string' ? raw : String(raw ?? '');
    const m = source.match(/^\s*(\*{1,5})\s*([\s\S]*)$/);
    if (!m) {
      return (
        <div className="prose prose-sm max-w-none overflow-hidden">
          <MarkdownContent content={processMarkdownText(source || '-')} />
        </div>
      );
    }
    const stars = m[1].length;
    const text = m[2] || '';
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <svg key={i} className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.95 13.93a1 1 0 00-1.175 0L6.615 16.281c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <div className="prose prose-sm max-w-none overflow-hidden">
          <MarkdownContent content={processMarkdownText(text)} />
        </div>
      </div>
    );
  };

  const costTooltipText =
    'Dit zijn geschatte kosten op basis van een voorbeeldberekening. De volledige berekening vindt u in de factsheet van de implementatievariant. De daadwerkelijke kosten verschillen per situatie.';

  const InfoTooltip = ({ text }: { text: string }) => {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const position = () => {
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX });
    };
    const show = () => { position(); setVisible(true); };
    const hide = () => setVisible(false);

    useEffect(() => {
      if (!visible) return;
      const onScroll = () => position();
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onScroll);
      return () => {
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onScroll);
      };
    }, [visible]);

    return (
      <>
        <button
          ref={btnRef}
          type="button"
          aria-label="Toelichting"
          onMouseEnter={show}
          onFocus={show}
          onMouseLeave={hide}
          onBlur={hide}
          className="mt-0.5 text-blue-600 hover:text-blue-700 focus:outline-none"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
        {visible && (
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: 320, zIndex: 99999 }}
            className="rounded-md bg-black text-white px-3 py-2 text-sm leading-snug shadow-2xl ring-1 ring-black/20"
          >
            {text}
          </div>
        )}
      </>
    );
  };

  const LabelWithTooltip = ({ label }: { label: string }) => (
    <div className="inline-flex items-start gap-1">
      <h3 className="font-medium text-gray-900">{label}</h3>
      <InfoTooltip text={costTooltipText} />
    </div>
  );

  // Parse values like "€1,94 ... [tooltip text here]" into main text + tooltip
  const parseValueAndTooltip = (raw?: string): { main: string; tip?: string } => {
    const source = typeof raw === 'string' ? raw : '';
    if (!source) return { main: '' };
    const bracketMatch = source.match(/\[([\s\S]*?)\]/);
    if (!bracketMatch) {
      return { main: source.trim() };
    }
    const tip = bracketMatch[1]?.trim();
    const main = source.replace(/\[[\s\S]*?\]/g, '').trim();
    return { main, tip };
  };

  const ValueWithOptionalTooltip = ({ value }: { value?: string }) => {
    const { main, tip } = parseValueAndTooltip(value);
    return (
      <div className="flex items-start gap-1 text-[15px] leading-snug">
        <span>{main || '-'}</span>
        {tip ? <InfoTooltip text={tip} /> : null}
      </div>
    );
  };

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
                  Voor elk van de inkoopvormen is in de onderstaande tabel samengevat in hoeverre elke inkoopvorm scoort op verschillende criteria. De sterren geven aan hoe de implementatievariant zich verhoudt tot de andere varianten, waarbij 1 ster negatief is en 5 sterren positief.
                  </p>
                </div>

                {/* Content - Scrollable with horizontal scroll on small screens */}
                <div className="flex-1 p-6 max-h-[80vh] overflow-x-auto overflow-y-auto">
                  <div className="space-y-1">
                    
                    {/* Variant Title Row (sticky) */}
                    <div className="grid bg-gray-50 rounded-lg p-3 sticky top-0 z-10 shadow-sm min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                      <div className="flex items-start">
                        <h3 className="font-medium text-gray-900">Implementatievariant</h3>
                      </div>
                      {variations.map((variation) => (
                        <div key={`${variation.id}-title`} className="border-l border-gray-200 pl-4 flex items-center bg-gray-50">
                          <div>
                            <h4 className="font-semibold text-lg text-blue-600 leading-tight">
                              {getDisplayTitle(variation)}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Geschatte jaarlijkse kosten Row */}
                    {hasAnyNonEmpty('geschatteJaarlijkseKosten') && (
                      <div className="grid bg-white rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start"><LabelWithTooltip label="Geschatte jaarlijkse kosten" /></div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-yearly-costs`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {variation.geschatteJaarlijkseKosten || '-'}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Kosten per km per persoon Row */}
                    {hasAnyNonEmpty('geschatteKostenPerKmPp') && (
                      <div className="grid bg-gray-50 rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start"><LabelWithTooltip label="Kosten per km per persoon" /></div>
                    {variations.map((variation) => (
                      <div key={`${variation.id}-km-costs`} className="border-l border-gray-200 pl-4">
                        <ValueWithOptionalTooltip value={variation.geschatteKostenPerKmPp} />
                      </div>
                    ))}
                      </div>
                    )}

                    {/* Kosten per rit Row */}
                    {hasAnyNonEmpty('geschatteKostenPerRit') && (
                      <div className="grid bg-white rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start"><LabelWithTooltip label="Kosten per rit" /></div>
                    {variations.map((variation) => (
                      <div key={`${variation.id}-trip-costs`} className="border-l border-gray-200 pl-4">
                        <ValueWithOptionalTooltip value={variation.geschatteKostenPerRit} />
                      </div>
                    ))}
                      </div>
                    )}

                    {/* Verantwoordelijkheid, Contractvormen, Voordelen en Nadelen zijn verwijderd uit de vergelijking */}

                    {/* Controle en flexibiliteit Row */}
                    {hasAnyNonEmpty('controleEnFlexibiliteit') && (
                      <div className="grid bg-white rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Controle en flexibiliteit</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-control-flex`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.controleEnFlexibiliteit || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Maatwerk Row */}
                    {hasAnyNonEmpty('maatwerk') && (
                      <div className="grid bg-gray-50 rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Maatwerk</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-maatwerk`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.maatwerk || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Kosten en schaalvoordelen Row */}
                    {hasAnyNonEmpty('kostenEnSchaalvoordelen') && (
                      <div className="grid bg-white rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Kosten en schaalvoordelen</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-cost-scale`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.kostenEnSchaalvoordelen || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Operationele complexiteit Row */}
                    {hasAnyNonEmpty('operationeleComplexiteit') && (
                      <div className="grid bg-gray-50 rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Operationele complexiteit</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-operational-complexity`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.operationeleComplexiteit || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Juridische en compliance risico's Row */}
                    {hasAnyNonEmpty('juridischeEnComplianceRisicos') && (
                      <div className="grid bg-white rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Juridische en compliance risico's</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-legal-compliance-risks`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.juridischeEnComplianceRisicos || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Risico van onvoldoende gebruik Row */}
                    {hasAnyNonEmpty('risicoVanOnvoldoendeGebruik') && (
                      <div className="grid bg-gray-50 rounded-lg p-3 min-w-[720px] md:min-w-0" style={{ gridTemplateColumns: `180px repeat(${variations.length}, minmax(180px, 1fr))` }}>
                        <div className="flex items-start">
                          <h3 className="font-medium text-gray-900">Risico van onvoldoende gebruik</h3>
                        </div>
                        {variations.map((variation) => (
                          <div key={`${variation.id}-underutilization-risk`} className="border-l border-gray-200 pl-4 text-[15px] leading-snug">
                            {renderStarsAndText(variation.risicoVanOnvoldoendeGebruik || '-')}
                          </div>
                        ))}
                      </div>
                    )}

                    

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
