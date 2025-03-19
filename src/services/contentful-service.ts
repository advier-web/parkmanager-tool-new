import { Entry, EntryCollection } from 'contentful';
import { getContentfulClient, handleContentfulError, ContentfulError } from '../lib/contentful/client';
import { IBusinessParkReason } from '../types/contentful-types.generated';
import { BusinessParkReason } from '../domain/models';
import { transformBusinessParkReason } from '../transforms/contentful';

/**
 * Service voor het ophalen van data uit Contentful
 */

interface ContentfulQueryOptions {
  preview?: boolean;
  limit?: number;
  skip?: number;
  // We vermijden het strict typen van order om flexibiliteit te behouden
}

/**
 * Haal alle business park reasons op uit Contentful
 */
export async function getBusinessParkReasonsFromContentful(
  options: ContentfulQueryOptions = {}
): Promise<BusinessParkReason[]> {
  try {
    const client = getContentfulClient(options.preview);
    
    // Bouw query parameters op met type assertion waar nodig
    const queryParams: any = {
      content_type: 'businessParkReason',
      limit: options.limit || 100,
      skip: options.skip || 0,
    };
    
    const response = await client.getEntries<IBusinessParkReason>(queryParams);
    
    // Gebruik de transform functies om Contentful entries naar domein objecten te converteren
    return response.items.map(transformBusinessParkReason);
  } catch (error) {
    console.error('Error fetching business park reasons:', error);
    throw handleContentfulError(error);
  }
}

/**
 * Haal een specifieke business park reason op uit Contentful
 */
export async function getBusinessParkReasonByIdFromContentful(
  id: string,
  options: ContentfulQueryOptions = {}
): Promise<BusinessParkReason | null> {
  try {
    const client = getContentfulClient(options.preview);
    
    // Gebruik de Contentful SDK om een specifieke entry op te halen
    const entry = await client.getEntry<IBusinessParkReason>(id);
    
    return transformBusinessParkReason(entry);
  } catch (error) {
    // Als de entry niet bestaat, geef null terug
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      return null;
    }
    
    // Anders, propageer de error
    console.error(`Error fetching business park reason with id ${id}:`, error);
    throw handleContentfulError(error);
  }
} 