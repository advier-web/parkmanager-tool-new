/**
 * Domain models for the ParkManager Tool
 * These models represent the core business entities in our application
 */

import { Asset } from 'contentful';

// Bedrijfsterreinen-redenen
export interface BusinessParkReason {
  id: string;
  title: string;
  description: string;
  summary?: string;
  icon?: string;
  category?: string;
  identifier?: string; // Identifier die overeenkomt met veldnamen in MobilitySolution rating velden
}

// Mobiliteitsoplossingen
export interface MobilitySolution {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  samenvattingLang?: string;
  benefits?: string[];
  challenges?: string[];
  implementationTime?: string; // e.g., "kort", "middellang", "lang"
  costs?: string; // e.g., "laag", "middel", "hoog"
  category: string;
  icon?: string;
  
  // Implementation plan field
  implementatie?: string;
  
  // Nieuwe velden van Contentful
  paspoort?: string;
  collectiefVsIndiviueel?: string;
  uitvoeringsmogelijkheden?: string;
  governanceModels?: Array<{sys: {id: string}} | string>;
  governanceModelsMits?: Array<{sys: {id: string}} | string>;
  governanceModelsNietgeschikt?: Array<{sys: {id: string}} | string>;
  
  // Rechtsvorm velden
  geenRechtsvorm?: string;
  vereniging?: string;
  stichting?: string;
  ondernemersBiz?: string;
  vastgoedBiz?: string;
  gemengdeBiz?: string;
  cooperatieUa?: string;
  bv?: string;
  ondernemersfonds?: string;
  
  // Toelichting velden van Contentful
  parkeerBereikbaarheidsproblemenToelichting?: string;
  waardeVastgoedToelichting?: string;
  personeelszorgEnBehoudToelichting?: string;
  vervoerkostenToelichting?: string;
  gezondheidToelichting?: string;
  gastvrijheidToelichting?: string;
  imagoToelichting?: string;
  milieuverordeningToelichting?: string;
  bedrijfsverhuizingToelichting?: string;
  energiebalansToelichting?: string;
  
  // Extra velden
  pdfLink?: string;
  
  // Verwijderde velden:
  // gemeenteBijdrage?: string; 
  // effecten?: string;
  // provincieBijdrage?: string;
  // reizigerBijdrage?: string;
  // vastgoedBijdrage?: string; // Behoud deze voor nu
 // bedrijvenVervoervraag?: string; // Behoud deze voor nu

  // Score velden (teruggezet)
  parkeer_bereikbaarheidsproblemen?: number;
  gezondheid?: number;
  personeelszorg_en_behoud?: number;
  imago?: number;
  milieuverordening?: number;
  waarde_vastgoed?: number;
  vervoerkosten?: number;
  gastvrijheid?: number;
  bedrijfsverhuizing?: number;
  energiebalans?: number;

  // Type vervoer (teruggezet)
  typeVervoer?: TrafficType[];
}

// Governance modellen
export interface GovernanceModel {
  id: string;
  title: string;
  description: string;
  summary?: string;
  advantages: string[];
  disadvantages: string[];
  applicableScenarios: string[];
  organizationalStructure?: string;
  legalForm?: string;
  stakeholders?: string[];
  
  // Implementation plan fields
  samenvatting?: string;
  aansprakelijkheid?: string;
  benodigdhedenOprichting?: any; // Can be rich text, string, or string array
  doorlooptijd?: string; // Deprecated: wordt vervangen door doorlooptijdLang
  doorlooptijdLang?: string; // Nieuwe veldnaam van Contentful
  implementatie?: string;
  links?: any; // Can be rich text, string, or array
  voorbeeldContracten?: any[]; // Can be file assets or links
  
  // Rechtsvormen velden
  geenRechtsvorm?: string;
  vereniging?: string;
  stichting?: string;
  ondernemersBiz?: string;
  vastgoedBiz?: string;
  gemengdeBiz?: string;
  cooperatieUa?: string;
  bv?: string;
  ondernemersfonds?: string;
  
  // Extra velden
  rechtsvormBeschrijving?: string;
}

// Implementatieplan
export interface ImplementationPlan {
  id: string;
  title: string;
  description: string;
  phases: ImplementationPhase[];
  estimatedDuration: string;
  requiredResources: string[];
  keySuccessFactors: string[];
}

export interface ImplementationPhase {
  id: string;
  title: string;
  description: string;
  tasks: ImplementationTask[];
  duration: string;
}

export interface ImplementationTask {
  id: string;
  title: string;
  description: string;
  responsible: string[];
  duration: string;
}

// Wizard state
export interface WizardState {
  // Stap 0: Bedrijventerrein informatie
  businessParkInfo: BusinessParkInfo;
  currentGovernanceModelId: string | null;
  
  // Stap 1: Bedrijfsterrein-redenen
  selectedReasons: string[];
  
  // Stap 2: Mobiliteitsoplossingen  
  selectedSolutions: string[];
  
  // Stap 3: Governance modellen
  selectedGovernanceModel: string | null;
  
  // Stap 4: Implementatieplan
  selectedImplementationPlan: string | null;
  
  // Extra gegevens
  businessParkName: string;
  contactPerson: string;
  contactEmail: string;
}

// Nieuwe interface voor bedrijventerrein informatie
export interface BusinessParkInfo {
  numberOfCompanies: number;
  numberOfEmployees: number;
  trafficTypes: TrafficType[];
  
  // Locatiekenmerken
  carAccessibility?: 'slecht' | 'matig' | 'goed';
  trainAccessibility?: 'slecht' | 'matig' | 'goed';
  busAccessibility?: 'slecht' | 'matig' | 'goed';
  sufficientParking?: 'ja' | 'nee';
  averageDistance?: string;
}

// Verkeertype opties
export enum TrafficType {
  COMMUTER = 'woon-werkverkeer',
  BUSINESS = 'zakelijk verkeer',
  VISITOR = 'bezoekers verkeer'
}

// Website Collectief Vervoer - Homepage content
export interface WebsiteCollectiefVervoer {
  id: string;
  title?: string;
  inleiding: string;
  watIsCollectiefVervoer: string;
  aanleidingenVoorCollectieveVervoersoplossingen: string;
  overzichtCollectieveVervoersoplossingen: string;
  bestuurlijkeRechtsvormen: string;
  coverSubsidie: string;
  bestPractices: string;
} 