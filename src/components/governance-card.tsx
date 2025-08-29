import { GovernanceModel, ImplementationVariation } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';
import { governanceTitleToFieldName, stripSolutionPrefixFromVariantTitle } from '../utils/wizard-helpers';
import { SelectedVariantMap } from '@/lib/store';
import GovernanceModelFactsheetButton from './governance-model-factsheet-button';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import React, { useMemo } from 'react';

interface GovernanceCardProps {
  model: GovernanceModel;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  isRecommended?: boolean;
  isConditionalRecommended?: boolean;
  isCurrent?: boolean;
  onMoreInfo?: (model: GovernanceModel) => void;
  relevantVariations?: ImplementationVariation[];
  selectedVariants: SelectedVariantMap;
  primaryVariantId?: string; // Id van de geselecteerde variant voor de (enige) gekozen oplossing
}

// Rename original component to avoid conflict and for clarity
const GovernanceCardComponent: React.FC<GovernanceCardProps> = ({ 
  model, 
  isSelected, 
  onSelect, 
  isRecommended = false,
  isConditionalRecommended = false,
  isCurrent = false,
  onMoreInfo,
  relevantVariations,
  selectedVariants,
  primaryVariantId
}) => {
  // Calculate variant specific texts, filtering by currently selected variants
  const currentlySelectedVariantIds = useMemo(() => Object.values(selectedVariants), [selectedVariants]);

  const variationsToDisplay = useMemo(() => {
    return relevantVariations?.filter(variation => {
      const isSelected = currentlySelectedVariantIds.includes(variation.id);
      return isSelected;
    });
  }, [relevantVariations, currentlySelectedVariantIds]);

  const variantSpecificText = useMemo(() => {
    const fieldName = governanceTitleToFieldName(model.title);
    if (!fieldName) return undefined;
    // Kies bij voorkeur de variant die hoort bij de eerste geselecteerde oplossing met een variant
    const preferredId = primaryVariantId || (Object.keys(selectedVariants).find(sid => selectedVariants[sid]) ? selectedVariants[Object.keys(selectedVariants).find(sid => selectedVariants[sid]) as string] as string | undefined : undefined);
    const selectedVariation = variationsToDisplay?.find(v => v.id === preferredId) || variationsToDisplay?.[0];
    const text = selectedVariation ? (selectedVariation as any)[fieldName] : undefined;
    if (!text || typeof text !== 'string') return undefined;
    return text as string;
  }, [variationsToDisplay, model.title, selectedVariants]);

  const buttonChildren = useMemo(() => (
    <>
      <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1" />
      Download factsheet
    </>
  ), []);

  return (
    <div
      onClick={() => onSelect(model.id)}
      className={`
        p-6 rounded-lg transition-all relative cursor-pointer
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
        ${isRecommended ? 'border-l-4 border-l-green-500' : ''}
        ${isConditionalRecommended ? 'border-l-4 border-l-blue-500' : ''}
        ${isCurrent ? 'border-r-4 border-r-purple-500' : ''}
      `}
    >
      <div className="absolute top-0 right-0 flex">
        {isRecommended && !isConditionalRecommended && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md mr-1">
            Aanbevolen
          </span>
        )}
        
        {isConditionalRecommended && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-0.5 rounded-full flex items-center whitespace-nowrap">
            Aanbevolen, mits
          </div>
        )}
        
        {isCurrent && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md mr-1">
            Huidige model
          </span>
        )}
        {!isRecommended && !isConditionalRecommended && (
          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Niet aanbevolen
          </span>
        )}
      </div>
      {/* Select checkbox button at top-right */}
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={(e) => { e.stopPropagation(); onSelect(model.id); }}
        className={`absolute top-5 right-2 h-5 w-5 rounded border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} flex items-center justify-center shadow-sm`}
      >
        {isSelected && (
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 103.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd"/></svg>
        )}
      </button>
      
      <div className="flex items-start">
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{model.title}</h3>
            
            {/* Select button for smaller screens */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation();
                onSelect(model.id); 
              }}
              className="md:hidden inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
          
          <div className="text-gray-600 mt-2 mb-4">
            {/* Altijd eerst de algemene samenvatting */}
            <MarkdownContent content={processMarkdownText(model.summary || model.description || '')} />

            {/* Daarna – indien aanwezig – alleen de variant-specifieke tekst (zonder algemene paragrafen) */}
            {variantSpecificText && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Relevantie voor geselecteerde implementatievariant:</h4>
                <div className="text-sm text-gray-700">
                  <div className="pl-2 prose prose-sm max-w-none"><MarkdownContent content={processMarkdownText(variantSpecificText)} /></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center mt-6 pt-3 border-t gap-2"> 
            {/* Left: Meer informatie */}
            <div className="md:justify-self-start">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMoreInfo) onMoreInfo(model);
                }}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none"
              >
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                Meer informatie
              </button>
            </div>
            {/* middle spacer */}
            <div className="hidden md:block"></div>
            {/* Right: Download factsheet */}
            <div className="md:justify-self-end" onClick={(e) => e.stopPropagation()}>
              <GovernanceModelFactsheetButton
                governanceModel={model}
                selectedVariations={variationsToDisplay} 
                governanceTitleToFieldName={governanceTitleToFieldName}
                stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none"
                buttonColorClassName="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 p-0 shadow-none font-normal cursor-pointer text-sm"
              >
                {buttonChildren}
              </GovernanceModelFactsheetButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the memoized version as GovernanceCard
export const GovernanceCard = React.memo(GovernanceCardComponent); 