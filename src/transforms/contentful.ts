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
  MobilitySolution
} from '../domain/models';

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
export function transformMobilitySolution(
  entry: Entry<IMobilitySolution>
): MobilitySolution {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  console.log(`[TRANSFORM] Processing mobility solution: ${fields.title}`);
  
  // Base solution object met standaard velden
  const solution: MobilitySolution = {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    summary: typeof fields.summary === 'string' ? fields.summary : 
             typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    benefits: Array.isArray(fields.benefits) ? fields.benefits : [],
    challenges: Array.isArray(fields.challenges) ? fields.challenges : [],
    implementationTime: typeof fields.implementationTime === 'string' ? fields.implementationTime : '',
    costs: typeof fields.costs === 'string' ? fields.costs : '',
    category: typeof fields.category === 'string' ? fields.category : '',
    icon: typeof fields.icon === 'string' ? fields.icon : undefined,
    
    // Implementation plan field
    implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
    
    // Nieuwe velden van Contentful
    paspoort: typeof fields.paspoort === 'string' ? fields.paspoort : undefined,
    collectiefVsIndiviueel: typeof fields.collectiefVsIndiviueel === 'string' ? fields.collectiefVsIndiviueel : undefined,
    effecten: typeof fields.effecten === 'string' ? fields.effecten : undefined,
    investering: typeof fields.investering === 'string' ? fields.investering : undefined,
    governancemodellenToelichting: typeof fields.governancemodellenToelichting === 'string' ? fields.governancemodellenToelichting : undefined,
    
    // Rating fields (default 0)
    parkeer_bereikbaarheidsproblemen: 0,
    gezondheid: 0,
    personeelszorg_en_behoud: 0,
    imago: 0,
    milieuverordening: 0,
    
    // Governance models references
    governanceModels: fields.governanceModels || undefined
  };
  
  // Log alle velden uit Contentful voor debugging
  console.log('[TRANSFORM] Contentful fields for solution:');
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'number') {
      console.log(`  ${key}: ${value} (type: ${typeof value})`);
    }
  });
  
  // NORMALISATIE VAN VELDNAMEN - Eerst bekend maken welke varianten gezocht moeten worden
  const fieldMappings = {
    // Parkeerprobleem varianten
    parkeer_bereikbaarheidsproblemen: [
      'parkeer_bereikbaarheidsproblemen',
      'Parkeer- en bereikbaarheidsprobleem',
      'Parkeer- en bereikbaarheidsproblemen',
      'parkeer_en_bereikbaarheidsproblemen',
      'Parkeer en bereikbaarheidsprobleem',
      'parkeerprobleem',
      'bereikbaarheidsprobleem'
    ],
    // Gezondheid varianten
    gezondheid: [
      'gezondheid',
      'Gezondheid',
      'health'
    ],
    // Personeelszorg varianten
    personeelszorg_en_behoud: [
      'personeelszorg_en_behoud',
      'Personeelszorg en -behoud',
      'personeel'
    ],
    // Imago varianten
    imago: [
      'imago',
      'Imago'
    ],
    // Milieuverordening varianten
    milieuverordening: [
      'milieuverordening',
      'Milieuverordening'
    ]
  };
  
  // Voor elk veld in de solution, zoek alle mogelijke varianten in de contentful data
  Object.entries(fieldMappings).forEach(([normalizedField, variants]) => {
    // Zoek door alle varianten
    for (const variant of variants) {
      if (typeof fields[variant] === 'number') {
        // Als een variant gevonden is, gebruik die waarde voor het genormaliseerde veld
        console.log(`[TRANSFORM] Found ${variant} = ${fields[variant]}, mapping to ${normalizedField}`);
        (solution as any)[normalizedField] = fields[variant];
        
        // Zorg ervoor dat alle varianten dezelfde waarde krijgen voor consistentie
        variants.forEach(otherVariant => {
          (solution as any)[otherVariant] = fields[variant];
        });
        
        // Stop zoeken naar varianten zodra we een waarde hebben gevonden
        break;
      }
    }
  });
  
  // Controleer op numerieke velden die nog niet afgehandeld zijn
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'number') {
      // Controleer of dit veld al is afgehandeld door de fieldMappings
      let isHandled = false;
      for (const [normalizedField, variants] of Object.entries(fieldMappings)) {
        if (variants.includes(key)) {
          isHandled = true;
          break;
        }
      }
      
      // Als het veld nog niet is afgehandeld, sla het op onder zijn eigen naam
      if (!isHandled) {
        console.log(`[TRANSFORM] Unmapped numeric field: ${key} = ${value}`);
        (solution as any)[key] = value;
        
        // Ook normaliseren als lowercase
        const normalizedKey = key.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/-/g, '_');
        
        if (normalizedKey !== key) {
          console.log(`[TRANSFORM] Also storing as normalized key: ${normalizedKey}`);
          (solution as any)[normalizedKey] = value;
        }
      }
    }
  });
  
  // Log het uiteindelijke resultaat voor debug doeleinden
  console.log('[TRANSFORM] Final solution scores:');
  Object.entries(solution).forEach(([key, value]) => {
    if (typeof value === 'number') {
      console.log(`  ${key}: ${value}`);
    }
  });
  
  return solution;
}

/**
 * Transform a Contentful GovernanceModel entry to a domain GovernanceModel
 */
export function transformGovernanceModel(
  entry: Entry<IGovernanceModel>
): GovernanceModel {
  // Veiliger benadering met type assertions
  const fields = entry.fields as any;
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    summary: typeof fields.summary === 'string' ? fields.summary : 
             typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    advantages: Array.isArray(fields.advantages) ? fields.advantages : [],
    disadvantages: Array.isArray(fields.disadvantages) ? fields.disadvantages : [],
    applicableScenarios: Array.isArray(fields.applicableScenarios) ? fields.applicableScenarios : [],
    organizationalStructure: typeof fields.organizationalStructure === 'string' ? fields.organizationalStructure : undefined,
    legalForm: typeof fields.legalForm === 'string' ? fields.legalForm : undefined,
    stakeholders: Array.isArray(fields.stakeholders) ? fields.stakeholders : undefined,
    
    // Implementation plan fields
    samenvatting: typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    aansprakelijkheid: typeof fields.aansprakelijkheid === 'string' ? fields.aansprakelijkheid : undefined,
    benodigdhedenOprichting: fields.benodigdhedenOprichting || undefined,
    doorlooptijd: typeof fields.doorlooptijd === 'string' ? fields.doorlooptijd : undefined,
    implementatie: typeof fields.implementatie === 'string' ? fields.implementatie : undefined,
    links: fields.links || undefined,
    voorbeeldContracten: fields.voorbeeldContracten || undefined
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