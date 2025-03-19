/**
 * THIS FILE WILL EVENTUALLY BE AUTO-GENERATED FROM CONTENTFUL
 * For now, it's a placeholder for the structure of contentful types
 */

export interface EntryFields {
  [key: string]: any;
}

export interface EntrySkeletonType<T extends EntryFields = EntryFields> {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
    contentTypeId: string;
  };
  fields: T;
}

export interface IBusinessParkReasonFields {
  title: string;
  description: string;
  summary?: string;
  samenvatting?: string;
  icon?: string;
  category?: string;
  identifier?: string;
}

export interface IBusinessParkReason extends EntrySkeletonType<IBusinessParkReasonFields> {
  contentTypeId: 'businessParkReason';
}

export interface IMobilitySolutionFields {
  title: string;
  description: string;
  benefits: string[];
  challenges: string[];
  implementationTime: string;
  costs: string;
  category: string;
  icon?: string;
  summary?: string;
  samenvatting?: string;
  implementatie?: string;
  parkeer_bereikbaarheidsproblemen?: number;
  gezondheid?: number;
  personeelszorg_en_behoud?: number;
  imago?: number;
  milieuverordening?: number;
}

export interface IMobilitySolution extends EntrySkeletonType<IMobilitySolutionFields> {
  contentTypeId: 'mobilitySolution';
}

export interface IGovernanceModelFields {
  title: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  applicableScenarios: string[];
  organizationalStructure?: string;
  legalForm?: string;
  stakeholders?: string[];
  summary?: string;
  samenvatting?: string;
  
  // Implementation plan fields
  aansprakelijkheid?: string;
  benodigdhedenOprichting?: string[];
  doorlooptijd?: string;
  implementatie?: string;
  links?: string[];
  voorbeeldContracten?: string[];
}

export interface IGovernanceModel extends EntrySkeletonType<IGovernanceModelFields> {
  contentTypeId: 'governanceModel';
}

export interface IImplementationTaskFields {
  title: string;
  description: string;
  responsible: string[];
  duration: string;
}

export interface IImplementationTask extends EntrySkeletonType<IImplementationTaskFields> {
  contentTypeId: 'implementationTask';
}

export interface IImplementationPhaseFields {
  title: string;
  description: string;
  tasks: {
    sys: {
      id: string;
    };
  }[];
  duration: string;
}

export interface IImplementationPhase extends EntrySkeletonType<IImplementationPhaseFields> {
  contentTypeId: 'implementationPhase';
}

export interface IImplementationPlanFields {
  title: string;
  description: string;
  phases: {
    sys: {
      id: string;
    };
  }[];
  estimatedDuration: string;
  requiredResources: string[];
  keySuccessFactors: string[];
}

export interface IImplementationPlan extends EntrySkeletonType<IImplementationPlanFields> {
  contentTypeId: 'implementationPlan';
} 