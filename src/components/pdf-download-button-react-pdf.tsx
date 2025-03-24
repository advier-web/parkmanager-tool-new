import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getMobilitySolutionForPdf } from '../services/mobilityService';
import { MobilitySolution } from '../types/mobilityTypes';

// Laad de PDF componenten alleen client-side
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

// Dynamisch laden van PdfTemplate component
const PdfTemplate = dynamic(() => import('./PdfTemplate'), { ssr: false });

interface PdfDownloadButtonProps {
  mobilityServiceId: string;
  fileName?: string;
  buttonText?: string;
  className?: string;
}

const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  mobilityServiceId,
  fileName,
  buttonText = 'Download PDF',
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pdfData, setPdfData] = useState<MobilitySolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect om client-side rendering te detecteren
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect om de data op te halen wanneer de component laadt
  useEffect(() => {
    const fetchData = async () => {
      if (!mobilityServiceId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMobilitySolutionForPdf(mobilityServiceId);
        setPdfData(data);
      } catch (err) {
        console.error('Error fetching PDF data:', err);
        setError('Er is een fout opgetreden bij het laden van de data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && mobilityServiceId) {
      fetchData();
    }
  }, [mobilityServiceId, isClient]);

  // Render een laad-indicator wanneer we nog niet client-side zijn of data aan het laden is
  if (!isClient || isLoading) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-500 ${className}`}
      >
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        PDF laden...
      </button>
    );
  }

  // Toon foutmelding indien nodig
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Als er geen data is, toon een uitgeschakelde knop
  if (!pdfData) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-500 ${className}`}
      >
        {buttonText}
      </button>
    );
  }

  // Genereer de bestandsnaam voor de PDF als er geen is opgegeven
  const pdfFileName = fileName || `${pdfData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;

  // Render de download link component
  return (
    <PDFDownloadLink
      document={<PdfTemplate data={pdfData} />}
      fileName={pdfFileName}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {({ loading, error }) => 
        loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PDF genereren...
          </>
        ) : error ? (
          'Fout bij genereren'
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {buttonText}
          </>
        )
      }
    </PDFDownloadLink>
  );
};

export default PdfDownloadButton; 