import { Entry /*, EntryCollection, EntrySkeletonType*/ } from 'contentful';
import { getContentfulClient, handleContentfulError, ContentfulError } from '../lib/contentful/client';
import {
  IBusinessParkReason,
  IMobilityService,
  IGovernanceModel,
  IImplementationvariations // Corrected casing
} from '../types/contentful-types.generated';
import { BusinessParkReason, MobilitySolution, GovernanceModel, ImplementationVariation, TrafficType } from '../domain/models';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, Document as ContentfulDocument } from '@contentful/rich-text-types';
import { 
  transformBusinessParkReason, 
  transformGovernanceModel, 
  transformImplementationVariation 
} from '../transforms/contentful';

// --- Helper Functions ---

function safeDocumentToHtmlString(doc: any): string | undefined {
  if (doc && typeof doc === 'object' && doc.nodeType === BLOCKS.DOCUMENT && Array.isArray(doc.content)) {
    try {
      return documentToHtmlString(doc as ContentfulDocument);
    } catch (error) {
      console.error("Error converting Rich Text to HTML:", error);
      return undefined;
    }
  }
  return undefined;
}

function parseTypeVervoer(typeVervoerField: any): TrafficType[] {
  if (!typeVervoerField) return [];
  if (Array.isArray(typeVervoerField)) {
    return typeVervoerField.map(item => {
      if (typeof item === 'string') {
        const normalized = item.toLowerCase().trim();
        if (normalized.includes('woon') || normalized.includes('commuter')) return TrafficType.COMMUTER;
        if (normalized.includes('zakelijk') || normalized.includes('business')) return TrafficType.BUSINESS;
        if (normalized.includes('bezoeker') || normalized.includes('visitor')) return TrafficType.VISITOR;
      }
      return null;
    }).filter((type): type is TrafficType => type !== null);
  }
  if (typeof typeVervoerField === 'string') {
    const types: TrafficType[] = [];
    const normalized = typeVervoerField.toLowerCase();
    if (normalized.includes('woon') || normalized.includes('commuter')) types.push(TrafficType.COMMUTER);
    if (normalized.includes('zakelijk') || normalized.includes('business')) types.push(TrafficType.BUSINESS);
    if (normalized.includes('bezoeker') || normalized.includes('visitor')) types.push(TrafficType.VISITOR);
    return types;
  }
  return [];
}

function getRefIdArray(refs: any): Array<{ sys: { id: string } }> {
  if (!Array.isArray(refs)) return [];
  return refs
    .map(ref => (ref && ref.sys && typeof ref.sys.id === 'string' ? { sys: { id: ref.sys.id } } : null))
    .filter((ref): ref is { sys: { id: string } } => ref !== null);
}

function getSafeAssetUrl(assetLink: any): string | undefined {
    // This expects the linked asset entry to be resolved (e.g., via include level in the query)
    if (assetLink && assetLink.fields && assetLink.fields.file && typeof assetLink.fields.file.url === 'string') {
        const url = assetLink.fields.file.url;
        return url.startsWith('//') ? `https:${url}` : url;
    }
    // Log a warning if the asset link couldn't be resolved
    if (assetLink && assetLink.sys && assetLink.sys.type === 'Link' && assetLink.sys.linkType === 'Asset') {
        console.warn(`Asset URL not resolved for asset ID: ${assetLink.sys.id}. Ensure assets are included in the query.`);
    }
    // Handle cases where the URL might be directly in the field (if not an Asset link)
    if(typeof assetLink === 'string' && assetLink.startsWith('//')) {
        return `https:${assetLink}`;
    }
    if(typeof assetLink === 'string' && assetLink.startsWith('http')) {
        return assetLink;
    }
    return undefined;
}

// --- Moved Helper Functions for getMobilitySolutionForPdf outside the function scope ---

const safeDocumentToHtmlStringForPdf = (doc: any): string | undefined => {
  if (doc && typeof doc === 'object' && doc.nodeType === BLOCKS.DOCUMENT && Array.isArray(doc.content)) {
    try {
      return documentToHtmlString(doc as ContentfulDocument);
    } catch (error) {
      console.error("Error converting Rich Text to HTML for PDF:", error);
      return undefined;
    }
  }
  return undefined;
};

