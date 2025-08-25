'use client'; // Required for @react-pdf/renderer client-side nature

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font as PdfFont } from '@react-pdf/renderer';
import { BusinessParkInfo, MobilitySolution, GovernanceModel, ImplementationVariation, BusinessParkReason } from '@/domain/models';
import { SelectedVariantMap } from '@/lib/store';
import { stripSolutionPrefixFromVariantTitle, governanceTitleToFieldName as governanceTitleToFieldNameHelper, snakeToCamel as snakeToCamelHelper } from '@/utils/wizard-helpers';

// --- BEGIN STYLING CHANGES ---

// Using Open Sans from CDN (consistent with other PDF components)
const openSansRegularUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf';
const openSansItalicUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf';
const openSansBoldUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf';
const openSansBoldItalicUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700italic.ttf';

PdfFont.register({
  family: 'Open Sans',
  fonts: [
    { src: openSansRegularUrl, fontWeight: 'normal', fontStyle: 'normal' },
    { src: openSansItalicUrl, fontWeight: 'normal', fontStyle: 'italic' },
    { src: openSansBoldUrl, fontWeight: 'bold', fontStyle: 'normal' },
    { src: openSansBoldItalicUrl, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Disable hyphenation globally
PdfFont.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans', // Changed from Helvetica
    fontSize: 9, // Consistent base font size
    lineHeight: 1.5, // Consistent line height
    color: '#000000', // Consistent base text color
  },
  twoColRow: {
    flexDirection: 'row',
  },
  twoColLeft: {
    width: '50%',
    paddingRight: 12,
  },
  twoColRight: {
    width: '50%',
    paddingLeft: 12,
  },
  // Header for "Vervolgstappen" and "Mobiliteitsplan Bedrijventerrein X"
  headerSection: { 
    marginBottom: 25, // Consistent with factsheets headerContainer
    paddingBottom: 5, // Consistent with factsheets headerContainer
    // Removed borderBottom, factsheets don't have it on the main PDF title container
  },
  mainTitle: { // "Vervolgstappen"
    fontSize: 18, // Consistent with factsheets headerText
    fontWeight: 'bold', // Consistent with factsheets headerText
    fontFamily: 'Open Sans', // Ensure Open Sans
    color: '#000000', // Consistent with factsheets headerText
    textAlign: 'left', // Changed from center for consistency
    marginBottom: 2, // Consistent spacing for multi-line headers
    lineHeight: 1.4, // Consistent with factsheets headerText
  },
  subTitle: { // "Mobiliteitsplan Bedrijventerrein X"
    fontSize: 18, // Keep same size as main title if it's part of the main header block
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.4,
    marginBottom: 15, // Spacing after the full header block
  },
  // Generic heading styles for renderRichText, similar to htmlTagStyles in factsheets
  h1: { // Used by renderRichText if # is encountered
    fontSize: 16, 
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000', 
    marginTop: 10, 
    marginBottom: 14, // nog wat extra ruimte onder H1
    lineHeight: 1.1,
  },
  section: { // For major sections like "Uw keuzes"
    marginBottom: 15,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  lastSection: { // No border for the last section
    marginBottom: 15, // Consistent margin
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  h2: { // Section titles like "Uw keuzes", "Geselecteerde Oplossingen & Varianten"
    fontSize: 12.5, // match factsheets
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000', // Consistent with factsheet sectionTitle
    marginBottom: 9, // iets meer lucht onder H2
    lineHeight: 1.2, // Consistent with factsheet sectionTitle
    // Removed its own borderBottom, as the parent <View style={styles.section}> has it
  },
  h3: { // Sub-section titles like "Bedrijventerrein Informatie", or Solution Titles
    fontSize: 11, // match factsheets
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000',
    marginTop: 6, // Added marginTop for spacing, consistent with factsheet h3
    marginBottom: 5, // consistent
    lineHeight: 1.1,
  },
  h4: { // Further sub-titles, e.g., for variant name or reason title in contribution block
    fontSize: 10, // New distinct size, smaller than h3
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#333333', // Slightly lighter if needed, or keep #000000
    marginTop: 8,
    marginBottom: 4, // Adjusted from 6
    lineHeight: 1.1,
  },
  paragraph: { // For general text from renderRichText
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 5, // Consistent with factsheet p
    textAlign: 'left', // Changed from justify
    marginTop: 0, // Consistent with factsheet p
  },
  listItemContainer: { // For bulleted lists from renderRichText
    flexDirection: 'row',
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 3, // Consistent with factsheet li
    paddingLeft: 0, // Bullets will create indent, actual list container not padded like factsheet ul
    // marginLeft is handled by renderRichText if it's a nested list, or directly if needed.
  },
  listItemBullet: {
    width: 8, // Keeps bullet small
    fontFamily: 'Open Sans',
    fontSize: 9,
    marginRight: 5, // Space after bullet
  },
  listItemText: {
    flex: 1,
    fontFamily: 'Open Sans',
    fontSize: 9,
  },
  // Indent style, if directly used. renderRichText list items get auto-indent from bullet usually.
  indent: { 
    marginLeft: 15, // Standard indent
    marginBottom: 10, 
  },
  label: { // For labels like "Aantal bedrijven:"
    fontFamily: 'Open Sans',
    fontWeight: 'bold', 
    color: '#000000', // Make labels black for higher contrast like section titles
    fontSize: 9, 
    marginBottom: 2,
  },
  value: { // For values next to labels
    fontFamily: 'Open Sans',
    fontSize: 9,
    marginBottom: 6, // Spacing after a value entry
    color: '#000000',
  },
  gridContainer: { 
    flexDirection: 'row',
    marginBottom: 10,
  },
  gridColumn: {
    width: '50%',
    paddingRight: 10, 
  },
  gridColumnLast: { 
    width: '50%',
  },
  solutionBlock: { 
    marginBottom: 15,
    paddingBottom: 15, // Add padding before border to match section
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea', // Consistent light border
  },
  lastSolutionBlock: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  variantBlock: { // Container for a variant within a solution
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5, // Lighter border for sub-sections
    borderTopColor: '#f0f0f0', // Very light separator
    marginLeft: 10, 
  },
  contributionBlock: { // For "Bijdrage aan geselecteerde aanleidingen"
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0', // Very light separator
  },
  contributionItem: {
    marginBottom: 8,
  },
  subtleText: { // For "(Geen specifieke toelichting beschikbaar)"
    fontFamily: 'Open Sans',
    fontSize: 9,
    color: '#555555', // Slightly darker grey than before
    fontStyle: 'italic',
    marginLeft: 10, // If it's under a label
  },
  bold: { fontWeight: 'bold', fontFamily: 'Open Sans' }, // Ensure Open Sans for bold/italic
  italic: { fontStyle: 'italic', fontFamily: 'Open Sans' },
  
  // Table Styles - make them consistent with ImplementationVariantFactsheet if tables are complex
  // The current renderRichText table rendering is basic. If complex tables from factsheets are needed,
  // then the full table styling from ImplementationVariantFactsheetPdf (pdfTable, etc.) would be needed.
  // For now, keeping the existing improved table styles in summary-pdf, but with Open Sans.
  table: {
    width: 'auto', // Keep auto for flexibility
    borderStyle: 'solid',
    borderWidth: 0.5, // Lighter border than factsheets if desired, or match to #ccc
    borderColor: '#cccccc', // Consistent with factsheet table border
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, // Lighter than factsheets, or match to #ccc
    borderBottomColor: '#cccccc',
    alignItems: 'stretch',
  },
  tableColHeader: {
    backgroundColor: '#f0f0f0', // Consistent with factsheet table header
    padding: 5, // Consistent padding
    fontWeight: 'bold',
    fontFamily: 'Open Sans', // Ensure Open Sans
    fontSize: 8.5, // Match factsheet table cell font size
    borderRightWidth: 0.5, // Lighter than factsheets, or match to #ccc
    borderRightColor: '#cccccc',
    flexGrow: 3, // Keep existing flex for now
    flexBasis: 0,
  },
  tableCol: {
    padding: 5,
    fontFamily: 'Open Sans',
    fontSize: 8.5,
    borderRightWidth: 0.5,
    borderRightColor: '#cccccc',
    flexGrow: 3,
    flexBasis: 0,
  },
  tableCell: { // Applied to Text within tableCol/tableColHeader
    fontFamily: 'Open Sans',
    fontSize: 8.5, // Match factsheet table cell font size
  },
  tableColHeaderLast: { // Style for last header cell
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    fontSize: 8.5,
    flexGrow: 1, // Keep existing flex
    flexBasis: 0,
    // No right border for the very last cell in a row
  },
  tableColLast: { // Style for last data cell
    padding: 5,
    fontFamily: 'Open Sans',
    fontSize: 8.5,
    flexGrow: 1,
    flexBasis: 0,
    // No right border
  },
  tableCellRight: { // For right-aligning text in a cell (e.g., last column)
    fontFamily: 'Open Sans',
    fontSize: 8.5,
    textAlign: 'right',
  },
});

// --- END STYLING CHANGES ---

interface SummaryPdfDocumentProps {
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
}

// Cleaner: Preserves structure, trims lines.
const cleanText = (text: any): string => {
  if (typeof text !== 'string') {
    // If it's not a string, return an empty string to prevent crashes.
    // This might hide underlying data issues if non-string values are common.
    return '';
  }
  // Now we know text is a string
  return text
    .split('\n')
    .map(line => line.trimEnd()) // Trim end, keep leading spaces for lists etc.
    .join('\n')
    .trim(); // Trim start/end of the whole block
};

// Parses **bold** and *italic*
const renderInlineFormatting = (line: string, keyPrefix: string) => {
  // Split by bold/italic markers, keeping the delimiters
  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_)/g).filter(part => part);
  let isBold = false;
  let isItalic = false;
  
  return parts.map((part, index) => {
    const key = `${keyPrefix}-inline-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={key} style={styles.bold}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <Text key={key} style={styles.bold}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <Text key={key} style={styles.italic}>{part.slice(1, -1)}</Text>;
    }
     if (part.startsWith('_') && part.endsWith('_')) {
      return <Text key={key} style={styles.italic}>{part.slice(1, -1)}</Text>;
    }
    return <Text key={key}>{part}</Text>;
  });
};

// Fallback-safe text renderer: strips html and renders as paragraphs only
const safeRenderText = (text: string | null | undefined, baseKey: string) => {
  if (!text) return null;
  const stripped = cleanText(String(text).replace(/<[^>]+>/g, ' '));
  const paras = stripped.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
  return (
    <View key={`${baseKey}-safe`}>
      {paras.map((p, i) => (
        <Text key={`${baseKey}-p-${i}`} style={styles.paragraph}>{p}</Text>
      ))}
    </View>
  );
};

// Main renderer: Handles basic markdown (headings, lists, italics) safely
const renderRichText = (text: string | null | undefined, baseKey: string) => {
  if (!text) return null;
  const cleanedText = cleanText(text);
  const blocks = cleanedText.split(/\n{2,}/); // Split into blocks by double+ newlines
  let elementKey = 0;

  const elements = blocks.reduce<React.ReactElement[]>((acc, block, blockIndex) => {
    const blockKey = `${baseKey}-block-${blockIndex}`;
    const lines = block.trim().split('\n');
    
    // Omit table handling for stability

    // --- Handle Other Block Types (Headings, Lists, Paragraphs) ---
    const renderedLines = lines.map((line, lineIndex) => {
      const lineKey = `${blockKey}-line-${lineIndex}`;
      elementKey++;
      
      // Headings
      if (line.startsWith('### ')) {
        return <Text key={`${lineKey}-h3`} style={styles.h3}>{renderInlineFormatting(line.substring(4), lineKey)}</Text>;
      } else if (line.startsWith('## ')) {
        return <Text key={`${lineKey}-h2`} style={styles.h2}>{renderInlineFormatting(line.substring(3), lineKey)}</Text>;
      } else if (line.startsWith('# ')) {
        return <Text key={`${lineKey}-h1`} style={styles.h1}>{renderInlineFormatting(line.substring(2), lineKey)}</Text>;
      } 
      // List Items
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
            <View key={`${lineKey}-li-c`} style={styles.listItemContainer}>
                 <Text style={styles.listItemBullet}>•</Text>
                 <Text style={styles.listItemText}>{renderInlineFormatting(line.substring(2), lineKey)}</Text>
            </View>
        );
      } 
      // Paragraphs (default)
      else if (line.trim()) { // Only render non-empty lines as paragraphs
        return <Text key={`${lineKey}-p`} style={styles.paragraph}>{renderInlineFormatting(line, lineKey)}</Text>;
      }
      return null; // Skip empty lines within a block
    });
    
    const filtered = renderedLines.filter(el => el !== null);
    if (filtered.length > 0) {
      acc.push(
        <View key={`${blockKey}-container`}>
          {filtered}
        </View>
      );
    }
    return acc;
  }, []);

  // Ensure a single root element
  return <View>{elements}</View>;
};

// Split text into two approx-equal halves by block length (best-effort for 2-column flow)
function splitTextForColumns(text?: string): { left: string; right: string } {
  if (!text || typeof text !== 'string') return { left: '', right: '' };
  const blocks = cleanText(text).split(/\n{2,}/).filter(Boolean);
  const totalLen = blocks.reduce((n, b) => n + b.length, 0);
  let acc = 0;
  const pivot = blocks.findIndex((b) => {
    acc += b.length;
    return acc >= totalLen / 2;
  });
  const p = pivot < 0 ? blocks.length : pivot + 1;
  return {
    left: blocks.slice(0, p).join('\n\n'),
    right: blocks.slice(p).join('\n\n'),
  };
}

// Paginate a long text into N pages of two columns (approximate), preserving blocks
function paginateTwoColumns(text?: string, approxCharsPerColumn: number = 2200): Array<{ left: string; right: string }> {
  if (!text || typeof text !== 'string') return [];
  const blocks = cleanText(text).split(/\n{2,}/).filter(Boolean);
  const takeChunk = (fromIndex: number): { chunk: string; nextIndex: number } => {
    let accLen = 0;
    let i = fromIndex;
    const chosen: string[] = [];
    while (i < blocks.length && accLen + blocks[i].length <= approxCharsPerColumn) {
      chosen.push(blocks[i]);
      accLen += blocks[i].length;
      i++;
    }
    if (i < blocks.length && chosen.length === 0) {
      // Single block too large; split at sentence boundary near approxCharsPerColumn
      const b = blocks[i];
      const slicePoint = Math.max(
        b.lastIndexOf('. ', approxCharsPerColumn),
        b.lastIndexOf('\n', approxCharsPerColumn),
        b.lastIndexOf(' ', approxCharsPerColumn / 1.1)
      );
      if (slicePoint > 0) {
        chosen.push(b.slice(0, slicePoint + 1));
        blocks[i] = b.slice(slicePoint + 1).trim();
      } else {
        chosen.push(b.slice(0, approxCharsPerColumn));
        blocks[i] = b.slice(approxCharsPerColumn).trim();
      }
    }
    return { chunk: chosen.join('\n\n'), nextIndex: i };
  };

  const pages: Array<{ left: string; right: string }> = [];
  let idx = 0;
  while (idx < blocks.length) {
    const leftRes = takeChunk(idx);
    idx = leftRes.nextIndex;
    const rightRes = takeChunk(idx);
    idx = rightRes.nextIndex;
    pages.push({ left: leftRes.chunk, right: rightRes.chunk });
  }
  return pages;
}

// Improved pagination using line estimation per column (more even fill)
function paginateTwoColumnsByLines(text?: string, maxLinesPerColumn: number = 38, maxCharsPerLine: number = 85): Array<{ left: string; right: string }> {
  if (!text || typeof text !== 'string') return [];
  const paras = cleanText(text).split(/\n{2,}/).filter(Boolean);

  const estimateLines = (p: string) => {
    const words = p.replace(/\s+/g, ' ').trim().split(' ');
    let lines = 0;
    let cur = 0;
    for (const w of words) {
      const len = w.length + 1; // include space
      if (cur + len > maxCharsPerLine) {
        lines += 1;
        cur = len;
      } else {
        cur += len;
      }
    }
    if (cur > 0) lines += 1;
    return Math.max(lines, 1);
  };

  const pages: Array<{ left: string; right: string }> = [];
  let idx = 0;
  while (idx < paras.length) {
    // Fill left
    let leftLines = 0;
    const leftParts: string[] = [];
    while (idx < paras.length && leftLines + estimateLines(paras[idx]) <= maxLinesPerColumn) {
      leftParts.push(paras[idx]);
      leftLines += estimateLines(paras[idx]);
      idx++;
    }
    // Fill right
    let rightLines = 0;
    const rightParts: string[] = [];
    while (idx < paras.length && rightLines + estimateLines(paras[idx]) <= maxLinesPerColumn) {
      rightParts.push(paras[idx]);
      rightLines += estimateLines(paras[idx]);
      idx++;
    }
    pages.push({ left: leftParts.join('\n\n'), right: rightParts.join('\n\n') });
  }
  return pages;
}
const SummaryPdfDocument: React.FC<SummaryPdfDocumentProps> = ({
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
  selectedReasons: selectedReasonIds,
  snakeToCamel,
  selectedVariationsData = []
}) => {
  const selectedGovModel = governanceModels.find(gm => gm.id === selectedGovernanceModelId);
  // Resolve current governance model ID from title (so we can compare/compute suitability)
  const currentGovernanceModelIdResolved = React.useMemo(() => {
    if (!currentGovernanceModelTitle) return null;
    const found = governanceModels.find(gm => gm.title === currentGovernanceModelTitle);
    return found ? found.id : null;
  }, [governanceModels, currentGovernanceModelTitle]);

  const isSameGovernanceModel = React.useMemo(() => {
    return selectedGovernanceModelId && currentGovernanceModelIdResolved
      ? selectedGovernanceModelId === currentGovernanceModelIdResolved
      : false;
  }, [selectedGovernanceModelId, currentGovernanceModelIdResolved]);

  const isCurrentModelNotSuitable = React.useMemo(() => {
    if (!currentGovernanceModelIdResolved || !Array.isArray(selectedVariationsData)) return false;
    return selectedVariationsData.some(v =>
      Array.isArray((v as any).governanceModelsNietgeschikt) &&
      (v as any).governanceModelsNietgeschikt.some((g: any) => g?.sys?.id === currentGovernanceModelIdResolved)
    );
  }, [selectedVariationsData, currentGovernanceModelIdResolved]);

  const currentModelSufficient = isSameGovernanceModel && !isCurrentModelNotSuitable;

  // Helper to find a selected variation object by its ID
  const findVariantById = (variantId: string | null | undefined) => {
    if (!variantId) return null;
    return selectedVariationsData.find(v => v.id === variantId);
  };
  
  // Helper for rendering a label and value
  const renderLabelValue = (label: string, value?: string | number | null, keyPrefix?: string) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <View key={`${keyPrefix}-${label}`} style={{ marginBottom: 6 }}>
        <Text style={styles.label}>{label}:</Text>
        {typeof value === 'string' && value.includes('\n') ? (
          renderRichText(value, `${keyPrefix}-${label}-value`)
        ) : (
          <Text style={styles.value}>{String(value)}</Text>
        )}
      </View>
    );
  };
  
  // Helper for list items
  const renderListItem = (text: string, key: string) => (
    <View style={styles.listItemContainer} key={key}>
      <Text style={styles.listItemBullet}>•</Text>
      <Text style={styles.listItemText}>{text}</Text>
    </View>
  );

  // Introductietekst voor pagina 1
  const introParagraphs: string[] = [
    'Dit adviesrapport is een compacte samenvatting van de keuzes die u in de wizard heeft gemaakt. Het brengt de belangrijkste uitgangspunten en geselecteerde opties overzichtelijk bij elkaar en helpt u om de vervolgstappen te plannen en te onderbouwen.',
    'Het advies richt zich op collectieve vervoersoplossingen: voorzieningen waarmee meerdere organisaties of doelgroepen samen vervoer organiseren en financieren. Let op: dit is géén volledige mobiliteitsscan en ook geen individueel bedrijfsadvies; de uitkomst is bedoeld als gerichte shortlist en startpunt voor verdere uitwerking.'
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Adviesrapport</Text>
        </View>

        {/* Page 1 - single column stacked content */}
        <View style={styles.section}>
          <Text style={styles.h1}>Over dit advies</Text>
          {introParagraphs.map((p, i) => (
            <Text key={`intro-${i}`} style={styles.paragraph}>{p}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.h1}>Uw Keuzes</Text>
          <View style={styles.twoColRow}>
            <View style={styles.twoColLeft}>
              <Text style={styles.h3}>Bedrijventerrein Informatie</Text>
              {renderLabelValue("Aantal bedrijven", businessParkInfo.numberOfCompanies, "bp")}
              {renderLabelValue("Aantal werknemers", businessParkInfo.numberOfEmployees, "bp")}
              {businessParkInfo.trafficTypes && businessParkInfo.trafficTypes.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>Verkeerstypen:</Text>
                  {businessParkInfo.trafficTypes.map((type, i) => renderListItem(type, `traffic-${i}`))}
                </View>
              )}
              {renderLabelValue("Huidig bestuursmodel", currentGovernanceModelTitle, "bp")}
              {businessParkInfo.employeePickupPreference && renderLabelValue(
                "Deel van de woon-werkreis",
                businessParkInfo.employeePickupPreference === 'thuis' ? 'Voor de hele reis' : 'Voor het laatste deel van de reis',
                "bp"
              )}
            </View>
            <View style={styles.twoColRight}>
              <Text style={styles.h3}>Selecties</Text>
              {selectedReasonTitles.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>Geselecteerde aanleidingen:</Text>
                  {selectedReasonTitles.map((title, i) => renderListItem(title, `reason-${i}`))}
                </View>
              )}
              {selectedSolutionsData.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>Geselecteerde collectieve mobiliteitsoplossing:</Text>
                  {selectedSolutionsData.map((sol, i) => renderListItem(sol.title, `solution-title-${i}`))}
                </View>
              )}
              {selectedVariationsData.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>Gekozen implementatievariant:</Text>
                  {selectedVariationsData.map((v, i) => renderListItem(stripSolutionPrefixFromVariantTitle(v.title), `variant-title-${i}`))}
                </View>
              )}
              {selectedGovModel && (
                renderLabelValue("Geselecteerde governance model", selectedGovModel.title, "gov")
              )}
            </View>
          </View>
        </View>

        {/* Footer intentionally removed to simplify rendering */}

      </Page>
      {/* Page 2: Governance model only */}
      <Page size="A4" style={styles.page}>
        {selectedGovModel ? (
          <View style={styles.section}>
            <Text style={styles.h1}>{selectedGovModel.title}</Text>
            {renderRichText(selectedGovModel.summary || selectedGovModel.samenvatting || selectedGovModel.description, `gov-sum-${selectedGovModel.id}`)}

            {/* If current model is sufficient, show a short notice instead of full implementatiestappen */}
            {currentModelSufficient ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.paragraph}>Het huidige governance model voldoet en u kunt verder met de implementatiestappen voor het implementeren van de collectieve vervoersoplossing.</Text>
              </View>
            ) : (
              selectedGovModel.implementatie && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.h1}>Implementatie</Text>
                  {renderRichText(selectedGovModel.implementatie, `gov-impl-${selectedGovModel.id}`)}
                </View>
              )
            )}

            {/* Algemene vervolgstappen direct onder governance implementatie of melding */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.h1}>Algemene vervolgstappen</Text>
              {renderRichText(
                [
                  'Nadat u de governance model keuze hebt gemaakt, kunt u verdergaan met de volgende stappen, maar voordat u verder gaat, is het belangrijk om de volgende punten te controleren:',
                  '- Check of relevante bereikbaarheidsdata (o.a. type bedrijf, begin- en eindtijden van werknemers, inzicht in bezoekersstromen, woon-werkverkeer en zakelijk verkeer, locatie, aanwezigheid infrastructuur etc.) aanwezig is binnen (een deel van) de aangesloten bedrijven en/of is geïnventariseerd vanuit een mobiliteitsmakelaar in uw regio. Controleer of deze data actueel en betrouwbaar is.',
                  "- Indien niet aanwezig, voer een mobiliteitsscan uit. In sommige regio's kan dit gratis via een mobiliteitsmakelaar. Het alternatief is dit onderdeel te maken van de inkoop of een risico te lopen in het gebruik in de praktijk te toetsen.",
                  '- Neem de bedrijven mee in de plannen en breng samen het proces goed in kaart. Bepaal of de kennis, kunde en capaciteit aanwezig is binnen de bedrijfsvereniging en/of dat specialisten ingeschakeld moeten worden. De moeilijkheidsgraad in de vorige stappen geeft hiervoor een indicatie.',
                  '- Check de wenselijkheid en mogelijkheden van de COVER subsidie m.b.t. de inkoopmodellen. Onderaan deze pagina vindt u meer informatie over deze subsidie.',
                  '- Vergeet hierbij niet om afspraken te maken over wie verantwoordelijk is voor de communicatie naar de gebruikers!'
                ].join('\n\n'),
                'alg-vsvgstp-inline'
              )}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.h1}>Governancemodel</Text>
            <Text style={styles.paragraph}>Geen governance model geselecteerd.</Text>
          </View>
        )}
      </Page>
      {/* Vervolgpagina met oplossing en variant */}
      <Page size="A4" style={styles.page}>
        {selectedSolutionsData && selectedSolutionsData.length > 0 && (() => {
          const solution = selectedSolutionsData[0];
          const variantIdForSolution = selectedVariants[solution.id];
          const chosenVariant = findVariantById(variantIdForSolution);
          return (
            <View>
              <View style={styles.section}>
                <Text style={styles.h1}>{solution.title}</Text>
                {solution.samenvattingLang && renderRichText(solution.samenvattingLang, `sol-sum-${solution.id}`)}

                {chosenVariant && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.h1}>{stripSolutionPrefixFromVariantTitle(chosenVariant.title)}</Text>
                    {chosenVariant.samenvatting && renderRichText(chosenVariant.samenvatting, `var-sum-${chosenVariant.id}`)}
                    {/* Realisatieplan – aandachtspunten verwijderd */}
                    {chosenVariant.vervolgstappen && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.h1}>Vervolgstappen</Text>
                        {renderRichText(chosenVariant.vervolgstappen, `var-steps-${chosenVariant.id}`)}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })()}
      </Page>
      {/* Removed extra variant continuation pages to avoid duplicated content */}
    </Document>
  );
};

export default SummaryPdfDocument; 