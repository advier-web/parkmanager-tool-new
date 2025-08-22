/**
 * Domain models for the ParkManager Tool
 * These models represent the core business entities in our application
 */

import { Entry, Asset as ContentfulAsset } from 'contentful';
import { Document as ContentfulDocumentType } from '@contentful/rich-text-types';

// Import the type we defined in store.ts
import { SelectedVariantMap } from '../lib/store';

// Bedrijfsterreinen-redenen
export interface BusinessParkReason {
  id: string;
  title: string;
  description: string;
  summary?: string;
  icon?: string;
  category?: string;
  identifier?: string; // Identifier die overeenkomt met veldnamen in MobilitySolution rating velden
  order?: number; // Added field for sorting order
  weight?: number; // Add optional weight property
}

/**
 * Represents a specific implementation variation of a mobility solution.
 */
export interface ImplementationVariation {
  id: string;
  title: string;
  mobiliteitsdienstVariantId?: string; // <-- ADDED: ID of the linked MobilitySolution
  samenvatting?: string | undefined; // Changed type back to string
  order?: number; // Sorting priority from Contentful (0 highest)
  investering?: string; // Transformed from Rich Text
  realisatieplan?: string; // Transformed from Rich Text
  vervolgstappen?: string; // New follow-up steps for summary page
  
  // New cost fields from Contentful
  geschatteJaarlijkseKosten?: string;
  geschatteKostenPerKmPp?: string;
  geschatteKostenPerRit?: string;

  // New qualitative comparison fields from Contentful
  controleEnFlexibiliteit?: string;
  maatwerk?: string;
  kostenEnSchaalvoordelen?: string;
  operationeleComplexiteit?: string;
  juridischeEnComplianceRisicos?: string;
  risicoVanOnvoldoendeGebruik?: string;
  
  governanceModels: Array<{ sys: { id: string } }>;
  governanceModelsMits: Array<{ sys: { id: string } }>;
  governanceModelsNietgeschikt: Array<{ sys: { id: string } }>;
  geenRechtsvorm?: string; // Transformed from Rich Text
  vereniging?: string; // Transformed from Rich Text
  stichting?: string; // Transformed from Rich Text
  ondernemersBiz?: string; // Transformed from Rich Text
  vastgoedBiz?: string; // Transformed from Rich Text
  gemengdeBiz?: string; // Transformed from Rich Text
  cooperatieUa?: string; // Transformed from Rich Text
  bv?: string; // Transformed from Rich Text
  ondernemersfonds?: string; // Transformed from Rich Text
  // New Realisatieplan fields
  realisatieplanLeveranciers?: string; // Assuming plain text
  realisatieplanContractvormen?: string; // Assuming plain text
  realisatieplanKrachtenveld?: string; // Assuming plain text
  realisatieplanVoorsEnTegens?: string; // Assuming plain text
  realisatieplanAandachtspunten?: string; // Assuming plain text
  realisatieplanChecklist?: string; // Assuming plain text
}

/**
 * Represents a mobility solution with potential implementation variations.
 */
export interface MobilitySolution {
  id: string;
  title: string;
  subtitle?: string;
  description?: string; // HTML string from Contentful Rich Text
  samenvattingKort?: string; // ADDED: Short summary, plain text or markdown
  samenvattingLang?: string; // HTML string from Contentful Rich Text
  implementatie?: string; // HTML string from Contentful Rich Text
  uitvoering?: string; // HTML string from Contentful Rich Text
  paspoort?: string; // HTML string from Contentful Rich Text
  investering?: string; // Generic investment info, specific is in variation
  collectiefVsIndiviueel?: string; // HTML string
  uitvoeringsmogelijkheden?: string; // HTML string (Consider if this moves to variation?)
  inputBusinesscase?: string; // HTML string
  casebeschrijving?: string; // ADDED: HTML string from Contentful Rich Text
  uitdagingenEnAanleidingen?: string; // ADDED: HTML string from Contentful Rich Text (alternative to challenges array)

