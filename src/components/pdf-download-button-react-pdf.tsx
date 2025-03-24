'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MobilitySolution } from '../types/mobilityTypes';
import { getMobilitySolutionForPdfMock } from '../services/mobilityService';

// Dynamisch laden van React-PDF componenten (alleen client-side)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

// Dynamisch laden van onze PDF template
const PdfTemplate = dynamic(
  () => import('./PdfTemplate'),
  { ssr: false }
);

interface PdfDownloadButtonProps {
  mobilityServiceId: string;
  fileName?: string;
  className?: string;
}

export default function PdfDownloadButton({ 
  mobilityServiceId, 
  fileName = 'mobiliteitsoplossing.pdf',
  className = ''
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [pdfData, setPdfData] = useState<MobilitySolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detecteren of we client-side zijn
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Data ophalen voor PDF
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMobilitySolutionForPdfMock(mobilityServiceId);
        setPdfData(data);
      } catch (err) {
        console.error('Fout bij ophalen data voor PDF:', err);
        setError('Er ging iets mis bij het genereren van de PDF. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    };

    if (isClient && mobilityServiceId) {
      fetchData();
    }
  }, [mobilityServiceId, isClient]);

  // Toon loading indicator
  if (loading) {
    return (
      <button
        className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 opacity-50 cursor-wait`}
        disabled
      >
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        PDF wordt voorbereid...
      </button>
    );
  }

  // Toon foutmelding
  if (error) {
    return (
      <button
        className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700`}
        disabled
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {error}
      </button>
    );
  }

  // Genereer bestandsnaam uit titel indien naam niet is opgegeven
  const getFileName = () => {
    if (fileName !== 'mobiliteitsoplossing.pdf' && fileName) {
      return fileName;
    }
    
    if (pdfData?.title) {
      const cleanTitle = pdfData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Verwijder speciale tekens
        .replace(/\s+/g, '-');     // Vervang spaties door streepjes
      return `${cleanTitle}.pdf`;
    }
    
    return 'mobiliteitsoplossing.pdf';
  };

  // Render download link met PDF
  return isClient && pdfData ? (
    <PDFDownloadLink
      document={<PdfTemplate data={pdfData} />}
      fileName={getFileName()}
      className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      {({ loading: pdfLoading }) => (
        <>
          {pdfLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              PDF genereren...
            </>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </>
      )}
    </PDFDownloadLink>
  ) : null;
} 