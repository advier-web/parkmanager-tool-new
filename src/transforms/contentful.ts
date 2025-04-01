import { Entry } from 'contentful';
import {
  IBusinessParkReason,
  IGovernanceModel,
  IImplementationPlan,
  IImplementationPhase,
  IImplementationTask,
  IMobilitySolution
} from '../types/contentful-types.generated';
import {
  BusinessParkReason,
  GovernanceModel,
  ImplementationPlan,
  ImplementationPhase,
  ImplementationTask,
  MobilitySolution,
  TrafficType
} from '../domain/models';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { Asset, EntrySkeletonType, ChainModifiers, UnresolvedLink, ResourceLink, AssetFile } from 'contentful';

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
  entry: Entry<IBusinessParkReason>
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
    identifier: typeof fields.identifier === 'string' ? fields.identifier : undefined
  };
}

/**
 * Transform a Contentful MobilitySolution entry to a domain MobilitySolution
 */
export function transformMobilitySolution(entry: Entry<any>): MobilitySolution {
  const fields = entry.fields;

  // Log de velden voor debuggen - log alleen keys om circular structure error te voorkomen
  console.log(`Transforming MobilitySolution entry ${entry.sys.id}. Available fields:`, Object.keys(fields).join(', '));

  const solution: MobilitySolution = {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
    subtitle: typeof fields.subtitle === 'string' ? fields.subtitle : undefined,
    description: typeof fields.description === 'string' ? fields.description : undefined,
    samenvattingLang: typeof fields.samenvattingLang === 'string' ? fields.samenvattingLang : undefined,
    benefits: Array.isArray(fields.benefits) ? fields.benefits.filter((b): b is string => typeof b === 'string') : [],
    challenges: Array.isArray(fields.challenges) ? fields.challenges.filter((c): c is string => typeof c === 'string') : [],
    implementationTime: typeof fields.implementationTime === 'string' ? fields.implementationTime : undefined,
    costs: typeof fields.costs === 'string' ? fields.costs : undefined,
    category: typeof fields.category === 'string' ? fields.category : 'Onbekend',
    icon: typeof fields.icon === 'string' ? fields.icon : undefined,
    implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
    paspoort: typeof fields.paspoort === 'string' ? fields.paspoort : undefined,
    collectiefVsIndiviueel: typeof fields.collectiefVsIndiviueel === 'string' ? fields.collectiefVsIndiviueel : undefined,
    uitvoeringsmogelijkheden: typeof fields.uitvoeringsmogelijkheden === 'string' ? fields.uitvoeringsmogelijkheden : undefined,
    governanceModels: getRefIdArray(fields.governanceModels),
    governanceModelsMits: getRefIdArray(fields.governanceModelsMits),
    governanceModelsNietgeschikt: getRefIdArray(fields.governanceModelsNietgeschikt),
    vereniging: typeof fields.vereniging === 'string' ? fields.vereniging : undefined,
    stichting: typeof fields.stichting === 'string' ? fields.stichting : undefined,
    ondernemersBiz: typeof fields.ondernemersBiz === 'string' ? fields.ondernemersBiz : undefined,
    vastgoedBiz: typeof fields.vastgoedBiz === 'string' ? fields.vastgoedBiz : undefined,
    gemengdeBiz: typeof fields.gemengdeBiz === 'string' ? fields.gemengdeBiz : undefined,
    cooperatieUa: typeof fields.cooperatieUa === 'string' ? fields.cooperatieUa : undefined,
    bv: typeof fields.bv === 'string' ? fields.bv : undefined,
    ondernemersfonds: typeof fields.ondernemersfonds === 'string' ? fields.ondernemersfonds : undefined,
    geenRechtsvorm: typeof fields.geenRechtsvorm === 'string' ? fields.geenRechtsvorm : undefined,
    parkeerBereikbaarheidsproblemenToelichting: typeof fields.parkeerBereikbaarheidsproblemenToelichting === 'string' ? fields.parkeerBereikbaarheidsproblemenToelichting : undefined,
    waardeVastgoedToelichting: typeof fields.waardeVastgoedToelichting === 'string' ? fields.waardeVastgoedToelichting : undefined,
    personeelszorgEnBehoudToelichting: typeof fields.personeelszorgEnBehoudToelichting === 'string' ? fields.personeelszorgEnBehoudToelichting : undefined,
    vervoerkostenToelichting: typeof fields.vervoerkostenToelichting === 'string' ? fields.vervoerkostenToelichting : undefined,
    gezondheidToelichting: typeof fields.gezondheidToelichting === 'string' ? fields.gezondheidToelichting : undefined,
    gastvrijheidToelichting: typeof fields.gastvrijheidToelichting === 'string' ? fields.gastvrijheidToelichting : undefined,
    imagoToelichting: typeof fields.imagoToelichting === 'string' ? fields.imagoToelichting : undefined,
    milieuverordeningToelichting: typeof fields.milieuverordeningToelichting === 'string' ? fields.milieuverordeningToelichting : undefined,
    bedrijfsverhuizingToelichting: typeof fields.bedrijfsverhuizingToelichting === 'string' ? fields.bedrijfsverhuizingToelichting : undefined,
    energiebalansToelichting: typeof fields.energiebalansToelichting === 'string' ? fields.energiebalansToelichting : undefined,
    pdfLink: getSafeAssetUrl(fields.pdfLink),
    effecten: typeof fields.effecten === 'string' ? fields.effecten : undefined,
    gemeenteBijdrage: typeof fields.gemeenteBijdrage === 'string' ? fields.gemeenteBijdrage : undefined,
    provincieBijdrage: typeof fields.provincieBijdrage === 'string' ? fields.provincieBijdrage : undefined,
    reizigerBijdrage: typeof fields.reizigerBijdrage === 'string' ? fields.reizigerBijdrage : undefined,
    vastgoedBijdrage: typeof fields.vastgoedBijdrage === 'string' ? fields.vastgoedBijdrage : undefined,
    bedrijvenVervoervraag: typeof fields.bedrijvenVervoervraag === 'string' ? fields.bedrijvenVervoervraag : undefined,
    // Scores mappen met helper functie
    parkeer_bereikbaarheidsproblemen: findScoreFieldValue(fields, ['parkeer_bereikbaarheidsproblemen']),
    gezondheid: findScoreFieldValue(fields, ['gezondheid']),
    personeelszorg_en_behoud: findScoreFieldValue(fields, ['personeelszorg_en_behoud']),
    imago: findScoreFieldValue(fields, ['imago']),
    milieuverordening: findScoreFieldValue(fields, ['milieuverordening']),
    waarde_vastgoed: findScoreFieldValue(fields, ['waarde_vastgoed', 'waardeVastgoed']), // Add known alternative name
    vervoerkosten: findScoreFieldValue(fields, ['vervoerkosten']),
    gastvrijheid: findScoreFieldValue(fields, ['gastvrijheid']),
    bedrijfsverhuizing: findScoreFieldValue(fields, ['bedrijfsverhuizing']),
    energiebalans: findScoreFieldValue(fields, ['energiebalans']),
    // Type vervoer mappen
    typeVervoer: parseTypeVervoer(fields.typeVervoer),
  };

  return solution;
}

