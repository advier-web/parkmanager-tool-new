import { createClient } from 'contentful';

// Environment variables for Contentful credentials (to be set in .env.local)
const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_PREVIEW_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN;
const CONTENTFUL_PREVIEW = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW === 'true';

// Validate environment variables
if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error(
      'Contentful space ID and access token are required. Please set the NEXT_PUBLIC_CONTENTFUL_SPACE_ID and NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN environment variables.'
    );
  }
}

/**
 * Create a Contentful client with the configured space and token
 */
export const contentfulClient = createClient({
  space: CONTENTFUL_SPACE_ID || 'development-space-id',
  accessToken: CONTENTFUL_PREVIEW
    ? CONTENTFUL_PREVIEW_ACCESS_TOKEN || 'preview-token'
    : CONTENTFUL_ACCESS_TOKEN || 'delivery-token',
  host: CONTENTFUL_PREVIEW ? 'preview.contentful.com' : 'cdn.contentful.com',
});

/**
 * Handle Contentful errors in a standardized way
 */
export function handleContentfulError(error: unknown): Error {
  console.error('Contentful API error:', error);
  
  if (error instanceof Error) {
    return error;
  }
  
  return new Error('An error occurred while fetching content from Contentful.');
} 