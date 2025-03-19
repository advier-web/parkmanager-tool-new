import { Entry, EntryCollection } from 'contentful';
import { getContentfulClient, handleContentfulError, ContentfulError } from '../lib/contentful/client';
import { IBusinessParkReason, IMobilitySolution, IGovernanceModel } from '../types/contentful-types.generated';
import { BusinessParkReason, MobilitySolution, GovernanceModel } from '../domain/models';
import { transformBusinessParkReason, transformMobilitySolution, transformGovernanceModel } from '../transforms/contentful';

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
 * Debug helper: Haal alle content types op uit Contentful om te controleren wat beschikbaar is
 */
export async function getContentfulContentTypes(preview = false): Promise<void> {
  try {
    const client = getContentfulClient(preview);
    const contentTypes = await client.getContentTypes();
    console.log('Available Contentful content types:');
    contentTypes.items.forEach(contentType => {
      console.log(`- ${contentType.sys.id}`);
    });
  } catch (error) {
    console.error('Error fetching content types:', error);
  }
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

/**
 * Haal alle mobility solutions op uit Contentful
 */
export async function getMobilitySolutionsFromContentful(
  options: ContentfulQueryOptions = {}
): Promise<MobilitySolution[]> {
  try {
    // Log available content types first
    const client = getContentfulClient(options.preview);
    
    console.log('Attempting to fetch mobility solutions from Contentful');
    
    // First get all content types to see what's available
    const contentTypes = await client.getContentTypes();
    console.log('Available Contentful content types:');
    const availableContentTypes = contentTypes.items.map(ct => ct.sys.id);
    console.log(availableContentTypes);
    
    // Check if any content type contains the word "mobility" or "mobil" (case insensitive)
    const mobilityContentTypes = availableContentTypes.filter(
      id => id.toLowerCase().includes('mobil')
    );
    
    if (mobilityContentTypes.length > 0) {
      console.log('Found potential mobility content types:', mobilityContentTypes);
      
      // Try the first matching content type
      const contentTypeId = mobilityContentTypes[0];
      console.log(`Trying content type: ${contentTypeId}`);
      
      const queryParams: any = {
        content_type: contentTypeId,
        limit: options.limit || 100,
        skip: options.skip || 0,
      };
      
      const response = await client.getEntries(queryParams);
      console.log(`Found ${response.items.length} entries with content type ${contentTypeId}`);
      
      if (response.items.length > 0) {
        // Manually map to domain model since types might not match exactly
        return response.items.map(item => {
          const fields = (item.fields as any) || {};
          return {
            id: item.sys.id,
            title: fields.title || fields.name || 'Unnamed Solution',
            description: fields.description || '',
            summary: fields.summary || fields.samenvatting || '',
            benefits: Array.isArray(fields.benefits) ? fields.benefits : [],
            challenges: Array.isArray(fields.challenges) ? fields.challenges : [],
            implementationTime: fields.implementationTime || '',
            costs: fields.costs || '',
            category: fields.category || 'overig',
            icon: fields.icon || undefined,
            implementatie: fields.implementatie || ''
          };
        });
      }
    }
    
    // If we get here, we couldn't find suitable content type or entries
    console.log('Could not find suitable mobility solutions in Contentful, falling back to mock data');
    
    // Throw an error to trigger the fallback to mock data
    throw new Error('No suitable mobility solutions found in Contentful');
  } catch (error) {
    console.error('Error fetching mobility solutions:', error);
    throw handleContentfulError(error);
  }
}

/**
 * Haal een specifieke mobility solution op uit Contentful
 */
export async function getMobilitySolutionByIdFromContentful(
  id: string,
  options: ContentfulQueryOptions = {}
): Promise<MobilitySolution | null> {
  try {
    const client = getContentfulClient(options.preview);
    
    // Gebruik de Contentful SDK om een specifieke entry op te halen
    const entry = await client.getEntry<IMobilitySolution>(id);
    
    return transformMobilitySolution(entry);
  } catch (error) {
    // Als de entry niet bestaat, geef null terug
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      return null;
    }
    
    // Anders, propageer de error
    console.error(`Error fetching mobility solution with id ${id}:`, error);
    throw handleContentfulError(error);
  }
}

