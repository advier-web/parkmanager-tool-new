/**
 * Domain models for the ParkManager Tool
 * These models represent the core business entities in our application
 */

// Bedrijfsterreinen-redenen
export interface BusinessParkReason {
  id: string;
  title: string;
  description: string;
  summary?: string;
  icon?: string;
  category?: string;
}

// Mobiliteitsoplossingen
export interface MobilitySolution {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  challenges: string[];
  implementationTime: string; // e.g., "kort", "middellang", "lang"
  costs: string; // e.g., "laag", "middel", "hoog"
  category: string;
  icon?: string;
}

// Governance modellen
export interface GovernanceModel {
  id: string;
  title: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  applicableScenarios: string[];
  organizationalStructure?: string;
  legalForm?: string;
  stakeholders?: string[];
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
}

// Verkeertype opties
export enum TrafficType {
  COMMUTER = 'woon-werkverkeer',
  BUSINESS = 'zakelijk verkeer',
  VISITOR = 'bezoekers verkeer'
} 