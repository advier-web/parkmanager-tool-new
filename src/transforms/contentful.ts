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
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    icon: entry.fields.icon as string | undefined,
    category: entry.fields.category as string | undefined
  };
}

/**
 * Transform a Contentful MobilitySolution entry to a domain MobilitySolution
 */
export function transformMobilitySolution(
  entry: Entry<IMobilitySolution>
): MobilitySolution {
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    benefits: Array.isArray(entry.fields.benefits) ? entry.fields.benefits : [],
    challenges: Array.isArray(entry.fields.challenges) ? entry.fields.challenges : [],
    implementationTime: entry.fields.implementationTime || '',
    costs: entry.fields.costs || '',
    category: entry.fields.category || '',
    icon: entry.fields.icon as string | undefined
  };
}

/**
 * Transform a Contentful GovernanceModel entry to a domain GovernanceModel
 */
export function transformGovernanceModel(
  entry: Entry<IGovernanceModel>
): GovernanceModel {
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    advantages: Array.isArray(entry.fields.advantages) ? entry.fields.advantages : [],
    disadvantages: Array.isArray(entry.fields.disadvantages) ? entry.fields.disadvantages : [],
    applicableScenarios: Array.isArray(entry.fields.applicableScenarios) ? entry.fields.applicableScenarios : [],
    organizationalStructure: entry.fields.organizationalStructure as string | undefined,
    legalForm: entry.fields.legalForm as string | undefined,
    stakeholders: Array.isArray(entry.fields.stakeholders) ? entry.fields.stakeholders : undefined
  };
}

/**
 * Transform a Contentful ImplementationTask entry to a domain ImplementationTask
 */
export function transformImplementationTask(
  entry: Entry<IImplementationTask>
): ImplementationTask {
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    responsible: Array.isArray(entry.fields.responsible) ? entry.fields.responsible : [],
    duration: entry.fields.duration || ''
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
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    tasks: tasks,
    duration: entry.fields.duration || ''
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
  return {
    id: entry.sys.id,
    title: entry.fields.title || '',
    description: entry.fields.description || '',
    phases: phases,
    estimatedDuration: entry.fields.estimatedDuration || '',
    requiredResources: Array.isArray(entry.fields.requiredResources) ? entry.fields.requiredResources : [],
    keySuccessFactors: Array.isArray(entry.fields.keySuccessFactors) ? entry.fields.keySuccessFactors : []
  };
} 