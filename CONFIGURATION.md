# ParkManager Tool - Configuration Guide

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Contentful CMS Configuration
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_contentful_space_id_here
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_contentful_delivery_token_here
NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_contentful_preview_token_here
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT=master
NEXT_PUBLIC_CONTENTFUL_PREVIEW=false
NEXT_PUBLIC_USE_CONTENTFUL=true

# Contentful Management API (for type generation)
CONTENTFUL_MANAGEMENT_TOKEN=your_contentful_management_token_here
```

### ⚠️ Database Configuration Issue

**CRITICAL**: The application currently has NO database implementation despite mentioning Neon/Vercel usage.

**Current State:**
- ✅ Contentful CMS integration (working)
- ❌ Database integration (missing)
- ❌ User data persistence (missing)
- ❌ Form submission storage (missing)

**If you need database functionality, add:**
```bash
# Neon PostgreSQL via Vercel
DATABASE_URL=postgresql://username:password@hostname/database
POSTGRES_URL=postgresql://username:password@hostname/database
POSTGRES_PRISMA_URL=postgresql://username:password@hostname/database?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://username:password@hostname/database
```

## Issues Found & Fixed

### ✅ Fixed Issues

1. **Duplicate Next.js Config**: Removed conflicting `next.config.ts`
2. **TypeScript Config**: Removed invalid `"contentful"` property
3. **Build Validation**: Re-enabled TypeScript and ESLint checking
4. **Environment Documentation**: Created proper setup guide

### ⚠️ Remaining Issues

1. **Experimental Dependencies**:
   - React 19 (experimental)
   - Tailwind CSS 4 (experimental)
   - Next.js 15.2.3 (vs planned 14)

2. **Missing Database Layer**:
   - No database schema
   - No ORM/query layer
   - No data persistence

3. **Type Generation Issues**:
   - Contentful types may not extend `EntrySkeletonType` properly
   - Some `any` types used as workarounds

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (now with validation)
npm run build

# Run linting
npm run lint

# Clear cache and restart
npm run fresh
```

## Database Integration Checklist

If you need database functionality, implement:

- [ ] Choose ORM (Prisma recommended for Neon)
- [ ] Add database dependencies
- [ ] Create database schema
- [ ] Implement data models
- [ ] Add database connection utilities
- [ ] Create API routes for data operations
- [ ] Add migration system

## Deployment Notes

- Ensure all environment variables are set in Vercel
- Database credentials should be automatically provided by Vercel if using Neon
- Build validation is now enabled (may catch issues previously hidden) 