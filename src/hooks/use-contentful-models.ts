import { useState, useEffect } from 'react';
import { useFetch } from './use-fetch';
import { 
  getBusinessParkReasonsFromContentful, 
  getBusinessParkReasonByIdFromContentful,
  getMobilitySolutionsFromContentful,
  getMobilitySolutionByIdFromContentful,
  getContentfulContentTypes
} from '../services/contentful-service';
import { BusinessParkReason, MobilitySolution } from '../domain/models';

/**
 * Debug hook to get content types from Contentful
 */
export function useContentfulContentTypes(preview = false) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getContentfulContentTypes(preview)
        .catch(error => console.error('Failed to fetch content types:', error));
    }
  }, [preview]);
}

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
    () => id ? getMobilitySolutionByIdFromContentful(id, { preview }) : Promise.resolve(null),
    [id, preview]
  );
} 