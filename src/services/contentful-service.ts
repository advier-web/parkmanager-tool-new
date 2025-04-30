import { Entry, EntryCollection, EntrySkeletonType } from 'contentful';
import { getContentfulClient, handleContentfulError, ContentfulError } from '../lib/contentful/client';
import {
  IBusinessParkReason,
  IMobilityService,
  IGovernanceModel,
  IImplementationvariations
} from '../types/contentful-types.generated';
import { BusinessParkReason, MobilitySolution, GovernanceModel, ImplementationVariation } from '../domain/models';
import { transformBusinessParkReason, transformMobilitySolution, transformGovernanceModel, transformImplementationVariation } from '../transforms/contentful';

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
    
    console.log('[CONTENTFUL] Attempting to fetch mobility solutions from Contentful');
    
    // First get all content types to see what's available
    const contentTypes = await client.getContentTypes();
    console.log('[CONTENTFUL] Available Contentful content types:');
    const availableContentTypes = contentTypes.items.map(ct => ct.sys.id);
    console.log(availableContentTypes);
    
    // Check if any content type contains the word "mobility" or "mobil" (case insensitive)
    const mobilityContentTypes = availableContentTypes.filter(
      id => id.toLowerCase().includes('mobil')
    );
    
    if (mobilityContentTypes.length > 0) {
      console.log('[CONTENTFUL] Found potential mobility content types:', mobilityContentTypes);
      
      // Try the first matching content type
      const contentTypeId = mobilityContentTypes[0];
      console.log(`[CONTENTFUL] Trying content type: ${contentTypeId}`);
      
      const queryParams: any = {
        content_type: contentTypeId,
        limit: options.limit || 100,
        skip: options.skip || 0,
      };
      
      const response = await client.getEntries<IMobilityService>(queryParams);
      console.log(`[CONTENTFUL] Found ${response.items.length} entries with content type ${contentTypeId}`);
      
      if (response.items.length > 0) {
        // Log de velden van de eerste oplossing
        const firstItem = response.items[0];
        console.log('[CONTENTFUL] First solution fields from Contentful:');
        Object.entries(firstItem.fields).forEach(([key, value]) => {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        });
        
        // Log specifiek voor Gezondheid
        if (response.items.some(item => 
            (item.fields as any).title && 
            (item.fields as any).title.includes('deelfiets'))) {
          console.log('[CONTENTFUL-IMPORTANT] Found deelfiets solution, checking score fields:');
          const deelfietsItem = response.items.find(item => 
            (item.fields as any).title && 
            (item.fields as any).title.includes('deelfiets'));
          
          if (deelfietsItem) {
            Object.entries(deelfietsItem.fields).forEach(([key, value]) => {
              if (typeof value === 'number') {
                console.log(`  [SCORE] ${key}: ${value}`);
              }
            });
          }
        }
        
        // Use the transformMobilitySolution function
        // Note: ImplementationVariations will be undefined here
        return response.items.map(transformMobilitySolution);
      }
    }
    
    // If we get here, we couldn't find suitable content type or entries
    console.log('[CONTENTFUL] Could not find suitable mobility solutions in Contentful, falling back to mock data');
    
    // Throw an error to trigger the fallback to mock data
    throw new Error('No suitable mobility solutions found in Contentful');
  } catch (error) {
    console.error('[CONTENTFUL] Error fetching mobility solutions:', error);
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
    const entry = await client.getEntry<IMobilityService>(id);
    
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
 * Haal een specifieke mobility solution op uit Contentful via ID
 */
export async function getMobilitySolutionById(
  id: string,
  options: ContentfulQueryOptions = {}
): Promise<MobilitySolution | null> {
  try {
    const client = getContentfulClient(options.preview);
    
    // Gebruik de Contentful SDK om een specifieke entry op te halen
    // We gebruiken het IMobilityService type, aangezien dat overeenkomt met de transformer
    const entry = await client.getEntry<IMobilityService>(id);
    
    // Transformeer naar het domain model
    return transformMobilitySolution(entry);

  } catch (error) {
    // Als de entry niet bestaat, geef null terug
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      console.warn(`[CONTENTFUL] Mobility solution with id ${id} not found.`);
      return null;
    }
    
    // Anders, propageer de error
    console.error(`[CONTENTFUL] Error fetching mobility solution with id ${id}:`, error);
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
      
      const response = await client.getEntries<IGovernanceModel>(queryParams);
      console.log(`Found ${response.items.length} entries with content type ${contentTypeId}`);
      
      if (response.items.length > 0) {
        // Debug log the first model to see its structure
        const firstItem = response.items[0];
        console.log('First governance model fields from Contentful:');
        if (firstItem && firstItem.fields) {
          Object.entries(firstItem.fields).forEach(([key, value]) => {
            console.log(`  ${key}: ${typeof value === 'object' ? 'object' : value}`);
          });
        }
        
        // Manually map to domain model since types might not match exactly
        return response.items.map(transformGovernanceModel);
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

/**
 * Haal de websiteCollectiefVervoer content op uit Contentful
 */
export async function getWebsiteCollectiefVervoerFromContentful(
  options: ContentfulQueryOptions = {}
): Promise<any> {
  try {
    const client = getContentfulClient(options.preview);
    
    console.log('[CONTENTFUL] Attempting to fetch websiteCollectiefVervoer content from Contentful');
    
    const queryParams: any = {
      content_type: 'websiteCollectiefVervoer',
      limit: 1,
    };
    
    const response = await client.getEntries(queryParams);
    
    if (response.items.length > 0) {
      const contentItem = response.items[0];
      return {
        id: contentItem.sys.id,
        ...contentItem.fields
      };
    }
    
    throw new Error('No websiteCollectiefVervoer content found in Contentful');
  } catch (error) {
    console.error('[CONTENTFUL] Error fetching websiteCollectiefVervoer content:', error);
    throw handleContentfulError(error);
  }
}

/**
 * Haalt een specifieke mobility solution op uit Contentful met alle velden voor PDF export
 */
export async function getMobilitySolutionForPdf(id: string, options: { preview?: boolean } = {}): Promise<MobilitySolution> {
  const client = getContentfulClient(options.preview);
  
  try {
    const entry = await client.getEntry<IMobilityService>(id, { include: 10 });
    const fields = entry.fields;
  
    // Helper to safely get string field, return empty string if not string
    const getStringField = (fieldName: string): string => {
      const value = (fields as any)[fieldName];
      return typeof value === 'string' ? value : '';
    };
    
    // Helper to safely get number field, return 0 if not number
    const getNumberField = (fieldName: string): number => {
      const value = (fields as any)[fieldName];
      return typeof value === 'number' ? value : 0;
    };
    
    // Helper to safely get string array field, return empty array if not array
    const getStringArrayField = (fieldName: string): string[] => {
      const value = (fields as any)[fieldName];
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    };
  
    // Transform Contentful data to MobilitySolution domain model
    const solution: MobilitySolution = {
      id: entry.sys.id,
      title: getStringField('title'),
      subtitle: getStringField('subtitle'),
      description: getStringField('description'),
      samenvattingLang: getStringField('samenvattingLang'),
      implementatie: getStringField('implementatie'),
      uitvoering: getStringField('uitvoering'),
      paspoort: getStringField('paspoort'),
      investering: getStringField('investering'),
      collectiefVsIndiviueel: getStringField('collectiefVsIndiviueel'),
      uitvoeringsmogelijkheden: getStringField('uitvoeringsmogelijkheden'),
      inputBusinesscase: getStringField('inputBusinesscase'),
      implementationTime: getStringField('implementationTime'),
      costs: getStringField('costs'),
      category: getStringField('category'),
      icon: getStringField('icon'),
      pdfLink: getStringField('pdfLink'),
      benefits: getStringArrayField('benefits'),
      challenges: getStringArrayField('challenges'),
      implementatievarianten: getStringArrayField('implementatievarianten'), // Assuming this is a simple array of strings now
      
      // Score fields
      parkeer_bereikbaarheidsproblemen: getNumberField('parkeer_bereikbaarheidsproblemen'),
      gezondheid: getNumberField('gezondheid'),
      personeelszorg_en_behoud: getNumberField('personeelszorg_en_behoud'),
      imago: getNumberField('imago'),
      milieuverordening: getNumberField('milieuverordening'),
      waarde_vastgoed: getNumberField('waarde_vastgoed'),
      vervoerkosten: getNumberField('vervoerkosten'),
      gastvrijheid: getNumberField('gastvrijheid'),
      bedrijfsverhuizing: getNumberField('bedrijfsverhuizing'),
      energiebalans: getNumberField('energiebalans'),
      
      typeVervoer: parseTypeVervoer(fields.typeVervoer),
      
      // Toelichtingen
      parkeerBereikbaarheidsproblemenToelichting: getStringField('parkeerBereikbaarheidsproblemenToelichting'),
      bereikbaarheidsproblemenToelichting: getStringField('bereikbaarheidsproblemenToelichting'),
      waardeVastgoedToelichting: getStringField('waardeVastgoedToelichting'),
      personeelszorgEnBehoudToelichting: getStringField('personeelszorgEnBehoudToelichting'),
      vervoerkostenToelichting: getStringField('vervoerkostenToelichting'),
      gezondheidToelichting: getStringField('gezondheidToelichting'),
      gastvrijheidToelichting: getStringField('gastvrijheidToelichting'),
      imagoToelichting: getStringField('imagoToelichting'),
      milieuverordeningToelichting: getStringField('milieuverordeningToelichting'),
      bedrijfsverhuizingToelichting: getStringField('bedrijfsverhuizingToelichting'),
      energiebalansToelichting: getStringField('energiebalansToelichting'),
      
      // Implementation Variations need to be fetched and transformed separately if needed for PDF
      implementationVariations: [], // Initialize as empty, fetch/transform if required
    };
    return solution;
  } catch (error) {
    console.error('Error fetching mobility solution for PDF:', error);
    throw error;
  }
}

/**
 * Haal alle implementatievarianten op voor een specifieke mobiliteitsoplossing
 */
export async function getImplementationVariationsForSolution(
  solutionId: string,
  options: ContentfulQueryOptions = {}
): Promise<ImplementationVariation[]> {
  try {
    const client = getContentfulClient(options.preview);
    console.log(`[SERVICE] Called getImplementationVariationsForSolution for solution ID: ${solutionId}`);

    const queryParams: any = {
      content_type: 'implementationvariations',
      'fields.mobiliteitsdienstVariant.sys.id': solutionId, // Filter op de link naar de solution
      limit: options.limit || 50, // Limiet voor varianten per oplossing
      skip: options.skip || 0,
    };

    const response = await client.getEntries<IImplementationvariations>(queryParams);
    console.log(`[SERVICE] Contentful query for variations returned ${response.items.length} items.`);
    console.log(`[CONTENTFUL] Found ${response.items.length} implementation variations for solution ${solutionId}`);

    // Transformeer de entries naar domain models
    if (response.items.length === 0) {
      console.log(`[SERVICE] No variations found, returning empty array.`);
    }
    return response.items.map(transformImplementationVariation);

  } catch (error) {
    console.error(`[CONTENTFUL] Error fetching implementation variations for solution ${solutionId}:`, error);
    throw handleContentfulError(error);
  }
}

/**
 * Haal een specifieke implementation variation op via ID
 */
export async function getImplementationVariationById(
  id: string,
  options: ContentfulQueryOptions = {}
): Promise<ImplementationVariation | null> {
  try {
    const client = getContentfulClient(options.preview);

    // Gebruik Contentful SDK om specifieke entry op te halen
    const entry = await client.getEntry<IImplementationvariations>(id);

    // Transformeer naar domain model
    return transformImplementationVariation(entry);

  } catch (error) {
    // Als entry niet bestaat, geef null terug
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      console.warn(`[CONTENTFUL] Implementation variation with id ${id} not found.`);
      return null;
    }

    // Anders, propageer de error
    console.error(`[CONTENTFUL] Error fetching implementation variation with id ${id}:`, error);
    throw handleContentfulError(error);
  }
} 