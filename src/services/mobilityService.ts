import { getMobilitySolutionForPdf as getContentfulMobilitySolution } from '@/services/contentful-service';
import { MobilitySolution, GovernanceModel } from '../types/mobilityTypes';
import { getGovernanceModelByIdFromContentful } from '@/services/contentful-service';

// Verzamel mobiliteitsoplossing data voor een pdf
export const getMobilitySolutionForPdf = async (mobilityServiceId: string): Promise<MobilitySolution> => {
  const data = await getContentfulMobilitySolution(mobilityServiceId);
  
  // Map de governance models naar het juiste type als ze bestaan
  const mappedGovernanceModels = data.governanceModels?.map(model => {
    if (typeof model === 'string') {
      return model;
    }
    // Zorg dat de object structuur overeenkomt met GovernanceModel in mobilityTypes
    return model as unknown as GovernanceModel;
  });
  
  // Aanvullen met verplichte velden uit onze specifieke PDF interface
  return {
    ...data,
    slug: data.title?.toLowerCase().replace(/[^\w\s-]/g, '-').replace(/\s+/g, '-') || mobilityServiceId,
    governanceModels: mappedGovernanceModels
  };
};

// Verzamel governance model data voor een pdf
export const getGovernanceModelForPdf = async (governanceModelId: string): Promise<GovernanceModel> => {
  const data = await getGovernanceModelByIdFromContentful(governanceModelId);
  
  if (!data) {
    throw new Error(`Geen governance model gevonden met ID: ${governanceModelId}`);
  }
  
  // Zorg dat alle velden beschikbaar zijn voor de PDF
  return {
    ...data,
    title: data.title || '',
    description: data.description || '',
    aansprakelijkheid: data.aansprakelijkheid || '',
    advantages: data.advantages || [],
    disadvantages: data.disadvantages || [],
    benodigdhedenOprichting: Array.isArray(data.benodigdhedenOprichting) ? data.benodigdhedenOprichting : [data.benodigdhedenOprichting].filter(Boolean),
    links: Array.isArray(data.links) ? data.links : [data.links].filter(Boolean),
    doorlooptijdLang: data.doorlooptijdLang || data.doorlooptijd || '',
    implementatie: data.implementatie || ''
  };
};

