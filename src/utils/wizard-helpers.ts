import { BusinessParkReason, MobilitySolution, GovernanceModel, ImplementationVariation } from '../domain/models';
import { SelectedVariantMap } from '../lib/store';

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

// --- NEW Helper Function --- 
// Extracts variant names from markdown in the order they appear.
export const extractVariantNamesInOrder = (
  markdown: string | undefined
): string[] => {
  if (!markdown) return [];

  const names: string[] = [];
  const regex = /:::variant\[([^\]]+)\]/g; // Regex to find :::variant[Name]
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    if (match[1]) {
      names.push(match[1].trim()); // Add the captured name (inside brackets)
    }
  }

  return names;
}; 

// Helper function to convert snake_case to camelCase
export const snakeToCamel = (str: string): string => 
  str.toLowerCase().replace(/([-_\s][a-z])/g, group => 
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
      .replace(' ', '')
  );

/**
 * Helper function to convert Governance Model title to field name used on ImplementationVariation
 */
export const governanceTitleToFieldName = (title: string | undefined): string | null => {
  if (!title) return null;
  const lowerTitle = title.toLowerCase();
  // Specific mappings based on known titles and field names on ImplementationVariation
  if (lowerTitle.includes('coöperatie') && lowerTitle.includes('u.a.')) return 'cooperatieUa';
  if (lowerTitle.includes('stichting')) return 'stichting';
  if (lowerTitle.includes('ondernemers biz')) return 'ondernemersBiz'; 
  if (lowerTitle.includes('vastgoed biz')) return 'vastgoedBiz';
  if (lowerTitle.includes('gemengde biz')) return 'gemengdeBiz';
  if (lowerTitle.includes('b.v.') || lowerTitle.includes(' bv ')) return 'bv'; 
  if (lowerTitle.includes('ondernemersfonds')) return 'ondernemersfonds';
  if (lowerTitle.includes('geen rechtsvorm')) return 'geenRechtsvorm';
  if (lowerTitle.includes('vereniging')) return 'vereniging';
  // Add more mappings if needed
  console.warn(`[governanceTitleToFieldName] No specific field name mapping found for title: ${title}`);
  // Fallback: try simple camelCase conversion (might not match exactly)
  return snakeToCamel(title.replace(/\./g, '')); 
};

/**
 * Removes the solution prefix (e.g., "Solution Title - ") from a variant title.
 */
export const stripSolutionPrefixFromVariantTitle = (fullVariantTitle: string | undefined): string => {
  if (!fullVariantTitle) return '';
  const separatorIndex = fullVariantTitle.indexOf(' - ');
  if (separatorIndex !== -1) {
    return fullVariantTitle.substring(separatorIndex + 3); // Get text after " - "
  }
  return fullVariantTitle; // Return original if separator not found
};

// Centralized desired ordering of implementation variants (normalized titles)
export const desiredImplementationOrder: string[] = [
  'zelf aanschaffen door bedrijfsvereniging',
  'inkoop door één aangesloten organisatie met deelname van anderen',
  'aanbevolen serviceprovider door de bedrijfsvereniging',
  'centrale inkoop door de bedrijfsvereniging via één serviceprovider',
];

function normalizeTitle(value: string): string {
  return (value || '').toLowerCase().trim();
}

// Centralized sorter for implementation variations
export function orderImplementationVariations<T extends { title: string }>(
  variations: T[] | undefined
): T[] {
  if (!variations || variations.length === 0) return [] as T[];
  const getKey = (v: T) => normalizeTitle(stripSolutionPrefixFromVariantTitle(v?.title || ''));
  return variations.slice().sort((a, b) => {
    const ai = desiredImplementationOrder.indexOf(getKey(a));
    const bi = desiredImplementationOrder.indexOf(getKey(b));
    const as = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bs = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (as !== bs) return as - bs;
    return getKey(a).localeCompare(getKey(b));
  });
}

// Helper function to find an implementation variation by ID
export function findVariationById(variations: ImplementationVariation[] | undefined, id: string | null): ImplementationVariation | undefined {
  if (!variations || !id) return undefined;
  return variations.find(v => v.id === id);
}

// Function to determine if a model is recommended based on variation links
export function isModelRecommended(modelId: string, variation: ImplementationVariation | undefined): boolean {
  if (!variation || !variation.governanceModels) return false;
  return variation.governanceModels.some(ref => ref.sys?.id === modelId);
}

// Function to determine if a model is conditionally recommended
export function isModelConditionallyRecommended(modelId: string, variation: ImplementationVariation | undefined): boolean {
  if (!variation || !variation.governanceModelsMits) return false;
  // Ensure it's not already in the main recommended list
  if (isModelRecommended(modelId, variation)) return false; 
  return variation.governanceModelsMits.some(ref => ref.sys?.id === modelId);
}

// Function to determine if a model is unsuitable
export function isModelUnsuitable(modelId: string, variation: ImplementationVariation | undefined): boolean {
  if (!variation || !variation.governanceModelsNietgeschikt) return false;
  // Ensure it's not in recommended or conditional lists
  if (isModelRecommended(modelId, variation) || isModelConditionallyRecommended(modelId, variation)) return false;
  return variation.governanceModelsNietgeschikt.some(ref => ref.sys?.id === modelId);
}

// Function to categorize governance models for a set of variations
export function categorizeGovernanceModels(
  allModels: GovernanceModel[],
  variations: ImplementationVariation[]
): {
  recommended: GovernanceModel[];
  conditional: GovernanceModel[];
  unsuitable: GovernanceModel[];
  other: GovernanceModel[];
} {
  const result = {
    recommended: [] as GovernanceModel[],
    conditional: [] as GovernanceModel[],
    unsuitable: [] as GovernanceModel[],
    other: [] as GovernanceModel[],
  };

  allModels.forEach(model => {
    let isRecommended = false;
    let isConditional = false;
    let isUnsuitable = false;

    variations.forEach(variation => {
      if (isModelRecommended(model.id, variation)) isRecommended = true;
      if (isModelConditionallyRecommended(model.id, variation)) isConditional = true;
      if (isModelUnsuitable(model.id, variation)) isUnsuitable = true;
    });

    if (isRecommended) {
      result.recommended.push(model);
    } else if (isConditional) {
      result.conditional.push(model);
    } else if (isUnsuitable) {
      result.unsuitable.push(model);
    } else {
      result.other.push(model);
    }
  });

  return result;
}