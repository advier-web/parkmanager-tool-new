/**
 * Helper functies voor environment variabelen
 */

/**
 * Controleert of Contentful API gebruikt moet worden
 * Deze functie werkt zowel in client als server context
 */
export function shouldUseContentful(): boolean {
  // Server-side
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';
  }
  
  // Client-side
  // Probeer eerst uit localStorage (gebruikt door de testpagina toggle)
  try {
    const localStorageSetting = localStorage.getItem('USE_CONTENTFUL');
    if (localStorageSetting !== null) {
      return localStorageSetting === 'true';
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }
  
  // Fallback naar env var
  return process.env.NEXT_PUBLIC_USE_CONTENTFUL === 'true';
}

/**
 * Controleert of Contentful preview mode actief is
 */
export function isContentfulPreviewMode(): boolean {
  return process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW === 'true';
} 