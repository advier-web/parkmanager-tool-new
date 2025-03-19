import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Gemeenschappelijke component voor het renderen van markdown content in de hele app
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) {
    return null;
  }
  
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
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
  return text.replace(/__(.*?)__/g, '**$1**');
} 