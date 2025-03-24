'use client';

import React from 'react';
import PdfDownloadButton from './pdf-download-button-react-pdf';

interface PdfDownloadButtonContentfulProps {
  mobilityServiceId: string;
  fileName?: string;
  className?: string;
}

const PdfDownloadButtonContentful: React.FC<PdfDownloadButtonContentfulProps> = ({
  mobilityServiceId,
  fileName,
  className
}) => {
  return (
    <PdfDownloadButton
      mobilityServiceId={mobilityServiceId}
      fileName={fileName}
      buttonText="Download als PDF"
      className={className}
    />
  );
};

export default PdfDownloadButtonContentful; 