/**
 * Transform a Contentful GovernanceModel entry to a domain GovernanceModel
 */
export function transformGovernanceModel(entry: Entry<any>): GovernanceModel {
  const fields = entry.fields;
  // Log alleen keys om circular structure error te voorkomen
  console.log(`Transforming GovernanceModel entry ${entry.sys.id}. Available fields:`, Object.keys(fields).join(', '));

  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
    description: typeof fields.description === 'string' ? fields.description : '',
    summary: typeof fields.summary === 'string' ? fields.summary : undefined,
    advantages: Array.isArray(fields.advantages) ? fields.advantages.filter((a): a is string => typeof a === 'string') : [],
    disadvantages: Array.isArray(fields.disadvantages) ? fields.disadvantages.filter((d): d is string => typeof d === 'string') : [],
    applicableScenarios: Array.isArray(fields.applicableScenarios) ? fields.applicableScenarios.filter((s): s is string => typeof s === 'string') : [],
    organizationalStructure: typeof fields.organizationalStructure === 'string' ? fields.organizationalStructure : undefined,
    legalForm: typeof fields.legalForm === 'string' ? fields.legalForm : undefined,
    stakeholders: Array.isArray(fields.stakeholders) ? fields.stakeholders.filter((s): s is string => typeof s === 'string') : [],
    samenvatting: typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    aansprakelijkheid: typeof fields.aansprakelijkheid === 'string' ? fields.aansprakelijkheid : undefined,
    benodigdhedenOprichting: fields.benodigdhedenOprichting,
    doorlooptijdLang: typeof fields.doorlooptijdLang === 'string' ? fields.doorlooptijdLang : undefined,
    implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
    links: fields.links,
    voorbeeldContracten: Array.isArray(fields.voorbeeldContracten) ? fields.voorbeeldContracten.map(getSafeAssetUrl).filter((url): url is string => !!url) : [],
    geenRechtsvorm: typeof fields.geenRechtsvorm === 'string' ? fields.geenRechtsvorm : undefined,
    vereniging: typeof fields.vereniging === 'string' ? fields.vereniging : undefined,
    stichting: typeof fields.stichting === 'string' ? fields.stichting : undefined,
    ondernemersBiz: typeof fields.ondernemersBiz === 'string' ? fields.ondernemersBiz : undefined,
    vastgoedBiz: typeof fields.vastgoedBiz === 'string' ? fields.vastgoedBiz : undefined,
    gemengdeBiz: typeof fields.gemengdeBiz === 'string' ? fields.gemengdeBiz : undefined,
    cooperatieUa: typeof fields.cooperatieUa === 'string' ? fields.cooperatieUa : undefined,
    bv: typeof fields.bv === 'string' ? fields.bv : undefined,
    ondernemersfonds: typeof fields.ondernemersfonds === 'string' ? fields.ondernemersfonds : undefined,
    rechtsvormBeschrijving: typeof fields.rechtsvormBeschrijving === 'string' ? fields.rechtsvormBeschrijving : undefined,
  };
}