// Helper function for safely getting string fields, assuming fields type
const getStringFieldSafe = (fields: Record<string, any> | undefined, fieldName: string): string => {
    const value = fields?.[fieldName];
    return typeof value === 'string' ? value : '';
};

// Helper function for safely getting number fields, assuming fields type
const getNumberFieldSafe = (fields: Record<string, any> | undefined, fieldName: string): number => {
     const value = fields?.[fieldName];
     return typeof value === 'number' ? value : 0;
};

// Helper function for safely getting string array fields, assuming fields type
const getStringArrayFieldSafe = (fields: Record<string, any> | undefined, fieldName: string): string[] => {
     const value = fields?.[fieldName];
     return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
};

// Helper function for safely getting rich text fields, assuming fields type
const getRichTextFieldSafe = (fields: Record<string, any> | undefined, fieldName: string): string | undefined => {
    const value = fields?.[fieldName];
    return safeDocumentToHtmlStringForPdf(value);
};

// --- SDK Calls (Use PascalCase generics, map directly) ---

interface ContentfulQueryOptions {
  preview?: boolean;
  limit?: number;
  skip?: number;
}

export async function getBusinessParkReasonsFromContentful(options: ContentfulQueryOptions = {}): Promise<BusinessParkReason[]> {
  try {
    const client = getContentfulClient(options.preview);
    const queryParams: any = { content_type: 'businessParkReason', limit: options.limit || 100, skip: options.skip || 0 };
    // Use PascalCase generic type. If EntrySkeletonType errors persist, consider <any> or fixing generated types.
    // Use <any> workaround for EntrySkeletonType constraint
    const response = await client.getEntries<any>(queryParams);
    return response.items.map(transformBusinessParkReason);
  } catch (error) {
    console.error('Error fetching business park reasons:', error);
    throw handleContentfulError(error);
  }
}

export async function getBusinessParkReasonByIdFromContentful(id: string, options: ContentfulQueryOptions = {}): Promise<BusinessParkReason | null> {
  try {
    const client = getContentfulClient(options.preview);
    // Use <any> workaround for EntrySkeletonType constraint
    const entry = await client.getEntry<any>(id); 
    return transformBusinessParkReason(entry);
  } catch (error) {
    if (error instanceof ContentfulError && error.type === 'NotFound') return null;
    console.error(`Error fetching business park reason with id ${id}:`, error);
    throw handleContentfulError(error);
  }
}

