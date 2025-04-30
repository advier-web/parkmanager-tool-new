import MobilityServiceClientPage from './client-page';
import { getMobilitySolutionsFromContentful, getImplementationVariationsForSolution } from '@/services/contentful-service';
import { ImplementationVariation } from '@/domain/models';

export default async function MobilityServicePage(props: any) {
  const { params } = props;
  let variations: ImplementationVariation[] = [];
  
  try {
    // Alle mobiliteitsoplossingen ophalen direct uit Contentful
    const solutions = await getMobilitySolutionsFromContentful();
    
    console.log('Requested slug:', params.slug);
    console.log('Available solutions from Contentful:', solutions.map(s => ({
      id: s.id,
      title: s.title,
      generatedSlug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    })));
    
    // Zoek de oplossing met de gegeven slug
    const solution = solutions.find((s) => {
      // Genereer een slug van de titel: lowercase en spaties/speciale tekens vervangen door koppeltekens
      const titleSlug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Log de vergelijking voor debugging
      // console.log(`Comparing: "${titleSlug}" with "${params.slug}"`, titleSlug === params.slug); // Debug log can be removed later
      
      return titleSlug === params.slug;
    }) || null;
    
    if (solution) {
      console.log('Found solution in Contentful:', solution.id, solution.title);
      // If solution is found, fetch its implementation variations
      try {
        variations = await getImplementationVariationsForSolution(solution.id);
        console.log(`Found ${variations.length} variations for solution ${solution.id}`);
      } catch (variationError) {
        console.error(`Error fetching variations for solution ${solution.id}:`, variationError);
        // Keep variations as empty array if fetching fails
      }
    } else {
      console.log('No solution found in Contentful for slug:', params.slug);
    }
    
    // Pass both solution and variations to the client page
    return <MobilityServiceClientPage solution={solution} variations={variations} />;
  } catch (error) {
    console.error('Error fetching solution from Contentful for slug:', params.slug, error);
    // Pass null/empty array in case of error
    return <MobilityServiceClientPage solution={null} variations={[]} />;
  }
} 