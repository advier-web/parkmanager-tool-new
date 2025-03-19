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
import { useContentfulBusinessParkReasons, useContentfulBusinessParkReason } from './use-contentful-models';
import { shouldUseContentful, isContentfulPreviewMode } from '../utils/env';

/**
 * Hook voor het ophalen van alle business park reasons
 * Gebruikt Contentful of mock data afhankelijk van configuratie
 */
export function useBusinessParkReasons() {
  // Als Contentful is ingeschakeld, gebruik de Contentful hook
  if (shouldUseContentful()) {
    return useContentfulBusinessParkReasons(isContentfulPreviewMode());
  }
  
  // Fallback naar mock data
  return useFetch<BusinessParkReason[]>(getBusinessParkReasons);
}

/**
 * Hook voor het ophalen van een specifieke business park reason
 * Gebruikt Contentful of mock data afhankelijk van configuratie
 */
export function useBusinessParkReason(id: string | null) {
  // Als Contentful is ingeschakeld, gebruik de Contentful hook
  if (shouldUseContentful()) {
    return useContentfulBusinessParkReason(id, isContentfulPreviewMode());
  }
  
  // Fallback naar mock data
  return useFetch<BusinessParkReason | null>(
    () => id ? getBusinessParkReasonById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook voor het ophalen van alle mobility solutions
 */
export function useMobilitySolutions() {
  // Voor nu alleen mock data, later Contentful toevoegen
  return useFetch<MobilitySolution[]>(getMobilitySolutions);
}

/**
 * Hook voor het ophalen van een specifieke mobility solution
 */
export function useMobilitySolution(id: string | null) {
  return useFetch<MobilitySolution | null>(
    () => id ? getMobilitySolutionById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook voor het ophalen van alle governance models
 */
export function useGovernanceModels() {
  return useFetch<GovernanceModel[]>(getGovernanceModels);
}

/**
 * Hook voor het ophalen van een specifieke governance model
 */
export function useGovernanceModel(id: string | null) {
  return useFetch<GovernanceModel | null>(
    () => id ? getGovernanceModelById(id) : Promise.resolve(null),
    [id]
  );
}

/**
 * Hook voor het ophalen van alle implementation plans
 */
export function useImplementationPlans() {
  return useFetch<ImplementationPlan[]>(getImplementationPlans);
}

/**
 * Hook voor het ophalen van een specifieke implementation plan
 */
export function useImplementationPlan(id: string | null) {
  return useFetch<ImplementationPlan | null>(
    () => id ? getImplementationPlanById(id) : Promise.resolve(null),
    [id]
  );
} 