export async function getMobilitySolutionsFromContentful(options: ContentfulQueryOptions = {}): Promise<MobilitySolution[]> {
  try {
    const client = getContentfulClient(options.preview);
    const contentTypes = await client.getContentTypes();
    const availableContentTypes = contentTypes.items.map(ct => ct.sys.id);
    const mobilityContentTypes = availableContentTypes.filter(id => id.toLowerCase().includes('mobil'));
    if (mobilityContentTypes.length > 0) {
      const contentTypeId = mobilityContentTypes[0];
      const queryParams: any = { content_type: contentTypeId, limit: options.limit || 100, skip: options.skip || 0 };
      const response = await client.getEntries<any>(queryParams);
      if (response.items.length > 0) {
        return response.items.map(entry => {
            const fields = entry.fields as any;
            const solution: MobilitySolution = {
              id: entry.sys.id,
              title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
              subtitle: typeof fields.subtitle === 'string' ? fields.subtitle : undefined,
              description: typeof fields.description === 'string' ? fields.description : undefined,
              samenvattingLang: typeof fields.samenvattingLang === 'string' ? fields.samenvattingLang : undefined,
              introTekstTool: typeof (fields as any).introTekstTool === 'string' ? (fields as any).introTekstTool : undefined,
              implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
              uitvoering: typeof fields.uitvoering === 'string' ? fields.uitvoering : undefined,
              paspoort: typeof fields.paspoort === 'string' ? fields.paspoort : undefined,
              investering: typeof fields.investering === 'string' ? fields.investering : undefined,
              collectiefVsIndiviueel: typeof fields.collectiefVsIndiviueel === 'string' ? fields.collectiefVsIndiviueel : undefined,
              uitvoeringsmogelijkheden: typeof fields.uitvoeringsmogelijkheden === 'string' ? fields.uitvoeringsmogelijkheden : undefined,
              inputBusinesscase: typeof fields.inputBusinesscase === 'string' ? fields.inputBusinesscase : undefined,
              casebeschrijving: typeof fields.casebeschrijving === 'string' ? fields.casebeschrijving : undefined,
              uitdagingenEnAanleidingen: typeof fields.uitdagingenEnAanleidingen === 'string' ? fields.uitdagingenEnAanleidingen : undefined,
              samenvattingKort: typeof fields.samenvattingKort === 'string' ? fields.samenvattingKort : undefined,
              implementationTime: typeof fields.implementationTime === 'string' ? fields.implementationTime : undefined,
              costs: typeof fields.costs === 'string' ? fields.costs : undefined,
              category: typeof fields.category === 'string' ? fields.category : 'Onbekend',
              icon: typeof fields.icon === 'string' ? fields.icon : undefined,
              benefits: Array.isArray(fields.benefits) ? fields.benefits.filter((b: unknown): b is string => typeof b === 'string') : [],
              challenges: Array.isArray(fields.challenges) ? fields.challenges.filter((c: unknown): c is string => typeof c === 'string') : [],
              implementatievarianten: getRefIdArray(fields.implementatievarianten).map(ref => ref.sys.id),
              typeVervoer: parseTypeVervoer(fields.typeVervoer),
              
              // New fields from Contentful
              ophalen: Array.isArray(fields.ophalen) ? fields.ophalen.filter((item: unknown): item is string => typeof item === 'string') : undefined,
              minimaleInvestering: typeof fields.minimaleInvestering === 'string' ? fields.minimaleInvestering : undefined,
              minimumAantalPersonen: typeof fields.minimumAantalPersonen === 'string' ? fields.minimumAantalPersonen : undefined,
              moeilijkheidsgraad: typeof fields.moeilijkheidsgraad === 'string' ? fields.moeilijkheidsgraad : undefined,
              wanneerRelevant: typeof (fields as any).wanneerRelevant === 'string' ? (fields as any).wanneerRelevant : undefined,
              schaalbaarheid: typeof (fields as any).schaalbaarheid === 'string' ? (fields as any).schaalbaarheid : undefined,
              impact: typeof (fields as any).impact === 'string' ? (fields as any).impact : undefined,
              ruimtebeslag: typeof (fields as any).ruimtebeslag === 'string' ? (fields as any).ruimtebeslag : undefined,
              afhankelijkheidExternePartijen: typeof (fields as any).afhankelijkheidExternePartijen === 'string' ? (fields as any).afhankelijkheidExternePartijen : undefined,
              
              implementationVariations: undefined,
              pdfLink: typeof fields.pdfLink === 'string' ? fields.pdfLink : undefined,
              parkeer_bereikbaarheidsproblemen: typeof fields.parkeer_bereikbaarheidsproblemen === 'number' ? fields.parkeer_bereikbaarheidsproblemen : undefined,
              bereikbaarheidsproblemen: typeof fields.bereikbaarheidsproblemen === 'number' ? fields.bereikbaarheidsproblemen : undefined,
              gezondheid: typeof fields.gezondheid === 'number' ? fields.gezondheid : undefined,
              personeelszorg_en_behoud: typeof fields.personeelszorg_en_behoud === 'number' ? fields.personeelszorg_en_behoud : undefined,
              imago: typeof fields.imago === 'number' ? fields.imago : undefined,
              milieuverordening: typeof fields.milieuverordening === 'number' ? fields.milieuverordening : undefined,
              waarde_vastgoed: typeof fields.waarde_vastgoed === 'number' ? fields.waarde_vastgoed : undefined,
              vervoerkosten: typeof fields.vervoerkosten === 'number' ? fields.vervoerkosten : undefined,
              gastvrijheid: typeof fields.gastvrijheid === 'number' ? fields.gastvrijheid : undefined,
              bedrijfsverhuizing: typeof fields.bedrijfsverhuizing === 'number' ? fields.bedrijfsverhuizing : undefined,
              energiebalans: typeof fields.energiebalans === 'number' ? fields.energiebalans : undefined,
              parkeerBereikbaarheidsproblemenToelichting: typeof fields.parkeerBereikbaarheidsproblemenToelichting === 'string' ? fields.parkeerBereikbaarheidsproblemenToelichting : undefined,
              bereikbaarheidsproblemenToelichting: typeof fields.bereikbaarheidsproblemenToelichting === 'string' ? fields.bereikbaarheidsproblemenToelichting : undefined,
              waardeVastgoedToelichting: typeof fields.waardeVastgoedToelichting === 'string' ? fields.waardeVastgoedToelichting : undefined,
              personeelszorgEnBehoudToelichting: typeof fields.personeelszorgEnBehoudToelichting === 'string' ? fields.personeelszorgEnBehoudToelichting : undefined,
              vervoerkostenToelichting: typeof fields.vervoerkostenToelichting === 'string' ? fields.vervoerkostenToelichting : undefined,
              gezondheidToelichting: typeof fields.gezondheidToelichting === 'string' ? fields.gezondheidToelichting : undefined,
              gastvrijheidToelichting: typeof fields.gastvrijheidToelichting === 'string' ? fields.gastvrijheidToelichting : undefined,
              imagoToelichting: typeof fields.imagoToelichting === 'string' ? fields.imagoToelichting : undefined,
              milieuverordeningToelichting: typeof fields.milieuverordeningToelichting === 'string' ? fields.milieuverordeningToelichting : undefined,
              bedrijfsverhuizingToelichting: typeof fields.bedrijfsverhuizingToelichting === 'string' ? fields.bedrijfsverhuizingToelichting : undefined,
              energiebalansToelichting: typeof fields.energiebalansToelichting === 'string' ? fields.energiebalansToelichting : undefined,
            };
            return solution;
        });
      }
    }
    throw new Error('No suitable mobility solutions content type found in Contentful');
  } catch (error) {
    console.error('[CONTENTFUL] Error fetching mobility solutions:', error);
    throw handleContentfulError(error);
  }
}

