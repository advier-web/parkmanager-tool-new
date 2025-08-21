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
    marginBottom: 1, // Consistent with factsheet h1
    lineHeight: 1.1,
  },
  section: { // For major sections like "Uw keuzes"
    marginBottom: 15, // Consistent with factsheets
    paddingBottom: 10, // Consistent with factsheets
    borderBottomWidth: 1, // Consistent with factsheets
    borderBottomColor: '#eaeaea', // Consistent with factsheets
    borderBottomStyle: 'solid',
  },
  lastSection: { // No border for the last section
    marginBottom: 15, // Consistent margin
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  h2: { // Section titles like "Uw keuzes", "Geselecteerde Oplossingen & Varianten"
    fontSize: 12.5, // Consistent with factsheet sectionTitle
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000', // Consistent with factsheet sectionTitle
    marginBottom: 8, // Adjusted for visual hierarchy below section, allow more space than factsheet's 2mb
    lineHeight: 1.2, // Consistent with factsheet sectionTitle
    // Removed its own borderBottom, as the parent <View style={styles.section}> has it
  },
  h3: { // Sub-section titles like "Bedrijventerrein Informatie", or Solution Titles
    fontSize: 12, // Slightly smaller than h2, similar to factsheet h3 for renderRichText
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    color: '#000000',
    marginTop: 6, // Added marginTop for spacing, consistent with factsheet h3
    marginBottom: 5, // Adjusted from 8, factsheet h3 has 3
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

// Main renderer: Handles blocks (paragraphs, headings, lists, tables)
const renderRichText = (text: string | null | undefined, baseKey: string) => {
  if (!text) return null;
  const cleanedText = cleanText(text);
  const blocks = cleanedText.split(/\n{2,}/); // Split into blocks by double+ newlines
  let elementKey = 0;

  const elements = blocks.flatMap((block, blockIndex) => {
    const blockKey = `${baseKey}-block-${blockIndex}`;
    const lines = block.trim().split('\n');
    
    // --- Handle Tables ---
    if (lines.length > 1 && lines[0].includes('|') && lines[1].includes('---')) {
        const headerLine = lines[0];
        const dataLines = lines.slice(2);
        
        // Split headers, trim, and remove potential empty strings from start/end pipes
        const headers = headerLine.split('|').map(h => h.trim()).slice(1, -1); 
        const numColumns = headers.length;

        if (numColumns > 0) { // Proceed only if we have valid headers
            const dataRows = dataLines.map(rowLine => {
                // Split data row, trim, remove start/end pipe fragments
                const cells = rowLine.split('|').map(c => c.trim()).slice(1, -1);
                // Normalize cell count: Pad with empty strings or truncate
                const normalizedCells = Array(numColumns).fill('');
                for (let i = 0; i < numColumns; i++) {
                    normalizedCells[i] = cells[i] || ''; // Use cell value or empty string
                }
                return normalizedCells;
            });

            elementKey++;
            return (
                <View key={`${blockKey}-table-${elementKey}`} style={styles.table}>
                    {/* Header Row - Apply last col style */}
                    <View style={styles.tableRow}>
                        {headers.map((header, hIndex) => (
                            <View key={`h-${hIndex}`} style={hIndex === numColumns - 1 ? styles.tableColHeaderLast : styles.tableColHeader}>
                                <Text style={styles.tableCell}>{renderInlineFormatting(header, `${blockKey}-th-${hIndex}`)}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Data Rows - Apply last col style and right align text in last cell */}
                    {dataRows.map((row, rIndex) => (
                        <View key={`r-${rIndex}`} style={styles.tableRow}>
                            {row.map((cell, cIndex) => (
                                <View key={`c-${rIndex}-${cIndex}`} style={cIndex === numColumns - 1 ? styles.tableColLast : styles.tableCol}>
                                    <Text style={cIndex === numColumns - 1 ? styles.tableCellRight : styles.tableCell}>{renderInlineFormatting(cell, `${blockKey}-td-${rIndex}-${cIndex}`)}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            );
        } 
        // If table detection fails basic validation, fall through
    }

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
    
    return renderedLines.filter(el => el !== null);
  });

  return <>{elements}</>; // Render all parsed elements
};

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Adviesrapport</Text>
        </View>

        {/* == Section 1: Uw Keuzes == */}
        <View style={styles.section}>
          <Text style={styles.h2}>Uw Keuzes</Text>
          
          <Text style={styles.h3}>Bedrijventerrein Informatie & Locatiekenmerken</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridColumn}>
              {renderLabelValue("Aantal bedrijven", businessParkInfo.numberOfCompanies, "bp")}
              {businessParkInfo.trafficTypes && businessParkInfo.trafficTypes.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>Verkeerstypen:</Text>
                  {businessParkInfo.trafficTypes.map((type, i) => renderListItem(type, `traffic-${i}`))}
                </View>
              )}
              {renderLabelValue("Bereikbaarheid met auto", businessParkInfo.carAccessibility, "bp")}
              {renderLabelValue("Bereikbaarheid met trein", businessParkInfo.trainAccessibility, "bp")}
              {renderLabelValue("Bereikbaarheid met bus", businessParkInfo.busAccessibility, "bp")}
            </View>
            <View style={styles.gridColumnLast}>
              {renderLabelValue("Aantal werknemers", businessParkInfo.numberOfEmployees, "bp")}
              {renderLabelValue("Huidig bestuursmodel", currentGovernanceModelTitle, "bp")}
              {businessParkInfo.employeePickupPreference && renderLabelValue(
                "Deel van de woon-werkreis",
                businessParkInfo.employeePickupPreference === 'thuis' ? 'Voor de hele reis' : 'Voor het laatste deel van de reis',
                "bp"
              )}
              {renderLabelValue("Voldoende parkeerplaatsen", businessParkInfo.sufficientParking, "bp")}
              {businessParkInfo.averageDistance && renderLabelValue("Gemiddelde woon-werk afstand", businessParkInfo.averageDistance === '25+' ? 'Meer dan 25 km' : `${businessParkInfo.averageDistance} km`, "bp")}
            </View>
          </View>

          <Text style={styles.h3}>Selecties</Text>
           <View style={styles.gridContainer}>
             <View style={styles.gridColumn}>
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
            </View>
            <View style={styles.gridColumnLast}>
                {selectedVariationsData.length > 0 && (
                    <View style={{ marginBottom: 6 }}>
                        <Text style={styles.label}>Gekozen implementatievarianten:</Text>
                        {selectedVariationsData.map((v, i) => renderListItem(stripSolutionPrefixFromVariantTitle(v.title), `variant-title-${i}`))}
                    </View>
                )}
                {selectedGovModel && (
                    renderLabelValue("Geselecteerde governance model", selectedGovModel.title, "gov")
                )}
            </View>
          </View>
        </View>

        {/* == Section 2: Governance model == */}
        {selectedGovModel && (
          <View style={styles.section}>
            <Text style={styles.h2}>Governancemodel</Text>
            <Text style={styles.h3}>{selectedGovModel.title}</Text>
            {renderRichText(selectedGovModel.summary || selectedGovModel.samenvatting || selectedGovModel.description, `gov-sum-${selectedGovModel.id}`)}
            {selectedGovModel.implementatie && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.h4}>Implementatie</Text>
                {renderRichText(selectedGovModel.implementatie, `gov-impl-${selectedGovModel.id}`)}
              </View>
            )}
          </View>
        )}

        {/* == Section 3: Vervoersoplossing == */}
        {selectedSolutionsData && selectedSolutionsData.length > 0 && (
          (() => {
            const solution = selectedSolutionsData[0];
            const variantIdForSolution = selectedVariants[solution.id];
            const chosenVariant = findVariantById(variantIdForSolution);
            return (
              <>
                <View style={styles.section}>
                  <Text style={styles.h2}>Vervoersoplossing</Text>
                  <Text style={styles.h3}>{solution.title}</Text>
                  {solution.samenvattingLang && renderRichText(solution.samenvattingLang, `sol-sum-${solution.id}`)}
                  {solution.uitvoering && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.h4}>Uitvoering</Text>
                      {renderRichText(solution.uitvoering, `sol-uitv-${solution.id}`)}
                    </View>
                  )}
                </View>

                {/* == Section 4: Implementatievariant == */}
                {chosenVariant && (
                  <View style={styles.lastSection}>
                    <Text style={styles.h2}>Implementatievariant</Text>
                    <Text style={styles.h3}>{stripSolutionPrefixFromVariantTitle(chosenVariant.title)}</Text>
                    {chosenVariant.samenvatting && renderRichText(chosenVariant.samenvatting, `var-sum-${chosenVariant.id}`)}
                    {chosenVariant.vervolgstappen && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.h4}>Vervolgstappen</Text>
                        {renderRichText(chosenVariant.vervolgstappen, `var-steps-${chosenVariant.id}`)}
                      </View>
                    )}
                  </View>
                )}
              </>
            );
          })()
        )}
        
        {/* Potential Footer for page numbers or generated date */}
        <Text style={{ position: 'absolute', fontSize: 8, bottom: 15, left: 30, right: 30, textAlign: 'center', color: 'grey' }} fixed>
          Pagina <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>

      </Page>
    </Document>
  );
};

export default SummaryPdfDocument; 