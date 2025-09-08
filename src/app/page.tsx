'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebsiteCollectiefVervoer, useMobilitySolutions, useGovernanceModels } from '../hooks/use-domain-models';
import { SiteHeader } from '../components/site-header';
import { MarkdownContent } from '../components/markdown-content';
import { MobilityServiceAccordion } from '../components/mobility-service-accordion';
import { GovernanceModelsSection } from '../components/governance-models-section';
import { BusinessParkReasonsSection } from '../components/business-park-reasons-section';
import Link from 'next/link';
import Image from 'next/image';
import { MobilityServiceButton } from '../components/mobility-service-button';

interface SectionRef {
  id: string;
  title: string;
}

export default function Home() {
  const { data, isLoading, error } = useWebsiteCollectiefVervoer();
  const { 
    data: mobilityServices, 
    isLoading: isLoadingServices, 
    error: servicesError 
  } = useMobilitySolutions();
  const {
    data: governanceModels,
    isLoading: isLoadingGovernance,
    error: governanceError
  } = useGovernanceModels();
  
  // State voor de sticky navigatie
  // const [showStickyNav, setShowStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('wat-is-collectief-vervoer');
  const tocRef = useRef<HTMLDivElement>(null);
  
  // Effect om actieve sectie te bepalen (logica voor showStickyNav verwijderd)
  useEffect(() => {
    const handleScroll = () => {
      // Verwijder logica voor tocRef.current check voor sticky nav
      // if (tocRef.current) { ... }
      
      // Bepaal welke sectie actief is (deze logica blijft)
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 200;
      let currentSection = 'wat-is-collectief-vervoer';
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionId = section.getAttribute('id') || '';
        if (scrollPosition >= sectionTop) {
          currentSection = sectionId;
        }
      });
      setActiveSection(currentSection);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Define sections for navigation
  const sections: SectionRef[] = [
    { id: 'wat-is-collectief-vervoer', title: 'Wat is gedeeld vervoer?' },
    { id: 'overzicht', title: 'Soorten gedeelde vervoersopties' },
    { id: 'bestuursvormen', title: 'Organisatiestructuren' },
    { id: 'subsidie', title: 'Subsidies' },
    // { id: 'best-practices', title: 'Succesverhalen' }
  ];
  
  // Scroll to section when clicking anchor link
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Laden...</p>
        </div>
      </>
    );
  }
  
  if (error || !data) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p>{error?.message || 'Er is een fout opgetreden bij het laden van de content.'}</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="container mx-auto max-w-5xl px-4 py-8 pt-16 w-full">
        <div className="mb-4">
          <h1 className="text-4xl font-bold">Samenwerken aan slimme vervoersoplossingen</h1>
        </div>
        
        <div className="prose prose-lg max-w-none mb-10 text-lg font-semibold">
          <MarkdownContent content={data.inleiding} />
        </div>
        
        {/* Actieknoppen */}
        <div className="flex flex-col sm:flex-row justify-start gap-4 mb-12">
          <Link 
            href="/wizard"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-md text-center font-medium transition-colors sm:flex-initial"
          >
            Start de tool
          </Link>
          
          <button
            onClick={() => scrollToSection('wat-is-collectief-vervoer')}
            className="bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 py-2 px-5 rounded-md text-center font-medium transition-colors flex items-center justify-center gap-2 sm:flex-initial"
          >
            Lees verder
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>
        
        {/* Op deze pagina sectie */}
        <div ref={tocRef} className="bg-gray-50 p-6 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-4">Op deze pagina:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {sections.slice(0, Math.ceil(sections.length / 2)).map((section) => (
              <div key={section.id} className="flex items-start">
                <span className="text-blue-600 mr-2 flex-shrink-0">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M19 14L12 21L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M19 7L12 14L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                </span>
                <button 
                  onClick={() => scrollToSection(section.id)}
                  className={`text-blue-600 hover:underline text-left ${activeSection === section.id ? 'font-bold' : 'font-medium'}`}
                >
                  {section.title}
                </button>
              </div>
            ))}
            {sections.slice(Math.ceil(sections.length / 2)).map((section) => (
              <div key={section.id} className="flex items-start">
                <span className="text-blue-600 mr-2 flex-shrink-0">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M19 14L12 21L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M19 7L12 14L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                </span>
                <button 
                  onClick={() => scrollToSection(section.id)}
                  className={`text-blue-600 hover:underline text-left ${activeSection === section.id ? 'font-bold' : 'font-medium'}`}
                >
                  {section.title}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content sections */}
        <section id="wat-is-collectief-vervoer" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Wat is gedeeld vervoer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="prose prose-lg max-w-none [&_h2]:mt-10">
                <MarkdownContent content={data.watIsCollectiefVervoer} />
              </div>
              <div className="mt-6">
                <Link 
                  href="/wizard"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-md text-center font-medium transition-colors inline-block"
                >
                  Start de tool
                </Link>
              </div>
            </div>
            <figure className="m-0">
              <Image 
                src="/bol%20pendeldienst%20shuttle2.jpg"
                alt="Pendelbusjes van Shuttle2 die medewerkers van en naar het hoofdkantoor van Bol in Utrecht vervoeren"
                width={1200}
                height={800}
                className="rounded-lg w-full h-auto object-cover shadow-sm"
                priority
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Pendelbusjes van Shuttle2 die medewerkers van en naar het hoofdkantoor van Bol in Utrecht vervoeren
              </figcaption>
            </figure>
          </div>
        </section>
        
        <section id="overzicht" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Soorten gedeelde vervoersopties</h2>
          <MarkdownContent content={data.overzichtCollectieveVervoersoplossingen} />
          
          {isLoadingServices && (
            <div className="py-4 text-center">
              <p>Oplossingen worden geladen...</p>
            </div>
          )}
          
          {servicesError && (
            <div className="py-4 px-4 bg-red-50 text-red-700 rounded-md my-4">
              <p>Fout bij het laden van de oplossingen</p>
            </div>
          )}
          
          {mobilityServices && mobilityServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {mobilityServices.map(service => (
                <MobilityServiceButton key={service.id} solution={service} />
              ))}
            </div>
          )}
          
          {mobilityServices && mobilityServices.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              <p>Geen collectieve vervoersoplossingen gevonden</p>
            </div>
          )}
        </section>
        
        <section id="bestuursvormen" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Organisatiestructuren</h2>
          <MarkdownContent content={data.bestuurlijkeRechtsvormen} />
          
          {isLoadingGovernance && (
            <div className="py-4 text-center">
              <p>Bestuursvormen worden geladen...</p>
            </div>
          )}
          
          {governanceError && (
            <div className="py-4 px-4 bg-red-50 text-red-700 rounded-md my-4">
              <p>Fout bij het laden van de bestuursvormen</p>
            </div>
          )}
          
          {governanceModels && governanceModels.length > 0 && (
            <div className="mt-6">
              <GovernanceModelsSection 
                governanceModels={governanceModels} 
                title="" 
              />
            </div>
          )}
          
          {governanceModels && governanceModels.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              <p>Geen bestuursvormen gevonden</p>
            </div>
          )}
        </section>
        
        <section id="subsidie" className="mb-16 pb-8 border-b border-gray-200">
          <div id="cover-subsidie" className="bg-white rounded-lg p-8 shadow-even">
            <h2 className="text-2xl font-bold mb-4">Subsidie: COVER (Collectieven mkb Verduurzaming Reisgedrag)</h2>
            <p className="text-gray-700 mb-4">De COVER subsidie is bedoeld voor organisaties die het mkb vertegenwoordigen, zoals parkmanagers. Met behulp van de subsidie kunnen stappen gezet worden naar blijvend duurzaam reisgedrag van werknemers. De subsidie dekt maximaal 75% van de kosten van het project waar de subsidie voor is aangevraagd, met een maximumbedrag van €100.000.
            Er zitten een aantal voorwaarden aan het aanvragen van de COVER subsidie.</p>
            <div className="space-y-3 text-gray-800">                
              <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                <summary className="font-medium cursor-pointer select-none">Uw organisatie...</summary>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                  <li>Treedt op namens een groep werkgever.</li>
                  <li>Is een rechtspersoon.</li>
                  <li>Vertegenwoordigt het mkb - uw achterban bestaat voor minimaal 50% uit werkgevers met minder dan 250 werknemers.</li>
                  <li>Vraagt minimaal € 10.000 aan voor uw project of activiteit.</li>
                  <li>Heeft de afgelopen 3 jaar maximaal € 300.000 De-minimissteun (staatssteun) ontvangen.</li>
                </ul>
              </details>
              <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                <summary className="font-medium cursor-pointer select-none">Uw project of activiteit...</summary>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                  <li>Richt zich op het wegnemen van belemmeringen bij de uitvoer van duurzame werkmobiliteit van werknemers.</li>
                  <li>Vraagt per kilogram bespaarde CO2 niet meer dan € 0,75 subsidie.</li>
                  <li>Heeft een berekening hoeveel kilogram CO2 u ermee vermindert.</li>
                  <li>Heeft een structureel, blijvend resultaat.</li>
                  <li>Is omschreven in het verplichte format van het projectplan.</li>
                  <li>Heeft een begroting.</li>
                  <li>Is afgerond binnen 24 maanden nadat uw subsidie is toegekend.</li>
                </ul>
              </details>
              <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                <summary className="font-medium cursor-pointer select-none">Aan te leveren documenten</summary>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                  <p>Voor de aanvraag van de subsidie dient u de volgende documenten ingevuld aan te leveren:</p>
                  <li>Projectplan COVER</li>
                  <li>Berekening CO2-besparing COVER</li>
                  <li>Onderbouwing voor blijvend resultaat</li>
                  <li>Modelbegroting project/activiteiten</li>
                  <li>
                    Voor al deze benodigdheden kunt u formats vinden op de{' '}
                    <a
                      className="text-blue-600 underline"
                      href="https://www.rvo.nl/subsidies-financiering/cover#uw-aanvraag-voorbereiden"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      website van de RVO
                    </a>
                    .
                  </li>
                </ul>
              </details>
            </div>
           
            {/* Aanvraag voorbereiden */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-gray-800">
              <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
                <summary className="font-medium cursor-pointer select-none">Aanvraag voorbereiden</summary>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                  <li>eHerkenning niveau 2+ (reken op 1–5 werkdagen); intermediair kan namens u aanvragen.</li>
                  <li>Gegevens aanvrager: naam, adres, wettelijk vertegenwoordiger en KvK-nummer.</li>
                  <li>De-minimisverklaring over ontvangen steun in de afgelopen 3 jaar.</li>
                  <li>Projectplan met doel, activiteiten, blijvend resultaat en onderbouwde CO₂-berekening (max € 0,75 subsidie per bespaarde kg CO₂).</li>
                  <li>Gespecificeerde begroting (kostenposten en onderbouwing).</li>
                </ul>
              </details>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Meer informatie en actuele voorwaarden: <a className="text-blue-600 underline" href="https://www.rvo.nl/subsidies-financiering/cover" target="_blank" rel="noreferrer noopener">RVO – COVER</a>.</p>
              <p className="mt-2">Na verlening keert RVO doorgaans 90% voorschot uit; voor projecten &gt; 1 jaar en &gt; € 25.000 is tussentijdse voortgangsrapportage verplicht. Na afloop volgt vaststelling en een prestatieverklaring.</p>
            </div>
          </div>
        </section>
        
        {/* <section id="best-practices" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Best practices</h2>
          <MarkdownContent content={data.bestPractices} />
        </section> */}
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Klaar om te beginnen?</h2>
          <p className="mb-4">
            Start de tool om een stappenplan op maat te maken voor collectieve vervoersoplossingen op uw bedrijventerrein.
          </p>
          <Link 
            href="/wizard" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md inline-block transition-colors"
          >
            Start de tool
          </Link>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8 mt-auto w-full">
        <div className="container mx-auto max-w-5xl px-4">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} ParkManager Tool - Alle rechten voorbehouden
          </p>
        </div>
      </footer>
    </div>
  );
}
