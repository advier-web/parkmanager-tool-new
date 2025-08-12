import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface MarkdownContentProps {
  content: string;
  className?: string;
  disableListStyles?: boolean;
  // visual spacing variant across contexts
  variant?: 'balanced' | 'page' | 'modal';
}

/**
 * Gemeenschappelijke component voor het renderen van markdown content in de hele app
 */
export function MarkdownContent({ 
  content, 
  className = '',
  disableListStyles = false,
  variant = 'balanced'
}: MarkdownContentProps) {
  if (!content) {
    return null;
  }
  
  // Process the content through the markdown-text processor
  const processedContent = processMarkdownText(content);
  
  
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHtml]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              {...props}
              className={
                variant === 'page'
                  ? 'text-2xl font-bold mb-2 mt-5'
                  : variant === 'modal'
                  ? 'text-2xl font-bold mb-1 mt-3'
                  : 'text-2xl font-bold mb-1 mt-3'
              }
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              {...props}
              className={
                variant === 'page'
                  ? 'text-xl font-bold mb-2 mt-6'
                  : variant === 'modal'
                  ? 'text-xl font-bold mb-1 mt-3'
                  : 'text-xl font-bold mb-1 mt-3'
              }
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              {...props}
              className={
                variant === 'page'
                  ? 'text-lg font-bold mb-2 mt-5'
                  : variant === 'modal'
                  ? 'text-lg font-bold mb-1 mt-2'
                  : 'text-lg font-bold mb-1 mt-2'
              }
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-base font-semibold mb-2 mt-4" />
          ),
          h5: ({ node, ...props }) => (
            <h5 {...props} className="text-sm font-semibold mb-2 mt-3" />
          ),
          h6: ({ node, ...props }) => (
            <h6 {...props} className="text-sm font-medium mb-2 mt-3" />
          ),
          p: ({ node, ...props }) => {
            const margin = variant === 'modal' ? 'mb-3' : 'mb-2';
            return <p {...props} className={margin} />;
          },
          em: ({ node, ...props }) => (
            <em {...props} className="italic" />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold" />
          ),
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              className="text-blue-600 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            />
          ),
          ul: ({ node, ...props }) => (
            disableListStyles ? (
              <ul className="list-none p-0 m-0" {...props} />
            ) : (
              <ul className={`${variant === 'modal' ? 'mb-3 mt-2' : 'mb-2 mt-1'} list-disc pl-5 [&>li]:mb-1`} {...props} />
            )
          ),
          ol: ({ node, ...props }) => (
            disableListStyles ? (
              <ol className="list-none p-0 m-0" {...props} />
            ) : (
              <ol className={`${variant === 'modal' ? 'mb-3 mt-2' : 'mb-2 mt-1'} list-decimal pl-5 [&>li]:mb-1`} {...props} />
            )
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="mb-0 [&>p]:mb-0 [&>p]:mt-0" />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table {...props} className="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-blue-50" />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} className="divide-y divide-gray-200" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="hover:bg-gray-50" />
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200" />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Helper functie om tekst met markdown-stijl te verwerken
 * bijv. "__Collectieve financiering__" wordt omgezet naar Markdown
 */
export function processMarkdownText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Normalize line endings
  let processed = text.replace(/\r\n/g, '\n');
  
  // Remove ONLY the :::variant tags, keeping the content inside
  processed = processed.replace(/:::variant\[.*?\]\s*([\s\S]*?)\s*:::/g, '$1'); // Replace match with content (group 1)
  
  // Process tables first
  processed = preprocessTables(processed);
  
  // Replace all special formats we observed in the screenshot
  // Replace "* *1. Text* *" with "**1. Text**" (numbered list with bold)
  processed = processed.replace(/\* \*(\d+\.\s+[^\n*]+)\* \*/g, '**$1**');
  
  // Patterns like "*Per persoon, per enkele reis. In €'s*" should be italic
  processed = processed.replace(/(\*[^*\n]+\*)/g, (match) => {
    // Check if this is already inside another markdown construct
    if (match.startsWith('**') || match.endsWith('**')) {
      return match;
    }
    return match; // Keep as is for italic
  });
  
  // Process standard Markdown formats
  // Make sure numbered lists with asterisks are handled correctly
  processed = processed.replace(/(\d+\.)\s+\*([^*\n]+)\*/g, '$1 *$2*');
  
  // Handle ordered lists better
  processed = processed.replace(/^(\s*)(\d+\.\s+)/gm, '$1$2');
  
  // Ensure proper spacing around headers
  processed = processed.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
  
  // Fix potential issues with asterisks in non-markdown contexts
  processed = processed.replace(/(\d+)\s+\*\s+(\d+)/g, '$1 \\* $2');
  
  return processed;
}

/**
 * Deze helper functie doet specifieke pre-processing voor tabelstructuren
 * vooral om de governance modellen tabel correct weer te geven
 */
