import { createClient, type ContentfulClientApi } from 'contentful';

// Typed environment variables
interface ContentfulConfig {
  spaceId: string;
  accessToken: string;
  previewAccessToken?: string;
  environment: string;
  preview: boolean;
}

// Configuratie laden vanuit environment variables
function getContentfulConfig(): ContentfulConfig {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  const previewAccessToken = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN;
  const environment = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
  const preview = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW === 'true';

  // Validatie van vereiste configuratie
  if (!spaceId || !accessToken) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error(
        'Contentful spaceId en accessToken zijn vereist. Controleer je .env.local bestand.'
      );
    }
    
    // Fallback voor development zonder env vars
    console.warn(
      'Contentful configuratie ontbreekt. Gebruik mock data of voeg NEXT_PUBLIC_CONTENTFUL_SPACE_ID en NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN toe aan je .env.local'
    );
    
    return {
      spaceId: 'development-space',
      accessToken: 'development-token',
      environment,
      preview: false,
    };
  }

  return {
    spaceId,
    accessToken,
    previewAccessToken,
    environment,
    preview,
  };
}

// Contentful client singleton
let client: ContentfulClientApi<undefined> | null = null;
let previewClient: ContentfulClientApi<undefined> | null = null;

/**
 * Get a singleton Contentful client instance
 */
export function getContentfulClient(preview = false): ContentfulClientApi<undefined> {
  const config = getContentfulConfig();
  
  // Gebruik previewClient als preview mode is ingeschakeld
  if (preview && config.previewAccessToken) {
    if (!previewClient) {
      previewClient = createClient({
        space: config.spaceId,
        accessToken: config.previewAccessToken,
        environment: config.environment,
        host: 'preview.contentful.com', // Preview API endpoint
      });
    }
    return previewClient;
  }
  
  // Gebruik reguliere client
  if (!client) {
    client = createClient({
      space: config.spaceId,
      accessToken: config.accessToken,
      environment: config.environment,
    });
  }
  
  if (!client) {
    throw new Error('Kon geen verbinding maken met Contentful');
  }
  
  return client;
}

/**
 * Contentful API error types
 */
export enum ContentfulErrorType {
  NOT_FOUND = 'NotFound',
  UNAUTHORIZED = 'Unauthorized',
  RATE_LIMIT = 'RateLimit',
  VALIDATION = 'Validation',
  SERVER_ERROR = 'ServerError',
  NETWORK_ERROR = 'NetworkError',
  UNKNOWN = 'Unknown',
}

/**
 * Enhanced error with Contentful specific information
 */
export class ContentfulError extends Error {
  type: ContentfulErrorType;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, type: ContentfulErrorType, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ContentfulError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Parse and handle Contentful errors in a standardized way
 */
export function handleContentfulError(error: unknown): ContentfulError {
  console.error('Contentful API error:', error);
  
  // Contentful API errors hebben een specifieke structuur
  if (typeof error === 'object' && error !== null) {
    const contentfulError = error as any;
    
    if (contentfulError.sys?.id === 'NotFound') {
      return new ContentfulError(
        'De opgevraagde content is niet gevonden',
        ContentfulErrorType.NOT_FOUND,
        404,
        contentfulError
      );
    }
    
    if (contentfulError.status === 401 || contentfulError.statusCode === 401) {
      return new ContentfulError(
        'Geen toegang tot Contentful API. Controleer je access tokens.',
        ContentfulErrorType.UNAUTHORIZED,
        401,
        contentfulError
      );
    }
    
    if (contentfulError.status === 429 || contentfulError.statusCode === 429) {
      return new ContentfulError(
        'Contentful API rate limit bereikt. Probeer het later opnieuw.',
        ContentfulErrorType.RATE_LIMIT,
        429,
        contentfulError
      );
    }
    
    if (contentfulError.status >= 400 && contentfulError.status < 500) {
      return new ContentfulError(
        'Validatiefout bij Contentful API aanroep',
        ContentfulErrorType.VALIDATION,
        contentfulError.status,
        contentfulError
      );
    }
    
    if (contentfulError.status >= 500 || contentfulError.statusCode >= 500) {
      return new ContentfulError(
        'Contentful server error',
        ContentfulErrorType.SERVER_ERROR,
        contentfulError.status || contentfulError.statusCode,
        contentfulError
      );
    }
    
    if (contentfulError.message && contentfulError.message.includes('network')) {
      return new ContentfulError(
        'Netwerkfout bij verbinden met Contentful',
        ContentfulErrorType.NETWORK_ERROR,
        undefined,
        contentfulError
      );
    }
  }
  
  // Fallback voor onbekende errors
  return new ContentfulError(
    error instanceof Error ? error.message : 'Onbekende fout bij ophalen van content',
    ContentfulErrorType.UNKNOWN,
    undefined,
    error
  );
} 