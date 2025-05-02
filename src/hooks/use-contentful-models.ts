import React from 'react';
import { useFetch } from './use-fetch';
import { 
  getBusinessParkReasonsFromContentful, 
  getBusinessParkReasonByIdFromContentful,
  getMobilitySolutionsFromContentful,
  getMobilitySolutionById,
  getGovernanceModelsFromContentful,
  getGovernanceModelByIdFromContentful,
  getWebsiteCollectiefVervoerFromContentful,
  getImplementationVariationsFromContentful
} from '../services/contentful-service';
import { BusinessParkReason, MobilitySolution, GovernanceModel, WebsiteCollectiefVervoer, ImplementationVariation } from '../domain/models';

/**
 * Hook om alle bedrijfsterrein-redenen op te halen via Contentful
 */
export function useContentfulBusinessParkReasons(preview = false) {
  return useFetch<BusinessParkReason[]>(
    () => getBusinessParkReasonsFromContentful({ preview }),
    [preview]
  );
}

/**
 * Hook om een specifieke bedrijfsterrein-reden op te halen via Contentful
 */
export function useContentfulBusinessParkReason(id: string | null, preview = false) {
  return useFetch<BusinessParkReason | null>(
    () => id ? getBusinessParkReasonByIdFromContentful(id, { preview }) : Promise.resolve(null),
    [id, preview]
  );
}

/**
 * Hook om alle mobiliteitsoplossingen op te halen via Contentful
 */
export function useContentfulMobilitySolutions(preview = false) {
  return useFetch<MobilitySolution[]>(
    () => getMobilitySolutionsFromContentful({ preview }),
    [preview]
  );
}

/**
 * Hook om een specifieke mobiliteitsoplossing op te halen via Contentful
 */
export function useContentfulMobilitySolution(id: string | null, preview = false) {
  return useFetch<MobilitySolution | null>(
    () => id ? getMobilitySolutionById(id, { preview }) : Promise.resolve(null),
    [id, preview]
  );
}

/**
 * Hook om alle governance modellen op te halen via Contentful
 */
export function useContentfulGovernanceModels(preview = false) {
  return useFetch<GovernanceModel[]>(
    () => getGovernanceModelsFromContentful({ preview }),
    [preview]
  );
}

/**
 * Hook om een specifiek governance model op te halen via Contentful
 */
export function useContentfulGovernanceModel(id: string | null, preview = false) {
  return useFetch<GovernanceModel | null>(
    () => id ? getGovernanceModelByIdFromContentful(id, { preview }) : Promise.resolve(null),
    [id, preview]
  );
}

/**
 * Hook om websiteCollectiefVervoer content op te halen via Contentful
 */
export function useContentfulWebsiteCollectiefVervoer(preview = false) {
  return useFetch<WebsiteCollectiefVervoer>(
    () => getWebsiteCollectiefVervoerFromContentful({ preview }),
    [preview]
  );
}

/**
 * Hook om ALLE implementatievarianten op te halen via Contentful
 */
export function useContentfulImplementationVariations(preview = false) {
  return useFetch<ImplementationVariation[]>(
    () => getImplementationVariationsFromContentful({ preview }),
    [preview]
  );
} 