import { getMobilitySolutionForPdf as getContentfulMobilitySolution } from '@/services/contentful-service';
import { MobilitySolution } from '../types/mobilityTypes';

// Verzamel mobiliteitsoplossing data voor een pdf
export const getMobilitySolutionForPdf = async (mobilityServiceId: string): Promise<MobilitySolution> => {
  return getContentfulMobilitySolution(mobilityServiceId);
}; 