export async function getMobilitySolutionById(id: string, options: ContentfulQueryOptions = {}): Promise<MobilitySolution | null> {
  let entry: Entry<any> | null = null; 
  try {
    const client = getContentfulClient(options.preview);
    entry = await client.getEntry<any>(id);

    if (!entry || !entry.fields) {
        return null;
    }

    const fields = entry.fields;
    let transformedSolution: MobilitySolution | null = null;
    try {
      transformedSolution = {
          id: entry.sys.id,
          title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
          subtitle: typeof fields.subtitle === 'string' ? fields.subtitle : undefined, 
          description: typeof fields.description === 'string' ? fields.description : undefined,
          samenvattingKort: typeof fields.samenvattingKort === 'string' ? fields.samenvattingKort : undefined,
          samenvattingLang: typeof fields.samenvattingLang === 'string' ? fields.samenvattingLang : undefined,
          introTekstTool: typeof (fields as any).introTekstTool === 'string' ? (fields as any).introTekstTool : undefined,
          implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
          uitvoering: typeof fields.uitvoering === 'string' ? fields.uitvoering : undefined,
          paspoort: typeof fields.paspoort === 'string' ? fields.paspoort : undefined,
          investering: typeof fields.investering === 'string' ? fields.investering : undefined,
          collectiefVsIndiviueel: typeof fields.collectiefVsIndiviueel === 'string' ? fields.collectiefVsIndiviueel : undefined,
          uitvoeringsmogelijkheden: typeof fields.uitvoeringsmogelijkheden === 'string' ? fields.uitvoeringsmogelijkheden : undefined,
          inputBusinesscase: typeof fields.inputBusinesscase === 'string' ? fields.inputBusinesscase : undefined,
          casebeschrijving: typeof fields.casebeschrijving === 'string' ? fields.casebeschrijving : undefined,
          uitdagingenEnAanleidingen: typeof fields.uitdagingenEnAanleidingen === 'string' ? fields.uitdagingenEnAanleidingen : undefined,
          implementationTime: typeof fields.implementationTime === 'string' ? fields.implementationTime : undefined,
          costs: typeof fields.costs === 'string' ? fields.costs : undefined,
          category: typeof fields.category === 'string' ? fields.category : 'Onbekend',
          icon: typeof fields.icon === 'string' ? fields.icon : undefined,
          benefits: Array.isArray(fields.benefits) ? fields.benefits.filter((b: unknown): b is string => typeof b === 'string') : [],
          challenges: Array.isArray(fields.challenges) ? fields.challenges.filter((c: unknown): c is string => typeof c === 'string') : [],
          implementatievarianten: getRefIdArray(fields.implementatievarianten).map(ref => ref.sys.id),
          typeVervoer: parseTypeVervoer(fields.typeVervoer),
          
          // New fields from Contentful
          ophalen: Array.isArray(fields.ophalen) ? fields.ophalen.filter((item: unknown): item is string => typeof item === 'string') : undefined,
          minimaleInvestering: typeof fields.minimaleInvestering === 'string' ? fields.minimaleInvestering : undefined,
          minimumAantalPersonen: typeof fields.minimumAantalPersonen === 'string' ? fields.minimumAantalPersonen : undefined,
          moeilijkheidsgraad: typeof fields.moeilijkheidsgraad === 'string' ? fields.moeilijkheidsgraad : undefined,
          wanneerRelevant: typeof (fields as any).wanneerRelevant === 'string' ? (fields as any).wanneerRelevant : undefined,
          schaalbaarheid: typeof (fields as any).schaalbaarheid === 'string' ? (fields as any).schaalbaarheid : undefined,
          impact: typeof (fields as any).impact === 'string' ? (fields as any).impact : undefined,
          ruimtebeslag: typeof (fields as any).ruimtebeslag === 'string' ? (fields as any).ruimtebeslag : undefined,
          afhankelijkheidExternePartijen: typeof (fields as any).afhankelijkheidExternePartijen === 'string' ? (fields as any).afhankelijkheidExternePartijen : undefined,
          
          implementationVariations: undefined,
          pdfLink: typeof fields.pdfLink === 'string' ? fields.pdfLink : undefined,

          // Ratings / Scores (keep as numbers)
          parkeer_bereikbaarheidsproblemen: typeof fields.parkeer_bereikbaarheidsproblemen === 'number' ? fields.parkeer_bereikbaarheidsproblemen : undefined,
          bereikbaarheidsproblemen: typeof fields.bereikbaarheidsproblemen === 'number' ? fields.bereikbaarheidsproblemen : undefined,
          gezondheid: typeof fields.gezondheid === 'number' ? fields.gezondheid : undefined,
          personeelszorg_en_behoud: typeof fields.personeelszorg_en_behoud === 'number' ? fields.personeelszorg_en_behoud : undefined,
          imago: typeof fields.imago === 'number' ? fields.imago : undefined,
          milieuverordening: typeof fields.milieuverordening === 'number' ? fields.milieuverordening : undefined,
          waarde_vastgoed: typeof fields.waarde_vastgoed === 'number' ? fields.waarde_vastgoed : undefined,
          vervoerkosten: typeof fields.vervoerkosten === 'number' ? fields.vervoerkosten : undefined,
          gastvrijheid: typeof fields.gastvrijheid === 'number' ? fields.gastvrijheid : undefined,
          bedrijfsverhuizing: typeof fields.bedrijfsverhuizing === 'number' ? fields.bedrijfsverhuizing : undefined,
          energiebalans: typeof fields.energiebalans === 'number' ? fields.energiebalans : undefined,

          // Toelichtingen (Explanations) - Plain strings
          parkeerBereikbaarheidsproblemenToelichting: typeof fields.parkeerBereikbaarheidsproblemenToelichting === 'string' ? fields.parkeerBereikbaarheidsproblemenToelichting : undefined,
          bereikbaarheidsproblemenToelichting: typeof fields.bereikbaarheidsproblemenToelichting === 'string' ? fields.bereikbaarheidsproblemenToelichting : undefined,
          waardeVastgoedToelichting: typeof fields.waardeVastgoedToelichting === 'string' ? fields.waardeVastgoedToelichting : undefined,
          personeelszorgEnBehoudToelichting: typeof fields.personeelszorgEnBehoudToelichting === 'string' ? fields.personeelszorgEnBehoudToelichting : undefined,
          vervoerkostenToelichting: typeof fields.vervoerkostenToelichting === 'string' ? fields.vervoerkostenToelichting : undefined,
          gezondheidToelichting: typeof fields.gezondheidToelichting === 'string' ? fields.gezondheidToelichting : undefined,
          gastvrijheidToelichting: typeof fields.gastvrijheidToelichting === 'string' ? fields.gastvrijheidToelichting : undefined,
          imagoToelichting: typeof fields.imagoToelichting === 'string' ? fields.imagoToelichting : undefined,
          milieuverordeningToelichting: typeof fields.milieuverordeningToelichting === 'string' ? fields.milieuverordeningToelichting : undefined,
          bedrijfsverhuizingToelichting: typeof fields.bedrijfsverhuizingToelichting === 'string' ? fields.bedrijfsverhuizingToelichting : undefined,
          energiebalansToelichting: typeof fields.energiebalansToelichting === 'string' ? fields.energiebalansToelichting : undefined,
      };
    } catch (transformError) {
      return null; 
    }
    return transformedSolution;

  } catch (error) {
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      console.warn(`[CONTENTFUL] Mobility solution with id ${id} not found.`);
      return null;
    }
    console.error(`[CONTENTFUL] Error fetching mobility solution with id ${id}:`, error);
    throw handleContentfulError(error);
  }
}

