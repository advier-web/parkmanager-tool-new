"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import SummaryPdfDocument from './summary-pdf-document';
import { BusinessParkInfo, GovernanceModel, ImplementationVariation, MobilitySolution } from '@/domain/models';
import { SelectedVariantMap } from '@/lib/store';

interface SummaryPdfDownloadButtonProps {
  businessParkInfo: BusinessParkInfo;
  businessParkName: string;
  currentGovernanceModelTitle: string;
  selectedReasonTitles: string[];
  selectedSolutionsData: MobilitySolution[];
  selectedVariants: SelectedVariantMap;
  selectedGovernanceModelId: string | null;
  governanceModels: GovernanceModel[];
  governanceTitleToFieldName: (title: string | undefined) => string | null;
  reasons: Array<{ id: string; title: string; identifier?: string }>;
  selectedReasons: string[];
  snakeToCamel: (str: string) => string;
  selectedVariationsData?: ImplementationVariation[];
  fileName: string;
  className?: string;
  buttonClassName?: string;
  label?: string;
  showIcon?: boolean;
}

export default function SummaryPdfDownloadButton(props: SummaryPdfDownloadButtonProps) {
  const {
    businessParkInfo,
    businessParkName,
    currentGovernanceModelTitle,
    selectedReasonTitles,
    selectedSolutionsData,
    selectedVariants,
    selectedGovernanceModelId,
    governanceModels,
    governanceTitleToFieldName,
    reasons,
    selectedReasons,
    snakeToCamel,
    selectedVariationsData = [],
    fileName,
    className = '',
    buttonClassName = 'bg-blue-600 hover:bg-blue-700 text-white',
    label = 'Download Adviesrapport',
  } = props;
  const { showIcon = true } = props;

  const [isClient, setIsClient] = React.useState(false);
  const [isArmed, setIsArmed] = React.useState(false);
  const [autoTriggered, setAutoTriggered] = React.useState(false);

  React.useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <Button variant="default" disabled className={buttonClassName + ' ' + className}>
        {showIcon && <DocumentTextIcon className="h-4 w-4" />}
        Laden…
      </Button>
    );
  }

  if (!isArmed) {
    return (
      <Button
        variant="default"
        className={buttonClassName + ' ' + className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsArmed(true);
        }}
      >
        {showIcon && <DocumentTextIcon className="h-4 w-4" />}
        {label}
      </Button>
    );
  }

  const AutoDownloader: React.FC<{ loading: boolean; url?: string | null }> = ({ loading, url }) => {
    React.useEffect(() => {
      if (!loading && url && !autoTriggered) {
        setAutoTriggered(true);
        // Programmatically trigger a download with the provided URL and filename
        try {
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          // Fallback: open in new tab
          window.open(url, '_blank');
        }
      }
    }, [loading, url]);
    return null;
  };

  return (
    <PDFDownloadLink
      document={(
        <SummaryPdfDocument
          businessParkInfo={businessParkInfo}
          businessParkName={businessParkName}
          currentGovernanceModelTitle={currentGovernanceModelTitle}
          selectedReasonTitles={selectedReasonTitles}
          selectedSolutionsData={selectedSolutionsData}
          selectedVariants={selectedVariants}
          selectedGovernanceModelId={selectedGovernanceModelId}
          governanceModels={governanceModels}
          governanceTitleToFieldName={governanceTitleToFieldName}
          reasons={reasons}
          selectedReasons={selectedReasons}
          snakeToCamel={snakeToCamel}
          selectedVariationsData={selectedVariationsData}
        />
      )}
      fileName={fileName}
    >
      {({ loading, url }: { loading: boolean; url?: string }) => (
        <>
          <AutoDownloader loading={loading} url={url} />
          <Button variant="default" className={buttonClassName + ' ' + className} disabled={loading}>
            {showIcon && <DocumentTextIcon className="h-4 w-4" />}
            {loading ? 'Even geduld…' : label}
          </Button>
        </>
      )}
    </PDFDownloadLink>
  );
}


