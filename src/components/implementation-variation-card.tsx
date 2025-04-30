'use client';

import { ImplementationVariation } from '@/domain/models';
import { MarkdownContent, processMarkdownText } from '@/components/markdown-content';
import { stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers';

interface ImplementationVariationCardProps {
  variation: ImplementationVariation;
  isSelected: boolean;
  onSelect: () => void;
}

export function ImplementationVariationCard({ 
  variation, 
  isSelected, 
  onSelect 
}: ImplementationVariationCardProps) {
  const displayTitle = stripSolutionPrefixFromVariantTitle(variation.title);

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
    </div>
  );
} 