import { GovernanceModel } from '../domain/models';
import { GovernanceModelButton } from './governance-model-button';

interface GovernanceModelsSectionProps {
  governanceModels: GovernanceModel[];
  title?: string;
  description?: string;
}

/**
 * Section to display all governance models in buttons
 */
export function GovernanceModelsSection({ 
  governanceModels,
  title = "Bestuurlijke rechtsvormen",
  description
}: GovernanceModelsSectionProps) {
  if (!governanceModels || governanceModels.length === 0) {
    return null;
  }

  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {description && <div className="mb-6">{description}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {governanceModels.map(model => (
          <GovernanceModelButton 
            key={model.id} 
            model={model} 
          />
        ))}
      </div>
    </section>
  );
} 