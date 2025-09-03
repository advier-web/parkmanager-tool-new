import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
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
    paddingTop: 30,
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000000',
  },
  headerContainer: {
    // Trek de header (logo) tegen de bovenrand aan op pagina 1
    marginTop: -30,
    marginBottom: 16,
    paddingBottom: 0,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 12, marginBottom: 8 },
  headerText: {
    fontSize: 18,
    textAlign: 'left',
    color: '#01689b',
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
    lineHeight: 1.4,
  },
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  twoColLeft: {
    width: '50%',
    paddingRight: 10,
  },
  twoColRight: {
    width: '50%',
    paddingLeft: 10,
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#01689b',
    fontFamily: 'Open Sans',
    lineHeight: 1.2,
  },
  content: {
    fontSize: 9,
    textAlign: 'justify',
  },
  h1Style: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 10,
    marginBottom: 2,
    lineHeight: 1.1,
  },
  h2Style: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 1.1,
  },
  h3Style: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 6,
    marginBottom: 3,
    lineHeight: 1.1,
  },
  ulStyle: { marginTop: 4, marginBottom: 5, paddingLeft: 6 },
  liStyle: { fontSize: 9, marginBottom: 4, lineHeight: 1.45, marginLeft: 0 },
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
  h1: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 6, lineHeight: 1.1, color: '#01689b' },
  h2: { fontSize: 12.5, fontWeight: 'bold', marginTop: 8, marginBottom: 6, lineHeight: 1.1, color: '#01689b' },
  h3: { fontSize: 11, fontWeight: 'bold', marginTop: 6, marginBottom: 5, lineHeight: 1.1, color: '#01689b' },
  ul: { marginTop: 4, marginBottom: 5, paddingLeft: 6 },
  li: { fontSize: 9, marginBottom: 4, lineHeight: 1.45 },
  strong: { fontWeight: 'bold', fontFamily: 'Open Sans' },
  em: { fontStyle: 'italic' },
  a: { color: '#2563eb', textDecoration: 'underline' },
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
  const listRegex = /^\s*([-*+]) +(.*)/; // Unordered list
  const orderedListRegex = /^\s*(\d+)\. +(.*)/; // Ordered list
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

    // 4. Ordered and unordered lists
    let listBuffer = '';
    let listOpen = false;
    let currentType: 'ul' | 'ol' | null = null;
    while (true) {
      const bullet = remainingText.match(listRegex);
      const ordered = remainingText.match(orderedListRegex);
      if (bullet || ordered) {
        const type: 'ul' | 'ol' = ordered ? 'ol' : 'ul';
        if (!listOpen) { 
          if (type === 'ol' && ordered) {
            listBuffer = `<ol start="${ordered[1]}">`;
          } else {
            listBuffer = `<${type}>`;
          }
          listOpen = true; currentType = type; 
        }
        else if (currentType !== type) { break; }
        const text = processInlineMarkdown((ordered ? ordered[2] : bullet![2]).trim());
        listBuffer += `<li>${text}</li>`;
        const consume = ordered ? ordered[0] : bullet![0];
        remainingText = remainingText.substring(consume.length).trimStart();
        const stillSame = type === 'ul' ? remainingText.match(listRegex) : remainingText.match(orderedListRegex);
        if (!stillSame) { break; }
      } else { break; }
    }
    if (listOpen && currentType) {
      listBuffer += `</${currentType}>`;
      blocks.push(listBuffer);
      matched = true;
      continue;
    }

    // 5. Check for Header (was 3)
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
  // Render an array of html blocks, grouping every heading (h1-h3)
  // with its immediate next block to avoid orphaned headings
  const renderHtmlBlocksGrouped = (blocks: string[]) => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i] || '';
      const isHeading = /^<h[1-3][^>]*>/i.test(b.trim());
      if (isHeading) {
        const next = i + 1 < blocks.length ? blocks[i + 1] : '';
        elements.push(
          <View key={`grp-${i}`} wrap={false}>
            <Html stylesheet={htmlTagStyles}>{b}</Html>
            {next ? <Html stylesheet={htmlTagStyles}>{next}</Html> : null}
          </View>
        );
        if (next) i++;
      } else {
        elements.push(<Html key={`blk-${i}`} stylesheet={htmlTagStyles}>{b}</Html>);
      }
    }
    return <View>{elements}</View>;
  };

  // Render a section where the sectionTitle and the first content block are kept together
  const renderSectionGrouped = (heading: string, content?: string) => {
    if (!content) return null;
    const blocks = basicMarkdownToHtml(content);
    if (blocks.length === 0) return null;
    const first = blocks[0] || '';
    const rest = blocks.slice(1);
    return (
      <View style={styles.section}>
        <View wrap={false}>
          <Text style={styles.sectionTitle}>{heading}</Text>
          {first ? <Html stylesheet={htmlTagStyles}>{first}</Html> : null}
        </View>
        {rest.length > 0 ? renderHtmlBlocksGrouped(rest) : null}
      </View>
    );
  };

  const renderContent = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;
    const htmlBlocks = basicMarkdownToHtml(content);
    if (htmlBlocks.length === 0) return <Text>Niet gespecificeerd</Text>;
    // Group headings (h1-h3) with the immediately following block using wrap={false}
    const elements: React.ReactElement[] = [];
    for (let i = 0; i < htmlBlocks.length; i++) {
      const b = htmlBlocks[i];
      const isHeading = /^<h[1-3][^>]*>/i.test((b || '').trim());
      if (isHeading) {
        const next = i + 1 < htmlBlocks.length ? htmlBlocks[i + 1] : '';
        elements.push(
          <View key={`grp-${i}`} wrap={false}>
            <Html stylesheet={htmlTagStyles}>{b}</Html>
            {next ? <Html stylesheet={htmlTagStyles}>{next}</Html> : null}
          </View>
        );
        if (next) i++;
      } else {
        elements.push(<Html key={`blk-${i}`} stylesheet={htmlTagStyles}>{b}</Html>);
      }
    }
    return <View>{elements}</View>;
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
          <View style={styles.logoWrap}>
            <Image src="/Logo IenW.png" style={{ width: 200, height: 50, objectFit: 'contain' }} />
          </View>
          <Text style={{ ...styles.headerText, marginBottom: 2 }}>
            Factsheet Implementatievariant:
          </Text>
          <Text style={styles.headerText}>
            {variation.title || 'Onbekende Variant'}
          </Text>
          <Text style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>
            Deze factsheet is gemaakt door de Parkmanager Tool Collectieve Vervoersoplossingen. Deze tool is ontwikkeld in opdracht van het Ministerie van Infrastructuur en Waterstaat.
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Meta blok in twee kolommen (vergelijkbaar met oplossingen factsheet) */}
        <View style={styles.twoColRow}>
          <View style={styles.twoColLeft}>
            {variation.controleEnFlexibiliteit && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Controle en flexibiliteit:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.controleEnFlexibiliteit || '').replace(/\*/g, '')}</Text>
              </View>
            )}
            {variation.kostenEnSchaalvoordelen && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Kosten en schaalvoordelen:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.kostenEnSchaalvoordelen || '').replace(/\*/g, '')}</Text>
              </View>
            )}
            {variation.juridischeEnComplianceRisicos && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Juridische en compliance-risico’s:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.juridischeEnComplianceRisicos || '').replace(/\*/g, '')}</Text>
              </View>
            )}
          </View>

          <View style={styles.twoColRight}>
            {variation.maatwerk && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Maatwerk:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.maatwerk || '').replace(/\*/g, '')}</Text>
              </View>
            )}
            {variation.operationeleComplexiteit && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Operationele complexiteit:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.operationeleComplexiteit || '').replace(/\*/g, '')}</Text>
              </View>
            )}
            {variation.risicoVanOnvoldoendeGebruik && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Risico van onvoldoende gebruik:</Text>
                <Text style={{ marginTop: 2 }}>{(variation.risicoVanOnvoldoendeGebruik || '').replace(/\*/g, '')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Divider onder vuistregels */}
        <View style={styles.divider} />

        {variation.samenvatting && renderSectionGrouped('Hoe werkt het', variation.samenvatting)}

        {/* Cost Information Section */}
        {/* {(variation.geschatteJaarlijkseKosten || variation.geschatteKostenPerKmPp || variation.geschatteKostenPerRit) && (
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
        )} */}

        {/* Velden verantwoordelijkheid/contractvormen/voordelen/nadelen zijn verwijderd uit het content type */}

        {variation.investering && renderSectionGrouped('Exploitatie', variation.investering)}

        {/* 'realisatieplan' is verwijderd op verzoek */}

        {variation.realisatieplanLeveranciers && renderSectionGrouped('Leveranciers', variation.realisatieplanLeveranciers)}

        {variation.realisatieplanContractvormen && renderSectionGrouped('Contractvormen', variation.realisatieplanContractvormen)}

        {variation.realisatieplanKrachtenveld && renderSectionGrouped('Krachtenveld', variation.realisatieplanKrachtenveld)}

        {variation.realisatieplanVoorsEnTegens && renderSectionGrouped('Voors en Tegens', variation.realisatieplanVoorsEnTegens)}

        {/* Aandachtspunten tijdelijk verborgen op verzoek */}

        {variation.realisatieplanChecklist && renderSectionGrouped('Checklist', variation.realisatieplanChecklist)}

        {variation.vervolgstappen && renderSectionGrouped('Vervolgstappen', variation.vervolgstappen)}
      </Page>
    </Document>
  );
};

export default React.memo(ImplementationVariantFactsheetPdfComponent); 