/**
 * Transform a Contentful ImplementationTask entry to a domain ImplementationTask
 */
export function transformImplementationTask(
  entry: Entry<IImplementationTask>
): ImplementationTask {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    responsible: Array.isArray(fields.responsible) ? fields.responsible : [],
    duration: typeof fields.duration === 'string' ? fields.duration : ''
  };
}

/**
 * Transform a Contentful ImplementationPhase entry to a domain ImplementationPhase
 * Note: This requires resolved tasks
 */
export function transformImplementationPhase(
  entry: Entry<IImplementationPhase>,
  tasks: ImplementationTask[] = []
): ImplementationPhase {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    tasks,
    duration: typeof fields.duration === 'string' ? fields.duration : ''
  };
}

/**
 * Transform a Contentful ImplementationPlan entry to a domain ImplementationPlan
 * Note: This requires resolved phases
 */
export function transformImplementationPlan(
  entry: Entry<IImplementationPlan>,
  phases: ImplementationPhase[] = []
): ImplementationPlan {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    phases,
    estimatedDuration: typeof fields.estimatedDuration === 'string' ? fields.estimatedDuration : '',
    requiredResources: Array.isArray(fields.requiredResources) ? fields.requiredResources : [],
    keySuccessFactors: Array.isArray(fields.keySuccessFactors) ? fields.keySuccessFactors : []
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