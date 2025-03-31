import MobilityServiceClientPage from './client-page';
import { getMobilitySolutions } from '@/services/mock-service';

export default async function MobilityServicePage({ params }: { params: { slug: string } }) {
  try {
    // Alle mobiliteitsoplossingen ophalen via de service functie
    const solutions = await getMobilitySolutions();
    
    console.log('Requested slug:', params.slug);
    console.log('Available solutions:', solutions.map(s => ({
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
      console.log('Found solution:', solution.title);
    } else {
      console.log('No solution found for slug:', params.slug);
    }
    
    return <MobilityServiceClientPage solution={solution} />;
  } catch (error) {
    console.error('Error fetching solution for slug:', params.slug, error);
    return <MobilityServiceClientPage solution={null} />;
  }
} 