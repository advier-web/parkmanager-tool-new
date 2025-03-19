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
import { 
  useContentfulBusinessParkReasons, 
  useContentfulBusinessParkReason,
  useContentfulMobilitySolutions,
  useContentfulMobilitySolution
} from './use-contentful-models';
import { shouldUseContentful, isContentfulPreviewMode } from '../utils/env';
import { getMobilitySolutionsFromContentful } from '../services/contentful-service';

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
 * Gebruikt Contentful of mock data afhankelijk van configuratie
 */
export function useMobilitySolutions() {
  // Als Contentful is ingeschakeld, probeer Contentful eerst
  if (shouldUseContentful()) {
    // Using SWR's fallback mechanism
    return useFetch<MobilitySolution[]>(
      async () => {
        try {
          // Try to get data from Contentful first
          return await getMobilitySolutionsFromContentful({ preview: isContentfulPreviewMode() });
        } catch (error) {
          console.log('Falling back to mock data for mobility solutions', error);
          // If Contentful fails, fall back to mock data
          return getMobilitySolutions();
        }
      }
    );
  }
  
  // Fallback naar mock data
  return useFetch<MobilitySolution[]>(getMobilitySolutions);
}

/**
 * Hook voor het ophalen van een specifieke mobility solution
 * Gebruikt Contentful of mock data afhankelijk van configuratie
 */
export function useMobilitySolution(id: string | null) {
  // Als Contentful is ingeschakeld, gebruik de Contentful hook
  if (shouldUseContentful()) {
    return useContentfulMobilitySolution(id, isContentfulPreviewMode());
  }
  
  // Fallback naar mock data
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