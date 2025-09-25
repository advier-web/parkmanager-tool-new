import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { GovernanceModel, ImplementationVariation } from '@/domain/models';
import Html from 'react-pdf-html';

// Using Open Sans from CDN (consistent with other PDF components)
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

Font.registerHyphenationCallback(word => [word]); // Disable hyphenation

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingTop: 50,
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000000',
  },
  headerContainer: {
    marginTop: -50, // logo strak tegen de bovenrand op pagina 1
    marginBottom: 16,
    paddingBottom: 0,
  },
  logoWrap: { alignItems: 'center', marginBottom: 18 },
  headerText: {
    fontSize: 18,
    textAlign: 'left',
    color: '#01689b',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#01689b',
    fontFamily: 'Open Sans',
    lineHeight: 1.2,
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 1,
    color: '#333333',
    fontFamily: 'Open Sans',
  },
  listItem: {
    marginLeft: 10, // Indent list items
    marginBottom: 3,
  }
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
};

// Re-using basicMarkdownToHtml and processInlineMarkdown from ImplementationVariantFactsheetPdf
// Ideally, these would be in a shared utils/pdf-helpers.ts file

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
  let remainingText = markdownText.trim().replace(/\r\n/g, '\n');
  const headerRegex = /^(#{1,3}) +(.*)/;
  const listRegex = /^\s*([-*+]) +(.*)/;
  const orderedListRegex = /^\s*(\d+)\. +(.*)/; // Ordered list support
  const preformattedRegex = /^```([a-zA-Z]*)\n([\s\S]*?)\n```/;
  const horizontalRuleRegex = /^[-*_]{3,}\s*$/;

  while (remainingText.length > 0) {
    let matched = false;
    const preMatch = remainingText.match(preformattedRegex);
    if (preMatch) {
      blocks.push(`<pre><code>${preMatch[2].trim()}</code></pre>`);
      remainingText = remainingText.substring(preMatch[0].length).trim();
      matched = true; continue;
    }
    const hrMatch = remainingText.match(horizontalRuleRegex);
    if (hrMatch) {
      blocks.push('<hr />');
      remainingText = remainingText.substring(hrMatch[0].length).trim();
      matched = true; continue;
    }
    const headerMatch = remainingText.match(headerRegex);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push(`<h${level}>${processInlineMarkdown(headerMatch[2].trim())}</h${level}>`);
      remainingText = remainingText.substring(headerMatch[0].length).trim();
      matched = true; continue;
    }
    let currentListHtml = '';
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    while(true){
        const bulletMatch = remainingText.match(listRegex);
        const orderedMatch = remainingText.match(orderedListRegex);
        if(bulletMatch || orderedMatch){
            const nextType: 'ul' | 'ol' = orderedMatch ? 'ol' : 'ul';
            if(!inList){ 
                if(nextType === 'ol' && orderedMatch){
                    currentListHtml = `<ol start="${orderedMatch[1]}">`;
                } else {
                    currentListHtml = `<${nextType}>`;
                }
                inList = true; listType = nextType; 
            }
            else if(listType !== nextType){ break; }
            const itemText = processInlineMarkdown((orderedMatch ? orderedMatch[2] : bulletMatch![2]).trim());
            currentListHtml += `<li>${itemText}</li>`;
            const toConsume = orderedMatch ? orderedMatch[0] : bulletMatch![0];
            remainingText = remainingText.substring(toConsume.length).trimStart();
            const stillSameType = nextType === 'ul' ? remainingText.match(listRegex) : remainingText.match(orderedListRegex);
            if(!stillSameType){ break; }
        } else { break; }
    }
    if(inList && listType){
        currentListHtml += `</${listType}>`;
        blocks.push(currentListHtml);
        matched = true; continue;
    }
    const lines = remainingText.split('\n');
    const paragraphBuffer: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLineIsBlockStart = (i + 1 < lines.length) && (lines[i+1].match(headerRegex) || lines[i+1].match(listRegex) || lines[i+1].match(preformattedRegex) || lines[i+1].match(horizontalRuleRegex));
        if (line.trim() === '' || (paragraphBuffer.length > 0 && nextLineIsBlockStart)) {
            if (paragraphBuffer.length > 0) {
                blocks.push(`<p>${processInlineMarkdown(paragraphBuffer.join('\n'))}</p>`);
                remainingText = lines.slice(i).join('\n').trim();
                matched = true; break;
            }
            if (line.trim() === '' && nextLineIsBlockStart){
                remainingText = lines.slice(i + 1).join('\n').trim();
                matched = true; break;
            }
        }
        paragraphBuffer.push(line);
        if (i === lines.length - 1) {
            if (paragraphBuffer.length > 0) {
                blocks.push(`<p>${processInlineMarkdown(paragraphBuffer.join('\n'))}</p>`);
                remainingText = '';
                matched = true; break;
            }
        }
    }
    if (!matched && remainingText.length > 0) {
      // Fallback for any remaining text, treat as a single paragraph.
      blocks.push(`<p>${processInlineMarkdown(remainingText.replace(/\n/g, '<br/>'))}</p>`);
      remainingText = '';
    }
  }
  return blocks;
};

