import { 
  BusinessParkReason, 
  GovernanceModel, 
  ImplementationPhase, 
  ImplementationPlan, 
  ImplementationTask, 
  MobilitySolution,
  TrafficType
} from '../domain/models';

/**
 * Mock business park reasons for development
 */
export const mockBusinessParkReasons: BusinessParkReason[] = [
  {
    id: 'reason-1',
    title: 'Verbeteren bereikbaarheid',
    description: 'Verbeteren van de bereikbaarheid van het bedrijfsterrein voor medewerkers, klanten en leveranciers.',
    icon: 'road',
    category: 'bereikbaarheid',
    identifier: 'parkeer_bereikbaarheidsproblemen'
  },
  {
    id: 'reason-2',
    title: 'Duurzaamheidsdoelen',
    description: 'Bijdragen aan duurzaamheidsdoelen door het verminderen van CO2-uitstoot en stimuleren van duurzaam vervoer.',
    icon: 'leaf',
    category: 'duurzaamheid',
    identifier: 'milieuverordening'
  },
  {
    id: 'reason-3',
    title: 'Parkeeroverlast verminderen',
    description: 'Aanpakken van parkeeroverlast op en rondom het bedrijfsterrein.',
    icon: 'parking',
    category: 'bereikbaarheid',
    identifier: 'parkeer_bereikbaarheidsproblemen'
  },
  {
    id: 'reason-4',
    title: 'Werkgeversaantrekkelijkheid',
    description: 'Verbeteren van de aantrekkelijkheid van het bedrijfsterrein als werklocatie.',
    icon: 'users',
    category: 'aantrekkelijkheid',
    identifier: 'personeelszorg_en_behoud'
  }
];

/**
 * Mock mobility solutions for development
 */
export const mockMobilitySolutions: MobilitySolution[] = [
  {
    id: 'solution-1',
    title: 'Bedrijfsfietsenplan',
    description: 'Een regeling waarbij medewerkers een fiets kunnen leasen of aanschaffen via de werkgever.',
    benefits: ['Gezondere medewerkers', 'Minder autoritten', 'Fiscaal voordeel'],
    challenges: ['Investeringskosten', 'Niet voor iedereen geschikt'],
    implementationTime: 'kort',
    costs: 'middel',
    category: 'fiets',
    icon: 'bike',
    typeVervoer: [TrafficType.COMMUTER],
    parkeer_bereikbaarheidsproblemen: 6,
    gezondheid: 9,
    personeelszorg_en_behoud: 7,
    imago: 8,
    milieuverordening: 5
  },
  {
    id: 'solution-2',
    title: 'Collectief OV-abonnement',
    description: 'Een collectief abonnement voor openbaar vervoer voor alle medewerkers op het bedrijfsterrein.',
    benefits: ['Lagere kosten door collectieve inkoop', 'Stimuleert OV-gebruik', 'Minder autoverkeer'],
    challenges: ['Afhankelijk van OV-bereikbaarheid', 'Administratieve last'],
    implementationTime: 'middellang',
    costs: 'hoog',
    category: 'openbaar vervoer',
    icon: 'bus',
    typeVervoer: [TrafficType.COMMUTER, TrafficType.BUSINESS],
    parkeer_bereikbaarheidsproblemen: 9,
    gezondheid: 5,
    personeelszorg_en_behoud: 6,
    imago: 7,
    milieuverordening: 8
  },
  {
    id: 'solution-3',
    title: 'Carpooldatabase',
    description: 'Een platform waarop medewerkers ritten kunnen aanbieden en vinden voor carpoolen.',
    benefits: ['Eenvoudig te implementeren', 'Lagere kosten voor medewerkers', 'Minder auto&apos;s'],
    challenges: ['Vereist actieve deelname', 'Privacy aspecten'],
    implementationTime: 'kort',
    costs: 'laag',
    category: 'auto',
    icon: 'car',
    typeVervoer: [TrafficType.COMMUTER, TrafficType.BUSINESS, TrafficType.VISITOR],
    parkeer_bereikbaarheidsproblemen: 8,
    gezondheid: 4,
    personeelszorg_en_behoud: 7,
    imago: 6,
    milieuverordening: 7
  },
  {
    id: 'solution-4',
    title: 'Pendeldienst',
    description: 'Soms ontbreekt er goed openbaar vervoer tussen het NS-station en het bedrijventerrein. Dan kan een pendeldienst de ontbrekende schakel vormen. Zo\'n shuttle brengt medewerkers van en naar het station op vaste tijden.',
    benefits: ['Verbeterde bereikbaarheid', 'Minder autogebruik', 'Betere verbinding met OV'],
    challenges: ['Kosten voor organisatie en beheer', 'Vereist voldoende volume', 'Afstemming dienstregeling'],
    implementationTime: 'middellang',
    costs: 'hoog',
    category: 'openbaar vervoer',
    icon: 'shuttle-van',
    typeVervoer: [TrafficType.COMMUTER],
    parkeer_bereikbaarheidsproblemen: 9,
    gezondheid: 5,
    personeelszorg_en_behoud: 8,
    imago: 7,
    milieuverordening: 7
  }
];

