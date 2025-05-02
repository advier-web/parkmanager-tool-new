# ParkManager Tool Projectplan

Dit document bevat het implementatieplan voor de nieuwe ParkManager Tool, met een focus op correcte Contentful integratie vanaf het begin.

## Doelen

- Herbouwen van de ParkManager Tool met een schone codebase
- Correcte Contentful type-handling zonder build errors
- Behoud van alle huidige functionaliteit
- Verbeterde onderhoudbaarheid en schaalbaarheid

## Fasering

### Fase 1: Projectbasis (✅ Voltooid)

- [x] Repository setup
- [x] Next.js 14 met App Router configureren
- [x] TypeScript in strict mode
- [x] Tailwind CSS en UI component bibliotheek
- [x] ESLint + Prettier configuratie
- [x] Deployment setup met Vercel
- [x] Basisstructuur applicatie
- [x] Domain model definities
- [x] Mock data service layer

### Fase 2: Wizard Flow met Dummy Data (✅ Voltooid)

- [x] Stap 0: Bedrijventerrein informatie toevoegen
- [x] Stap 1: Bedrijfstereinen-redenen implementeren
- [x] Stap 2: Mobiliteitsoplossingen implementeren
- [x] Stap 3: Governance modellen implementeren
- [x] Stap 4: Implementatieplan implementeren
- [x] Stap 5: Samenvatting implementeren (basisversie)
- [x] State management tussen wizard stappen
- [x] Navigatie en routing
- [x] Formulier validatie

### Fase 3: Contentful Integratie (✅ Voltooid)

- [x] Contentful client setup
- [x] Type generatie script
- [x] Domain naar Contentful type transformers
- [x] Unit tests voor transformers
- [x] Integratie van bedrijfsterreinen-redenen
- [x] Integratie van mobiliteitsoplossingen
- [x] Integratie van governance modellen
- [x] Integratie van implementatieplan
- [x] Error handling

### Fase 4: UI/UX Optimalisatie (✅ Voltooid)

- [x] Consistente schaduwen voor alle kaarten
- [x] Verbeterde weergave van CO₂-uitstoot tekst in PDFs
- [x] UX verbeteringen voor "Ik weet het nog niet" optie
- [x] PDF export functionaliteit
- [x] Responsieve layout verbeteringen
- [x] Cross-browser testing

### Fase 5: Afronding en Fine-tuning (⏳ Bezig)

- [x] Bugfixes voor contentweergave
- [x] Performance optimalisatie
- [x] Toegankelijkheid verbeteren
- [ ] Content preview functionaliteit
- [x] Final checks en kleinere bug fixes
- [ ] Deployment naar productie

### Fase 6: Housekeeping en Robuustheid Verbeteren (TODO)

Deze fase richt zich op het opschonen van de codebase, het oplossen van resterende technische schulden en het verhogen van de algehele robuustheid en onderhoudbaarheid, volgend op de debug-sessie van 1 mei 2025.

-   **[ ] Contentful Type Generatie Oplossen:**
    -   Onderzoek waarom de gegenereerde types (bv. `IBusinessParkReason`, `IMobilityService`) niet voldoen aan `EntrySkeletonType` (missen `contentTypeId`).
    -   Update `contentful-typescript-codegen` script of configuratie indien nodig.
    -   Regenereer types en pas de code aan om de correcte, gegenereerde types te gebruiken (verwijder `any` workarounds in `contentful-service.ts` en `transforms/contentful.ts`).

-   **[ ] Resterende Linter Errors Oplossen (`no-explicit-any`, `no-unused-vars`, etc.):**
    -   Loop systematisch door de output van `npm run lint` (nadat de build checks zijn aangezet).
    -   Vervang `any` door specifiekere types waar mogelijk.
    -   Verwijder alle resterende ongebruikte variabelen, imports en functies.
    -   Los overige linter waarschuwingen op (bv. `exhaustive-deps`, `prefer-const`).

-   **[ ] Transformatie Logica Refactoren:**
    -   Verplaats de inline transformatielogica voor `MobilitySolution` vanuit `contentful-service.ts` terug naar een aparte `transformMobilitySolution` functie in `transforms/contentful.ts`.
    -   Test grondig of het serialisatieprobleem (het wegvallen van velden tussen server en client) hierdoor niet terugkomt.
    -   Indien het probleem terugkomt, behoud de inline logica of implementeer de handmatige `JSON.stringify`/`parse` workaround als definitieve oplossing en documenteer dit.

-   **[ ] Build Checks Heractiveren:**
    -   Zet `ignoreDuringBuilds` en `ignoreBuildErrors` terug op `false` in `next.config.js`.
    -   Zorg dat `npm run build` slaagt *met* de actieve checks.

