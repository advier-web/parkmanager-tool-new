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

### Fase 2: Wizard Flow met Dummy Data (✅ Gestart)

- [x] Stap 1: Bedrijfstereinen-redenen implementeren
- [ ] Stap 2: Mobiliteitsoplossingen implementeren
- [ ] Stap 3: Governance modellen implementeren
- [ ] Stap 4: Implementatieplan implementeren
- [ ] Stap 5: Samenvatting implementeren
- [x] State management tussen wizard stappen
- [x] Navigatie en routing
- [ ] Formulier validatie

### Fase 3: Contentful Integratie

- [ ] Contentful client setup
- [ ] Type generatie script
- [ ] Domain naar Contentful type transformers
- [ ] Unit tests voor transformers
- [ ] Integratie van bedrijfsterreinen-redenen
- [ ] Integratie van mobiliteitsoplossingen
- [ ] Integratie van governance modellen
- [ ] Integratie van implementatieplan
- [ ] Error handling

### Fase 4: Afronding en Optimalisatie

- [ ] Performance optimalisatie
- [ ] Toegankelijkheid verbeteren
- [ ] Cross-browser testing
- [ ] Content preview functionaliteit
- [ ] PDF export functionaliteit
- [ ] Final checks en bug fixes

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

| Feature                  | Dummy Data | Contentful Integratie | Status |
|--------------------------|------------|----------------------|--------|
| Bedrijfsterrein-redenen  | ✅         | ❌                    | Voltooid |
| Mobiliteitsoplossingen   | ❌         | ❌                    | Nog te implementeren |
| Governance modellen      | ❌         | ❌                    | Nog te implementeren |
| Implementatieplan        | ❌         | ❌                    | Nog te implementeren |
| Samenvatting             | ❌         | ❌                    | Nog te implementeren |
| PDF Export               | ❌         | ❌                    | Nog te implementeren |

## Contentful Schema Documentatie

Dit gedeelte zal worden bijgewerkt zodra we de exacte Contentful content types hebben gedocumenteerd.

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

- [Huidige Applicatie](https://github.com/originele-repo-link)
- [Contentful Documentatie](https://www.contentful.com/developers/docs/)
- [Next.js Documentatie](https://nextjs.org/docs) 