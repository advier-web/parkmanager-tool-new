import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
  disableListStyles?: boolean;
}

/**
 * Gemeenschappelijke component voor het renderen van markdown content in de hele app
 */
export function MarkdownContent({ 
  content, 
  className = '',
  disableListStyles = false
}: MarkdownContentProps) {
  if (!content) {
    return null;
  }
  
  // Verwerk de content door de markdown-tekst te bewerken
  const processedContent = processMarkdownText(content);
  
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Styling voor headings
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold mb-3 mt-5" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-bold mb-3 mt-4" />
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
          // Expliciete styling voor italic/emphasis tekst
          em: ({ node, ...props }) => (
            <em {...props} className="italic" />
          ),
          // Expliciete styling voor bold/strong tekst
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold" />
          ),
          // Styling voor links
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              className="text-blue-600 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            />
          ),
          // Styling voor lijsten - schakel list-disc uit als we in een bestaande lijst zijn
          ul: ({ node, ...props }) => (
            <ul {...props} className={disableListStyles ? "pl-0" : "list-disc pl-5 mb-4 mt-4"} />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="mb-1" />
          ),
          // Styling voor tabellen
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
  
  // Voer een pre-processing stap uit voor tabellen voordat we andere bewerkingen doen
  // Dit helpt specifiek met de governance modellen tabel
  let processed = preprocessTables(text);
  
  // Verwerk __text__ naar **text** voor vette tekst
  processed = processed.replace(/__(.*?)__/g, '**$1**');
  
  // Vervang ### zonder spatie door ### met spatie
  processed = processed.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
  
  // Specifieke verbetering voor markdown headers die beginnen met ###
  processed = processed.replace(/(#{1,6})\s+([^#\n]+)/g, '$1 $2');
  
  // Verwerk "###Titel" zonder spatie ook (case-insensitief)
  processed = processed.replace(/^(#{1,6})([A-Za-z])/gm, '$1 $2');

  // Verbeterde verwerking van italic tekst
  // 1. Vervang "_tekst_" door "*tekst*" voor cursieve tekst
  processed = processed.replace(/(?<![a-zA-Z0-9\*])_([^_\n]+?)_(?![a-zA-Z0-9\*])/g, '*$1*');
  
  // 2. Zorg ervoor dat alleenstaande * tekens niet worden verward met markdown
  // (b.v. "5 * 5 = 25" zou niet als italic moeten worden geïnterpreteerd)
  processed = processed.replace(/(\s)(\*)(\s)/g, '$1\\*$3');
  
  // 3. Zorg ervoor dat *tekst* consistent wordt behandeld
  processed = processed.replace(/(?<![a-zA-Z0-9\\\*])(\*)([^\*\n]+?)(\*)(?![a-zA-Z0-9\*])/g, '*$2*');
  
  // Converteer html <ul> en <li> tags naar markdown lijsten als ze nog niet in markdown formaat zijn
  processed = processed.replace(/<ul>/g, '\n');
  processed = processed.replace(/<\/ul>/g, '\n');
  processed = processed.replace(/<li>(.*?)<\/li>/g, '- $1\n');
  
  // Zorg ervoor dat URL's die nog geen markdown link zijn, naar markdown links worden geconverteerd
  const urlRegex = /(?<!["\(])(https?:\/\/[^\s<]+)(?!["\)])/g;
  processed = processed.replace(urlRegex, '[$1]($1)');
  
  // Verwerking van strikethrough tekst met ~~ ~~
  processed = processed.replace(/~~([^~]+)~~/g, '~~$1~~');
  
  // Vervang specifieke patronen die in de contentful content voorkomen
  processed = processed.replace(/###\s+([^#\n]+)/g, '### $1');
  
  return processed;
}

/**
 * Deze helper functie doet specifieke pre-processing voor tabelstructuren
 * vooral om de governance modellen tabel correct weer te geven
 */
function preprocessTables(text: string): string {
  let processed = text;
  
  // Herkenningspatroon voor tabellen met meerdere | tekens en streepjes
  const tableRowPattern = /\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|/g;
  const hasTableFormat = tableRowPattern.test(text);
  
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
      
      if (pipesCount >= 3 && !inTable) {
        // Begin van een nieuwe tabel gedetecteerd
        inTable = true;
        currentTable = [line];
      } else if (pipesCount >= 3 && inTable) {
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
            const headerCols = (currentTable[0].match(/\|/g) || []).length - 1;
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
        const headerCols = (currentTable[0].match(/\|/g) || []).length - 1;
        const separator = '|' + Array(headerCols).fill(' --- ').join('|') + '|';
        currentTable.splice(1, 0, separator);
      }
      
      // Opgeschoonde tabel toevoegen aan de verzameling
      tableRows.push(currentTable.join('\n'));
    }
    
    // Combineer alles terug tot één string
    processed = tableRows.join('\n');
  }
  
  // Als de tekst veel streepjes en pipes bevat, kan het een tabel zijn die niet goed geformatteerd is
  if (text.includes('-----') && text.includes('|')) {
    // Zoek naar patronen zoals "| Bestuurlijke rechtsvorm | Geschikt | Toelichting |"
    const potentialTableHeaders = text.match(/\|\s*[\w\s]+\s*\|\s*[\w\s]+\s*\|\s*[\w\s]+\s*\|/g);
    
    if (potentialTableHeaders) {
      // Voor elke mogelijke tabelheader
      potentialTableHeaders.forEach(header => {
        const headerIndex = processed.indexOf(header);
        if (headerIndex !== -1) {
          // Voeg een scheidingsrij toe na deze header als die er nog niet is
          const afterHeader = processed.substring(headerIndex + header.length);
          // Als de volgende rij geen scheidingsrij is, voeg er een in
          if (!afterHeader.trim().startsWith('|') || !afterHeader.trim().match(/^\|[\s-:|]+\|/)) {
            // Tel het aantal kolommen door de pipe-symbolen te tellen
            const columnCount = (header.match(/\|/g) || []).length - 1;
            const separatorRow = '\n|' + Array(columnCount).fill(' --- ').join('|') + '|\n';
            
            processed = processed.substring(0, headerIndex + header.length) + 
                         separatorRow + 
                         processed.substring(headerIndex + header.length);
          }
        }
      });
    }
    
    // Vervang rijen met veel streepjes door correcte markdown tabelscheidingen
    processed = processed.replace(/(\|-+\|-+\|-+\|)/g, '| --- | --- | --- |');
    processed = processed.replace(/\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|/g, '| --- | --- | --- |');
    
    // Streepjes tussen rijen (niet omgeven door pipes) verwijderen
    processed = processed.replace(/^-{3,}$/gm, '');
  }
  
  // Specifieke problemen met streepjes en pipes verhelpen
  processed = processed.replace(/\|-{3,}\|/g, '| --- |');
  
  return processed;
} 