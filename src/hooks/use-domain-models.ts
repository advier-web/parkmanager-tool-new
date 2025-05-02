import { useFetch } from './use-fetch';
import {
  getBusinessParkReasons as getMockBusinessParkReasons,
  getBusinessParkReasonById as getMockBusinessParkReasonById,
  getMobilitySolutions as getMockMobilitySolutions,
  getMobilitySolutionById as getMockMobilitySolutionById,
  getGovernanceModels as getMockGovernanceModels,
  getGovernanceModelById as getMockGovernanceModelById,
  getImplementationPlans,
  getImplementationPlanById
} from '../services/mock-service';
import {
  BusinessParkReason,
  GovernanceModel,
  ImplementationPlan,
  MobilitySolution,
  WebsiteCollectiefVervoer,
  ImplementationVariation
} from '../domain/models';
import { shouldUseContentful, isContentfulPreviewMode } from '../utils/env';
import { 
  getBusinessParkReasonsFromContentful,
  getBusinessParkReasonByIdFromContentful,
  getMobilitySolutionsFromContentful,
  getMobilitySolutionById as getMobilitySolutionByIdFromContentful,
  getGovernanceModelsFromContentful,
  getGovernanceModelByIdFromContentful,
  getWebsiteCollectiefVervoerFromContentful,
  getImplementationVariationsFromContentful
} from '../services/contentful-service';

/**
 * Hook voor het ophalen van alle business park reasons
 */
export function useBusinessParkReasons() {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => getBusinessParkReasonsFromContentful({ preview })
    : getMockBusinessParkReasons;

  return useFetch<BusinessParkReason[]>(fetcher, [useContentful, preview]);
}

/**
 * Hook voor het ophalen van een specifieke business park reason
 */
export function useBusinessParkReason(id: string | null) {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => id ? getBusinessParkReasonByIdFromContentful(id, { preview }) : Promise.resolve(null)
    : () => id ? getMockBusinessParkReasonById(id) : Promise.resolve(null);

  return useFetch<BusinessParkReason | null>(fetcher, [id, useContentful, preview]);
}

/**
 * Hook voor het ophalen van alle mobility solutions
 */
export function useMobilitySolutions() {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => getMobilitySolutionsFromContentful({ preview })
    : getMockMobilitySolutions;

  return useFetch<MobilitySolution[]>(fetcher, [useContentful, preview]);
}

/**
 * Hook voor het ophalen van een specifieke mobility solution
 */
export function useMobilitySolution(id: string | null) {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => id ? getMobilitySolutionByIdFromContentful(id, { preview }) : Promise.resolve(null)
    : () => id ? getMockMobilitySolutionById(id) : Promise.resolve(null);

  return useFetch<MobilitySolution | null>(fetcher, [id, useContentful, preview]);
}

/**
 * Hook voor het ophalen van alle governance models
 */
export function useGovernanceModels() {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => getGovernanceModelsFromContentful({ preview })
    : getMockGovernanceModels;

  return useFetch<GovernanceModel[]>(fetcher, [useContentful, preview]);
}

/**
 * Hook voor het ophalen van een specifieke governance model
 */
export function useGovernanceModel(id: string | null) {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => id ? getGovernanceModelByIdFromContentful(id, { preview }) : Promise.resolve(null)
    : () => id ? getMockGovernanceModelById(id) : Promise.resolve(null);

  return useFetch<GovernanceModel | null>(fetcher, [id, useContentful, preview]);
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
  const fetcher = () => id ? getImplementationPlanById(id) : Promise.resolve(null);
  return useFetch<ImplementationPlan | null>(fetcher, [id]);
}

/**
 * Hook voor het ophalen van alle Implementation Variations
 */
export function useImplementationVariations() {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const fetcher = useContentful
    ? () => getImplementationVariationsFromContentful({ preview })
    : () => Promise.resolve<ImplementationVariation[]>([]);

  return useFetch<ImplementationVariation[]>(fetcher, [useContentful, preview]);
}

/**
 * Hook voor het ophalen van de website collectief vervoer content
 */
export function useWebsiteCollectiefVervoer() {
  const preview = isContentfulPreviewMode();
  const useContentful = shouldUseContentful();

  const mockFetcher = () => Promise.resolve<WebsiteCollectiefVervoer>({
    id: 'mock',
    inleiding: 'Collectief vervoer inleiding (mock data).',
    watIsCollectiefVervoer: 'Wat is collectief vervoer (mock data).',
    aanleidingenVoorCollectieveVervoersoplossingen: 'Aanleidingen voor collectieve vervoersoplossingen (mock data).',
    overzichtCollectieveVervoersoplossingen: 'Overzicht collectieve vervoersoplossingen (mock data).',
    bestuurlijkeRechtsvormen: 'Bestuurlijke rechtsvormen (mock data).',
    coverSubsidie: 'Cover subsidie (mock data).',
    bestPractices: 'Best practices (mock data).'
  });

  const fetcher = useContentful
    ? () => getWebsiteCollectiefVervoerFromContentful({ preview })
    : mockFetcher;
    
  return useFetch<WebsiteCollectiefVervoer>(fetcher, [useContentful, preview]);
} 