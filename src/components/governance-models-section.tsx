import { GovernanceModel } from '../domain/models';
import { GovernanceModelAccordion } from './governance-model-accordion';

interface GovernanceModelsSectionProps {
  governanceModels: GovernanceModel[];
  title?: string;
  description?: string;
}

/**
 * Section to display all governance models in accordions
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
      
      <div className="space-y-4">
        {governanceModels.map(model => (
          <GovernanceModelAccordion 
            key={model.id} 
            model={model} 
          />
        ))}
      </div>
    </section>
  );
} 