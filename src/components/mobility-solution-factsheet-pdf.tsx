import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { MobilitySolution } from '@/domain/models';
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
    marginBottom: 5,
    paddingLeft: 6,
  },
  li: {
    fontSize: 9,
    marginBottom: 4,
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
  html = html.replace(/^\s*(\d+)\. (.*$)/gim, (m, n, t) => `<ol start="${n}"><li>${t}</li></ol>`);
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
        
        {solution.uitdagingenEnAanleidingen && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uitdagingen en Aanleidingen</Text>
            {renderContent(solution.uitdagingenEnAanleidingen)}
          </View>
        )}

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