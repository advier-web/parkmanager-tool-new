"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BusinessParkInfo, GovernanceModel, ImplementationVariation, MobilitySolution } from '@/domain/models';
import { SelectedVariantMap } from '@/lib/store';

interface SummaryHtmlPdfDownloadButtonProps {
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
  label?: string;
}

function renderList(items: string[]) {
  return (
    <ul style={{ margin: '4px 0 8px 18px' }}>
      {items.map((t, i) => (
        <li key={i} style={{ marginBottom: 4 }}>{t}</li>
      ))}
    </ul>
  );
}

export default function SummaryHtmlPdfDownloadButton(props: SummaryHtmlPdfDownloadButtonProps) {
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
    label = 'Download Adviesrapport',
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedGovModel = useMemo(() => governanceModels.find(gm => gm.id === selectedGovernanceModelId) || null, [governanceModels, selectedGovernanceModelId]);

  const solution = selectedSolutionsData[0];
  const chosenVariant = useMemo(() => {
    if (!solution) return null;
    const id = selectedVariants[solution.id];
    return (selectedVariationsData || []).find(v => v.id === id) || null;
  }, [solution, selectedVariants, selectedVariationsData]);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setBusy(true);
    try {
      const element = containerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth; // fill width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      position = -pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }

      pdf.save(fileName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={handleDownload} className={className} disabled={busy}>
        <DocumentTextIcon className="h-4 w-4" />
        {busy ? 'Even geduld…' : label}
      </Button>

      {/* Hidden printable container */}
      <div ref={containerRef} style={{ position: 'fixed', left: -99999, top: 0, width: 1120 }}>
        <style>{`
          .page { width: 100%; height: 740pt; padding: 24pt; box-sizing: border-box; }
          .title { font-weight: 700; font-size: 18pt; margin: 0 0 6pt; }
          .h2 { font-weight: 700; font-size: 12pt; margin: 12pt 0 6pt; }
          .h3 { font-weight: 700; font-size: 11pt; margin: 10pt 0 6pt; }
          .p { font-size: 10pt; margin: 0 0 6pt; line-height: 1.45; }
          .two-cols { column-count: 2; column-gap: 24pt; }
          .pb { page-break-before: always; }
          .avoid { page-break-inside: avoid; }
        `}</style>

        {/* Page 1 */}
        <div className="page">
          <div className="title">Adviesrapport</div>
          <div className="h2">Over dit advies</div>
          <p className="p">Dit adviesrapport is een compacte samenvatting van de keuzes die u in de wizard heeft gemaakt. Het brengt de belangrijkste uitgangspunten en geselecteerde opties overzichtelijk bij elkaar en helpt u om de vervolgstappen te plannen en te onderbouwen.</p>
          <p className="p">Het advies richt zich op collectieve vervoersoplossingen: voorzieningen waarmee meerdere organisaties of doelgroepen samen vervoer organiseren en financieren. Door capaciteit te bundelen ontstaan efficiëntere, betaalbaardere en duurzamere reisopties. De aanpak werkt het best wanneer bedrijven, parkmanagement en aanbieders afspraken vastleggen in een passend governance- en inkoopmodel.</p>

          <div className="h2">Uw Keuzes</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div className="h3">Bedrijventerrein Informatie & Locatiekenmerken</div>
              {renderList([
                `Aantal bedrijven: ${businessParkInfo.numberOfCompanies}`,
                ...(businessParkInfo.trafficTypes || []).map(t => `Verkeerstypen: ${t}`),
              ])}
            </div>
            <div style={{ flex: 1 }}>
              {renderList([
                `Aantal werknemers: ${businessParkInfo.numberOfEmployees}`,
                `Huidig bestuursmodel: ${currentGovernanceModelTitle}`,
              ])}
            </div>
          </div>
        </div>

        {/* Page 2+: Governance */}
        {selectedGovModel && (
          <div className="page pb">
            <div className="h2">Gekozen Governance model</div>
            <div className="h3">{selectedGovModel.title}</div>
            {selectedGovModel.summary && <p className="p" dangerouslySetInnerHTML={{ __html: selectedGovModel.summary }} />}
            <div className="two-cols">
              {selectedGovModel.implementatie && (
                <div dangerouslySetInnerHTML={{ __html: selectedGovModel.implementatie }} />
              )}
            </div>
          </div>
        )}

        {/* Page: Solution + Variant */}
        {solution && (
          <div className="page pb">
            <div className="h2">Gekozen vervoersoplossing</div>
            <div className="h3">{solution.title}</div>
            {solution.samenvattingLang && (
              <div className="p" dangerouslySetInnerHTML={{ __html: solution.samenvattingLang }} />
            )}

            {chosenVariant && (
              <>
                <div className="h2" style={{ marginTop: 16 }}>Gekozen implementatievariant</div>
                <div className="h3">{chosenVariant.title}</div>
                {chosenVariant.samenvatting && (
                  <div className="p" dangerouslySetInnerHTML={{ __html: chosenVariant.samenvatting }} />
                )}
                {chosenVariant.realisatieplanAandachtspunten && (
                  <div className="two-cols">
                    <div dangerouslySetInnerHTML={{ __html: chosenVariant.realisatieplanAandachtspunten }} />
                  </div>
                )}
              </>
            )}

            {/* Vervolgstappen (optioneel) */}
            {/* Hier kan je extra secties toevoegen, html stroomt automatisch door over kolommen/pagina's */}
          </div>
        )}
      </div>
    </>
  );
}


