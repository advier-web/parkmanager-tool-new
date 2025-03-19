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
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const icon = typeof entry.fields.icon === 'string' ? entry.fields.icon : undefined;
  const category = typeof entry.fields.category === 'string' ? entry.fields.category : undefined;
  
  return {
    id: entry.sys.id,
    title,
    description,
    icon,
    category
  };
}

/**
 * Transform a Contentful MobilitySolution entry to a domain MobilitySolution
 */
export function transformMobilitySolution(
  entry: Entry<IMobilitySolution>
): MobilitySolution {
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const benefits = Array.isArray(entry.fields.benefits) ? entry.fields.benefits : [];
  const challenges = Array.isArray(entry.fields.challenges) ? entry.fields.challenges : [];
  const implementationTime = typeof entry.fields.implementationTime === 'string' 
    ? entry.fields.implementationTime : '';
  const costs = typeof entry.fields.costs === 'string' ? entry.fields.costs : '';
  const category = typeof entry.fields.category === 'string' ? entry.fields.category : '';
  const icon = typeof entry.fields.icon === 'string' ? entry.fields.icon : undefined;
  
  return {
    id: entry.sys.id,
    title,
    description,
    benefits,
    challenges,
    implementationTime,
    costs,
    category,
    icon
  };
}

/**
 * Transform a Contentful GovernanceModel entry to a domain GovernanceModel
 */
export function transformGovernanceModel(
  entry: Entry<IGovernanceModel>
): GovernanceModel {
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const advantages = Array.isArray(entry.fields.advantages) ? entry.fields.advantages : [];
  const disadvantages = Array.isArray(entry.fields.disadvantages) ? entry.fields.disadvantages : [];
  const applicableScenarios = Array.isArray(entry.fields.applicableScenarios) ? entry.fields.applicableScenarios : [];
  const organizationalStructure = typeof entry.fields.organizationalStructure === 'string' 
    ? entry.fields.organizationalStructure : undefined;
  const legalForm = typeof entry.fields.legalForm === 'string' ? entry.fields.legalForm : undefined;
  const stakeholders = Array.isArray(entry.fields.stakeholders) ? entry.fields.stakeholders : undefined;
  
  return {
    id: entry.sys.id,
    title,
    description,
    advantages,
    disadvantages,
    applicableScenarios,
    organizationalStructure,
    legalForm,
    stakeholders
  };
}

/**
 * Transform a Contentful ImplementationTask entry to a domain ImplementationTask
 */
export function transformImplementationTask(
  entry: Entry<IImplementationTask>
): ImplementationTask {
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const responsible = Array.isArray(entry.fields.responsible) ? entry.fields.responsible : [];
  const duration = typeof entry.fields.duration === 'string' ? entry.fields.duration : '';
  
  return {
    id: entry.sys.id,
    title,
    description,
    responsible,
    duration
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
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const duration = typeof entry.fields.duration === 'string' ? entry.fields.duration : '';
  
  return {
    id: entry.sys.id,
    title,
    description,
    tasks,
    duration
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
  const title = typeof entry.fields.title === 'string' ? entry.fields.title : '';
  const description = typeof entry.fields.description === 'string' ? entry.fields.description : '';
  const estimatedDuration = typeof entry.fields.estimatedDuration === 'string' ? entry.fields.estimatedDuration : '';
  const requiredResources = Array.isArray(entry.fields.requiredResources) ? entry.fields.requiredResources : [];
  const keySuccessFactors = Array.isArray(entry.fields.keySuccessFactors) ? entry.fields.keySuccessFactors : [];
  
  return {
    id: entry.sys.id,
    title,
    description,
    phases,
    estimatedDuration,
    requiredResources,
    keySuccessFactors
  };
} 