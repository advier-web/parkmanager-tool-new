// Override the default Next.js types
import type { NextPage } from 'next';
// import type { Metadata } from 'next'; // Unused import
import type { ReactElement, ReactNode } from 'react';

declare module 'next' {
  export interface PageProps {
    params?: any;
    searchParams?: any;
  }
}

// Define AppProps type for _app.tsx
export interface AppProps {
  Component: NextPageWithLayout;
  pageProps: unknown; // Use unknown instead of any
}

// Extend NextPage type to include getLayout property
export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export {}; 