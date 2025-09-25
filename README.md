## Parkmanager Tool – Overzicht

Next.js app (App Router) met Contentful-integratie, wizard-flow, vergelijkers en PDF-factsheets (React-PDF). Stijlen met Tailwind. State via Zustand.

## Installatie & Development

1) Dependencies installeren:
```bash
npm ci
```

2) Env-variabelen instellen in `.env.local`:
```bash
NEXT_PUBLIC_USE_CONTENTFUL=true           # of false voor mock data
CONTENTFUL_SPACE_ID=...
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_DELIVERY_TOKEN=...
CONTENTFUL_PREVIEW_TOKEN=...
```

3) Dev server starten:
```bash
npm run dev
# Tip: bij poort-conflict
npm run dev -- --hostname 127.0.0.1 --port 3001
```

4) Cache wissen (optioneel bij rare build issues):
```bash
npm run clear-cache
```

## Architectuur

- `src/app`: pagina’s (App Router), incl. wizard-stappen en dynamische routes.
- `src/components`: herbruikbare UI, modals en secties.
- `src/services`: Contentful fetchers en mocks.
- `src/transforms`: mapping van Contentful respons naar domeinmodellen.
- `src/domain`: TypeScript domeinmodellen (Solution, Variation, Governance, ...).
- `src/store`: Zustand store voor wizard-keuzes.
- `src/utils`: gedeelde helpers (wizard-helpers, env, etc.).

Belangrijke UI-modules:
- Tooltips: `components/ui/tooltip.tsx` (Radix UI) + vaste positie varianten: `components/solution-dialog/FixedInfoTooltip.tsx`
- Sterrenrenderer: `components/ui/stars.tsx` met `StarsWithText` (interpreteert leidende `*`)
- Vergelijkingstabel varianten: `components/solution-variant-comparison-table.tsx`
- Dialog structuur: `components/solution-dialog.tsx` opgesplitst in subcomponenten in `components/solution-dialog/*`

## Contentful toggles

- `NEXT_PUBLIC_USE_CONTENTFUL=false`: app draait volledig op mock data (`src/services/mock-service.ts`).
- `NEXT_PUBLIC_USE_CONTENTFUL=true`: live Contentful-API (`src/services/contentful-service.ts` + `src/lib/contentful/client.ts`).

Migrations staan in `migrations/*`; typegeneratie scripts in `scripts/generate-contentful-types.*`.

## Tooltipconventie (bracket-tooltips)

- Tekstvelden kunnen inline toelichting bevatten tussen vierkante haken. Voorbeeld:
  `€0,50 per km [Excl. BTW; indicatief op basis van aanbieder X]`
- Parser: `parseValueAndTooltip` (export in `src/lib/utils.ts`), UI: `ValueWithTooltip` (`components/ui/tooltip.tsx`).
- In modals waar Radix overlay clipping gaf, gebruiken we fixed-position varianten: `InlineFixedTooltip`/`CostInfoTooltip`.

## Sterrenconventie in tekstvelden

- Leidende `*` (1–5) geven relatieve score en worden als sterren gerenderd; resterende tekst eronder.
- Renderer: `StarsWithText` (`components/ui/stars.tsx`).

## Implementatievarianten – titel en sortering

- Varianten tonen zonder oplossingsprefix via `stripSolutionPrefixFromVariantTitle(...)` (`utils/wizard-helpers.ts`).
- Kolomvolgorde is centraal vastgelegd in `desiredImplementationOrder`; sorteer met `orderImplementationVariations(...)`.

## Factsheets (PDF)

- Oplossing: `components/mobility-solution-factsheet-pdf.tsx`
- Implementatievariant: `components/implementation-variant-factsheet-pdf.tsx`
- Governance model: `components/governance-model-factsheet-pdf.tsx`
- Downloadknoppen: `*factsheet-button.tsx`

React-PDF tips:
- Beperk Html-rendering; grote tabellen worden lichter gerenderd via custom table logic.
- Geen afbeeldingen/scripts in inline HTML; fonts via CDN (Open Sans) zijn geregistreerd.

## Build & Deploy

Build lokaal:
```bash
npm run build
```

Vercel: auto-deploy op push naar `main` (controleer repo-koppeling, GitHub App permissies en webhooks). Bij uitblijven van builds, check Vercel Project Settings → Git.

## Troubleshooting

- Poort bezet (EADDRINUSE):
```bash
lsof -ti tcp:3000 | xargs -r kill -9
npm run dev -- --hostname 127.0.0.1 --port 3001
```
- Vastgelopen build: `npm run clear-cache`
- Contentful timeouts: zet tijdelijk `NEXT_PUBLIC_USE_CONTENTFUL=false` voor lokale ontwikkeling.

