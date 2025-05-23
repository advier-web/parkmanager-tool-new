import React, { useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { GovernanceModel, ImplementationVariation } from '@/domain/models';
import GovernanceModelFactsheetPdf from './governance-model-factsheet-pdf'; // Path to the PDF document component

// Helper function types (ensure these match the actual helpers you pass)
interface GovernanceModelFactsheetButtonProps {
  governanceModel: GovernanceModel;
  selectedVariations?: ImplementationVariation[]; // Optional, as it might not always be available
  governanceTitleToFieldName: (title: string | undefined) => string | null | undefined;
  stripSolutionPrefixFromVariantTitle: (title: string) => string;
  className?: string;
  children?: React.ReactNode; // Added children prop
  buttonColorClassName?: string; // Added for consistency with other buttons
}

const GovernanceModelFactsheetButton: React.FC<GovernanceModelFactsheetButtonProps> = ({
  governanceModel,
  selectedVariations = [],
  governanceTitleToFieldName,
  stripSolutionPrefixFromVariantTitle,
  className = '',
  children,
  buttonColorClassName = 'bg-blue-600 hover:bg-blue-700 text-white' // Default styling
}) => {
  const fileName = `Factsheet_Governance_Model_${(governanceModel.title || 'model').replace(/[^\s\w-]/gi, '_').replace(/\s+/g, '_')}.pdf`; // Improved file name generation

  // Client-side rendering check for PDFDownloadLink
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const pdfDocument = useMemo(() => {
    return (
      <GovernanceModelFactsheetPdf 
        model={governanceModel}
        variations={selectedVariations}
        governanceTitleToFieldName={governanceTitleToFieldName}
        stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
      />
    );
  }, [governanceModel, selectedVariations, governanceTitleToFieldName, stripSolutionPrefixFromVariantTitle]);

  if (!isClient) {
    return (
      <Button variant="default" disabled className={`${className} bg-blue-600 text-white opacity-75`}>
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        PDF laden...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={pdfDocument}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Button 
          variant="default" 
          className={`${className} ${buttonColorClassName}`} // Use buttonColorClassName
          disabled={loading}
        >
          {children ? (
            <>
              {loading ? 'Genereren...' : children}
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {loading ? 'PDF genereren...' : `Download Factsheet: ${governanceModel.title || 'Governance Model'}`}
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default React.memo(GovernanceModelFactsheetButton); 