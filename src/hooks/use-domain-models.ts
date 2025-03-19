import { useFetch } from './use-fetch';
import {
  getBusinessParkReasons,
  getBusinessParkReasonById,
  getMobilitySolutions,
  getMobilitySolutionById,
  getGovernanceModels,
  getGovernanceModelById,
  getImplementationPlans,
  getImplementationPlanById
} from '../services/mock-service';
import {
  BusinessParkReason,
  GovernanceModel,
  ImplementationPlan,
  MobilitySolution
} from '../domain/models';

/**
 * Hook for fetching all business park reasons
 */
export function useBusinessParkReasons() {
  return useFetch<BusinessParkReason[]>(getBusinessParkReasons);
}

/**
 * Hook for fetching a specific business park reason by ID
 */
export function useBusinessParkReason(id: string | null) {
  return useFetch<BusinessParkReason | null>(
    () => id ? getBusinessParkReasonById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook for fetching all mobility solutions
 */
export function useMobilitySolutions() {
  return useFetch<MobilitySolution[]>(getMobilitySolutions);
}

/**
 * Hook for fetching a specific mobility solution by ID
 */
export function useMobilitySolution(id: string | null) {
  return useFetch<MobilitySolution | null>(
    () => id ? getMobilitySolutionById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook for fetching all governance models
 */
export function useGovernanceModels() {
  return useFetch<GovernanceModel[]>(getGovernanceModels);
}

/**
 * Hook for fetching a specific governance model by ID
 */
export function useGovernanceModel(id: string | null) {
  return useFetch<GovernanceModel | null>(
    () => id ? getGovernanceModelById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook for fetching all implementation plans
 */
export function useImplementationPlans() {
  return useFetch<ImplementationPlan[]>(getImplementationPlans);
}

/**
 * Hook for fetching a specific implementation plan by ID
 */
export function useImplementationPlan(id: string | null) {
  return useFetch<ImplementationPlan | null>(
    () => id ? getImplementationPlanById(id) : Promise.resolve(null),
    [id]
  );
} 