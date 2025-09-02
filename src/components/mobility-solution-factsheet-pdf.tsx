import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Svg, Path, Image } from '@react-pdf/renderer';
import { MobilitySolution, ImplementationVariation } from '@/domain/models';
import Html from 'react-pdf-html';
// Local helper to avoid importing browser-specific modules in PDF context
const stripSolutionPrefixFromVariantTitle = (fullVariantTitle: string | undefined): string => {
  if (!fullVariantTitle) return '';
  const separatorIndex = fullVariantTitle.indexOf(' - ');
  if (separatorIndex !== -1) {
    return fullVariantTitle.substring(separatorIndex + 3);
  }
  return fullVariantTitle;
};

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
    paddingTop: 50, // normale top padding voor vervolgpagina's
    fontFamily: 'Open Sans',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000000',
  },
  // Variant comparison table styles
  compTable: {
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  compHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  compRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  compHeaderCell: {
    width: 110,
    padding: 4,
  },
  compCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  compHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  compVariantTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
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
  headerContainer: {
    marginTop: -50, // trekt content (logo) tegen bovenrand aan op pagina 1
    marginBottom: 16,
    paddingBottom: 0,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
    marginBottom: 8,
  },
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
  // Generic PDF table styles for markdown tables in content
  genTable: {
    marginTop: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  genHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  genRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  genHeaderCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 5,
  },
  genCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  // content style might not be directly used if all content goes through renderContent -> Html
  content: {
    fontSize: 9,
    // textAlign: 'justify', // Alignment handled by htmlTagStyles.p
  },
  // htmlContent is effectively replaced by htmlTagStyles
  // textBlock style is replaced by renderContent logic
});

// Stylesheet for the <Html> component (copied from ImplementationVariantFactsheetPdf)
const htmlTagStyles = {
  p: {
    fontSize: 9,
    marginBottom: 6,
    lineHeight: 1.5,
    textAlign: 'left',
    marginTop: 0,
  },
  h1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 1.1,
  },
  h2: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 1.1,
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#01689b',
    marginTop: 6,
    marginBottom: 5,
    lineHeight: 1.1,
  },
  ul: {
    marginTop: 4,
    marginBottom: 3,
    paddingLeft: 6,
  },
  ol: {
    marginTop: 2,
    marginBottom: 2,
    paddingLeft: 6,
  },
  li: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.45,
    marginLeft: 0,
  },
  strong: {
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
  },
  em: {
    fontStyle: 'italic',
  },
  a: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
};

interface MobilitySolutionFactsheetPdfProps {
  solution: MobilitySolution;
  variations?: ImplementationVariation[];
}

// Convert simple markdown to HTML; try to preserve tables (we'll render them ourselves)
const basicMarkdownToHtml = (text: string): string => {
  let html = text;
  // Links: [label](url) -> <a href="url">label</a>
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^\s*[-*+] (.*$)/gim, '<ul><li>$1</li></ul>');
  // Ordered lists: each item on its own line. Preserve numbering using start attribute.
  html = html.replace(/^\s*(\d+)\. (.*$)/gim, (m, n, t) => `<ol start="${n}" style="margin:2px 0 2px 0; padding-left:6px;"><li style="margin:2px 0;">${t}</li></ol>`);
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  html = html.replace(/<\/ol>\s*<ol([^>]*)>/gim, '</ol><ol$1>');
  html = html.replace(/<\/ol>\s*<ol>/gim, '');
  html = html.split('\n').map(line => {
    if (line.match(/^<h[1-6]>.*<\/h[1-6]>$/) || line.match(/^<li>.*<\/li>$/) || line.match(/^<ul>.*<\/ul>$/) || line.match(/^<p>.*<\/p>$/) || line.trim() === '') {
      return line;
    }
    return `<p>${line}</p>`;
  }).join('');
  return html;
};