export async function getGovernanceModelsFromContentful(options: ContentfulQueryOptions = {}): Promise<GovernanceModel[]> {
  try {
    const client = getContentfulClient(options.preview);
    const contentTypes = await client.getContentTypes();
    const availableContentTypes = contentTypes.items.map(ct => ct.sys.id);
    const governanceContentTypes = availableContentTypes.filter(id => id.toLowerCase().includes('governance') || id.toLowerCase().includes('model'));
     if (governanceContentTypes.length > 0) {
      const contentTypeId = governanceContentTypes[0];
      const queryParams: any = { content_type: contentTypeId, limit: options.limit || 100, skip: options.skip || 0 };
       const response = await client.getEntries<any>(queryParams); // Using <any> as workaround
       if (response.items.length > 0) {
        return response.items.map(transformGovernanceModel);
      }
    }
     throw new Error('No suitable governance models content type found in Contentful');
  } catch (error) {
    console.error('Error fetching governance models:', error);
    throw handleContentfulError(error);
  }
}

export async function getGovernanceModelByIdFromContentful(id: string, options: ContentfulQueryOptions = {}): Promise<GovernanceModel | null> {
   try {
    const client = getContentfulClient(options.preview);
    const entry = await client.getEntry<any>(id); // Using <any> as workaround
    return transformGovernanceModel(entry);
  } catch (error) {
    if (error instanceof ContentfulError && error.type === 'NotFound') return null;
    console.error(`Error fetching governance model with id ${id}:`, error);
    throw handleContentfulError(error);
  }
}

