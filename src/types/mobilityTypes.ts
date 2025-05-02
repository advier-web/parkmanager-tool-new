export interface GovernanceModel {
  title: string;
  description: unknown;
  sys?: { id: string };
  id?: string;
  summary?: string;
  advantages: unknown;
  disadvantages: unknown;
  applicableScenarios?: string[];
  organizationalStructure?: string;
  legalForm?: string;
  stakeholders?: string[];
  samenvatting?: string;
  aansprakelijkheid?: string;
  benodigdhedenOprichting?: unknown;
  doorlooptijd?: string;
  doorlooptijdLang?: string;
  implementatie?: string;
  links?: any;
  voorbeeldContracten?: any[];
}

export interface MobilitySolution {
  title: string;
  slug: string;
  coverImage?: string;
  paspoort?: any;
  description?: string;
  collectiefVsIndiviueel?: string;
  // effecten?: string;
  costs?: string;
  uitvoeringsmogelijkheden?: string;
  governancemodellenToelichting?: string;
  implementatie?: string;
  governanceModels?: (GovernanceModel | string)[];
  governanceModelsMits?: (GovernanceModel | string)[];
  governanceModelsNietgeschikt?: (GovernanceModel | string)[];
  
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
  
  sys?: { id: string };
}

export interface MobilityType {
  id: string;
  title: string;
  description: string;
  samenvattingLang?: string;
  benefits: string[];
}

export interface ScoreCorrection {
  solutionId: string;
  reasonId: string;
  newValue: number;
} 