interface GovernanceModelFactsheetPdfProps {
  model: GovernanceModel;
  variations?: ImplementationVariation[];
  governanceTitleToFieldName: (title: string | undefined) => string | null | undefined;
  stripSolutionPrefixFromVariantTitle: (title: string) => string;
}

const GovernanceModelFactsheetPdfComponent: React.FC<GovernanceModelFactsheetPdfProps> = ({
  model,
  variations = [],
  governanceTitleToFieldName,
  stripSolutionPrefixFromVariantTitle,
}) => {
  // Render a section where the heading and the first content block are grouped (non-wrapping)
  const renderSectionGrouped = (heading: string, markdown?: string) => {
    if (!markdown) return null;
    const blocks = basicMarkdownToHtml(markdown);
    const first = blocks[0] || '';
    const restBlocks = blocks.slice(1);
    return (
      <View style={styles.section}>
        <View wrap={false}>
          <Text style={styles.sectionTitle}>{heading}</Text>
          {first ? <Html stylesheet={htmlTagStyles}>{first}</Html> : null}
        </View>
        {restBlocks.length > 0 ? renderHtmlBlocksGrouped(restBlocks) : null}
      </View>
    );
  };

  // Render array content sections (e.g., voordelen/nadelen) with heading + first item grouped
  const renderSectionArrayGrouped = (heading: string, items?: string[]) => {
    if (!items || items.length === 0) return null;
    const [firstItem, ...restItems] = items;
    const firstBlocks = firstItem ? basicMarkdownToHtml(firstItem) : [];
    return (
      <View style={styles.section}>
        <View wrap={false}>
          <Text style={styles.sectionTitle}>{heading}</Text>
          {firstBlocks.length > 0 ? <Html stylesheet={htmlTagStyles}>{firstBlocks.join('')}</Html> : <Text>Niet gespecificeerd</Text>}
        </View>
        {restItems.length > 0 && (
          <View>
            {restItems.map((item, index) => (
              <View key={index} style={{ marginBottom: 5 }}>
                {renderHtmlBlocksGrouped(basicMarkdownToHtml(item))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render an array of HTML blocks while keeping each heading (h1-h3) together
  // with the immediate next block using a non-wrapping container.
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
        if (next) i++; // skip next because grouped
      } else {
        elements.push(
          <Html key={`blk-${i}`} stylesheet={htmlTagStyles}>{b}</Html>
        );
      }
    }
    return <View>{elements}</View>;
  };

  const renderContent = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;
    const htmlBlocks = basicMarkdownToHtml(content);
    if (htmlBlocks.length === 0) return <Text>Niet gespecificeerd</Text>;
    return renderHtmlBlocksGrouped(htmlBlocks);
  };

  const renderContentArray = (items?: string[]) => {
    if (!items || items.length === 0) return <Text>Niet gespecificeerd</Text>;
    return (
      <View>
        {items.map((item, index) => (
          <View key={index} style={{ marginBottom: 5 }}>
            {renderContent(item)}
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
            Factsheet Governance Model:
          </Text>
          <Text style={styles.headerText}>
            {model.title || 'Onbekend Model'}
          </Text>
          <Text style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>
            Deze factsheet is gemaakt door de Parkmanager Tool Collectieve Vervoersoplossingen. Deze tool is ontwikkeld in opdracht van het Ministerie van Infrastructuur en Waterstaat.
          </Text>
          <View style={{ height: 1, backgroundColor: '#e5e7eb', marginTop: 12, marginBottom: 8 }} />
        </View>

        {(model.description || model.summary) && renderSectionGrouped('Beschrijving', model.description || model.summary)}

        {model.aansprakelijkheid && renderSectionGrouped('Aansprakelijkheid', model.aansprakelijkheid)}

        {model.voordelen && model.voordelen.length > 0 && renderSectionArrayGrouped('Voordelen', model.voordelen)}

        {model.nadelen && model.nadelen.length > 0 && renderSectionArrayGrouped('Nadelen', model.nadelen)}

        {model.benodigdhedenOprichting && renderSectionGrouped('Benodigdheden Oprichting', Array.isArray(model.benodigdhedenOprichting) ? model.benodigdhedenOprichting.join('\n\n') : model.benodigdhedenOprichting)}

        {model.links && renderSectionGrouped('Links', model.links)}

        {model.doorlooptijdLang && renderSectionGrouped('Doorlooptijd', model.doorlooptijdLang)}

        {model.implementatie && renderSectionGrouped('Implementatie', model.implementatie)}

        {/* Relevantie sectie verwijderd op verzoek */}
      </Page>
    </Document>
  );
};

export default React.memo(GovernanceModelFactsheetPdfComponent); 