/**
 * Haal alle governance modellen op uit Contentful
 */
export async function getGovernanceModelsFromContentful(
  options: ContentfulQueryOptions = {}
): Promise<GovernanceModel[]> {
  try {
    const client = getContentfulClient(options.preview);
    
    console.log('Attempting to fetch governance models from Contentful');
    
    // First get all content types to see what's available
    const contentTypes = await client.getContentTypes();
    console.log('Available Contentful content types:');
    const availableContentTypes = contentTypes.items.map(ct => ct.sys.id);
    console.log(availableContentTypes);
    
    // Check if any content type contains the word "governance" (case insensitive)
    const governanceContentTypes = availableContentTypes.filter(
      id => id.toLowerCase().includes('governance') || id.toLowerCase().includes('model')
    );
    
    if (governanceContentTypes.length > 0) {
      console.log('Found potential governance content types:', governanceContentTypes);
      
      // Try the first matching content type
      const contentTypeId = governanceContentTypes[0];
      console.log(`Trying content type: ${contentTypeId}`);
      
      const queryParams: any = {
        content_type: contentTypeId,
        limit: options.limit || 100,
        skip: options.skip || 0,
      };
      
      const response = await client.getEntries(queryParams);
      console.log(`Found ${response.items.length} entries with content type ${contentTypeId}`);
      
      if (response.items.length > 0) {
        // Manually map to domain model since types might not match exactly
        return response.items.map(item => {
          const fields = (item.fields as any) || {};
          return {
            id: item.sys.id,
            title: fields.title || fields.name || 'Unnamed Model',
            description: fields.description || '',
            summary: fields.summary || fields.samenvatting || '',
            advantages: Array.isArray(fields.advantages) ? fields.advantages : [],
            disadvantages: Array.isArray(fields.disadvantages) ? fields.disadvantages : [],
            applicableScenarios: Array.isArray(fields.applicableScenarios) ? fields.applicableScenarios : [],
            organizationalStructure: fields.organizationalStructure || undefined,
            legalForm: fields.legalForm || undefined,
            stakeholders: Array.isArray(fields.stakeholders) ? fields.stakeholders : undefined,
            
            // Implementation plan fields
            samenvatting: fields.samenvatting || '',
            aansprakelijkheid: fields.aansprakelijkheid || '',
            benodigdhedenOprichting: Array.isArray(fields.benodigdhedenOprichting) ? fields.benodigdhedenOprichting : [],
            doorlooptijd: fields.doorlooptijd || '',
            implementatie: fields.implementatie || '',
            links: Array.isArray(fields.links) ? fields.links : [],
            voorbeeldContracten: Array.isArray(fields.voorbeeldContracten) ? fields.voorbeeldContracten : []
          };
        });
      }
    }
    
    // If we get here, we couldn't find suitable content type or entries
    console.log('Could not find suitable governance models in Contentful, falling back to mock data');
    
    // Throw an error to trigger the fallback to mock data
    throw new Error('No suitable governance models found in Contentful');
  } catch (error) {
    console.error('Error fetching governance models:', error);
    throw handleContentfulError(error);
  }
}

/**
 * Haal een specifiek governance model op uit Contentful
 */
export async function getGovernanceModelByIdFromContentful(
  id: string,
  options: ContentfulQueryOptions = {}
): Promise<GovernanceModel | null> {
  try {
    const client = getContentfulClient(options.preview);
    
    // Try to get the entry directly
    const entry = await client.getEntry<IGovernanceModel>(id);
    
    return transformGovernanceModel(entry);
  } catch (error) {
    // If the entry doesn't exist, return null
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      return null;
    }
    
    // Otherwise, propagate the error
    console.error(`Error fetching governance model with id ${id}:`, error);
    throw handleContentfulError(error);
  }
} 