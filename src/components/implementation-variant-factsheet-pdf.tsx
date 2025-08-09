import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { ImplementationVariation } from '@/domain/models';
import Html from 'react-pdf-html';

// Using Open Sans from CDN
const openSansRegularUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf';
const openSansItalicUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf';
const openSansBoldUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf';
const openSansBoldItalicUrl = 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700italic.ttf';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: openSansRegularUrl, fontWeight: 'normal', fontStyle: 'normal' },
    { src: openSansItalicUrl, fontWeight: 'normal', fontStyle: 'italic' },
    { src: openSansBoldUrl, fontWeight: 'bold', fontStyle: 'normal' },
    { src: openSansBoldItalicUrl, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Disable hyphenation globally
Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000000',
  },
  headerContainer: {
    marginBottom: 25,
    paddingBottom: 5,
  },
  headerText: {
    fontSize: 18,
    textAlign: 'left',
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#000000',
    fontFamily: 'Open Sans',
    lineHeight: 1.2,
  },
  content: {
    fontSize: 9,
    textAlign: 'justify',
  },
  h1Style: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 2,
    lineHeight: 1.1,
  },
  h2Style: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 1.1,
  },
  h3Style: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 6,
    marginBottom: 3,
    lineHeight: 1.1,
  },
  ulStyle: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 15,
  },
  liStyle: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.5,
  },
  strongStyle: {
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
  },
  pStyle: {
    fontSize: 9,
    marginBottom: 5,
    lineHeight: 1.5,
    textAlign: 'left',
    marginTop: 0,
  },
  emStyle: {
    fontStyle: 'italic',
  },
  pdfTable: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    width: '100%',
  },
  pdfTableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pdfTableHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  pdfTableCell: {
    padding: 4,
    fontSize: 8.5,
    textAlign: 'left',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  pdfTableHeaderCell: {
    padding: 4,
    fontSize: 8.5,
    textAlign: 'left',
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  pdfTableCellCol0: {
    flexGrow: 2,
  },
});

const htmlTagStyles = {
  p: { fontSize: 9, marginBottom: 5, lineHeight: 1.5, textAlign: 'left', marginTop: 0 },
  h1: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 1, lineHeight: 1.1 },
  h2: { fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 1, lineHeight: 1.1 },
  h3: { fontSize: 12, fontWeight: 'bold', marginTop: 6, marginBottom: 3, lineHeight: 1.1 },
  ul: { marginTop: 5, marginBottom: 5, paddingLeft: 15 },
  li: { fontSize: 9, marginBottom: 3, lineHeight: 1.5 },
  strong: { fontWeight: 'bold', fontFamily: 'Open Sans' },
  em: { fontStyle: 'italic' },
  table: { width: '100%', border: '1px solid #ccc', marginBottom: 10, borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f0f0f0' },
  th: { border: '1px solid #ccc', padding: 4, fontWeight: 'bold', textAlign: 'left', fontSize: 8.5, display: 'table-cell' },
  td: { border: '1px solid #ccc', padding: 4, textAlign: 'left', fontSize: 8.5, display: 'table-cell' },
  tbody: {},
};

interface ImplementationVariantFactsheetPdfProps {
  variation: ImplementationVariation;
}

// Helper for inline markdown processing (bold, italic, links) within a line/paragraph
const processInlineMarkdown = (line: string): string => {
  let processedLine = line;
  processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processedLine = processedLine.replace(/__(.*?)__/g, '<strong>$1</strong>');
  processedLine = processedLine.replace(/(?<![\*_])\*(?!\*)(.*?)(?<![\*_])\*(?!\*)/g, '<em>$1</em>');
  processedLine = processedLine.replace(/(?<![a-zA-Z0-9_])_(?!_)(.*?)(?<!_)_(?![a-zA-Z0-9_])/g, '<em>$1</em>');
  return processedLine;
};

