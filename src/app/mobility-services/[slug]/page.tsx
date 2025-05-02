import MobilityServiceClientPage from './client-page';
import { getMobilitySolutionsFromContentful, getMobilitySolutionById, getImplementationVariationsForSolution } from '@/services/contentful-service';
import { ImplementationVariation, MobilitySolution } from '@/domain/models';

// Addressing no-explicit-any for props
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Helper function to generate slug (keep consistent)
const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

// We fetch data in the client component now for debugging
export default async function MobilityServicePage({ params }: PageProps) {
  const slug = params.slug;
  let variations: ImplementationVariation[] = [];
  let solution: MobilitySolution | null = null;

  try {
    const allSolutions = await getMobilitySolutionsFromContentful({ preview: false });
    const solutionInfo = allSolutions.find(s => generateSlug(s.title) === slug);

    if (solutionInfo) {
      // console.log('Found solution ID from slug:', solutionInfo.id, solutionInfo.title);
      solution = await getMobilitySolutionById(solutionInfo.id, { preview: false }); 
      
      if (solution) {
         try {
           variations = await getImplementationVariationsForSolution(solution.id, { preview: false });
           // console.log(`Found ${variations.length} variations for solution ${solution.id}`);
         } catch (variationError) {
           console.error(`Error fetching variations for solution ${solution.id}:`, variationError);
         }
      } else {
         // console.log('Could not fetch full details for solution ID:', solutionInfo.id);
      }
    } else {
      // console.log('No solution found matching slug:', slug);
    }

    // Verwijder serialisatie logs
    // console.log("[SERVER PAGE DEBUG - BEFORE SERIALIZE] Solution object:", ...);
    // const solutionString = solution ? JSON.stringify(solution) : null;
    // console.log("[SERVER PAGE DEBUG - SERIALIZE] Serialized solutionString:", ...);
    
    // Geef object direct door
    return <MobilityServiceClientPage solution={solution} variations={variations} />;
  } catch (error) {
    // console.error('Error fetching data for slug:', slug, error); // Keep error log if desired
    return <MobilityServiceClientPage solution={null} variations={[]} />;
  }
} 