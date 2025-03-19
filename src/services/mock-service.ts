import {
  BusinessParkReason,
  GovernanceModel,
  ImplementationPlan,
  MobilitySolution
} from '../domain/models';
import {
  mockBusinessParkReasons,
  mockGovernanceModels,
  mockImplementationPlans,
  mockMobilitySolutions
} from './mock-data';

/**
 * Mock service to simulate Contentful API calls during development
 * Will be replaced with real Contentful service when ready
 */

// Simulate async behavior for realistic testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all business park reasons
 */
export async function getBusinessParkReasons(): Promise<BusinessParkReason[]> {
  await delay(500); // Simulate network delay
  return [...mockBusinessParkReasons];
}

/**
 * Get a specific business park reason by ID
 */
export async function getBusinessParkReasonById(id: string): Promise<BusinessParkReason | null> {
  await delay(300);
  const reason = mockBusinessParkReasons.find(reason => reason.id === id);
  return reason || null;
}

/**
 * Get all mobility solutions
 */
export async function getMobilitySolutions(): Promise<MobilitySolution[]> {
  await delay(500);
  return [...mockMobilitySolutions];
}

/**
 * Get a specific mobility solution by ID
 */
export async function getMobilitySolutionById(id: string): Promise<MobilitySolution | null> {
  await delay(300);
  const solution = mockMobilitySolutions.find(solution => solution.id === id);
  return solution || null;
}

/**
 * Get all governance models
 */
export async function getGovernanceModels(): Promise<GovernanceModel[]> {
  await delay(500);
  return [...mockGovernanceModels];
}

/**
 * Get a specific governance model by ID
 */
export async function getGovernanceModelById(id: string): Promise<GovernanceModel | null> {
  await delay(300);
  const model = mockGovernanceModels.find(model => model.id === id);
  return model || null;
}

/**
 * Get all implementation plans
 */
export async function getImplementationPlans(): Promise<ImplementationPlan[]> {
  await delay(500);
  return [...mockImplementationPlans];
}

/**
 * Get a specific implementation plan by ID
 */
export async function getImplementationPlanById(id: string): Promise<ImplementationPlan | null> {
  await delay(300);
  const plan = mockImplementationPlans.find(plan => plan.id === id);
  return plan || null;
} 