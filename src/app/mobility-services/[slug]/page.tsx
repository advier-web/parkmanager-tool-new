import MobilityServiceClientPage from './client-page';
import { getMobilitySolutionsFromContentful } from '@/services/contentful-service';

export default async function MobilityServicePage(props: any) {
  const { params } = props;
  
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
      console.log(`Comparing: "${titleSlug}" with "${params.slug}"`, titleSlug === params.slug);
      
      return titleSlug === params.slug;
    }) || null;
    
    if (solution) {
      console.log('Found solution in Contentful:', solution.id, solution.title);
    } else {
      console.log('No solution found in Contentful for slug:', params.slug);
    }
    
    return <MobilityServiceClientPage solution={solution} />;
  } catch (error) {
    console.error('Error fetching solution from Contentful for slug:', params.slug, error);
    return <MobilityServiceClientPage solution={null} />;
  }
} 