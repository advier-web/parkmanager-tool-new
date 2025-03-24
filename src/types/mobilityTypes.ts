export interface GovernanceModel {
  sys?: { id: string };
  title: string;
  description: string;
}

export interface MobilitySolution {
  title: string;
  paspoort?: string;
  description?: string;
  collectiefVsIndiviueel?: string;
  effecten?: string;
  investering?: string;
  implementatie?: string;
  governanceModels?: (GovernanceModel | string)[];
  governancemodellenToelichting?: string;
} 