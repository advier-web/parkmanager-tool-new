import React from 'react';
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
  buttonText?: string; // Optional custom button text
}

const GovernanceModelFactsheetButton: React.FC<GovernanceModelFactsheetButtonProps> = ({
  governanceModel,
  selectedVariations = [],
  governanceTitleToFieldName,
  stripSolutionPrefixFromVariantTitle,
  className = '',
  buttonText,
}) => {
  const defaultButtonText = `Download factsheet ${governanceModel.title || 'Governance Model'}`;
  const actualButtonText = buttonText || defaultButtonText;
  const fileName = `Factsheet_Governance_Model_${(governanceModel.title || 'model').replace(/\s+/g, '_')}.pdf`;

  // Client-side rendering check for PDFDownloadLink
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

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
      document={(
        <GovernanceModelFactsheetPdf 
          model={governanceModel}
          variations={selectedVariations}
          governanceTitleToFieldName={governanceTitleToFieldName}
          stripSolutionPrefixFromVariantTitle={stripSolutionPrefixFromVariantTitle}
        />
      )}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Button 
          variant="default" 
          className={`${className} bg-blue-600 text-white hover:bg-blue-700`}
          disabled={loading}
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {loading ? 'PDF genereren...' : actualButtonText}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default GovernanceModelFactsheetButton; 