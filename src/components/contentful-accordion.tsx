'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { ItemWithMarkdown } from './item-with-markdown';

interface ContentfulAccordionProps {
  content: string;
  sectionDelimiter?: string; // Tekst die secties scheidt, standaard dubbele regeleinde
  titleField?: string; // Veldnaam waaruit de titel wordt gehaald, standaard eerste regel
  bg?: string; // Achtergrondkleur voor de header
  textColor?: string; // Tekstkleur voor de header
}

// Component die Contentful content opdeelt in accordions
export function ContentfulAccordion({
  content,
  sectionDelimiter = '\n\n',
  titleField = 'title:',
  bg = 'bg-gray-50',
  textColor = 'text-gray-800'
}: ContentfulAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  // Functie om content op te delen in secties
  const parseSections = () => {
    if (!content) return [];

    // Split content op basis van delimiter
    const sections = content.split(sectionDelimiter).filter(section => section.trim() !== '');
    
    return sections.map(section => {
      // Kijk of er een titelregel is (format "title: Mijn Titel")
      let title = 'Sectie';
      let sectionContent = section;
      
      if (section.includes(titleField)) {
        const lines = section.split('\n');
        const titleLine = lines.find(line => line.trim().startsWith(titleField));
        
        if (titleLine) {
          title = titleLine.substring(titleField.length).trim();
          // Verwijder de titellijn uit de content
          sectionContent = lines.filter(line => !line.trim().startsWith(titleField)).join('\n');
        }
      } else {
        // Als er geen titel is, gebruik dan de eerste regel (max 50 tekens)
        const firstLine = section.split('\n')[0].trim();
        title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
      }
      
      return { title, content: sectionContent.trim() };
    });
  };

  const sections = parseSections();
  
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
            className={`w-full flex justify-between items-center p-4 ${bg} hover:bg-opacity-90 transition-colors text-left ${textColor}`}
            onClick={() => toggleSection(index)}
          >
            <h3 className="font-medium">{section.title}</h3>
            {openSections[index] ? (
              <ChevronUpIcon className={`h-5 w-5 ${textColor}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${textColor}`} />
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

// Voorbeeld component die specifiek voor het paspoort veld is
export function PaspoortAccordion({ paspoort }: { paspoort: string }) {
  return (
    <ContentfulAccordion 
      content={paspoort}
      sectionDelimiter="\n\n##" // Split op dubbele newline gevolgd door ##
      titleField="##" // Titels beginnen met ##
      bg="bg-teal-600"
      textColor="text-white"
    />
  );
} 