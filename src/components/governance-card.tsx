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
  selectedVariants
}) => {
  // Calculate variant specific texts, filtering by currently selected variants
  const currentlySelectedVariantIds = useMemo(() => Object.values(selectedVariants), [selectedVariants]);

  const variationsToDisplay = useMemo(() => {
    return relevantVariations?.filter(variation => {
      const isSelected = currentlySelectedVariantIds.includes(variation.id);
      return isSelected;
    });
  }, [relevantVariations, currentlySelectedVariantIds]);

  const variantSpecificTexts = useMemo(() => {
    return variationsToDisplay?.map(variation => {
        const fieldName = governanceTitleToFieldName(model.title);
        if (!fieldName) {
          return null;
        }
        const text = (variation as any)[fieldName]; 
        if (!text || typeof text !== 'string') {
           return null;
        }
        const displayVariationTitle = stripSolutionPrefixFromVariantTitle(variation.title);
        return { variationTitle: displayVariationTitle, text };
      }).filter(item => item !== null) as { variationTitle: string; text: string }[] | undefined;
  }, [variationsToDisplay, model.title]);

  const buttonChildren = useMemo(() => (
    <>
      <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1" />
      {`Download factsheet ${model.title}`}
    </>
  ), [model.title]);

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
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
            Aanbevolen, mits
          </div>
        )}
        
        {isCurrent && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Huidige model
          </span>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="radio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
            checked={isSelected}
            onChange={() => { /* Main div handles select */ }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="ml-3 flex-grow">
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
            {/* General model summary - Fix potential undefined */}
            <MarkdownContent content={processMarkdownText(model.summary || model.description || '')} />
            
            {/* Variant specific relevance text */}
            {variantSpecificTexts && variantSpecificTexts.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100 space-y-2">
                 <h4 className="text-sm font-semibold text-gray-700 mb-1">Relevantie voor geselecteerde implementatievariant:</h4>
                 {variantSpecificTexts.map(({ variationTitle, text }, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <div className="pl-2 prose prose-sm max-w-none"><MarkdownContent content={processMarkdownText(text)} /></div>
                  </div>
                 ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-3 border-t"> 
            {/* Container for left-aligned links */}
            <div className="flex items-center space-x-4">
              {/* More info button */}
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

              {/* PDF Download Link */}
              <div onClick={(e) => e.stopPropagation()} /* Prevent card click */>
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
            
            {/* Select button for larger screens - now correctly on the far right */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation();
                onSelect(model.id); 
              }}
              className="hidden md:inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the memoized version as GovernanceCard
export const GovernanceCard = React.memo(GovernanceCardComponent); 