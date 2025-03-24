export interface GovernanceModel {
  title: string;
  description: string;
  sys?: { id: string };
}

export interface MobilitySolution {
  title: string;
  slug: string;
  coverImage?: string;
  paspoort?: string;
  description?: string;
  collectiefVsIndiviueel?: string;
  effecten?: string;
  investering?: string;
  implementatie?: string;
  governanceModels?: (GovernanceModel | string)[];
  governancemodellenToelichting?: string;
  sys?: { id: string };
} 