  implementationTime?: string;
  costs?: string; // Generic costs info, specific is in variation
  category: string;
  icon?: string;
  benefits: string[];
  challenges: string[];
  implementatievarianten?: string[]; // List of variant names/types?

  // Link to specific variations
  implementationVariations?: ImplementationVariation[]; // Array of detailed variations

  pdfLink?: string;

  // Ratings / Scores
  parkeer_bereikbaarheidsproblemen?: number;
  bereikbaarheidsproblemen?: number;
  gezondheid?: number;
  personeelszorg_en_behoud?: number;
  imago?: number;
  milieuverordening?: number;
  waarde_vastgoed?: number;
  vervoerkosten?: number;
  gastvrijheid?: number;
  bedrijfsverhuizing?: number;
  energiebalans?: number;

  // Traffic types
  typeVervoer?: TrafficType[];

  // New fields from Contentful
  ophalen?: string[]; // Array of pickup options
  minimaleInvestering?: string; // Minimum investment required
  minimumAantalPersonen?: string; // Minimum number of people
  afstand?: string; // Distance information
  // Newly added fields in Contentful (MobilityService)
  moeilijkheidsgraad?: string; // Qualitative difficulty level
  doorlooptijd?: string; // Expected lead time
  wanneerRelevant?: string;
  schaalbaarheid?: string;
  impact?: string;
  ruimtebeslag?: string;
  afhankelijkheidExternePartijen?: string;

  // Toelichtingen (Explanations) - keep these if they are generic
  parkeerBereikbaarheidsproblemenToelichting?: string;
  bereikbaarheidsproblemenToelichting?: string; // Assuming this relates to the base solution
  waardeVastgoedToelichting?: string;
  personeelszorgEnBehoudToelichting?: string;
  vervoerkostenToelichting?: string;
  gezondheidToelichting?: string;
  gastvrijheidToelichting?: string;
  imagoToelichting?: string;
  milieuverordeningToelichting?: string;
  bedrijfsverhuizingToelichting?: string;
  energiebalansToelichting?: string;

  // Fields removed as they moved to ImplementationVariation:
  // governanceModels: Array<{ sys: { id: string } }>;
  // governanceModelsMits: Array<{ sys: { id: string } }>;
  // governanceModelsNietgeschikt: Array<{ sys: { id: string } }>;
  // geenRechtsvorm?: string;
  // vereniging?: string;
  // stichting?: string;
  // ondernemersBiz?: string;
  // vastgoedBiz?: string;
  // gemengdeBiz?: string;
  // cooperatieUa?: string;
  // bv?: string;
  // ondernemersfonds?: string;
  // rechtsvormBeschrijving?: string;
}

// Governance modellen
export interface GovernanceModel {
  id: string;
  title: string;
  description?: string; // Can be Rich Text -> HTML
  summary?: string; // Can be Rich Text -> HTML
  voordelen: string[];
  nadelen: string[];
  applicableScenarios: string[];
  organizationalStructure?: string;
  legalForm?: string;
  stakeholders: string[];
  samenvatting?: string; // Can be Rich Text -> HTML
  aansprakelijkheid?: string; // Can be Rich Text -> HTML
  benodigdhedenOprichting?: string[]; // Changed from any/string to string[]
  doorlooptijdLang?: string; // Can be Rich Text -> HTML
  implementatie?: string; // Can be Rich Text -> HTML
  links?: any; // Keep as any or refine
  voorbeeldContracten: string[]; // Array of URLs
  // rechtsvormBeschrijving?: string; // Assuming this specific description field is also moved/obsolete
}

// Implementatieplan (verwijderd)
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
  
  // Stap 4: Implementatieplan (verwijderd)
  selectedImplementationPlan: string | null;
  selectedVariants: SelectedVariantMap;
  
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
  employeePickupPreference?: 'thuis' | 'locatie' | null;
  
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

// Acquisition type enum
export enum AcquisitionType {
  PROCURE = 'inkopen',
  SELF_PURCHASE = 'zelf aanschaffen',
  UNKNOWN = 'onbekend'
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