const MobilitySolutionFactsheetPdfComponent: React.FC<MobilitySolutionFactsheetPdfProps> = ({ solution, variations = [] }) => {
  const [resolvedVariations] = useState<ImplementationVariation[]>(variations);
  // Helper to render a compact comparison table for available implementation variations
  const renderVariantComparison = () => {
    const variations = resolvedVariations;
    if (!variations || variations.length === 0) return null;

    // Small star row using SVG (ensures visibility regardless of font support)
    const StarsRow: React.FC<{ count: number }> = ({ count }) => (
      <View style={{ flexDirection: 'row', marginBottom: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Svg key={i} width={10} height={10} viewBox="0 0 24 24">
            <Path d="M12 .587l3.668 7.568L24 9.423l-6 5.847L19.336 24 12 19.897 4.664 24 6 15.27 0 9.423l8.332-1.268z" fill="#f59e0b" />
          </Svg>
        ))}
      </View>
    );

    // Render stars + plain text (no Html) to keep PDF generation light-weight
    const renderStarsAndText = (raw: string) => {
      const source = typeof raw === 'string' ? raw : String(raw ?? '');
      const m = source.match(/^\s*(\*{1,5})\s*([\s\S]*)$/);
      const toPlain = (s: string) =>
        s
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
          .replace(/\r?\n/g, ' ')
          .trim();
      if (!m) {
        // Fallback: map textual labels like 'Hoog:', 'Middel:', 'Laag:' to star counts
        const labelMatch = source.match(/^\s*(hoog|gemidd\w*|middel\w*|laag)\s*:?-?\s*([\s\S]*)$/i);
        if (labelMatch) {
          const label = (labelMatch[1] || '').toLowerCase();
          let mapped = 0;
          if (label.startsWith('hoog')) mapped = 5;
          else if (label.startsWith('laag')) mapped = 1;
          else mapped = 3; // middel/gemiddeld
          const rest = toPlain(labelMatch[2] || '');
          return (
            <View>
              <StarsRow count={mapped} />
              <Text style={{ fontSize: 9 }}>{rest || '-'}</Text>
            </View>
          );
        }
        return <Text style={{ fontSize: 9 }}>{toPlain(source || '-')}</Text>;
      }
      const starsCount = m[1].length;
      const text = toPlain(m[2] || '');
      return (
        <View>
          <StarsRow count={starsCount} />
          <Text style={{ fontSize: 9 }}>{text || '-'}</Text>
        </View>
      );
    };

    // Columns: one for each variation
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.sectionTitle}>Vergelijk implementatievarianten</Text>
        <Text style={{ fontSize: 9, color: '#374151', marginTop: 2, marginBottom: 6 }}>
          In de tabel hieronder kunt u de verschillende implementatievarianten met elkaar vergelijken.
        </Text>
        {/* Header row with variant titles */}
        <View style={styles.compTable}>
          <View style={styles.compHeaderRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Categorie</Text></View>
            {variations.map((v, idx) => {
              const shortTitle = stripSolutionPrefixFromVariantTitle(v.title);
              return (
                <View key={`vh-${v.id || idx}`} style={styles.compCell}>
                  <Text style={styles.compVariantTitle}>{shortTitle || `Variant ${idx + 1}`}</Text>
                </View>
              );
            })}
          </View>

          {/* Controle en flexibiliteit */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Controle en flexibiliteit</Text></View>
            {variations.map((v, idx) => (
              <View key={`cf-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.controleEnFlexibiliteit || '-')}
              </View>
            ))}
          </View>

          {/* Maatwerk */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Maatwerk</Text></View>
            {variations.map((v, idx) => (
              <View key={`mw-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.maatwerk || '-')}
              </View>
            ))}
          </View>

          {/* Kosten en schaalvoordelen */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Kosten en schaalvoordelen</Text></View>
            {variations.map((v, idx) => (
              <View key={`ks-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.kostenEnSchaalvoordelen || '-')}
              </View>
            ))}
          </View>

          {/* Operationele complexiteit */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Operationele complexiteit</Text></View>
            {variations.map((v, idx) => (
              <View key={`oc-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.operationeleComplexiteit || '-')}
              </View>
            ))}
          </View>

          {/* Juridische en compliance risico's */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Juridische en compliance risico's</Text></View>
            {variations.map((v, idx) => (
              <View key={`jr-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.juridischeEnComplianceRisicos || '-')}
              </View>
            ))}
          </View>

          {/* Risico van onvoldoende gebruik */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Risico van onvoldoende gebruik</Text></View>
            {variations.map((v, idx) => (
              <View key={`rg-${v.id || idx}`} style={styles.compCell}>
                {renderStarsAndText(v.risicoVanOnvoldoendeGebruik || '-')}
              </View>
            ))}
          </View>

        </View>
      </View>
    );
  };
  // Lightweight renderer to avoid heavy Html parsing; handles headings, lists and paragraphs
  // Also supports inline bold/italic for **text**, __text__, *text*, _text_
  const renderPlainBlocks = (text: string) => {
    const renderInline = (input: string): any[] => {
      const nodes: any[] = [];
      const pattern = /(\*\*[^*]+?\*\*|__[^_]+?__|\*[^*]+?\*|_[^_]+?_)/g;
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(input)) !== null) {
        if (m.index > lastIndex) {
          nodes.push(input.slice(lastIndex, m.index));
        }
        const token = m[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          nodes.push(<Text key={`b-${m.index}`} style={{ fontWeight: 'bold' }}>{token.slice(2, -2)}</Text>);
        } else if (token.startsWith('__') && token.endsWith('__')) {
          nodes.push(<Text key={`b2-${m.index}`} style={{ fontWeight: 'bold' }}>{token.slice(2, -2)}</Text>);
        } else if (token.startsWith('*') && token.endsWith('*')) {
          nodes.push(<Text key={`i-${m.index}`} style={{ fontStyle: 'italic' }}>{token.slice(1, -1)}</Text>);
        } else if (token.startsWith('_') && token.endsWith('_')) {
          nodes.push(<Text key={`i2-${m.index}`} style={{ fontStyle: 'italic' }}>{token.slice(1, -1)}</Text>);
        } else {
          nodes.push(token);
        }
        lastIndex = m.index + token.length;
      }
      if (lastIndex < input.length) nodes.push(input.slice(lastIndex));
      return nodes;
    };

    const lines = text.split(/\r?\n/);
    const blocks: any[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Skip empty lines
      if (!line.trim()) { i++; continue; }
      // Headings
      const h3 = line.match(/^###\s+(.*)$/);
      if (h3) { blocks.push(<Text key={`h3-${i}`} style={{ fontSize: 11, fontWeight: 'bold', color: '#01689b', marginTop: 6, marginBottom: 5, lineHeight: 1.1 }}>{h3[1]}</Text>); i++; continue; }
      const h2 = line.match(/^##\s+(.*)$/);
      if (h2) { blocks.push(<Text key={`h2-${i}`} style={{ fontSize: 12.5, fontWeight: 'bold', color: '#01689b', marginTop: 8, marginBottom: 6, lineHeight: 1.1 }}>{h2[1]}</Text>); i++; continue; }
      const h1 = line.match(/^#\s+(.*)$/);
      if (h1) { blocks.push(<Text key={`h1-${i}`} style={{ fontSize: 18, fontWeight: 'bold', color: '#01689b', marginTop: 10, marginBottom: 6, lineHeight: 1.1 }}>{h1[1]}</Text>); i++; continue; }
      // Unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
          i++;
        }
        blocks.push(
          <View key={`ul-${i}`} style={{ marginTop: 4, marginBottom: 3, paddingLeft: 6 }}>
            {items.map((it, idx) => (
              <View key={`uli-${idx}`} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={{ fontSize: 9, marginRight: 3 }}>•</Text>
                <Text style={{ fontSize: 9, flex: 1 }}>{renderInline(it)}</Text>
              </View>
            ))}
          </View>
        );
        continue;
      }
      // Ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        const items: string[] = [];
        let startNum = parseInt((line.match(/^(\s*)(\d+)/) || [0, '', '1'])[2], 10) || 1;
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
          i++;
        }
        blocks.push(
          <View key={`ol-${i}`} style={{ marginTop: 2, marginBottom: 2, paddingLeft: 6 }}>
            {items.map((it, idx) => (
              <View key={`oli-${idx}`} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={{ fontSize: 9, marginRight: 4 }}>{`${startNum + idx}.`}</Text>
                <Text style={{ fontSize: 9, flex: 1 }}>{renderInline(it)}</Text>
              </View>
            ))}
          </View>
        );
        continue;
      }
      // Paragraph: merge consecutive non-empty non-list lines
      const para: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !/^\s*[-*+]/.test(lines[i]) && !/^\s*\d+\./.test(lines[i]) && !/^#{1,3}\s+/.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      blocks.push(<Text key={`p-${i}`} style={{ fontSize: 9, marginBottom: 6, lineHeight: 1.5 }}>{renderInline(para.join(' '))}</Text>);
    }
    return <View>{blocks}</View>;
  };

  // renderContent function (copied and adapted from ImplementationVariantFactsheetPdf)
  const renderContent = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;
    // Only treat as HTML if there appear to be actual tags like <p>, <div>, etc.
    const isLikelyHtml = /<\s*[a-zA-Z][^>]*>/i.test(content);
    const sanitizeHtml = (html: string) =>
      html
        .replace(/<img[^>]*>/gi, '') // strip images to avoid heavy rendering
        .replace(/<script[\s\S]*?<\/script>/gi, '') // no scripts
        .replace(/ style="[^"]*"/gi, ''); // drop inline styles that Html might not like

    // If HTML contains <table>, convert them to lightweight PDF tables to avoid heavy Html rendering
    if (isLikelyHtml && /<table/i.test(content)) {
      const html = content;
      const tableRegex = /<table[\s\S]*?<\/table>/gi;
      const parts: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = tableRegex.exec(html)) !== null) {
        const before = html.slice(lastIndex, match.index);
        if (before.trim()) {
          parts.push(<Html key={`h-${lastIndex}`} stylesheet={htmlTagStyles}>{sanitizeHtml(before)}</Html>);
        }
        const tableHtml = match[0];
        // Parse rows and cells
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const rows: string[][] = [];
        let rowMatch: RegExpExecArray | null;
        while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
          const rowInner = rowMatch[1];
          const headerCells: string[] = [];
          let h: RegExpExecArray | null;
          while ((h = thRegex.exec(rowInner)) !== null) headerCells.push(h[1]);
          if (headerCells.length > 0) rows.push(headerCells);
          const cells: string[] = [];
          let c: RegExpExecArray | null;
          while ((c = tdRegex.exec(rowInner)) !== null) cells.push(c[1]);
          if (cells.length > 0) rows.push(cells);
        }
        const decode = (s: string) =>
          sanitizeHtml(s)
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
        const headers = rows.length > 0 ? rows[0].map(decode) : [];
        const bodyRows = rows.length > 1 ? rows.slice(1).map(r => r.map(decode)) : [];
        parts.push(
          <View key={`t-${match.index}`} style={styles.genTable}>
            {headers.length > 0 && (
              <View style={styles.genHeaderRow}>
                {headers.map((h, i) => (
                  <View key={`th-${i}`} style={[styles.genHeaderCell, i === 0 ? {} : { borderLeftWidth: 1, borderLeftColor: '#e5e7eb' }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{h}</Text>
                  </View>
                ))}
              </View>
            )}
            {bodyRows.map((r, ri) => (
              <View key={`tr-${ri}`} style={styles.genRow}>
                {(headers.length > 0 ? headers : r).map((_, ci) => (
                  <View key={`td-${ri}-${ci}`} style={styles.genCell}>
                    <Text style={{ fontSize: 9 }}>{r[ci] || ''}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
        lastIndex = match.index + match[0].length;
      }
      const after = html.slice(lastIndex);
      if (after.trim()) {
        parts.push(<Html key={`h-end`} stylesheet={htmlTagStyles}>{sanitizeHtml(after)}</Html>);
      }
      return <View>{parts}</View>;
    }
    // Try to detect simple markdown tables and render as PDF table
    const tableRegex = /(\n|^)\s*\|([^\n]+)\|\s*\n\s*\|[\-:\s\|]+\|\s*\n([\s\S]*?)(?=\n\s*\n|$)/g;
    const parts: any[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = tableRegex.exec(content)) !== null) {
      const before = content.slice(last, m.index);
      if (before.trim()) {
        if (isLikelyHtml) {
          parts.push(<Html key={`h-${last}`} stylesheet={htmlTagStyles}>{sanitizeHtml(before)}</Html>);
        } else {
          // render markdown as lightweight blocks (avoid Html for performance)
          parts.push(<View key={`md-${last}`}>{renderPlainBlocks(before)}</View>);
        }
      }
      const headerRow = m[2];
      const body = m[3];
      const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
      const rows = body.split('\n').filter(l => l.trim().startsWith('|')).map((line, idx) => {
        const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        return { id: idx, cells };
      });
      parts.push(
        <View key={`t-${m.index}`} style={styles.genTable}>
          <View style={styles.genHeaderRow}>
            {headers.map((h, i) => (
              <View key={`th-${i}`} style={[styles.genHeaderCell, i === 0 ? {} : { borderLeftWidth: 1, borderLeftColor: '#e5e7eb' }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{h}</Text>
              </View>
            ))}
          </View>
          {rows.map(r => (
            <View key={`tr-${r.id}`} style={styles.genRow}>
              {headers.map((_, i) => (
                <View key={`td-${r.id}-${i}`} style={styles.genCell}>
                  <Text style={{ fontSize: 9 }}>{r.cells[i] || ''}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
      last = m.index + m[0].length;
    }
    const after = content.slice(last);
    if (after.trim()) {
      if (isLikelyHtml) {
        parts.push(<Html key={`h-end`} stylesheet={htmlTagStyles}>{sanitizeHtml(after)}</Html>);
      } else {
        parts.push(<View key={`md-end`}>{renderPlainBlocks(after)}</View>);
      }
    }
    return <View>{parts}</View>;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoWrap}>
            <Image src="/Logo IenW.png" style={{ width: 200, height: 50, objectFit: 'contain' }} />
          </View>
          <Text style={styles.headerText}>
            {`Factsheet ${solution.title || 'Onbekende Oplossing'}`}
          </Text>
          <Text style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>
            Deze factsheet is gemaakt door de Parkmanager Tool Collectieve Vervoersoplossingen. Deze tool is ontwikkeld in opdracht van het Ministerie van Infrastructuur en Waterstaat.
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Meta blok in twee kolommen (Vuistregels) */}
        <View style={styles.twoColRow}>
          <View style={styles.twoColLeft}>
            {solution.wanneerRelevant && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Wanneer relevant:</Text>
                <Text style={{ marginTop: 2 }}>{solution.wanneerRelevant}</Text>
              </View>
            )}
            {solution.minimumAantalPersonen && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Minimum aantal personen:</Text>
                <Text style={{ marginTop: 2 }}>{solution.minimumAantalPersonen}</Text>
              </View>
            )}
            {solution.moeilijkheidsgraad && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Moeilijkheidsgraad:</Text>
                <Text style={{ marginTop: 2 }}>{solution.moeilijkheidsgraad}</Text>
              </View>
            )}
            {solution.ruimtebeslag && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Ruimtebeslag:</Text>
                <Text style={{ marginTop: 2 }}>{solution.ruimtebeslag}</Text>
              </View>
            )}
          </View>

          <View style={styles.twoColRight}>
            {solution.minimaleInvestering && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Investering:</Text>
                <Text style={{ marginTop: 2 }}>{solution.minimaleInvestering}</Text>
              </View>
            )}
            {solution.schaalbaarheid && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Schaalbaarheid:</Text>
                <Text style={{ marginTop: 2 }}>{solution.schaalbaarheid}</Text>
              </View>
            )}
            {solution.impact && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Impact:</Text>
                <Text style={{ marginTop: 2 }}>{solution.impact}</Text>
              </View>
            )}
            {solution.afhankelijkheidExternePartijen && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Afhankelijkheid externe partijen:</Text>
                <Text style={{ marginTop: 2 }}>{solution.afhankelijkheidExternePartijen}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Divider onder vuistregels */}
        <View style={styles.divider} />


        {solution.description && (
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>Beschrijving</Text> */}
            {renderContent(solution.description)}
          </View>
        )}

        {solution.uitvoering && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uitvoering</Text>
            {renderContent(solution.uitvoering)}
          </View>
        )}
        
        {/* Uitdagingen en Aanleidingen verwijderd op verzoek */}

        {solution.inputBusinesscase && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Input voor uw Business Case</Text>
            {renderContent(solution.inputBusinesscase)}
          </View>
        )}

        {solution.collectiefVsIndiviueel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collectief versus Individueel</Text>
            {renderContent(solution.collectiefVsIndiviueel)}
          </View>
        )}

        {/* Variant comparison table just before Casebeschrijving */}
        {renderVariantComparison()}

        {solution.casebeschrijving && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Casebeschrijving</Text>
            {renderContent(solution.casebeschrijving)}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default React.memo(MobilitySolutionFactsheetPdfComponent); 