import { MobilitySolution } from '../domain/models';
import { Accordion } from './accordion';
import { ItemWithMarkdown } from './item-with-markdown';

interface MobilityServiceAccordionProps {
  service: MobilitySolution;
}

export function MobilityServiceAccordion({ service }: MobilityServiceAccordionProps) {
  return (
    <Accordion title={service.title}>
      <div className="space-y-8 py-2">
        {service.paspoort && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Paspoort</h2>
            <ItemWithMarkdown content={service.paspoort} />
          </div>
        )}
        
        {service.description && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Beschrijving</h2>
            <ItemWithMarkdown content={service.description} />
          </div>
        )}
        
        {service.collectiefVsIndiviueel && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Collectief vs. Individueel</h2>
            <ItemWithMarkdown content={service.collectiefVsIndiviueel} />
          </div>
        )}
        
        {service.effecten && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Effecten</h2>
            <ItemWithMarkdown content={service.effecten} />
          </div>
        )}
        
        {service.investering && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Investering</h2>
            <ItemWithMarkdown content={service.investering} />
          </div>
        )}
        
        {service.implementatie && (
          <div className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-3">Implementatie</h2>
            <ItemWithMarkdown content={service.implementatie} />
          </div>
        )}
        
        {service.governancemodellenToelichting && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Toelichting bestuursvormen</h2>
            <ItemWithMarkdown content={service.governancemodellenToelichting} />
          </div>
        )}
      </div>
    </Accordion>
  );
} 