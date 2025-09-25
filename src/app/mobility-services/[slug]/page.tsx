import MobilityServiceClientPage from './client-page';
import { getMobilitySolutionsFromContentful, getMobilitySolutionById, getImplementationVariationsForSolution } from '@/services/contentful-service';
import { ImplementationVariation, MobilitySolution } from '@/domain/models';

// Addressing no-explicit-any for props
// Next 15 App Router passes params as a Promise

// Helper function to generate slug (keep consistent)
const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

// We fetch data in the client component now for debugging
export default async function MobilityServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let variations: ImplementationVariation[] = [];
  let solution: MobilitySolution | null = null;

  try {
    const allSolutions = await getMobilitySolutionsFromContentful({ preview: false });
    const solutionInfo = allSolutions.find(s => generateSlug(s.title) === slug);

    if (solutionInfo) {
      
      solution = await getMobilitySolutionById(solutionInfo.id, { preview: false }); 
      
      if (solution) {
         try {
           variations = await getImplementationVariationsForSolution(solution.id, { preview: false });
           
         } catch (variationError) {
           console.error(`Error fetching variations for solution ${solution.id}:`, variationError);
         }
      } else {
         
      }
    } else {
      
    }

    // Verwijder serialisatie logs
    
    // const solutionString = solution ? JSON.stringify(solution) : null;
    
    
    // Geef object direct door
    return <MobilityServiceClientPage solution={solution} variations={variations} />;
  } catch (error) {
    // Keep server error log if desired
    return <MobilityServiceClientPage solution={null} variations={[]} />;
  }
} 