/**
 * Mock governance models for development
 */
export const mockGovernanceModels: GovernanceModel[] = [
  {
    id: 'governance-1',
    title: 'Parkmanagement Vereniging',
    description: 'Een vereniging van bedrijven op het bedrijfsterrein die samen mobiliteitsoplossingen beheren en financieren.',
    advantages: ['Democratische structuur', 'Gedeelde kosten', 'Sterke betrokkenheid'],
    disadvantages: ['Langere besluitvorming', 'Vrijwillige basis'],
    applicableScenarios: ['Middelgrote bedrijfsterreinen', 'Heterogene bedrijvenpopulatie'],
    organizationalStructure: 'Vereniging met bestuur en ledenvergadering',
    legalForm: 'Vereniging',
    stakeholders: ['Bedrijven', 'Gemeente', 'Vervoerders']
  },
  {
    id: 'governance-2',
    title: 'Mobiliteitscoördinator',
    description: 'Een aangestelde coördinator die mobiliteitsoplossingen beheert namens alle bedrijven.',
    advantages: ['Slagvaardig', 'Professioneel', 'Duidelijk aanspreekpunt'],
    disadvantages: ['Kosten coördinator', 'Minder betrokkenheid bedrijven'],
    applicableScenarios: ['Kleinere bedrijfsterreinen', 'Homogene bedrijvenpopulatie'],
    organizationalStructure: 'Centrale coördinator met stuurgroep',
    legalForm: 'Dienstverband of ZZP',
    stakeholders: ['Bedrijven', 'Coördinator', 'Gemeente']
  }
];

/**
 * Mock implementation tasks for development
 */
export const mockImplementationTasks: ImplementationTask[] = [
  {
    id: 'task-1',
    title: 'Inventarisatie huidige situatie',
    description: 'Het in kaart brengen van de huidige mobiliteitssituatie op het bedrijfsterrein.',
    responsible: ['Projectleider', 'Werkgroep'],
    duration: '2 weken'
  },
  {
    id: 'task-2',
    title: 'Stakeholderanalyse',
    description: 'Identificeren en analyseren van alle belanghebbenden en hun belangen.',
    responsible: ['Projectleider'],
    duration: '1 week'
  },
  {
    id: 'task-3',
    title: 'Selectie mobiliteitsoplossingen',
    description: 'Kiezen van de meest geschikte mobiliteitsoplossingen voor het bedrijfsterrein.',
    responsible: ['Werkgroep', 'Directie'],
    duration: '3 weken'
  }
];

/**
 * Mock implementation phases for development
 */
export const mockImplementationPhases: ImplementationPhase[] = [
  {
    id: 'phase-1',
    title: 'Voorbereiding',
    description: 'De voorbereidende fase waarin de huidige situatie en behoeften in kaart worden gebracht.',
    tasks: [mockImplementationTasks[0], mockImplementationTasks[1]],
    duration: '3 weken'
  },
  {
    id: 'phase-2',
    title: 'Planvorming',
    description: 'De fase waarin concrete plannen worden gemaakt voor de mobiliteitsoplossingen.',
    tasks: [mockImplementationTasks[2]],
    duration: '4 weken'
  }
];

/**
 * Mock implementation plans for development
 */
export const mockImplementationPlans: ImplementationPlan[] = [
  {
    id: 'plan-1',
    title: 'Standaard implementatieplan',
    description: 'Een standaard stappenplan voor de implementatie van mobiliteitsoplossingen op een bedrijfsterrein.',
    phases: mockImplementationPhases,
    estimatedDuration: '3 maanden',
    requiredResources: ['Projectleider (0,2 FTE)', 'Werkgroep (5 personen)', 'Budget: €10.000-€25.000'],
    keySuccessFactors: ['Betrokkenheid directie', 'Duidelijke communicatie', 'Voldoende capaciteit']
  }
]; 