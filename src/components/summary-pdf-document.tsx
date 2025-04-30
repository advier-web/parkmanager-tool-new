'use client'; // Required for @react-pdf/renderer client-side nature

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { BusinessParkInfo, MobilitySolution, GovernanceModel, ImplementationVariation } from '@/domain/models'; // Add ImplementationVariation
import { SelectedVariantMap } from '@/lib/store';
import { extractPassportTextWithVariant, stripSolutionPrefixFromVariantTitle } from '@/utils/wizard-helpers'; // Import new helper

// Register font (optional, but good for consistency)
// Ensure you have the font files available or use standard fonts
// Font.register({ family: 'Helvetica', fonts: [ { src: 'path/to/Helvetica.ttf' } ] }); // Example

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 35, // Slightly more padding
    fontSize: 10,
    fontFamily: 'Helvetica', // Ensure this matches registered font or is standard
    lineHeight: 1.5, // Increased line height
    color: '#333',
  },
  section: {
    marginBottom: 18, // Increased spacing
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
  },
  lastSection: {
    marginBottom: 18,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  h1: {
    fontSize: 20, // Larger
    marginBottom: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  h2: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#222',
  },
  h3: {
    fontSize: 13, // Adjusted size
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  h4: {
    fontSize: 11,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#444',
  },
  paragraph: {
    marginBottom: 8, // Space after paragraphs
  },
  listItemContainer: { // Container for list items for potential indentation
    flexDirection: 'row',
    marginBottom: 5,
    marginLeft: 10, // Indent list items
  },
  listItemBullet: {
    width: 10,
    fontSize: 10,
    marginRight: 5,
  },
  listItemText: {
    flex: 1,
  },
  indent: {
    marginLeft: 15,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gridCol: {
    width: '50%',
    paddingRight: 12,
    marginBottom: 12,
  },
  solutionItem: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  lastSolutionItem: {
    marginBottom: 18,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  subSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    borderTopStyle: 'solid',
    marginLeft: 10,
  },
  // --- Table Styles ---
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
    alignItems: 'stretch',
  },
  tableColHeader: {
    backgroundColor: '#f8f8f8',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexBasis: 0, // Base for flex grow
    flexGrow: 3, // Default grow for header cols
    fontWeight: 'bold',
  },
  tableColHeaderLast: { // Style for the last header cell
    backgroundColor: '#f8f8f8',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexBasis: 0,
    flexGrow: 1, // Less grow for the last column
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexBasis: 0,
    flexGrow: 3, // Default grow (description column)
  },
  tableColLast: { // Style for the last data cell column
     borderStyle: 'solid',
     borderWidth: 0.5,
     borderColor: '#ddd',
     borderLeftWidth: 0,
     borderTopWidth: 0,
     padding: 5,
     flexBasis: 0,
     flexGrow: 1, // Less grow (cost column)
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellRight: { // Style for right-aligned text in cells
      fontSize: 9,
      textAlign: 'right',
  },
  // --- Inline Styles --- (used within renderInlineFormatting)
  bold: { fontWeight: 'bold' }, 
  italic: { fontStyle: 'italic' }, 
});

interface SummaryPdfDocumentProps {
  businessParkInfo: BusinessParkInfo;
  currentGovernanceModelTitle: string;
  selectedReasonTitles: string[];
  selectedSolutionsData: MobilitySolution[];
  selectedVariants: SelectedVariantMap;
  selectedGovernanceModelId: string | null;
  selectedImplementationPlanTitle: string;
  governanceModels: GovernanceModel[];
  governanceTitleToFieldName: (title: string | undefined) => string | null;
  extractImplementationSummaryFromVariant: (implementationText: string | undefined, variantName: string | null) => string | null;
  reasons: Array<{ id: string; title: string; identifier?: string }>;
  selectedReasons: string[];
  snakeToCamel: (str: string) => string;
  selectedVariationsData?: ImplementationVariation[]; // Add prop
}

// Cleaner: Preserves structure, trims lines.
const cleanText = (text: string | null | undefined): string => {
  if (!text) return '';
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
  currentGovernanceModelTitle,
  selectedReasonTitles,
  selectedSolutionsData,
  selectedVariants,
  selectedGovernanceModelId,
  selectedImplementationPlanTitle,
  governanceModels,
  governanceTitleToFieldName,
  extractImplementationSummaryFromVariant,
  reasons,
  selectedReasons,
  snakeToCamel,
  selectedVariationsData // Destructure prop
}) => {
  const selectedGovernanceModel = governanceModels.find(m => m.id === selectedGovernanceModelId);
  const selectedGovernanceModelTitle = selectedGovernanceModel?.title || 'N/A';

  return (
    <Document title="Samenvatting Mobiliteitsplan">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.h1}>Samenvatting Mobiliteitsplan</Text>
        </View>

        {/* Bedrijventerrein Info */}
        <View style={styles.section}>
          <Text style={styles.h2}>Bedrijventerrein Informatie</Text>
          <View style={styles.grid}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Aantal bedrijven</Text>
              <Text style={styles.paragraph}>{businessParkInfo.numberOfCompanies || 'N/A'}</Text>
              <Text style={styles.label}>Verkeerstypen</Text>
              {(businessParkInfo.trafficTypes && businessParkInfo.trafficTypes.length > 0) ? (
                businessParkInfo.trafficTypes.map(type => (
                  <View key={type} style={styles.listItemContainer}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{type}</Text>
                  </View>
                ))
              ) : <Text style={styles.paragraph}>Geen</Text>}
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Aantal werknemers</Text>
              <Text style={styles.paragraph}>{businessParkInfo.numberOfEmployees || 'N/A'}</Text>
              {currentGovernanceModelTitle && (
                <>
                  <Text style={styles.label}>Huidig bestuursmodel</Text>
                  <Text style={styles.paragraph}>{currentGovernanceModelTitle}</Text>
                </>
              )}
            </View>
          </View>
          <Text style={styles.h3}>Locatiekenmerken</Text>
          <View style={styles.grid}>
            {businessParkInfo.carAccessibility && <View style={styles.gridCol}><Text style={styles.label}>Bereikbaarheid auto</Text><Text style={styles.paragraph}>{businessParkInfo.carAccessibility}</Text></View>}
            {businessParkInfo.trainAccessibility && <View style={styles.gridCol}><Text style={styles.label}>Bereikbaarheid trein</Text><Text style={styles.paragraph}>{businessParkInfo.trainAccessibility}</Text></View>}
            {businessParkInfo.busAccessibility && <View style={styles.gridCol}><Text style={styles.label}>Bereikbaarheid bus</Text><Text style={styles.paragraph}>{businessParkInfo.busAccessibility}</Text></View>}
            {businessParkInfo.sufficientParking && <View style={styles.gridCol}><Text style={styles.label}>Voldoende parkeerplaatsen</Text><Text style={styles.paragraph}>{businessParkInfo.sufficientParking}</Text></View>}
            {businessParkInfo.averageDistance && <View style={styles.gridCol}><Text style={styles.label}>Gem. woon-werk afstand</Text><Text style={styles.paragraph}>{businessParkInfo.averageDistance === '25+' ? 'Meer dan 25 km' : `${businessParkInfo.averageDistance} km`}</Text></View>}
          </View>
          {!(businessParkInfo.carAccessibility || businessParkInfo.trainAccessibility || businessParkInfo.busAccessibility || businessParkInfo.sufficientParking || businessParkInfo.averageDistance) && (
              <Text style={styles.paragraph}>Geen specifieke locatiekenmerken opgegeven.</Text>
          )}
        </View>

        {/* Geselecteerde Oplossingen */}
        {selectedSolutionsData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Geselecteerde Mobiliteitsoplossingen</Text>
            {selectedSolutionsData.map((solution, index) => {
               const variantId = selectedVariants[solution.id];
               // Find full variation data using the ID
               const variation = selectedVariationsData?.find(v => v.id === variantId);
               const variantTitle = variation ? stripSolutionPrefixFromVariantTitle(variation.title) : (variantId || null); // Apply helper, fallback to ID
               
               const passportText = extractPassportTextWithVariant(solution.paspoort, variantTitle); // Pass title to extraction
               const implementationSummary = extractImplementationSummaryFromVariant(solution.implementatie, variantTitle);
               const isLastItemInList = index === selectedSolutionsData.length - 1;

               return (
                 <View key={solution.id} style={isLastItemInList ? styles.lastSolutionItem : styles.solutionItem}>
                   <Text style={styles.h3}>{solution.title}</Text>
                   {variantTitle && (
                     <View style={styles.indent}>
                       <Text style={styles.label}>Gekozen variant</Text>
                       {/* Display the stripped title */}
                       <Text style={styles.paragraph}>{variantTitle}</Text> 
                     </View>
                   )}
                   {passportText && (
                     <View style={styles.indent}>
                       <Text style={styles.label}>Kernpunten</Text>
                       {renderRichText(passportText, `${solution.id}-passport`)}
                     </View>
                   )}
                   {implementationSummary && (
                      <View style={styles.subSection}>
                          <Text style={styles.h4}>Implementatie Kernpunten</Text>
                          {renderRichText(implementationSummary, `${solution.id}-impl`)}
                      </View>
                   )}
                   {/* --- Added Section: Contribution to Selected Reasons --- */}
                   {selectedReasons.length > 0 && reasons.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.h4}>Bijdrage aan Geselecteerde Aanleidingen:</Text>
                            {selectedReasons.map(reasonId => {
                                const reason = reasons.find(r => r.id === reasonId);
                                if (!reason || !reason.identifier) return null; 

                                const reasonIdentifierCamel = snakeToCamel(reason.identifier);
                                const fieldName = `${reasonIdentifierCamel}Toelichting`;
                                const text = (solution as any)[fieldName];

                                if (!text) return null; 

                                return (
                                    <View key={reasonId} style={{ marginBottom: 8 }}>
                                        <Text style={{ ...styles.bold, fontSize: 10, marginBottom: 3 }}>
                                            {reason.title}:
                                        </Text>
                                        <View style={{ marginLeft: 10 }}> {/* Indent explanation */}
                                            {renderRichText(text, `${solution.id}-${reasonId}-contrib`)}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                 </View>
               );
            })}
          </View>
        )}

        {/* Gekozen Governance Model */}
        {selectedGovernanceModel && (
          <View style={styles.section}>
            <Text style={styles.h2}>Gekozen Governance Model</Text>
            <Text style={styles.h3}>{selectedGovernanceModelTitle}</Text>
            {renderRichText(selectedGovernanceModel.summary || selectedGovernanceModel.samenvatting || selectedGovernanceModel.description, `${selectedGovernanceModelId}-desc`)}
            
            {selectedSolutionsData.length > 0 && (
                <View style={styles.subSection}>
                  <Text style={styles.h4}>Relevantie per Gekozen Oplossing:</Text>
                  {selectedSolutionsData.map(solution => {
                    const fieldName = governanceTitleToFieldName(selectedGovernanceModel.title);
                    if (!fieldName) return null;
                    const text = (solution as any)[fieldName];
                    if (!text) return null;
                    
                    return (
                        <View key={`${solution.id}-gov`} style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.bold, fontSize: 11, marginBottom: 4 }}>{solution.title}:</Text> {/* Use style object */}
                            {renderRichText(text, `${solution.id}-gov-text`)}
                        </View>
                    );
                  })}
              </View>
            )}
          </View>
        )}

        {/* Gekozen Implementatieplan */}
        {selectedImplementationPlanTitle && (
          <View style={!selectedGovernanceModel ? styles.lastSection : styles.section}>
            <Text style={styles.h2}>Gekozen Implementatieplan</Text>
            <Text style={styles.paragraph}>{selectedImplementationPlanTitle}</Text>
          </View>
        )}

      </Page>
    </Document>
  );
};

export default SummaryPdfDocument; 