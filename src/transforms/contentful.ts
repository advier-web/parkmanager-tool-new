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
    category: typeof fields.category === 'string' ? fields.category : undefined
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
  
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    benefits: Array.isArray(fields.benefits) ? fields.benefits : [],
    challenges: Array.isArray(fields.challenges) ? fields.challenges : [],
    implementationTime: typeof fields.implementationTime === 'string' ? fields.implementationTime : '',
    costs: typeof fields.costs === 'string' ? fields.costs : '',
    category: typeof fields.category === 'string' ? fields.category : '',
    icon: typeof fields.icon === 'string' ? fields.icon : undefined
  };
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
    advantages: Array.isArray(fields.advantages) ? fields.advantages : [],
    disadvantages: Array.isArray(fields.disadvantages) ? fields.disadvantages : [],
    applicableScenarios: Array.isArray(fields.applicableScenarios) ? fields.applicableScenarios : [],
    organizationalStructure: typeof fields.organizationalStructure === 'string' ? fields.organizationalStructure : undefined,
    legalForm: typeof fields.legalForm === 'string' ? fields.legalForm : undefined,
    stakeholders: Array.isArray(fields.stakeholders) ? fields.stakeholders : undefined
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