export async function getImplementationVariationsFromContentful(options: ContentfulQueryOptions = {}): Promise<ImplementationVariation[]> {
  try {
    const client = getContentfulClient(options.preview);
    // Assuming the content type ID is 'implementationvariations' (lowercase)
    const queryParams: any = {
      content_type: 'implementationvariations',
      limit: options.limit || 200, // Fetch more variations if needed
      skip: options.skip || 0,
    };
    // Use <any> workaround due to potential type generation issues
    const response = await client.getEntries<any>(queryParams);
    return response.items.map(transformImplementationVariation);
  } catch (error) {
    console.error(`[CONTENTFUL] Error fetching all implementation variations:`, error);
    // Decide on error handling: throw or return empty array?
    // Returning empty array might be safer for the UI.
    return []; 
  }
}

export async function getImplementationVariationsForSolution(solutionId: string, options: ContentfulQueryOptions = {}): Promise<ImplementationVariation[]> {
  try {
    const client = getContentfulClient(options.preview);
    const queryParams: any = {
      content_type: 'implementationvariations',
      'fields.mobiliteitsdienstVariant.sys.id': solutionId,
      order: 'fields.order', // Ascending: 0 first
      limit: options.limit || 50,
      skip: options.skip || 0,
    };
    const response = await client.getEntries<any>(queryParams); // Using <any> as workaround
    const items = response.items.map(transformImplementationVariation);
    // Defensive client-side sort by order (ascending), fallback to title
    return items.sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error(`[CONTENTFUL] Error fetching implementation variations for solution ${solutionId}:`, error);
    return []; // Return empty array on error
  }
}

