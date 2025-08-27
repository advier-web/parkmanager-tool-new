import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { MobilitySolution, ImplementationVariation } from '@/domain/models';
import { getImplementationVariationsForSolution, getImplementationVariationById } from '@/services/contentful-service';
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
    marginBottom: 6,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
    fontFamily: 'Open Sans',
    lineHeight: 1.2,
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
    color: '#000000',
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 1.1,
  },
  h2: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 1.1,
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
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
}

// Basic Markdown to HTML converter (copied from ImplementationVariantFactsheetPdf)
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

const MobilitySolutionFactsheetPdfComponent: React.FC<MobilitySolutionFactsheetPdfProps> = ({ solution }) => {
  const [resolvedVariations, setResolvedVariations] = useState<ImplementationVariation[]>([]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      // 1) Prefer already attached variations
      if (Array.isArray((solution as any).implementationVariations) && (solution as any).implementationVariations.length > 0) {
        if (!cancelled) setResolvedVariations((solution as any).implementationVariations as ImplementationVariation[]);
        return;
      }
      // 2) If we have linked ids, fetch by ids
      const ids = (solution as any).implementatievarianten as string[] | undefined;
      if (Array.isArray(ids) && ids.length > 0) {
        const fetched = (await Promise.all(ids.map(id => getImplementationVariationById(id)))).filter(Boolean) as ImplementationVariation[];
        if (!cancelled) setResolvedVariations(fetched);
        return;
      }
      // 3) Fallback: query by solution id
      try {
        const fetched = await getImplementationVariationsForSolution(solution.id);
        if (!cancelled) setResolvedVariations(fetched);
      } catch (_) {
        // ignore
      }
    };
    bootstrap();
    return () => { cancelled = true; };
  }, [solution]);
  // Helper to render a compact comparison table for available implementation variations
  const renderVariantComparison = () => {
    const variations = resolvedVariations;
    if (!variations || variations.length === 0) return null;

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
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.controleEnFlexibiliteit || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`cf-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

          {/* Maatwerk */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Maatwerk</Text></View>
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.maatwerk || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`mw-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

          {/* Kosten en schaalvoordelen */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Kosten en schaalvoordelen</Text></View>
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.kostenEnSchaalvoordelen || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`ks-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

          {/* Operationele complexiteit */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Operationele complexiteit</Text></View>
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.operationeleComplexiteit || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`oc-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

          {/* Juridische en compliance risico's */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Juridische en compliance risico's</Text></View>
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.juridischeEnComplianceRisicos || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`jr-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

          {/* Risico van onvoldoende gebruik */}
          <View style={styles.compRow}>
            <View style={styles.compHeaderCell}><Text style={styles.compHeaderText}>Risico van onvoldoende gebruik</Text></View>
            {variations.map((v, idx) => {
              const blocks = basicMarkdownToHtml(v.risicoVanOnvoldoendeGebruik || '-');
              const html = Array.isArray(blocks) ? blocks.join('') : String(blocks);
              return (
                <View key={`rg-${v.id || idx}`} style={styles.compCell}>
                  <Html stylesheet={htmlTagStyles}>{html}</Html>
                </View>
              );
            })}
          </View>

        </View>
      </View>
    );
  };
  console.log("MobilitySolutionFactsheetPdf received solution:", JSON.stringify(solution, null, 2)); // Added for debugging
  // renderContent function (copied and adapted from ImplementationVariantFactsheetPdf)
  const renderContent = (content?: string) => {
    if (!content) return <Text>Niet gespecificeerd</Text>;
    const isLikelyHtml = content.includes('<') && content.includes('>');
    let htmlToRender;
    if (isLikelyHtml) {
      htmlToRender = content;
    } else {
      htmlToRender = basicMarkdownToHtml(content);
    }
    const cleanedHtml = htmlToRender.replace(/<p><\/p>/g, '');
    // Split into block-level chunks so large sections can flow across page breaks
    const blockRegex = /<(h1|h2|h3|p|ul|ol|table|pre)[\s\S]*?<\/\1>/gi;
    const blocks: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(cleanedHtml)) !== null) {
      // Push any text before the match as a paragraph
      if (match.index > lastIndex) {
        const stray = cleanedHtml.slice(lastIndex, match.index).trim();
        if (stray) blocks.push(`<p>${stray}</p>`);
      }
      blocks.push(match[0]);
      lastIndex = match.index + match[0].length;
    }
    const tail = cleanedHtml.slice(lastIndex).trim();
    if (tail) blocks.push(`<p>${tail}</p>`);

    return (
      <View>
        {blocks.map((b, i) => (
          <Html key={i} stylesheet={htmlTagStyles}>{b}</Html>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            {`Factsheet ${solution.title || 'Onbekende Oplossing'}`}
          </Text>
        </View>

        {/* Meta blok in twee kolommen */}
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