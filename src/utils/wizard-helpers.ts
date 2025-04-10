// Helper function to extract relevant implementation text based on :::variant[Name]...::: syntax
// Moved from stap-4/page.tsx
export const extractImplementationText = (
    markdown: string | undefined,
    selectedVariantName: string | null
  ): string => {
    if (!markdown) return 'Geen implementatieplan beschikbaar.';
    
    if (!selectedVariantName) {
      // Check if *any* :::variant block exists to determine if prompt is needed
      // This assumes if variants are defined in the model, they should exist in the text
      if (markdown.includes(':::variant[')) {
          // This case should ideally not be hit in Step 2b if selection is mandatory
          // In Step 4 (if it were still used), this would prompt selection
          return "*Selecteer een implementatievariant om de specifieke tekst te zien.*";
      } else {
          // No variant blocks found, maybe this solution doesn't use variants?
          console.warn('[extractImplementationText] No variant selected and no :::variant blocks found in markdown. Returning full text.');
          return markdown; 
      }
    }
  
    // Escape potential special characters in the variant name for regex/string matching
    const escapedVariantName = selectedVariantName; 
    const startTag = `:::variant[${escapedVariantName}]`;
    const endTag = `:::`;
  
    const startIndex = markdown.indexOf(startTag);
  
    if (startIndex === -1) {
      // The specific variant block was not found
      console.error(`[extractImplementationText] Start tag '${startTag}' not found in markdown.`);
      return `*Specifieke implementatie-informatie blok voor '${selectedVariantName}' (zoekt naar '${startTag}') kon niet worden gevonden in de tekst.*`;
    }
  
    // Find the end tag *after* the start tag
    const contentStartIndex = startIndex + startTag.length;
    const endIndex = markdown.indexOf(endTag, contentStartIndex);
  
    if (endIndex === -1) {
      // End tag was not found after the start tag - indicates syntax error in content
      console.error(`[extractImplementationText] End tag '${endTag}' not found after start tag '${startTag}' (searched from index ${contentStartIndex}).`);
      return `*Syntaxfout gevonden in de implementatietekst: Eind-tag '${endTag}' ontbreekt na start-tag '${startTag}'.*`;
    }
  
    // Extract the text between the tags
    const extractedText = markdown.substring(contentStartIndex, endIndex).trim();
  
    return extractedText || `*Geen specifieke tekst gevonden in het blok voor '${selectedVariantName}'.*`;
  }; 

/**
 * Extracts relevant sections from passport text based on a selected variant.
 * Iterates through matches to combine general text segments with the content of *all* 
 * blocks matching the selected variant, maintaining the original order.
 * If no variant blocks are found, returns the full text.
 * If variant blocks exist but none match the selection, returns only the general text.
 */
export const extractPassportTextWithVariant = (
  passportText: string | undefined,
  selectedVariantName: string | null
): string => {
  if (!passportText) return '';

  // Regex to find variant blocks and capture name and content
  const variantBlockRegex = /:::variant\[(.*?)\]([\s\S]*?):::/g;
  const allMatches = Array.from(passportText.matchAll(variantBlockRegex));

  // If no variant blocks exist at all, return the original text
  if (allMatches.length === 0) {
    return passportText;
  }

  // If no variant is selected, return the original text (or consider returning only general text)
  if (!selectedVariantName) {
    return passportText; 
  }

  const resultBuilder: string[] = [];
  let currentIndex = 0;

  // Iterate through all found variant blocks
  for (const match of allMatches) {
    const blockStartIndex = match.index ?? 0;
    const blockEndIndex = blockStartIndex + match[0].length;
    const variantName = match[1].trim();
    const variantContent = match[2].trim();

    // Add the general text segment before this block
    const generalTextSegment = passportText.substring(currentIndex, blockStartIndex).trim();
    if (generalTextSegment) {
      resultBuilder.push(generalTextSegment);
    }

    // If the current block matches the selected variant, add its content
    if (variantName === selectedVariantName && variantContent) {
      resultBuilder.push(variantContent);
    }

    // Update the index to the end of the current block
    currentIndex = blockEndIndex;
  }

  // Add any remaining general text after the last block
  const finalGeneralTextSegment = passportText.substring(currentIndex).trim();
  if (finalGeneralTextSegment) {
    resultBuilder.push(finalGeneralTextSegment);
  }

  // Join the collected segments with double newlines
  // Filter(Boolean) removes any empty strings that might have resulted from trimming
  return resultBuilder.filter(Boolean).join('\n\n');
}; 

/**
 * Extracts the first """samenvatting..."""/samenvatting""" block found within any block matching the selected
 * :::variant[...]...:::` in the implementation text.
 */
export const extractImplementationSummaryFromVariant = (
  implementationText: string | undefined,
  selectedVariantName: string | null
): string => {
  if (!implementationText || !selectedVariantName) {
    return '';
  }

  // 1. Find ALL blocks matching the selected variant name
  const escapedVariantName = selectedVariantName.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  const patternString = `:::variant\\[\\s*${escapedVariantName}\s*\\]([\\s\\S]*):::`;
  const specificVariantBlockRegex = new RegExp(patternString, 'g');
  const allVariantMatches = Array.from(implementationText.matchAll(specificVariantBlockRegex));

  if (allVariantMatches.length === 0) {
    return '';
  }

  // 2. Search within each found variant block for the new summary tag structure
  const summaryBlockRegex = /"""samenvatting([\s\S]*?)"""\/samenvatting"""/;

  for (const [index, variantMatch] of allVariantMatches.entries()) {
    const variantContent = variantMatch[1];
    if (variantContent) {
      const summaryMatch = variantContent.match(summaryBlockRegex);
      if (summaryMatch && summaryMatch[1]) {
        return summaryMatch[1].trim();
      }
    }
  }

  return '';
}; 