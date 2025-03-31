'use client';

import React, { useState } from 'react';
import { ItemWithMarkdown } from './item-with-markdown';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface AccordionSection {
  title: string;
  content: string;
}

interface AccordionMarkdownContentProps {
  content: string;
  headerLevel?: number; // 2 for ##, 3 for ###, etc.
}

export function AccordionMarkdownContent({
  content,
  headerLevel = 2
}: AccordionMarkdownContentProps) {
  // Parseer de content in secties op basis van headers
  const parseSections = (text: string): AccordionSection[] => {
    // Default als er geen headers zijn
    if (!text.includes(`${'#'.repeat(headerLevel)} `)) {
      return [{ title: 'Inhoud', content: text }];
    }

    const headerRegex = new RegExp(`^${'#'.repeat(headerLevel)} (.*)$`, 'gm');
    const sections: AccordionSection[] = [];
    
    // Vind alle headers
    const matches = [...text.matchAll(headerRegex)];
    
    // Verwerk iedere header en zijn content
    matches.forEach((match, index) => {
      const title = match[1].trim();
      const startPos = match.index! + match[0].length;
      const endPos = index < matches.length - 1 
        ? matches[index + 1].index! 
        : text.length;
        
      const content = text.substring(startPos, endPos).trim();
      
      sections.push({ title, content });
    });
    
    return sections;
  };
  
  const sections = parseSections(content);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  
  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
          <button
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            onClick={() => toggleSection(index)}
          >
            <h3 className="font-medium">{section.title}</h3>
            {openSections[index] ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {openSections[index] && (
            <div className="p-4 bg-white">
              <ItemWithMarkdown content={section.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 