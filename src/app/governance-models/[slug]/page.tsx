import { getGovernanceModelsFromContentful } from '@/services/contentful-service';
import GovernanceModelClientPage from './client-page';

export default async function GovernanceModelPage({ params }: { params: { slug: string } }) {
  try {
    // Alle governance modellen ophalen direct uit Contentful
    const models = await getGovernanceModelsFromContentful();
    
    console.log('Requested governance model slug:', params.slug);
    console.log('Available governance models from Contentful:', models.map(m => ({
      id: m.id,
      title: m.title,
      generatedSlug: m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    })));
    
    // Zoek het model met de gegeven slug
    const model = models.find((m) => {
      // Genereer een slug van de titel: lowercase en spaties/speciale tekens vervangen door koppeltekens
      const titleSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Log de vergelijking voor debugging
      console.log(`Comparing governance models: "${titleSlug}" with "${params.slug}"`, titleSlug === params.slug);
      
      return titleSlug === params.slug;
    }) || null;
    
    if (model) {
      console.log('Found governance model in Contentful:', model.id, model.title);
    } else {
      console.log('No governance model found in Contentful for slug:', params.slug);
    }
    
    return <GovernanceModelClientPage model={model} />;
  } catch (error) {
    console.error('Error fetching governance model from Contentful for slug:', params.slug, error);
    return <GovernanceModelClientPage model={null} />;
  }
} 