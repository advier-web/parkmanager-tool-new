'use client';

import { useState, useEffect } from 'react';
import { useBusinessParkReasons } from '../../hooks/use-domain-models';
import { shouldUseContentful } from '../../utils/env';
import Link from 'next/link';

export default function ContentfulTestPage() {
  const [useContentful, setUseContentful] = useState(false);
  const { data, isLoading, error } = useBusinessParkReasons();
  
  // Toggle useContentful via localStorage
  const toggleContentful = () => {
    const newValue = !useContentful;
    setUseContentful(newValue);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('USE_CONTENTFUL', newValue ? 'true' : 'false');
      // Herlaad de pagina om de nieuwe instelling effect te laten hebben
      window.location.reload();
    }
  };
  
  // Initialiseer de toggle state op basis van de env helper
  useEffect(() => {
    setUseContentful(shouldUseContentful());
  }, []);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Contentful Test Pagina</h1>
      
      <div className="mb-8">
        <button
          onClick={toggleContentful}
          className={`px-4 py-2 rounded-md ${
            useContentful ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {useContentful ? 'Contentful Data Actief' : 'Mock Data Actief'}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          {useContentful 
            ? 'Data wordt geladen vanuit Contentful CMS.' 
            : 'Data wordt geladen vanuit lokale mock data.'
          }
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Bedrijfsterrein-redenen</h2>
        {isLoading && <p className="text-gray-600">Laden...</p>}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error.message}</p>
          </div>
        )}
        
        {data && data.length === 0 && (
          <p className="text-gray-600">Geen redenen gevonden.</p>
        )}
        
        {data && data.length > 0 && (
          <ul className="space-y-4">
            {data.map(reason => (
              <li key={reason.id} className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium">{reason.title}</h3>
                <p className="text-gray-600 mt-1">{reason.description}</p>
                {reason.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {reason.category}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <Link 
        href="/"
        className="text-blue-600 hover:underline"
      >
        Terug naar home
      </Link>
    </div>
  );
} 