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
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Helper functie om tekst met markdown-stijl onderstreepte woorden te verwerken
 * bijv. "__Collectieve financiering__" wordt omgezet naar Markdown
 */
export function processMarkdownText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Verwerk __text__ naar **text** voor vette tekst
  let processed = text.replace(/__(.*?)__/g, '**$1**');
  
  // Zorg ervoor dat Markdown-headings correct worden weergegeven
  // Voeg spatie toe na # indien deze ontbreekt (e.g. "#Heading" -> "# Heading")
  processed = processed.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
  
  // Converteer html <ul> en <li> tags naar markdown lijsten als ze nog niet in markdown formaat zijn
  processed = processed.replace(/<ul>/g, '\n');
  processed = processed.replace(/<\/ul>/g, '\n');
  processed = processed.replace(/<li>(.*?)<\/li>/g, '- $1\n');
  
  // Zorg ervoor dat URL's die nog geen markdown link zijn, naar markdown links worden geconverteerd
  const urlRegex = /(?<!["\(])(https?:\/\/[^\s<]+)(?!["\)])/g;
  processed = processed.replace(urlRegex, '[$1]($1)');
  
  return processed;
} 