export async function getImplementationVariationById(id: string, options: ContentfulQueryOptions = {}): Promise<ImplementationVariation | null> {
  try {
    const client = getContentfulClient(options.preview);
    const entry = await client.getEntry<any>(id); // Using <any> as workaround
    return transformImplementationVariation(entry);
  } catch (error) {
    if (error instanceof ContentfulError && error.type === 'NotFound') {
      console.warn(`[CONTENTFUL] Implementation variation with id ${id} not found.`);
      return null;
    }
    console.error(`[CONTENTFUL] Error fetching implementation variation with id ${id}:`, error);
    throw handleContentfulError(error);
  }
}

export async function getMobilitySolutionForPdf(id: string, options: { preview?: boolean } = {}): Promise<MobilitySolution> {
  const client = getContentfulClient(options.preview);
  try {
    const entry = await client.getEntry<any>(id, { include: 10 }); // Using <any> as workaround
    const fields = entry.fields as Record<string, any> | undefined; // Cast fields to a record type

    // Create the solution object using the domain model type and safe helpers
    const solution: MobilitySolution = {
      id: entry.sys.id,
      title: getStringFieldSafe(fields, 'title') || 'Geen titel',
      subtitle: getStringFieldSafe(fields, 'subtitle'),
      description: getStringFieldSafe(fields, 'description'),
      samenvattingLang: getStringFieldSafe(fields, 'samenvattingLang'),
      introTekstTool: getStringFieldSafe(fields, 'introTekstTool'),
      implementatie: getStringFieldSafe(fields, 'implementatie'),
      uitvoering: getStringFieldSafe(fields, 'uitvoering'),
      paspoort: getStringFieldSafe(fields, 'paspoort'),
      investering: getStringFieldSafe(fields, 'investering'),
      collectiefVsIndiviueel: getStringFieldSafe(fields, 'collectiefVsIndiviueel'),
      uitvoeringsmogelijkheden: getStringFieldSafe(fields, 'uitvoeringsmogelijkheden'),
      inputBusinesscase: getStringFieldSafe(fields, 'inputBusinesscase'),
      casebeschrijving: getStringFieldSafe(fields, 'casebeschrijving'),
      uitdagingenEnAanleidingen: getStringFieldSafe(fields, 'uitdagingenEnAanleidingen'),
      implementationTime: getStringFieldSafe(fields, 'implementationTime'),
      costs: getStringFieldSafe(fields, 'costs'),
      category: getStringFieldSafe(fields, 'category') || 'Onbekend',
      icon: getStringFieldSafe(fields, 'icon'),
      pdfLink: getStringFieldSafe(fields, 'pdfLink'),
      benefits: getStringArrayFieldSafe(fields, 'benefits'),
      challenges: getStringArrayFieldSafe(fields, 'challenges'),
      implementatievarianten: getRefIdArray(fields?.implementatievarianten).map(ref => ref.sys.id),
      typeVervoer: parseTypeVervoer(fields?.typeVervoer),
      
      // New fields from Contentful
      ophalen: getStringArrayFieldSafe(fields, 'ophalen'),
      minimaleInvestering: getStringFieldSafe(fields, 'minimaleInvestering'),
      minimumAantalPersonen: getStringFieldSafe(fields, 'minimumAantalPersonen'),
      afstand: getStringFieldSafe(fields, 'afstand'),
       moeilijkheidsgraad: getStringFieldSafe(fields, 'moeilijkheidsgraad'),
       doorlooptijd: getStringFieldSafe(fields, 'doorlooptijd'),
      
      parkeer_bereikbaarheidsproblemen: getNumberFieldSafe(fields, 'parkeer_bereikbaarheidsproblemen'),
      bereikbaarheidsproblemen: getNumberFieldSafe(fields, 'bereikbaarheidsproblemen'),
      gezondheid: getNumberFieldSafe(fields, 'gezondheid'),
      personeelszorg_en_behoud: getNumberFieldSafe(fields, 'personeelszorg_en_behoud'),
      imago: getNumberFieldSafe(fields, 'imago'),
      milieuverordening: getNumberFieldSafe(fields, 'milieuverordening'),
      waarde_vastgoed: getNumberFieldSafe(fields, 'waarde_vastgoed'),
      vervoerkosten: getNumberFieldSafe(fields, 'vervoerkosten'),
      gastvrijheid: getNumberFieldSafe(fields, 'gastvrijheid'),
      bedrijfsverhuizing: getNumberFieldSafe(fields, 'bedrijfsverhuizing'),
      energiebalans: getNumberFieldSafe(fields, 'energiebalans'),
      parkeerBereikbaarheidsproblemenToelichting: getStringFieldSafe(fields, 'parkeerBereikbaarheidsproblemenToelichting'),
      bereikbaarheidsproblemenToelichting: getStringFieldSafe(fields, 'bereikbaarheidsproblemenToelichting'),
      waardeVastgoedToelichting: getStringFieldSafe(fields, 'waardeVastgoedToelichting'),
      personeelszorgEnBehoudToelichting: getStringFieldSafe(fields, 'personeelszorgEnBehoudToelichting'),
      vervoerkostenToelichting: getStringFieldSafe(fields, 'vervoerkostenToelichting'),
      gezondheidToelichting: getStringFieldSafe(fields, 'gezondheidToelichting'),
      gastvrijheidToelichting: getStringFieldSafe(fields, 'gastvrijheidToelichting'),
      imagoToelichting: getStringFieldSafe(fields, 'imagoToelichting'),
      milieuverordeningToelichting: getStringFieldSafe(fields, 'milieuverordeningToelichting'),
      bedrijfsverhuizingToelichting: getStringFieldSafe(fields, 'bedrijfsverhuizingToelichting'),
      energiebalansToelichting: getStringFieldSafe(fields, 'energiebalansToelichting'),
      implementationVariations: [], // Fetch separately if needed
    };
    return solution;
  } catch (error) {
    console.error('Error fetching mobility solution for PDF:', error);
    throw error;
  }
}

export async function getWebsiteCollectiefVervoerFromContentful(options: ContentfulQueryOptions = {}): Promise<any> {
 try {
    const client = getContentfulClient(options.preview);
    const queryParams: any = { content_type: 'websiteCollectiefVervoer', limit: 1 };
    const response = await client.getEntries<any>(queryParams);
    if (response.items.length > 0) {
      const contentItem = response.items[0];
      return { id: contentItem.sys.id, ...contentItem.fields };
    }
    throw new Error('No websiteCollectiefVervoer content found');
  } catch (error) {
    console.error('[CONTENTFUL] Error fetching websiteCollectiefVervoer:', error);
    throw handleContentfulError(error);
  }
} 