'use client';

import { useState, useEffect } from 'react';
import { useWebsiteCollectiefVervoer, useMobilitySolutions, useGovernanceModels } from '../hooks/use-domain-models';
import { SiteHeader } from '../components/site-header';
import { MarkdownContent } from '../components/markdown-content';
import { MobilityServiceAccordion } from '../components/mobility-service-accordion';
import { GovernanceModelsSection } from '../components/governance-models-section';
import Link from 'next/link';

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
  
  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Samenwerken in collectieve vervoersoplossingen',
        text: 'Bekijk deze informatie over samenwerken in collectieve vervoersoplossingen',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link gekopieerd naar klembord!'))
        .catch((error) => console.log('Error copying to clipboard:', error));
    }
  };
  
  // Define sections for navigation
  const sections: SectionRef[] = [
    { id: 'wat-is-collectief-vervoer', title: 'Wat is collectief vervoer?' },
    { id: 'aanleidingen', title: 'Aanleidingen voor collectieve vervoersoplossingen' },
    { id: 'overzicht', title: 'Overzicht collectieve vervoersoplossingen' },
    { id: 'bestuursvormen', title: 'Bestuurlijke rechtsvormen' },
    { id: 'subsidie', title: 'COVER subsidie' },
    { id: 'best-practices', title: 'Best practices' }
  ];
  
  // Scroll to section when clicking anchor link
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    <>
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-8 pt-16">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-bold">Samenwerken in collectieve vervoersoplossingen</h1>
          <button 
            onClick={handleShare}
            className="flex items-center text-blue-600 hover:text-blue-800"
            aria-label="Deel deze pagina"
          >
            <span className="mr-2">Deel</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
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
            Start de wizard
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
        <div className="bg-gray-50 p-6 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-4">Op deze pagina:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {sections.map((section) => (
              <div key={section.id} className="flex items-start">
                <span className="text-blue-600 mr-2 flex-shrink-0">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M19 14L12 21L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M19 7L12 14L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                </span>
                <button 
                  onClick={() => scrollToSection(section.id)}
                  className="text-blue-600 hover:underline text-left font-medium"
                >
                  {section.title}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content sections */}
        <section id="wat-is-collectief-vervoer" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Wat is collectief vervoer?</h2>
          <MarkdownContent content={data.watIsCollectiefVervoer} />
        </section>
        
        <section id="aanleidingen" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Aanleidingen voor collectieve vervoersoplossingen</h2>
          <MarkdownContent content={data.aanleidingenVoorCollectieveVervoersoplossingen} />
        </section>
        
        <section id="overzicht" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Overzicht collectieve vervoersoplossingen</h2>
          <MarkdownContent content={data.overzichtCollectieveVervoersoplossingen} />
          
          {isLoadingServices && (
            <div className="py-4 text-center">
              <p>Oplossingen worden geladen...</p>
            </div>
          )}
          
          {servicesError && (
            <div className="py-4 px-4 bg-red-50 text-red-700 rounded-md my-4">
              <p>Fout bij het laden van de vervoersoplossingen</p>
            </div>
          )}
          
          {mobilityServices && mobilityServices.length > 0 && (
            <div className="mt-6">
              <div className="space-y-2">
                {mobilityServices.map(service => (
                  <MobilityServiceAccordion key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}
          
          {mobilityServices && mobilityServices.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              <p>Geen collectieve vervoersoplossingen gevonden</p>
            </div>
          )}
        </section>
        
        <section id="bestuursvormen" className="mb-16 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Bestuurlijke rechtsvormen</h2>
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
          <h2 className="text-2xl font-bold mb-6">COVER subsidie</h2>
          <MarkdownContent content={data.coverSubsidie} />
        </section>
        
        <section id="best-practices" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Best practices</h2>
          <MarkdownContent content={data.bestPractices} />
        </section>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Klaar om te beginnen?</h2>
          <p className="mb-4">
            Start de wizard om een stappenplan op maat te maken voor collectieve vervoersoplossingen op uw bedrijventerrein.
          </p>
          <Link 
            href="/wizard" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md inline-block transition-colors"
          >
            Start de wizard
          </Link>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto max-w-5xl px-4">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} ParkManager Tool - Alle rechten voorbehouden
          </p>
        </div>
      </footer>
    </>
  );
}
