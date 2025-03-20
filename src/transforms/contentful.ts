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
    console.log(`  ${key}: ${value} (type: ${typeof value})`);
  });
  
  // Log governance models if they exist
  if (fields.governanceModels) {
    console.log('[TRANSFORM] Found governanceModels field:', fields.governanceModels);
  }
  
  // Specifieke check voor deelfietssysteem 
  if (fields.title && fields.title.includes('deelfiets')) {
    console.log('[TRANSFORM-IMPORTANT] Processing deelfiets solution');
    
    // Check voor gezondheid score
    if (typeof fields.gezondheid === 'number') {
      console.log(`[TRANSFORM-IMPORTANT] Found gezondheid score in Contentful: ${fields.gezondheid}`);
      solution.gezondheid = fields.gezondheid;
      
      // Ook expliciet als verschillende schrijfwijzen toevoegen
      (solution as any)['Gezondheid'] = fields.gezondheid;
      (solution as any)['Health'] = fields.gezondheid;
    } else {
      console.log('[TRANSFORM-IMPORTANT] No direct gezondheid score found in fields');
    }
  }
  
  // Voeg alle numerieke velden toe aan het solution object
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'number') {
      console.log(`[TRANSFORM] Found numeric field in Contentful: ${key} = ${value}`);
      
      // Voeg dit veld toe aan het solution object
      (solution as any)[key] = value;
      
      // Voeg ook lowercase en capitalized varianten toe voor robuustheid
      (solution as any)[key.toLowerCase()] = value;
      (solution as any)[key.charAt(0).toUpperCase() + key.slice(1)] = value;
      
      // Verwijder spaties en vervang door underscores
      if (key.includes(' ')) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        (solution as any)[normalizedKey] = value;
        console.log(`[TRANSFORM] Also added normalized key: ${normalizedKey} = ${value}`);
      }
    }
  });
  
  // Specifieke hardcoded rating velden (voor het geval dat)
  const ratingFields = [
    'parkeer_bereikbaarheidsproblemen', 
    'gezondheid', 
    'personeelszorg_en_behoud', 
    'imago', 
    'milieuverordening',
    'Gezondheid',
    'Personeelszorg en -behoud',
    'Vervoerkosten',
    'Gastvrijheid'
  ];
  
  // Controleer en zet rating velden
  ratingFields.forEach(field => {
    if (typeof fields[field] === 'number') {
      (solution as any)[field] = fields[field];
      console.log(`[TRANSFORM] Set rating field ${field} = ${fields[field]}`);
      
      // Ook lowercase variant toevoegen
      (solution as any)[field.toLowerCase()] = fields[field];
    }
  });
  
  // Nu expliciete veldbinding toevoegen voor de meest voorkomende scenario's
  if (typeof fields['Gezondheid'] === 'number') {
    solution.gezondheid = fields['Gezondheid'];
    console.log(`[TRANSFORM] Mapped 'Gezondheid' to 'gezondheid': ${fields['Gezondheid']}`);
  }
  
  if (typeof fields['Personeelszorg en -behoud'] === 'number') {
    solution.personeelszorg_en_behoud = fields['Personeelszorg en -behoud'];
    console.log(`[TRANSFORM] Mapped 'Personeelszorg en -behoud' to 'personeelszorg_en_behoud': ${fields['Personeelszorg en -behoud']}`);
  }
  
  // Sanity check - loggen van alle velden in het uiteindelijke solution object
  console.log('[TRANSFORM] Final solution object with scores:');
  ['gezondheid', 'Gezondheid', 'parkeer_bereikbaarheidsproblemen', 'personeelszorg_en_behoud', 'imago', 'milieuverordening'].forEach(field => {
    console.log(`  ${field}: ${(solution as any)[field]} (type: ${typeof (solution as any)[field]})`);
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