// Mock data om de PDF functionaliteit te testen zonder Contentful
export const getMobilitySolutionForPdfMock = async (): Promise<MobilitySolution> => {
  // In een echte implementatie haal je deze data van Contentful
  // Bijvoorbeeld: const response = await contentfulClient.getEntry(id);
  // return transformContentfulResponse(response);
  
  // Voor nu gebruiken we mock data
  return {
    title: "Slimme Mobiliteitsoplossing",
    slug: "slimme-mobiliteitsoplossing",
    coverImage: "",
    paspoort: "Type: Mobiliteitsoplossing\nDoelgroep: Bewoners en bezoekers\nImplementatiesnelheid: Middellang\nKosten: €€",
    description: "**Slimme mobiliteitsoplossing** is een innovatieve aanpak om vervoer in stedelijke gebieden efficiënter te maken.\n\nHet systeem maakt gebruik van realtime data om vervoersbewegingen te optimaliseren en congestie te verminderen. Door middel van een geïntegreerd platform kunnen gebruikers de beste vervoersopties kiezen op basis van tijd, kosten en milieu-impact.\n\n# Belangrijke kenmerken\n\n* Realtime verkeersinformatie\n* Multimodale reisplanning\n* Gebruiksvriendelijke mobiele applicatie\n* Integratie met openbaar vervoer",
    collectiefVsIndiviueel: "Deze oplossing biedt zowel collectieve als individuele voordelen:\n\n**Collectieve voordelen:**\n* Verminderde verkeerscongestie in de stad\n* Lagere CO2-uitstoot door efficiënter vervoer\n* Betere benutting van bestaande infrastructuur\n\n**Individuele voordelen:**\n* Tijdsbesparing door optimale routeplanning\n* Kostenbesparing door efficiënte vervoerskeuzes\n* Verbeterde reiservaring met minder stress",
    effecten: "De implementatie van deze mobiliteitsoplossing leidt tot de volgende effecten:\n\n# Verkeersstromen\n\n* 15-20% reductie in piekuurcongestie\n* Betere spreiding van verkeer over beschikbare routes\n* Verminderde parkeerdruk in het centrum\n\n# Duurzaamheid\n\n* 10-15% reductie in CO2-uitstoot gerelateerd aan vervoer\n* Verhoogd gebruik van duurzame vervoersopties\n* Verbeterde luchtkwaliteit in stadscentra",
    investering: "De initiële investering voor deze oplossing bestaat uit:\n\n* Ontwikkeling van het platform: €150.000 - €200.000\n* Implementatie en integratie: €50.000 - €75.000\n* Jaarlijkse operationele kosten: €75.000 - €100.000\n\nDe ROI wordt geschat op 3-5 jaar, afhankelijk van de schaal van implementatie en gebruikersadoptie.",
    implementatie: "Het implementatietraject verloopt in de volgende fasen:\n\n## Fase 1: Voorbereiding (3-6 maanden)\n* Stakeholderanalyse en betrokkenheid\n* Technische specificaties definiëren\n* Partnerschappen met vervoersaanbieders opzetten\n\n## Fase 2: Ontwikkeling (6-9 maanden)\n* Platform ontwikkeling\n* Integratie met bestaande systemen\n* Gebruikerstesten en feedback\n\n## Fase 3: Uitrol (3-6 maanden)\n* Pilotprogramma in geselecteerde gebieden\n* Training voor gebruikers en beheerders\n* Volledige implementatie en marketing\n\n## Fase 4: Optimalisatie (doorlopend)\n* Monitoring van prestaties\n* Dataverzameling en analyse\n* Incrementele verbeteringen",
    governanceModels: [
      {
        title: "Publiek-Private Samenwerking",
        description: "Een samenwerkingsmodel waarbij de gemeente de leiding neemt maar nauw samenwerkt met private mobiliteitsaanbieders.\n\n**Kenmerken:**\n* Gedeelde investeringen en risico's\n* Duidelijke verdeling van verantwoordelijkheden\n* Combinatie van publieke doelen en private efficiëntie"
      },
      {
        title: "Coöperatief Model",
        description: "Een gebruikersgestuurd model waarbij eindgebruikers mede-eigenaar zijn van de mobiliteitsoplossing.\n\n**Kenmerken:**\n* Directe invloed van gebruikers op besluitvorming\n* Eerlijke verdeling van kosten en baten\n* Sterke focus op gemeenschapsbelangen"
      }
    ],
    governancemodellenToelichting: "De keuze voor een governance model hangt af van verschillende factoren zoals:\n\n* Beschikbare financiële middelen\n* Lokale politieke context\n* Bestaande samenwerkingsverbanden\n* Gebruikersbereidheid om te participeren\n\nVoor kleinere gemeenten is het coöperatieve model vaak geschikter, terwijl grotere steden meestal meer baat hebben bij het publiek-private samenwerkingsmodel vanwege de complexiteit en schaal."
  };
};

// Mock data voor een governance model voor testing
export const getMockGovernanceModelForPdf = async (): Promise<GovernanceModel> => {
  return {
    title: "Coöperatief Model",
    description: "Een gebruikersgestuurd model waarbij eindgebruikers mede-eigenaar zijn van de mobiliteitsoplossing.",
    aansprakelijkheid: "De aansprakelijkheid wordt gedeeld door alle leden van de coöperatie.",
    advantages: [
      "Directe invloed van gebruikers op besluitvorming",
      "Eerlijke verdeling van kosten en baten",
      "Sterke focus op gemeenschapsbelangen"
    ],
    disadvantages: [
      "Vereist actieve betrokkenheid van leden",
      "Besluitvorming kan langzamer verlopen",
      "Kan moeilijker zijn om financiering aan te trekken"
    ],
    benodigdhedenOprichting: [
      "Oprichtingsakte",
      "Statuten",
      "Ledenregister",
      "Bestuursstructuur"
    ],
    links: [
      "https://example.com/cooperatieve-modellen",
      "https://example.com/mobiliteit-cooperatie"
    ],
    doorlooptijdLang: "De gemiddelde doorlooptijd voor het opzetten van een coöperatief model is 6-12 maanden.",
    implementatie: "Het implementatietraject verloopt in vier fasen: initiatie, formalisatie, operationalisatie, en evaluatie."
  };
};

