import { Entry, Asset, AssetFile } from 'contentful';
import {
  IbusinessParkReason,
  IgovernanceModel,
  ImobilityService,
  Iimplementationvariations,
  ImobilityServiceFields
} from '../types/contentful-types.generated';
import {
  BusinessParkReason,
  GovernanceModel,
  MobilitySolution,
  TrafficType,
  ImplementationVariation
} from '../domain/models';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES, MARKS, Document as ContentfulDocument } from '@contentful/rich-text-types';
import { EntrySkeletonType, ChainModifiers, UnresolvedLink, ResourceLink } from 'contentful';

/**
 * Helper function to safely convert Rich Text to HTML
 */
function safeDocumentToHtmlString(doc: any): string | undefined {
  if (doc && typeof doc === 'object' && doc.nodeType === BLOCKS.DOCUMENT) {
    try {
      return documentToHtmlString(doc as ContentfulDocument);
    } catch (error) {
      console.error("Error converting Rich Text to HTML:", error);
      return undefined; // Return undefined or a fallback string on error
    }
  }
  // If it's already a string, return it (consider if this is valid for your use case)
  // if (typeof doc === 'string') {
  //   return doc;
  // }
  return undefined;
}

/**
 * Helper function to parse the typeVervoer field from Contentful
 */
function parseTypeVervoer(typeVervoerField: any): TrafficType[] {
  console.log('[TRANSFORM] Parsing typeVervoer:', typeVervoerField);
  
  if (!typeVervoerField) {
    return [];
  }
  
  // If it's already an array, process it
  if (Array.isArray(typeVervoerField)) {
    return typeVervoerField.map(item => {
      if (typeof item === 'string') {
        const normalized = item.toLowerCase().trim();
        
        if (normalized.includes('woon') || normalized.includes('commuter')) {
          return TrafficType.COMMUTER;
        } else if (normalized.includes('zakelijk') || normalized.includes('business')) {
          return TrafficType.BUSINESS;
        } else if (normalized.includes('bezoeker') || normalized.includes('visitor')) {
          return TrafficType.VISITOR;
        }
      }
      return null;
    }).filter((type): type is TrafficType => type !== null);
  }
  
  // If it's a string, parse it
  if (typeof typeVervoerField === 'string') {
    const types: TrafficType[] = [];
    const normalized = typeVervoerField.toLowerCase();
    
    if (normalized.includes('woon') || normalized.includes('commuter')) {
      types.push(TrafficType.COMMUTER);
    }
    
    if (normalized.includes('zakelijk') || normalized.includes('business')) {
      types.push(TrafficType.BUSINESS);
    }
    
    if (normalized.includes('bezoeker') || normalized.includes('visitor')) {
      types.push(TrafficType.VISITOR);
    }
    
    return types;
  }
  
  // Default empty array
  return [];
}

/**
 * Transform a Contentful BusinessParkReason entry to a domain BusinessParkReason
 */
export function transformBusinessParkReason(
  entry: Entry<IbusinessParkReason>
): BusinessParkReason {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    summary: typeof fields.summary === 'string' ? fields.summary : 
             typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    icon: typeof fields.icon === 'string' ? fields.icon : undefined,
    category: typeof fields.category === 'string' ? fields.category : undefined,
    identifier: typeof fields.identifier === 'string' ? fields.identifier : undefined,
    order: typeof fields.order === 'number' ? fields.order : undefined
  };
}

/**
 * Transform a Contentful ImplementationVariation entry to a domain ImplementationVariation
 */