const basicMarkdownToHtml = (markdownText: string): string[] => {
  if (!markdownText) return [];

  const blocks: string[] = [];
  let remainingText = markdownText.trim().replace(/\r\n/g, '\n'); // Normalize newlines first, ensure this is let

  // Regexes for block elements
  const headerRegex = /^(#{1,3}) +(.*)/; // Ensure space after #
  const listRegex = /^\s*([-*+]) +(.*)/; // Ensure space after marker
  const preformattedRegex = /^```([a-zA-Z]*)\n([\s\S]*?)\n```/;
  const horizontalRuleRegex = /^[-*_]{3,}\s*$/;
  // Regex for table rows (simplified: must start and end with |, and contain at least one more | for columns)
  // Handles optional leading/trailing spaces around cell content
  const tableRowRegex = /^\|(.*?)(?:\|)?$/;
  // Regex for table separator (e.g., |---|---| or |:---|:--:|--:|)
  const tableSeparatorRegex = /^\|( *:?-+:? *\|)+$/;

  while (remainingText.length > 0) {
    let matched = false;

    // 1. Check for Preformatted Block
    const preMatch = remainingText.match(preformattedRegex);
    if (preMatch) {
      blocks.push(`<pre><code>${preMatch[2].trim()}</code></pre>`);
      remainingText = remainingText.substring(preMatch[0].length).trim();
      matched = true;
      continue;
    }

    // 2. Check for Horizontal Rule
    const hrMatch = remainingText.match(horizontalRuleRegex);
    if (hrMatch) {
        blocks.push('<hr />');
        remainingText = remainingText.substring(hrMatch[0].length).trim();
        matched = true;
        continue;
    }

    // 3. Check for Table (NEW)
    // A table is a sequence of lines matching tableRowRegex, potentially with a separator line
    const linesForTableCheck = remainingText.split('\n');
    let tableHtml = '';
    let tableRowCount = 0;
    let consumedTableLength = 0;
    let inTable = false;
    let hasHeader = false;

    if (linesForTableCheck.length >= 1) {
      let currentLineIndex = 0;
      // Get the first line and trim it for processing
      let firstLineInspected = linesForTableCheck[currentLineIndex];
      let firstLineContent = firstLineInspected.trim();

      if (tableRowRegex.test(firstLineContent)) {
        // Potential start of a table
        let headerCells = [];
        const firstLineCellsMatch = firstLineContent.match(tableRowRegex);

        if (firstLineCellsMatch) {
          headerCells = firstLineCellsMatch[1].split('|').map(cell => cell.trim());
          tableHtml += '<thead><tr>';
          headerCells.forEach(cell => {
            tableHtml += `<th>${processInlineMarkdown(cell)}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          tableRowCount++;
          consumedTableLength += firstLineInspected.length + 1; // Consume original length
          currentLineIndex++;
          inTable = true;

          // Check for separator line immediately after the first line
          if (currentLineIndex < linesForTableCheck.length) {
            let separatorLineInspected = linesForTableCheck[currentLineIndex];
            let separatorLineContent = separatorLineInspected.trim();
            if (tableSeparatorRegex.test(separatorLineContent)) {
              hasHeader = true;
              consumedTableLength += separatorLineInspected.length + 1; // Consume original length
              currentLineIndex++;
            } else {
              // No separator, the first line was data. Reset and rebuild.
              tableHtml = '<tbody><tr>';
              headerCells.forEach(cell => {
                tableHtml += `<td>${processInlineMarkdown(cell)}</td>`;
              });
              tableHtml += '</tr>';
              hasHeader = false;
            }
          } else {
            // No more lines after the first, treat first line as data if no separator implied
            tableHtml = '<tbody><tr>';
            headerCells.forEach(cell => {
                tableHtml += `<td>${processInlineMarkdown(cell)}</td>`;
            });
            tableHtml += '</tr>';
            hasHeader = false;
          }

          // Process subsequent rows
          while (currentLineIndex < linesForTableCheck.length) {
            let subsequentLineInspected = linesForTableCheck[currentLineIndex];
            let subsequentLineContent = subsequentLineInspected.trim();

            if (subsequentLineContent === '') { // Skip empty lines
              consumedTableLength += subsequentLineInspected.length + 1; // Consume original length
              currentLineIndex++;
              continue;
            }

            if (tableRowRegex.test(subsequentLineContent)) {
              const rowMatch = subsequentLineContent.match(tableRowRegex);
              if (rowMatch) {
                const cells = rowMatch[1].split('|').map(cell => cell.trim());
                tableHtml += '<tr>';
                cells.forEach(cell => {
                  tableHtml += `<td>${processInlineMarkdown(cell)}</td>`;
                });
                tableHtml += '</tr>';
                tableRowCount++;
                consumedTableLength += subsequentLineInspected.length + 1; // Consume original length
                currentLineIndex++;
              } else {
                break; 
              }
            } else {
              break; // Not a valid table row, stop table processing
            }
          }
        }
      }

      if (inTable && tableRowCount > (hasHeader ? 1 : 0)) { // Ensure at least one data row if header, or one row if no header
        tableHtml += '</tbody>';
        blocks.push(`<table>${tableHtml}</table>`);
        remainingText = remainingText.substring(consumedTableLength).trim();
        matched = true;
        continue;
      }
    }

    // 4. Check for Header (was 3)
    const headerMatch = remainingText.match(headerRegex);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const textContent = processInlineMarkdown(headerMatch[2].trim());
      blocks.push(`<h${level}>${textContent}</h${level}>`);
      remainingText = remainingText.substring(headerMatch[0].length).trim();
      matched = true;
      continue;
    }

    // 5. Paragraph (default) (was 4)
    const lines = remainingText.split('\n');
    let paragraphBuffer: string[] = [];
    let consumedLength = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check if the *next* line starts a new block type (excluding current line if it's empty)
        const nextLineIsBlockStart = (i + 1 < lines.length) && 
                                     (lines[i+1].match(headerRegex) || 
                                      lines[i+1].match(listRegex) || 
                                      lines[i+1].match(preformattedRegex) ||
                                      lines[i+1].match(horizontalRuleRegex));

        if (line.trim() === '' || (paragraphBuffer.length > 0 && nextLineIsBlockStart)) {
            // End of paragraph if blank line, or if buffer has content and next line is a new block type
            if (paragraphBuffer.length > 0) {
                blocks.push(`<p>${processInlineMarkdown(paragraphBuffer.join('\n'))}</p>`);
                remainingText = lines.slice(i).join('\n').trim();
                matched = true;
                break; // Break from line iteration, re-enter main while loop
            }
            if (line.trim() === '' && !nextLineIsBlockStart) { // consume blank line if it's not a separator before another block
                 consumedLength += line.length +1; // +1 for newline
                 continue;
            } 
            if(line.trim() === '' && nextLineIsBlockStart){
                // This blank line is a separator, consume it and break to let next block be processed
                remainingText = lines.slice(i + 1).join('\n').trim();
                matched = true;
                break;
            }
        }
        paragraphBuffer.push(line);
        consumedLength += line.length + 1; // +1 for newline character itself if splitting by \n
        if (i === lines.length - 1) { // Last line of remainingText
            if (paragraphBuffer.length > 0) {
                blocks.push(`<p>${processInlineMarkdown(paragraphBuffer.join('\n'))}</p>`);
                remainingText = '';
                matched = true;
                break;
            }
        }
    }
    if (!matched && remainingText.length > 0) { // Should not happen if paragraph logic is correct
        console.warn("Markdown parser loop finished without consuming text:", remainingText);
        remainingText = ''; // Prevent infinite loop
    }
  }
  return blocks;
};

const ImplementationVariantFactsheetPdfComponent: React.FC<ImplementationVariantFactsheetPdfProps> = ({ variation }) => {
  const renderContent = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;

    const htmlBlocks = basicMarkdownToHtml(content);
    if (htmlBlocks.length === 0) {
      return <Text>Niet gespecificeerd</Text>;
    }

    const combinedHtml = htmlBlocks.join('');

    if (combinedHtml.trim() === '') {
      return <Text>Niet gespecificeerd</Text>;
    }

    return (
      <Html stylesheet={htmlTagStyles}>
        {combinedHtml}
      </Html>
    );
  };

  // Helper function to render comma-separated list in PDF
  const renderCommaSeparatedPdfList = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;
    
    const items = content.split(',').map(item => item.trim()).filter(item => item.length > 0);
    
    if (items.length === 0) return <Text>Niet gespecificeerd</Text>;
    
    return (
      <View>
        {items.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontSize: 8, color: '#374151', marginRight: 6, marginTop: 2 }}>•</Text>
            <Text style={{ fontSize: 11, color: '#374151', flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}> 
          <Text style={{ ...styles.headerText, marginBottom: 2 }}>
            Factsheet Implementatievariant:
          </Text>
          <Text style={styles.headerText}>
            {variation.title || 'Onbekende Variant'}
          </Text>
        </View>

        {variation.samenvatting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Samenvatting</Text>
            {renderContent(variation.samenvatting)}
          </View>
        )}

        {/* Cost Information Section */}
        {(variation.geschatteJaarlijkseKosten || variation.geschatteKostenPerKmPp || variation.geschatteKostenPerRit) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kosteninformatie</Text>
            {variation.geschatteJaarlijkseKosten && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.subSectionTitle}>Geschatte jaarlijkse kosten</Text>
                <Text style={{ fontSize: 11, color: '#374151' }}>{variation.geschatteJaarlijkseKosten}</Text>
              </View>
            )}
            {variation.geschatteKostenPerKmPp && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.subSectionTitle}>Kosten per km per persoon</Text>
                <Text style={{ fontSize: 11, color: '#374151' }}>{variation.geschatteKostenPerKmPp}</Text>
              </View>
            )}
            {variation.geschatteKostenPerRit && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.subSectionTitle}>Kosten per rit</Text>
                <Text style={{ fontSize: 11, color: '#374151' }}>{variation.geschatteKostenPerRit}</Text>
              </View>
            )}
          </View>
        )}

        {/* Velden verantwoordelijkheid/contractvormen/voordelen/nadelen zijn verwijderd uit het content type */}

        {variation.investering && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investering</Text>
            {renderContent(variation.investering)}
          </View>
        )}

        {variation.realisatieplan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Realisatieplan</Text>
            {renderContent(variation.realisatieplan)}
          </View>
        )}

        {variation.realisatieplanLeveranciers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leveranciers</Text>
            {renderContent(variation.realisatieplanLeveranciers)}
          </View>
        )}

        {variation.realisatieplanContractvormen && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contractvormen</Text>
            {renderContent(variation.realisatieplanContractvormen)}
          </View>
        )}

        {variation.realisatieplanKrachtenveld && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Krachtenveld</Text>
            {renderContent(variation.realisatieplanKrachtenveld)}
          </View>
        )}

        {variation.realisatieplanVoorsEnTegens && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voors en Tegens</Text>
            {renderContent(variation.realisatieplanVoorsEnTegens)}
          </View>
        )}

        {variation.realisatieplanAandachtspunten && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aandachtspunten</Text>
            {renderContent(variation.realisatieplanAandachtspunten)}
          </View>
        )}

        {variation.realisatieplanChecklist && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            {renderContent(variation.realisatieplanChecklist)}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default React.memo(ImplementationVariantFactsheetPdfComponent); 