'use client';

import { usePathname } from 'next/navigation';

// Helper to get step number/name from pathname
const getStepInfoFromPathname = (pathname: string): { name: string; number: number } => {
  const match = pathname.match(/\/wizard\/(?:stap-(\d+[ab]?)|(bedrijventerrein)|(samenvatting))/);
  if (!match) return { name: 'unknown', number: -1 };
  if (match[2]) return { name: 'bedrijventerrein', number: 0 }; 
  if (match[1]) {
    const stepPart = match[1];
    // Handle steps like 2a, 2b - use the number for logic, but keep name specific if needed later
    const number = parseInt(stepPart.replace(/[ab]/, ''), 10);
    return { name: `stap-${stepPart}`, number };
  }
  if (match[3]) return { name: 'samenvatting', number: 5 }; 
  return { name: 'unknown', number: -1 };
};

// Define the content for each step
const stepInfoContent: Record<string, React.ReactNode> = {
  bedrijventerrein: (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
        <p className="text-gray-600 text-sm">
          Deze informatie helpt ons om een passend advies te geven voor uw bedrijventerrein. 
          De grootte en complexiteit van het terrein bepalen mede welke collectieve vervoersoplossingen het meest geschikt zijn.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Huidige situatie</h3>
        <p className="text-gray-600 text-sm">
          Het is belangrijk om te weten wat uw huidige bestuursmodel is. 
          Dit helpt ons later te bepalen of er aanpassingen nodig zijn voor de implementatie van nieuwe collectieve vervoersoplossingen.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Type verkeer</h3>
        <p className="text-gray-600 text-sm">
          Door aan te geven voor welk type verkeer u oplossingen zoekt, 
          kunnen we gerichter adviseren over collectieve vervoersoplossingen die aansluiten bij uw behoeften.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Locatiekenmerken</h3>
        <p className="text-gray-600 text-sm">
          De bereikbaarheid van uw bedrijventerrein met verschillende vervoermiddelen 
          en de afstand tussen woonplaats en werk zijn belangrijke factoren bij het 
          kiezen van geschikte collectieve vervoersoplossingen.
        </p>
      </div>
    </>
  ),
  'stap-1': (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
        <p className="text-gray-600 text-sm">
          Door te begrijpen waarom u de mobiliteit wilt verbeteren, 
          kan ik gerichter adviseren over passende collectieve vervoersoplossingen. Elke reden kan leiden tot andere aanbevelingen.
        </p>
      </div>
      <div>
         <h3 className="text-lg font-semibold mb-2">Selecteer uw redenen</h3>
         <p className="text-gray-600 text-sm">
           Kies de belangrijkste aanleidingen die voor uw bedrijventerrein gelden. 
           U kunt meerdere redenen selecteren.
         </p>
       </div>
    </>
  ),
  'stap-2': (
     <>
       <div>
         <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
         <p className="text-gray-600 text-sm">
           Op basis van uw gekozen aanleidingen, presenteren we hier de meest relevante collectieve vervoersoplossingen. 
           Selecteer de oplossingen die u wilt overwegen.
         </p>
       </div>
       <div>
         <h3 className="text-lg font-semibold mb-2">Ontdek oplossingen</h3>
         <p className="text-gray-600 text-sm">
           Bekijk de details van elke oplossing door erop te klikken. 
           Selecteer de collectieve vervoersoplossingen die het beste aansluiten bij uw situatie.
         </p>
       </div>
     </>
  ),
   'stap-2b': (
     <>
       <div>
         <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
         <p className="text-gray-600 text-sm">
            Voor sommige collectieve vervoersoplossingen zijn er verschillende manieren om ze te implementeren. 
            Kies hier de variant die het beste past bij uw voorkeuren en mogelijkheden.
         </p>
       </div>
        <div>
         <h3 className="text-lg font-semibold mb-2">Kies een variant</h3>
         <p className="text-gray-600 text-sm">
            Selecteer per gekozen collectieve vervoersoplossing de gewenste implementatievariant. 
            Deze keuze beïnvloedt het uiteindelijke advies en de vervolgstappen.
         </p>
       </div>
     </>
  ),
   'stap-3': (
     <>
       <div>
         <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
         <p className="text-gray-600 text-sm">
            Het kiezen van het juiste governance model is cruciaal voor een succesvolle implementatie en beheer van collectieve vervoersoplossingen. 
            Hier helpen we u het meest geschikte model te selecteren.
         </p>
       </div>
       <div>
         <h3 className="text-lg font-semibold mb-2">Governance model</h3>
         <p className="text-gray-600 text-sm">
            Vergelijk de voorgestelde modellen en selecteer het model dat het beste past bij uw bedrijventerrein, 
            de gekozen collectieve vervoersoplossing en uw organisatorische context.
         </p>
       </div>
     </>
  ),
  // stap-4 (Implementatieplan) verwijderd
  samenvatting: (
    <>
       <div>
         <h3 className="text-lg font-semibold mb-2">Waarom deze stap?</h3>
         <p className="text-gray-600 text-sm">
           De samenvatting geeft u een compleet overzicht van alle keuzes die u heeft gemaakt. 
           Dit helpt u om te controleren of alles correct is.
         </p>
       </div>
    </>
  ),
  // Add default or unknown state if needed
};

export function WizardStepInfo() {
  const pathname = usePathname();
  const step = pathname ? getStepInfoFromPathname(pathname) : { name: 'unknown', number: -1 }; 

  // Don't render info box if the step is unknown
  if (step.name === 'unknown') {
    return null; 
  }

  // Get content based on the step name (including 'bedrijventerrein')
  const content = stepInfoContent[step.name];

  if (!content) {
    return null; // No specific info defined for this step
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-even space-y-6">
      {content}
      {/* Optional: Common info box footer */}
      {step.name !== 'samenvatting' && (
         <div className="border-t pt-4 mt-6">
          <div className="flex items-center text-sm text-blue-600">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Deze informatie helpt bij het maken van keuzes</span>
          </div>
        </div>
      )}
    </div>
  );
} 