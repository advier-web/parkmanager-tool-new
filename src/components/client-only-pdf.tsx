'use client';

import React, { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { MobilitySolution } from '../types/mobilityTypes';
import PdfTemplate from './PdfTemplate';

interface ClientOnlyPDFProps {
  pdfData: MobilitySolution;
  fileName: string;
  mode: 'view' | 'download';
  downloadButtonText?: string;
  className?: string;
}

const ClientOnlyPDF: React.FC<ClientOnlyPDFProps> = ({ pdfData, fileName, mode, downloadButtonText = 'Download PDF', className = '' }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    if (mode === 'view') {
      return <div className={`border border-gray-200 p-4 text-center text-gray-500 ${className}`}>PDF Viewer wordt geladen...</div>;
    }
    return (
      <button disabled className={`bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed ${className}`}>
        {downloadButtonText}
      </button>
    );
  }

  if (mode === 'view') {
    return (
      <PDFViewer className={`w-full h-[70vh] border border-gray-300 ${className}`}>
        <PdfTemplate data={pdfData} />
      </PDFViewer>
    );
  }

  // Download mode
  return (
    <PDFDownloadLink
      document={<PdfTemplate data={pdfData} />}
      fileName={fileName}
      className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      {({ loading, error }) => (
        <button
          disabled={loading}
          className={`px-4 py-2 rounded transition-colors ${className} ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Genereren...' : downloadButtonText}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ClientOnlyPDF; 