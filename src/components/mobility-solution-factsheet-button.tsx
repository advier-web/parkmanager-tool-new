import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MobilitySolutionFactsheetPdf from './mobility-solution-factsheet-pdf';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { MobilitySolution } from '@/domain/models';

interface MobilitySolutionFactsheetButtonProps {
  solution: MobilitySolution | null;
  className?: string;
  buttonColorClassName?: string;
  children?: React.ReactNode;
}

const MobilitySolutionFactsheetButtonComponent: React.FC<MobilitySolutionFactsheetButtonProps> = ({ 
  solution, 
  className, 
  buttonColorClassName = 'bg-blue-600 hover:bg-blue-700 text-white',
  children
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pdfDocument = useMemo(() => {
    if (!solution) return null;
    return <MobilitySolutionFactsheetPdf solution={solution} />;
  }, [solution]);

  if (!solution) {
    return (
      <Button variant="default" disabled className={`${className} ${buttonColorClassName} opacity-50`}>
        <DocumentTextIcon className="h-4 w-4" />
        Factsheet Oplossing (niet beschikbaar)
      </Button>
    );
  }

  const fileName = `Factsheet_${solution.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  if (!pdfDocument) {
    return (
      <Button variant="default" disabled className={`${className} ${buttonColorClassName} opacity-50`}>
        <DocumentTextIcon className="h-4 w-4" />
        Factsheet (document niet beschikbaar)
      </Button>
    );
  }

  return isClient ? (
    <PDFDownloadLink document={pdfDocument} fileName={fileName}>
      {({ loading }) => (
        <Button variant="default" className={`${className} ${buttonColorClassName}`} disabled={loading}>
          <DocumentTextIcon className="h-4 w-4" />
          {children ? (loading ? 'Even geduld…' : children) : (loading ? 'Even geduld…' : `Download factsheet ${solution.title}`)}
        </Button>
      )}
    </PDFDownloadLink>
  ) : (
    <Button variant="default" disabled className={`${className} ${buttonColorClassName}`}>
      <DocumentTextIcon className="h-4 w-4" />
      Factsheet laden...
    </Button>
  );
};

export default React.memo(MobilitySolutionFactsheetButtonComponent); 