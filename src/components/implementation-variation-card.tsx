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
      className={`relative flex flex-col p-8 border rounded-lg cursor-pointer transition-all duration-150 ${isSelected 
        ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
        : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
      }`}
    >
      <div className="flex items-start mb-2">
        <div className="flex-grow">
          <h3 className="text-lg font-medium mb-3">{displayTitle}</h3>
          
          {variation.samenvatting && (
            <div className="text-gray-600 mb-3 prose prose-sm max-w-none">
              <MarkdownContent content={processMarkdownText(variation.samenvatting)} />
            </div>
          )}
        </div>

        <div className="ml-4 mt-1 flex-shrink-0">
          <button
            type="button"
            aria-pressed={isSelected}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`h-5 w-5 rounded border flex items-center justify-center focus:outline-none ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
          >
            {isSelected && (
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 103.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd"/></svg>
            )}
          </button>
        </div>
      </div> 

      {/* Action row: align left like solution cards */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        {/* Meer informatie button */}
        <div>
          <button
          type="button"
          onClick={e => { e.stopPropagation(); openImplementationVariantDialog(variation); }}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none whitespace-nowrap"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          Meer informatie
          </button>
        </div>
        {/* PDF Download Button */}
        <div onClick={(e) => e.stopPropagation()} className="min-w-0">
          <ImplementationVariantFactsheetButton
            variation={variation}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer focus:outline-none"
            buttonColorClassName="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 p-0 shadow-none font-normal cursor-pointer text-sm"
          >
            <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span>Download factsheet</span>
          </ImplementationVariantFactsheetButton>
        </div>
      </div>
    </div>
  );
} 