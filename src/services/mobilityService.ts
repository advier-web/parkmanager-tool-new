import { getMobilitySolutionForPdf as getContentfulMobilitySolution } from '@/services/contentful-service';
import { MobilitySolution, GovernanceModel } from '../types/mobilityTypes';
import { getGovernanceModelByIdFromContentful } from '@/services/contentful-service';

// Verzamel mobiliteitsoplossing data voor een pdf
export const getMobilitySolutionForPdf = async (mobilityServiceId: string): Promise<MobilitySolution> => {
  const data = await getContentfulMobilitySolution(mobilityServiceId);
  
  // Debug log rechtsvorm fields that come from Contentful
  console.log('[PDF SERVICE] Rechtsvorm fields from Contentful:', {
    geenRechtsvorm: data.geenRechtsvorm ? 'present' : 'missing',
    vereniging: data.vereniging ? 'present' : 'missing',
    stichting: data.stichting ? 'present' : 'missing',
    ondernemersBiz: data.ondernemersBiz ? 'present' : 'missing',
    vastgoedBiz: data.vastgoedBiz ? 'present' : 'missing',
    gemengdeBiz: data.gemengdeBiz ? 'present' : 'missing',
    cooperatieUa: data.cooperatieUa ? 'present' : 'missing',
    bv: data.bv ? 'present' : 'missing',
    ondernemersfonds: data.ondernemersfonds ? 'present' : 'missing'
  });
  
  // Map de governance models naar het juiste type als ze bestaan
  const mappedGovernanceModels = data.governanceModels?.map(model => {
    if (typeof model === 'string') {
      return model;
    }
    // Zorg dat de object structuur overeenkomt met GovernanceModel in mobilityTypes
    return model as unknown as GovernanceModel;
  });
  
  // Map de governanceModelsMits naar het juiste type als ze bestaan
  const mappedGovernanceModelsMits = data.governanceModelsMits?.map(model => {
    if (typeof model === 'string') {
      return model;
    }
    // Zorg dat de object structuur overeenkomt met GovernanceModel in mobilityTypes
    return model as unknown as GovernanceModel;
  });
  
  // Map de governanceModelsNietgeschikt naar het juiste type als ze bestaan
  const mappedGovernanceModelsNietgeschikt = data.governanceModelsNietgeschikt?.map(model => {
    if (typeof model === 'string') {
      return model;
    }
    // Zorg dat de object structuur overeenkomt met GovernanceModel in mobilityTypes
    return model as unknown as GovernanceModel;
  });
  
  // Ensure rechtsvorm fields have default values if they're missing
  const rechtsvormDefaults = {
    geenRechtsvorm: "Geen specifieke rechtsvorm nodig voor dit model. Geschikt voor informele samenwerkingen tussen partijen.",
    vereniging: "Een bedrijvenvereniging is een samenwerkingsverband waarin bedrijven op een bedrijventerrein gezamenlijk hun belangen behartigen. De vereniging biedt een formele structuur waarin leden inspraak hebben en collectieve acties kunnen ondernemen.",
    stichting: "Een stichting is een rechtspersoon met een bestuur maar zonder leden, opgericht om een in de statuten vermeld doel te realiseren. Geschikt voor het beheren van gemeenschappelijke voorzieningen.",
    ondernemersBiz: "De Ondernemers BIZ is een publiek-private samenwerking waarbij ondernemers én vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame mobiliteitsmaatregelen.",
    vastgoedBiz: "De Vastgoed BIZ is een publiek-private samenwerking waarbij vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame investeringen.",
    gemengdeBiz: "De Gemengde BIZ is een publiek-private samenwerking waarbij ondernemers én vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame mobiliteitsmaatregelen.",
    cooperatieUa: "Met een Coöperatie met uitgesloten aansprakelijkheid (UA) organiseren bedrijven op een bedrijventerrein gezamenlijk mobiliteitsoplossingen. De leden beslissen samen, delen de kosten en zijn niet persoonlijk aansprakelijk voor eventuele tekorten.",
    bv: "Een besloten vennootschap (BV) is een rechtsvorm voor bedrijvencollectieven die gezamenlijk mobiliteitsoplossingen willen organiseren. Deze structuur biedt eigendomsverhoudingen, beperkte aansprakelijkheid en ruimte voor een flexibele organisatie.",
    ondernemersfonds: "Een ondernemersfonds is een financiële regeling waarin bedrijven binnen een afgebakend gebied gezamenlijk bijdragen aan de verbetering van hun bedrijfsomgeving. De bijdragen worden geheven via een opslag op de onroerendezaakbelasting (OZB) of rioolheffing."
  };
  
  // Controleer of rechtsvorm teksten leeg of undefined zijn en gebruik standaardwaarden indien nodig
  const ensureRechtsvormText = (fieldName: keyof typeof rechtsvormDefaults): string => {
    let value: any;
    
    // Explicitly check for each field
    switch(fieldName) {
      case 'geenRechtsvorm': 
        value = data.geenRechtsvorm; 
        break;
      case 'vereniging': 
        value = data.vereniging; 
        break;
      case 'stichting': 
        value = data.stichting; 
        break;
      case 'ondernemersBiz': 
        value = data.ondernemersBiz; 
        break;
      case 'vastgoedBiz': 
        value = data.vastgoedBiz; 
        break;
      case 'gemengdeBiz': 
        value = data.gemengdeBiz; 
        break;
      case 'cooperatieUa': 
        value = data.cooperatieUa; 
        break;
      case 'bv': 
        value = data.bv; 
        break;
      case 'ondernemersfonds': 
        value = data.ondernemersfonds; 
        break;
      default:
        value = undefined;
    }
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      console.log(`[PDF SERVICE] Using default value for ${fieldName}`);
      return rechtsvormDefaults[fieldName];
    }
    return String(value);
  };
  
  // Aanvullen met verplichte velden uit onze specifieke PDF interface
  return {
    ...data,
    slug: data.title?.toLowerCase().replace(/[^\w\s-]/g, '-').replace(/\s+/g, '-') || mobilityServiceId,
    governanceModels: mappedGovernanceModels,
    governanceModelsMits: mappedGovernanceModelsMits,
    governanceModelsNietgeschikt: mappedGovernanceModelsNietgeschikt,
    
    // Ensure all rechtsvorm fields are present with fallbacks
    geenRechtsvorm: ensureRechtsvormText('geenRechtsvorm'),
    vereniging: ensureRechtsvormText('vereniging'),
    stichting: ensureRechtsvormText('stichting'),
    ondernemersBiz: ensureRechtsvormText('ondernemersBiz'),
    vastgoedBiz: ensureRechtsvormText('vastgoedBiz'),
    gemengdeBiz: ensureRechtsvormText('gemengdeBiz'),
    cooperatieUa: ensureRechtsvormText('cooperatieUa'),
    bv: ensureRechtsvormText('bv'),
    ondernemersfonds: ensureRechtsvormText('ondernemersfonds')
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
    // effecten: "De implementatie van deze mobiliteitsoplossing leidt tot de volgende effecten:\n\n# Verkeersstromen\n\n* 15-20% reductie in piekuurcongestie\n* Betere spreiding van verkeer over beschikbare routes\n* Verminderde parkeerdruk in het centrum\n\n# Duurzaamheid\n\n* 10-15% reductie in CO2-uitstoot gerelateerd aan vervoer\n* Verhoogd gebruik van duurzame vervoersopties\n* Verbeterde luchtkwaliteit in stadscentra",
    costs: "De initiële investering voor deze oplossing bestaat uit:\n\n* Ontwikkeling van het platform: €150.000 - €200.000\n* Implementatie en integratie: €50.000 - €75.000\n* Jaarlijkse operationele kosten: €75.000 - €100.000\n\nDe ROI wordt geschat op 3-5 jaar, afhankelijk van de schaal van implementatie en gebruikersadoptie.",
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
    governanceModelsMits: [
      {
        title: "Vereniging",
        description: "Een formele vereniging van bedrijven die gezamenlijk mobiliteitsdiensten aanbieden."
      },
      {
        title: "Stichting",
        description: "Een non-profit stichting die mobiliteitsoplossingen faciliteert en beheert."
      }
    ],
    governanceModelsNietgeschikt: [
      {
        title: "Ondernemersfonds",
        description: "Een financieringsmodel waarbij bijdragen via belastingen worden geïnd."
      }
    ],
    
    // Rechtsvorm velden
    geenRechtsvorm: "Geen formele rechtsvorm vereist voor dit model. Geschikt voor informele samenwerkingen tussen partijen.",
    vereniging: "Een bedrijvenvereniging is een samenwerkingsverband waarin bedrijven op een bedrijventerrein gezamenlijk hun belangen behartigen. De vereniging biedt een formele structuur waarin leden inspraak hebben en collectieve acties kunnen ondernemen.",
    stichting: "Een stichting is een rechtspersoon met een bestuur maar zonder leden, opgericht om een in de statuten vermeld doel te realiseren. Geschikt voor het beheren van gemeenschappelijke voorzieningen.",
    ondernemersBiz: "De Ondernemers BIZ is een publiek-private samenwerking waarbij ondernemers én vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame mobiliteitsmaatregelen.",
    vastgoedBiz: "De Vastgoed BIZ is een publiek-private samenwerking waarbij vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame investeringen.",
    gemengdeBiz: "De Gemengde BIZ is een publiek-private samenwerking waarbij ondernemers én vastgoedeigenaren verplicht financieel bijdragen aan gezamenlijke voorzieningen. Deze rechtsvorm biedt een stabiele en wettelijk basis voor duurzame mobiliteitsmaatregelen.",
    cooperatieUa: "Met een Coöperatie met uitgesloten aansprakelijkheid (UA) organiseren bedrijven op een bedrijventerrein gezamenlijk mobiliteitsoplossingen. De leden beslissen samen, delen de kosten en zijn niet persoonlijk aansprakelijk voor eventuele tekorten.",
    bv: "Een besloten vennootschap (BV) is een rechtsvorm voor bedrijvencollectieven die gezamenlijk mobiliteitsoplossingen willen organiseren. Deze structuur biedt eigendomsverhoudingen, beperkte aansprakelijkheid en ruimte voor een flexibele organisatie.",
    ondernemersfonds: "Een ondernemersfonds is een financiële regeling waarin bedrijven binnen een afgebakend gebied gezamenlijk bijdragen aan de verbetering van hun bedrijfsomgeving. De bijdragen worden geheven via een opslag op de onroerendezaakbelasting (OZB) of rioolheffing."
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