function preprocessTables(text: string): string {
  let processed = text;
  
  // Specifieke patroon voor tabellen met spaties en streepjes zoals in Contentful
  // Voorbeeld: | Header     | Header     |
  //           | ---------- | ---------- |
  //           | Cell       | Cell       |
  const contentfulTablePattern = /\|\s+[\w\s]+\s+\|\s+[\w\s]+\s+\|/;
  
  if (contentfulTablePattern.test(text)) {
    // Dit ziet eruit als een Contentful tabel met veel spaties
    const lines = processed.split('\n');
    const cleanedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Controleer of dit een tabelrij is met pipe symbolen
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        // Normaliseer de spaties binnen de tabelcellen
        line = line.replace(/\|\s+/g, '| ').replace(/\s+\|/g, ' |');
        
        // Controleer of dit een scheidingsrij is (alleen streepjes tussen pipes)
      if (line.match(/\|\s*-{3,}\s*\|/)) {
          // Vervang door standaard markdown scheidingsrij
          const rawCount = (line.match(/\|/g) || []).length - 1;
          const columnCount = Math.max(1, Math.min(50, rawCount));
          line = '|' + Array(columnCount).fill(' --- ').join('|') + '|';
        }
      }
      
      cleanedLines.push(line);
    }
    
    processed = cleanedLines.join('\n');
  }
  
  // Herkenningspatroon voor tabellen met meerdere | tekens en streepjes
  const tableRowPattern = /\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|/g;
  const hasTableFormat = tableRowPattern.test(processed);
  
  if (hasTableFormat) {
    // Splitsen op regels
    const lines = processed.split('\n');
    let inTable = false;
    let tableRows: string[] = [];
    let currentTable: string[] = [];
    
    // Voor elke regel controleren of het onderdeel is van een tabel
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check of deze regel een tabelrij kan zijn (bevat meerdere | tekens)
      const pipesCount = (line.match(/\|/g) || []).length;
      
      if (pipesCount >= 2 && !inTable) {
        // Begin van een nieuwe tabel gedetecteerd
        inTable = true;
        currentTable = [line];
      } else if (pipesCount >= 2 && inTable) {
        // Vervolg van een tabel
        currentTable.push(line);
      } else if (inTable) {
        // Einde van de tabel
        inTable = false;
        
        // Verwerk de verzamelde tabelrijen
        if (currentTable.length >= 1) {
          // Zorg ervoor dat we een scheidingsrij hebben na de header
          if (currentTable.length < 2 || !currentTable[1].match(/^\|[\s-:|]+\|[\s-:|]+\|/)) {
            // Aantal kolommen berekenen
            const rawHeaderCols = (currentTable[0].match(/\|/g) || []).length - 1;
            const headerCols = Math.max(1, Math.min(50, rawHeaderCols));
            const separator = '|' + Array(headerCols).fill(' --- ').join('|') + '|';
            currentTable.splice(1, 0, separator);
          }
          
          // Opgeschoonde tabel toevoegen aan de verzameling
          tableRows.push(currentTable.join('\n'));
        }
        
        // Deze niet-tabel regel toevoegen
        tableRows.push(line);
      } else {
        // Normale regel (geen tabel)
        tableRows.push(line);
      }
    }
    
    // Als we eindigen in een tabel, deze ook verwerken
    if (inTable && currentTable.length >= 1) {
      // Zorg ervoor dat we een scheidingsrij hebben na de header
      if (currentTable.length < 2 || !currentTable[1].match(/^\|[\s-:|]+\|[\s-:|]+\|/)) {
        // Aantal kolommen berekenen
        const rawHeaderCols = (currentTable[0].match(/\|/g) || []).length - 1;
        const headerCols = Math.max(1, Math.min(50, rawHeaderCols));
        const separator = '|' + Array(headerCols).fill(' --- ').join('|') + '|';
        currentTable.splice(1, 0, separator);
      }
      
      // Opgeschoonde tabel toevoegen aan de verzameling
      tableRows.push(currentTable.join('\n'));
    }
    
    // Combineer alles terug tot één string
    processed = tableRows.join('\n');
  }
  
  // Specifieke verwerking voor Contentful-tabellen met veel streepjes
  if (text.includes('----------') && text.includes('|')) {
    // Vervang rijen met veel streepjes door correcte markdown tabelscheidingen
    processed = processed.replace(/\|\s*-{3,}\s*\|\s*-{3,}\s*\|/g, '| --- | --- |');
    processed = processed.replace(/\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|/g, '| --- | --- | --- |');
    
    // Streepjes tussen rijen (niet omgeven door pipes) verwijderen
    processed = processed.replace(/^-{3,}$/gm, '');
  }
  
  // Specifieke problemen met streepjes en pipes verhelpen
  processed = processed.replace(/\|-{3,}\|/g, '| --- |');
  
  return processed;
}