export function transformImplementationVariation(entry: Entry<Iimplementationvariations>): ImplementationVariation {
  const fields = entry.fields as Iimplementationvariations["fields"]; 
  console.log(`Transforming ImplementationVariation entry ${entry.sys.id}. Available fields:`, Object.keys(fields).join(', '));

  const title = typeof fields.title === 'string' ? fields.title : 'Unnamed Variation';

  return {
    id: entry.sys.id,
    title: title,
    samenvatting: typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined, 
    investering: typeof fields.investering === 'string' ? fields.investering : undefined,
    realisatieplan: typeof fields.realisatieplan === 'string' ? fields.realisatieplan : undefined,
    governanceModels: getRefIdArray(fields.governanceModels),
    governanceModelsMits: getRefIdArray(fields.governanceModelsMits),
    governanceModelsNietgeschikt: getRefIdArray(fields.governanceModelsNietgeschikt),
    geenRechtsvorm: typeof fields.geenRechtsvorm === 'string' ? fields.geenRechtsvorm : undefined,
    vereniging: typeof fields.vereniging === 'string' ? fields.vereniging : undefined,
    stichting: typeof fields.stichting === 'string' ? fields.stichting : undefined,
    ondernemersBiz: typeof fields.ondernemersBiz === 'string' ? fields.ondernemersBiz : undefined,
    vastgoedBiz: typeof fields.vastgoedBiz === 'string' ? fields.vastgoedBiz : undefined,
    gemengdeBiz: typeof fields.gemengdeBiz === 'string' ? fields.gemengdeBiz : undefined,
    cooperatieUa: typeof fields.cooperatieUa === 'string' ? fields.cooperatieUa : undefined,
    bv: typeof fields.bv === 'string' ? fields.bv : undefined,
    ondernemersfonds: typeof fields.ondernemersfonds === 'string' ? fields.ondernemersfonds : undefined,
    realisatieplanLeveranciers: typeof fields.realisatieplanLeveranciers === 'string' ? fields.realisatieplanLeveranciers : undefined,
    realisatieplanContractvormen: typeof fields.realisatieplanContractvormen === 'string' ? fields.realisatieplanContractvormen : undefined,
    realisatieplanKrachtenveld: typeof fields.realisatieplanKrachtenveld === 'string' ? fields.realisatieplanKrachtenveld : undefined,
    realisatieplanVoorsEnTegens: typeof fields.realisatieplanVoorsEnTegens === 'string' ? fields.realisatieplanVoorsEnTegens : undefined,
    realisatieplanAandachtspunten: typeof fields.realisatieplanAandachtspunten === 'string' ? fields.realisatieplanAandachtspunten : undefined,
    realisatieplanChecklist: typeof fields.realisatieplanChecklist === 'string' ? fields.realisatieplanChecklist : undefined,
  };
}

/**
 * Transform a Contentful MobilitySolution entry to a domain MobilitySolution
 * NOTE: This function transforms ONLY the fields available in ImobilityServiceFields
 * AND ignores governance/rechtsvorm fields as per the new structure.
 * ImplementationVariations must be fetched and attached separately.
 */
export function transformMobilitySolution(entry: Entry<ImobilityService>): MobilitySolution {
  // Explicitly type fields to avoid 'never' inference issues
  const fields = entry.fields as ImobilityService["fields"]; 
  console.log(`Transforming MobilitySolution entry ${entry.sys.id}. Available fields:`, Object.keys(fields).join(', '));

  const solution: MobilitySolution = {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
    description: typeof fields.description === 'string' ? fields.description : undefined,
    samenvattingLang: typeof fields.samenvattingLang === 'string' ? fields.samenvattingLang : undefined,
    implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
    uitvoering: typeof fields.uitvoering === 'string' ? fields.uitvoering : undefined,
    paspoort: typeof fields.paspoort === 'string' ? fields.paspoort : undefined,
    investering: typeof fields.investering === 'string' ? fields.investering : undefined,
    collectiefVsIndiviueel: typeof fields.collectiefVsIndiviueel === 'string' ? fields.collectiefVsIndiviueel : undefined,
    uitvoeringsmogelijkheden: typeof fields.uitvoeringsmogelijkheden === 'string' ? fields.uitvoeringsmogelijkheden : undefined,
    inputBusinesscase: typeof fields.inputBusinesscase === 'string' ? fields.inputBusinesscase : undefined,

    // Toelichting fields (check generated types and assign safely)
    parkeerBereikbaarheidsproblemenToelichting: typeof fields.parkeerBereikbaarheidsproblemenToelichting === 'string' ? fields.parkeerBereikbaarheidsproblemenToelichting : undefined,
    bereikbaarheidsproblemenToelichting: typeof fields.bereikbaarheidsproblemenToelichting === 'string' ? fields.bereikbaarheidsproblemenToelichting : undefined,
    personeelszorgEnBehoudToelichting: typeof fields.personeelszorgEnBehoudToelichting === 'string' ? fields.personeelszorgEnBehoudToelichting : undefined,
    gezondheidToelichting: typeof fields.gezondheidToelichting === 'string' ? fields.gezondheidToelichting : undefined,
    imagoToelichting: typeof fields.imagoToelichting === 'string' ? fields.imagoToelichting : undefined,
    milieuverordeningToelichting: typeof fields.milieuverordeningToelichting === 'string' ? fields.milieuverordeningToelichting : undefined,

    // List of variant names
    implementatievarianten: Array.isArray(fields.implementatievarianten)
      ? fields.implementatievarianten.filter((v): v is string => typeof v === 'string')
      : undefined,

    implementationVariations: undefined,

    // Score fields (check generated types and assign safely)
    parkeer_bereikbaarheidsproblemen: typeof fields.parkeer_bereikbaarheidsproblemen === 'number' ? fields.parkeer_bereikbaarheidsproblemen : undefined,
    gezondheid: typeof fields.gezondheid === 'number' ? fields.gezondheid : undefined,
    personeelszorg_en_behoud: typeof fields.personeelszorg_en_behoud === 'number' ? fields.personeelszorg_en_behoud : undefined,
    imago: typeof fields.imago === 'number' ? fields.imago : undefined,
    milieuverordening: typeof fields.milieuverordening === 'number' ? fields.milieuverordening : undefined,

    typeVervoer: parseTypeVervoer(fields.typeVervoer),

    category: 'Onbekend',
    // Add missing properties required by MobilitySolution type, initialize as empty arrays
    benefits: [], 
    challenges: [],
  };

  return solution;
}

