'use client';

import { ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';
import ImplementationVariantFactsheetButton from './implementation-variant-factsheet-button';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useDialog } from '../contexts/dialog-context';

interface ImplementationVariationCardProps {
  variation: ImplementationVariation;
  isSelected: boolean;
  onSelect: () => void;
  solutionTitle: string;
}

export function ImplementationVariationCard({ 
  variation, 
  isSelected, 
  onSelect, 
  solutionTitle
}: ImplementationVariationCardProps) {
  const displayTitle = stripSolutionPrefixFromVariantTitle(variation.title);
  const { openImplementationVariantDialog } = useDialog();

  return (
    <div 
      onClick={onSelect}
      className={`relative flex flex-col p-6 border rounded-lg cursor-pointer transition-all duration-150 ${isSelected 
        ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
        : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-grow">
          <span className="text-lg font-semibold mb-3">
            {displayTitle}
          </span>
          
          {variation.samenvatting && (
            <div className="text-gray-600 mb-3 prose prose-sm max-w-none">
              <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
            </div>
          )}
        </div>

        <div className="ml-4 mt-1 flex-shrink-0">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isSelected}
            onChange={() => { /* Outer div handles toggle */ }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div> 

      {/* PDF Download Link Section */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-start items-center space-x-4">
        {/* Meer informatie button */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); openImplementationVariantDialog(variation); }}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none whitespace-nowrap"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          Meer informatie
        </button>
        {/* PDF Download Button */}
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink min-w-0">
          <ImplementationVariantFactsheetButton
            variation={variation}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none w-full"
            buttonColorClassName="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 p-0 shadow-none font-normal cursor-pointer text-sm w-full overflow-hidden"
          >
            <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              Download factsheet van deze implementatievariant
            </span>
          </ImplementationVariantFactsheetButton>
        </div>
      </div>
    </div>
  );
} 