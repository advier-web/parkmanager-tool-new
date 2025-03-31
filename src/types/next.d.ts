// Override the default Next.js types
import { Metadata } from 'next';

declare module 'next' {
  export interface PageProps {
    params?: any;
    searchParams?: any;
  }
}

export {}; 