/**
 * Transform a Contentful GovernanceModel entry to a domain GovernanceModel
 */
export function transformGovernanceModel(entry: Entry<IgovernanceModel>): GovernanceModel {
  // Explicitly type fields
  const fields = entry.fields as IgovernanceModel["fields"]; 
  console.log(`Transforming GovernanceModel entry ${entry.sys.id}. Available fields:`, Object.keys(fields).join(', '));

  // Check IgovernanceModelFields carefully
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
    // Assume description is Rich Text
    description: safeDocumentToHtmlString(fields.description),
    // Treat samenvatting as plain text based on Contentful setup
    summary: typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined, 
    advantages: Array.isArray(fields.voordelen) ? fields.voordelen : [], // Assuming voordelen is string[]
    disadvantages: Array.isArray(fields.nadelen) ? fields.nadelen : [], // Assuming nadelen is string[]
    // Remove redundant samenvatting mapping
    aansprakelijkheid: safeDocumentToHtmlString(fields.aansprakelijkheid),
    benodigdhedenOprichting: safeDocumentToHtmlString(fields.benodigdhedenOprichting),
    doorlooptijdLang: safeDocumentToHtmlString(fields.doorlooptijdLang),
    implementatie: safeDocumentToHtmlString(fields.implementatie),
    links: safeDocumentToHtmlString(fields.links),
    voorbeeldContracten: Array.isArray(fields.voorbeeldContracten) ? fields.voorbeeldContracten.map(getSafeAssetUrl).filter((url): url is string => !!url) : [],
    // Add missing properties required by GovernanceModel type, initialize as empty arrays
    applicableScenarios: [], 
    stakeholders: [], 
  };
}

// Type guard for Contentful links
function isLink(obj: any): obj is { sys: { id: string, type: string, linkType: string } } {
  return obj && typeof obj === 'object' && obj.sys && typeof obj.sys.id === 'string';
}

// Type guard for Contentful AssetFile
function isAssetFile(obj: any): obj is AssetFile {
  return obj && typeof obj === 'object' && typeof obj.url === 'string';
}

// Type guard for Contentful Asset
function isAsset(obj: any): obj is Asset {
  return obj && obj.sys?.type === 'Asset' && isAssetFile(obj.fields?.file);
}

// Helper om een array van references om te zetten naar een array van objecten met ID
function getRefIdArray(refs: any): Array<{ sys: { id: string } }> {
  if (!Array.isArray(refs)) return [];
  return refs
    .map(ref => {
      if (isLink(ref)) {
        return { sys: { id: ref.sys.id } };
      }
      return null;
    })
    .filter((item): item is { sys: { id: string } } => item !== null);
}

// Helper to extract URL from various potential Asset structures
function getSafeAssetUrl(assetField: any): string | undefined {
  if (isAsset(assetField) && assetField.fields.file) {
    return assetField.fields.file.url as string;
  }
  // Handle cases where the link might not be resolved
  if (isLink(assetField) && assetField.sys.linkType === 'Asset') {
    console.warn(`Asset link ${assetField.sys.id} is unresolved.`);
    return undefined;
  }
  return undefined;
}

// Helper functie om velden te vinden in verschillende formaten (voor scores)
function findScoreFieldValue(fields: any, baseNames: string[]): number | undefined {
  for (const baseName of baseNames) {
    // Check direct name and variations
    const variations = [
      baseName,
      baseName.toLowerCase(),
      baseName.replace(/_/g, '-'),
      baseName.replace(/_/g, ' '),
      baseName.charAt(0).toUpperCase() + baseName.slice(1),
      // Add specific known variants from Contentful
      baseName === 'parkeer_bereikbaarheidsproblemen' ? 'Parkeer- en bereikbaarheidsproblemen' : '',
      baseName === 'personeelszorg_en_behoud' ? 'Personeelszorg en -behoud' : '',
    ].filter(Boolean);
    
    for (const variation of variations) {
      if (typeof fields[variation] === 'number') {
        console.log(`[Score Mapping] Found score for ${baseName} via variant '${variation}': ${fields[variation]}`);
        return fields[variation];
      }
    }
  }
  console.log(`[Score Mapping] No score found for base names: ${baseNames.join(', ')}`);
  return undefined;
} 