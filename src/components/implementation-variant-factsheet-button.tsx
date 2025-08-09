import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ImplementationVariantFactsheetPdf from './implementation-variant-factsheet-pdf';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
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
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        Factsheet Variant (niet beschikbaar)
      </Button>
    );
  }
  
  const fileName = `Factsheet_Variant_${variation.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  return (
    <div className={className}>
      {isClient && isArmed && pdfDocument ? (
        <PDFDownloadLink document={pdfDocument} fileName={fileName}>
          {({ loading }) => (
            <Button variant="default" disabled={loading} className={buttonColorClassName}>
              {children ? (
                <>
                  {loading ? 'Genereren...' : children}
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Factsheet genereren...' : `Download Factsheet: ${variation.title}`}
                </>
              )}
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
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {children || `Download Factsheet: ${variation.title}`}
        </Button>
      ) : (
        <Button variant="default" disabled className={buttonColorClassName}>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Factsheet laden...
        </Button>
      )}
    </div>
  );
};

export default React.memo(ImplementationVariantFactsheetButtonComponent); 