import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ImplementationVariantFactsheetPdf from './implementation-variant-factsheet-pdf';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ImplementationVariation } from '@/domain/models';

interface ImplementationVariantFactsheetButtonProps {
  variation: ImplementationVariation | null;
  className?: string;
  buttonColorClassName?: string;
  children?: React.ReactNode;
}

const ImplementationVariantFactsheetButtonComponent: React.FC<ImplementationVariantFactsheetButtonProps> = ({ 
  variation, 
  className, 
  buttonColorClassName = 'bg-blue-600 hover:bg-blue-700 text-white',
  children
}) => {
  const [isClient, setIsClient] = useState(false);
  // Defer heavy PDF rendering until the user explicitly requests it
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pdfDocument = useMemo(() => {
    if (!variation || !isArmed) return null;
    return <ImplementationVariantFactsheetPdf variation={variation} />;
  }, [variation, isArmed]);

  if (!variation) {
    return (
      <Button variant="default" disabled className={`${className} ${buttonColorClassName} opacity-50`}>
        <DocumentTextIcon className="h-4 w-4" />
        Factsheet Variant (niet beschikbaar)
      </Button>
    );
  }
  
  const fileName = `Factsheet_Variant_${variation.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  return (
    <span className={className}>
      {isClient && isArmed && pdfDocument ? (
        <PDFDownloadLink document={pdfDocument} fileName={fileName}>
          {({ loading }) => (
            <Button variant="default" className={buttonColorClassName} disabled={loading}>
              <DocumentTextIcon className="h-4 w-4" />
              {children ? (loading ? 'Even geduld…' : children) : (loading ? 'Even geduld…' : `Download factsheet ${variation.title}`)}
            </Button>
          )}
        </PDFDownloadLink>
      ) : isClient ? (
        <Button
          variant="default"
          className={buttonColorClassName}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsArmed(true);
          }}
        >
          <DocumentTextIcon className="h-4 w-4" />
          {children || `Download factsheet ${variation.title}`}
        </Button>
      ) : (
        <Button variant="default" disabled className={buttonColorClassName}>
          <DocumentTextIcon className="h-4 w-4" />
          Factsheet laden...
        </Button>
      )}
    </span>
  );
};

export default React.memo(ImplementationVariantFactsheetButtonComponent); 