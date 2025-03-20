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
  
  // Verwerk __text__ naar **text** voor vette tekst
  let processed = text.replace(/__(.*?)__/g, '**$1**');
  
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
  
  // Verwerking van tabellen - Contentful kan speciale tekens gebruiken voor tabellen die we converteren naar standaard markdown
  
  // 1. Zorg ervoor dat pipe symbolen die in tabellen worden gebruikt correct worden weergegeven
  // Vervang alleenstaande "|" met escaped version \| indien nodig
  processed = processed.replace(/(\S)\|(\S)/g, "$1\\|$2");
  
  // 2. Zorg ervoor dat tabelheaders correct worden gedetecteerd
  // Verbeter tabel header/data scheiding (--- lijnen) door consistentie te verzekeren
  const tableHeaderRegex = /^\|(.+)\|$/gm;
  const tableHeaderMatches = processed.match(tableHeaderRegex);
  
  if (tableHeaderMatches) {
    // We hebben een tabel gedetecteerd, controleer of de header-scheiding correct is
    for (const headerMatch of tableHeaderMatches) {
      // Controleer of er een scheidingsrij na deze header is
      const headerIndex = processed.indexOf(headerMatch);
      const nextLineStart = processed.indexOf('\n', headerIndex) + 1;
      const nextLineEnd = processed.indexOf('\n', nextLineStart);
      const nextLine = nextLineEnd > 0 ? 
        processed.substring(nextLineStart, nextLineEnd) : 
        processed.substring(nextLineStart);
      
      // Als de volgende rij geen scheidingsrij is (|----|----| formaat), voeg deze toe
      if (!nextLine.match(/^\|(\s*[-:]+\s*\|)+$/)) {
        const columns = headerMatch.split('|').filter(Boolean);
        const separatorRow = '|' + columns.map(() => ' --- |').join('');
        
        processed = processed.substring(0, nextLineStart) + 
                    separatorRow + '\n' + 
                    processed.substring(nextLineStart);
      }
    }
  }
  
  // 3. Zorg ervoor dat tabellen met speciale tekens (zoals ------) worden herkend als tabellen
  processed = processed.replace(/^([-|]+\s*[-|]+\s*[-|]+)$/gm, (match) => {
    // Converteer "| ------ | ------ |" formaat naar correcte markdown tabel scheiding
    return match.replace(/[-]+/g, ' --- ');
  });
  
  return processed;
} 