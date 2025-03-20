interface ItemWithMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Simple component to render Contentful markdown content directly as HTML
 * This avoids all the parsing issues with the markdown library
 */
export function ItemWithMarkdown({ content, className = '' }: ItemWithMarkdownProps) {
  if (!content) {
    return null;
  }
  
  // Pre-process: handle headers first to avoid conflicts with list processing
  let updatedContent = content;
  
  // Properly handle all header levels with specific classes
  updatedContent = updatedContent
    .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold my-3">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold my-4">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-semibold mb-4 mt-6">$1</h1>')
    // Alternate hash notation
    .replace(/^#{3} (.*?)$/gm, '<h3 class="text-lg font-semibold my-3">$1</h3>')
    .replace(/^#{2} (.*?)$/gm, '<h2 class="text-xl font-semibold my-4">$1</h2>')
    .replace(/^#{1} (.*?)$/gm, '<h1 class="text-2xl font-semibold mb-4 mt-6">$1</h1>');
  
  // Process the content line by line to handle lists properly
  const lines = updatedContent.split('\n');
  let inList = false;
  let listType = ''; // Can be 'ul' or 'ol'
  
  let processed = lines.map((line, index) => {
    // Skip lines that are already HTML headers
    if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3')) {
      return line;
    }
    
    const trimmedLine = line.trim();
    
    // Check for ordered list (numbered) items
    if (trimmedLine.match(/^\d+\.\s/)) {
      if (!inList || listType !== 'ol') {
        // Start a new ordered list
        inList = true;
        listType = 'ol';
        return `<ol class="list-decimal pl-5 my-4">\n<li>${trimmedLine.replace(/^\d+\.\s/, '')}</li>`;
      } else {
        // Continue existing ordered list
        return `<li>${trimmedLine.replace(/^\d+\.\s/, '')}</li>`;
      }
    } 
    // Check for unordered list (bullet) items - also handle - as bullets
    else if (trimmedLine.match(/^[\*\-]\s/)) {
      if (!inList || listType !== 'ul') {
        // Start a new unordered list
        inList = true;
        listType = 'ul';
        return `<ul class="list-disc pl-5 my-4">\n<li>${trimmedLine.replace(/^[\*\-]\s/, '')}</li>`;
      } else {
        // Continue existing unordered list
        return `<li>${trimmedLine.replace(/^[\*\-]\s/, '')}</li>`;
      }
    } 
    // Empty line after a list should close the list
    else if (inList && trimmedLine === '') {
      inList = false;
      const closingTag = listType === 'ol' ? '</ol>' : '</ul>';
      listType = '';
      
      // If this is not the last line and we're ending a list, add a paragraph break
      return `${closingTag}${index < lines.length - 1 ? '\n<p></p>' : ''}`;
    } 
    // Content within a list item should be appended to the previous list item
    else if (inList && trimmedLine !== '') {
      // This is additional content within a list item - it should be joined with the previous line
      return ` ${trimmedLine}`;
    } 
    // Regular paragraph text
    else {
      // Handle empty lines as paragraph breaks (only if not at the start)
      if (trimmedLine === '') {
        return index === 0 ? '' : '</p>\n<p>';
      }
      
      // If this is the first line or follows a paragraph break, wrap in a paragraph
      if (index === 0 || lines[index - 1].trim() === '') {
        return `<p>${trimmedLine}`;
      }
      
      // Otherwise, continue the previous paragraph with a break
      return ` ${trimmedLine}`;
    }
  }).join('\n');
  
  // If we ended inside a list, close it
  if (inList) {
    processed += listType === 'ol' ? '</ol>' : '</ul>';
  }
  
  // Handle the specific patterns we saw in the screenshot
  let html = processed
    // Handle numbered list items with special formatting first
    .replace(/\* \*(\d+\.\s+[^*\n]+)\* \*/g, '<strong>$1</strong>')
    .replace(/\*\* \*(\d+\.\s+[^*\n]+)\* \*\*/g, '<strong>$1</strong>')
    
    // Convert bold: either * *text* * or __text__
    .replace(/\* \*(.*?)\* \*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert italic: *text* - but not when it's part of * *text* *
    .replace(/(?<!\* )\*([^*\n]+)\*(?! \*)/g, '<em>$1</em>')
    
    // Handle special case for asterisks that shouldn't be formatting
    .replace(/(\d+)\s+\\\*\s+(\d+)/g, '$1 * $2')
    .replace(/(\w+)\s+\*\s+(\w+)/g, '$1 * $2')
    
    // Ensure proper spacing for paragraphs
    .replace(/<\/p>\s*<p>/g, '</p>\n<p class="my-4">')
    
    // Fix any Contentful link markup (might be present in the JSON)
    .replace(/\{\{(.*?)\}\}/g, '$1');
  
  // Clean up any malformed HTML that might be created
  html = html
    // Remove any empty paragraphs except those used for spacing
    .replace(/<p><\/p>/g, '<p class="my-4"></p>')
    
    // Add classes to first paragraph
    .replace(/<p>/, '<p class="my-4">');
  
  // Ensure it starts and ends with proper tags
  if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
    html = '<p class="my-4">' + html;
  }
  
  if (!html.endsWith('</p>') && !html.endsWith('</h1>') && !html.endsWith('</h2>') && 
      !html.endsWith('</h3>') && !html.endsWith('</ul>') && !html.endsWith('</ol>')) {
    html = html + '</p>';
  }
  
  return (
    <div 
      className={`prose prose-headings:font-semibold prose-p:my-3 prose-li:my-1 prose-ul:my-3 prose-ol:my-3 max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 