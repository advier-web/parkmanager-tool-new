import { useState, useEffect } from 'react';
import { useFetch } from './use-fetch';
import { getBusinessParkReasonsFromContentful, getBusinessParkReasonByIdFromContentful } from '../services/contentful-service';
import { BusinessParkReason } from '../domain/models';

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