-   **[ ] Code Review en Verdere Optimalisaties:**
    -   Loop kritisch door de codebase op zoek naar verdere verbeterpunten qua structuur, leesbaarheid en performance.
    -   Controleer of alle data correct wordt weergegeven op alle pagina's.
    -   Overweeg het toevoegen van meer unit- en integratietests.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Taal**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **CMS**: Contentful
- **Deployment**: Vercel

## Contentful Type Strategie

### 1. Type Lagen

```
┌───────────────────┐
│   UI Components   │
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│   Domain Models   │
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│  Contentful Types │
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│  Contentful API   │
└───────────────────┘
```

### 2. Type Generatie

We genereren types in drie stappen:

1. **Contentful Types**: Automatisch gegenereerd van het Contentful schema
   ```typescript
   // Gegenereerd type (contentful-types.generated.ts)
   export interface IGovernanceModel extends EntrySkeletonType {
     contentTypeId: 'governanceModel';
     fields: {
       title: string;
       type?: string;
       // ... andere velden
     };
   }
   ```

2. **Domain Models**: Onze business logica types
   ```typescript
   // Domain model (domain/models.ts)
   export interface GovernanceModel {
     id: string;
     title: string;
     type?: string;
     // ... andere velden in business-vriendelijk formaat
   }
   ```

3. **Transform Functions**: Veilige conversie tussen types
   ```typescript
   // Transform function (transforms/contentful.ts)
   export function transformGovernanceModel(
     entry: Entry<IGovernanceModel>
   ): GovernanceModel {
     return {
       id: entry.sys.id,
       title: entry.fields.title || '',
       // ... veilige transformatie van alle velden
     };
   }
   ```

### 3. Data Fetching Pattern

```typescript
// Service layer (services/contentful.ts)
export async function getGovernanceModels(): Promise<GovernanceModel[]> {
  try {
    const response = await contentfulClient.getEntries<IGovernanceModel>({
      content_type: 'governanceModel',
    });
    
    return response.items.map(transformGovernanceModel);
  } catch (error) {
    // Proper error handling
    throw handleContentfulError(error);
  }
}

// UI Component (components/GovernanceModelList.tsx)
export function GovernanceModelList() {
  const { data, error, isLoading } = useGovernanceModels();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {data.map(model => (
        <GovernanceModelCard key={model.id} model={model} />
      ))}
    </ul>
  );
}
```

## Voortgang Tracking

| Feature                     | Dummy Data | Contentful Integratie | Status |
|-----------------------------|------------|----------------------|--------|
| Bedrijfsterrein informatie  | ✅         | ✅                    | Voltooid met verkeerstypes |
| Bedrijfsterrein-redenen     | ✅         | ✅                    | Voltooid met beide data sources |
| Mobiliteitsoplossingen      | ✅         | ✅                    | Voltooid met summary field |
| Governance modellen         | ✅         | ✅                    | Voltooid met summary field |
| Implementatieplan           | ✅         | ✅                    | Voltooid met implementatiedetails |
| Samenvatting                | ✅         | ✅                    | Voltooid met PDF download |
| PDF Export                  | ✅         | ✅                    | Voltooid met CO₂-uitstoot fixes |
| UI/UX Optimalisaties        | ✅         | ✅                    | Voltooid met consistente schaduwen |

## Recente Verbeteringen

### UI/UX Optimalisaties
- Consistente schaduwen (`shadow-even` class) doorgevoerd voor alle kaarten in de applicatie
- Verbeterde formattering voor CO₂-uitstoot tekst in PDFs
- Geavanceerde regex-patronen voor speciale tekst in PDFs
- UX verbetering: "Ik weet het nog niet" aanleiding toont geen bijdrage-indicatoren
- Responsieve layout verbeteringen voor verschillende schermformaten

### Bug Fixes
- Opgelost: CO₂-uitstoot tekst correct weergeven in PDFs
- Opgelost: Inconsistenties in schaduw-stijlen tussen verschillende kaarten
- Opgelost: Overbodige bijdrage-indicatoren bij "Ik weet het nog niet" aanleiding

## Contentful Schema Documentatie

Dit gedeelte zal worden bijgewerkt met de exacte schema definities wanneer alle content types zijn gefinaliseerd.

## Potentiële Risico's en Mitigatie

1. **Contentful Type Mismatch**
   - **Risico**: Contentful schema wijzigt en breekt type definities
   - **Mitigatie**: Type generatie script in CI/CD, goede transformer functions met fallbacks

2. **Build Errors op Vercel**
   - **Risico**: TypeScript errors die lokaal niet zichtbaar zijn
   - **Mitigatie**: Strict type checking inschakelen en regelmatig deployen naar Vercel

3. **Performanceproblemen**
   - **Risico**: Te veel API calls of grote payloads
   - **Mitigatie**: Implementeren van caching, server components, en pagination

## Referenties

- [GitHub Repository](https://github.com/advier-web/parkmanager-tool-new)
- [Contentful Documentatie](https://www.contentful.com/developers/docs/)
- [Next.js Documentatie](https://nextjs.org/docs) 