import { getGovernanceModelsFromContentful } from '@/services/contentful-service';
import GovernanceModelClientPage from './client-page';
import { Metadata } from 'next';
import { GovernanceModel } from '@/domain/models';
import { getGovernanceModelByIdFromContentful } from '@/services/contentful-service';
import { SiteHeader } from '@/components/site-header';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const models = await getGovernanceModelsFromContentful();
    const model = models.find((m) => {
      const titleSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return titleSlug === slug;
    });

    if (!model) {
      return {
        title: 'Bestuursmodel niet gevonden',
      };
    }

    return {
      title: `${model.title} | Parkmanager Tool`,
      description: model.description ? model.description.substring(0, 160) : undefined,
    };
  } catch (error) {
    return {
      title: 'Bestuursmodel',
    };
  }
}

export default async function GovernanceModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    // Alle governance modellen ophalen direct uit Contentful
    const models = await getGovernanceModelsFromContentful();
    // dev logging removed

    // Zoek het model met de gegeven slug
    const model = models.find((m) => {
      // Genereer een slug van de titel: lowercase en spaties/speciale tekens vervangen door koppeltekens
      const titleSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Log de vergelijking voor debugging
  // dev logging removed
      
      return titleSlug === slug;
    }) || null;
    
    if (model) {
    // dev logging removed
    } else {
    // dev logging removed
    }
    
    return <GovernanceModelClientPage model={model} />;
  } catch (error) {
    console.error('Error fetching governance model from Contentful for slug:', slug, error);
    return <GovernanceModelClientPage model={null} />;
  }
} 