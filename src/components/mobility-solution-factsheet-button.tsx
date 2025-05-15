import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MobilitySolutionFactsheetPdf from './mobility-solution-factsheet-pdf';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { MobilitySolution } from '@/domain/models';

interface MobilitySolutionFactsheetButtonProps {
  solution: MobilitySolution | null;
  className?: string;
  buttonColorClassName?: string;
}

const MobilitySolutionFactsheetButton: React.FC<MobilitySolutionFactsheetButtonProps> = ({ 
  solution, 
  className, 
  buttonColorClassName = 'bg-blue-600 hover:bg-blue-700 text-white'
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!solution) {
    return (
      <Button variant="default" disabled className={`${className} ${buttonColorClassName} opacity-50`}>
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        Factsheet Oplossing (niet beschikbaar)
      </Button>
    );
  }

  const fileName = `Factsheet_${solution.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  return (
    <div className={className}>
      {isClient ? (
        <PDFDownloadLink
          document={<MobilitySolutionFactsheetPdf solution={solution} />}
          fileName={fileName}
        >
          {({ loading }) => (
            <Button variant="default" disabled={loading} className={buttonColorClassName}>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {loading ? 'Factsheet genereren...' : `Download Factsheet: ${solution.title}`}
            </Button>
          )}
        </PDFDownloadLink>
      ) : (
        <Button variant="default" disabled className={buttonColorClassName}>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Factsheet laden...
        </Button>
      )}
    </div>
  );
};

export default MobilitySolutionFactsheetButton; 