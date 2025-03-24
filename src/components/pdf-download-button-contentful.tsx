'use client';

import React from 'react';
import PdfDownloadButton from './pdf-download-button-react-pdf';

interface PdfDownloadButtonContentfulProps {
  mobilityServiceId: string;
  fileName?: string;
  className?: string;
}

export default function PdfDownloadButtonContentful({
  mobilityServiceId,
  fileName,
  className
}: PdfDownloadButtonContentfulProps) {
  return (
    <PdfDownloadButton
      mobilityServiceId={mobilityServiceId}
      fileName={fileName}
      className={className}
    />
  );
} 