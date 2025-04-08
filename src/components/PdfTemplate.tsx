'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { GovernanceModel } from '../types/mobilityTypes';

// Lettertypen registreren
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN_r8OUuhs.ttf', fontWeight: 'bold' }
  ]
});

// Stijlen voor de PDF
const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5
  },
  section: { 
    marginBottom: 10 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 10
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 12
  },
  text: { 
    fontSize: 11, 
    marginBottom: 5 
  },
  boldText: {
    fontWeight: 'bold'
  },
  bulletList: {
    marginTop: 5,
    marginBottom: 5
  },
  bulletItem: { 
    flexDirection: 'row', 
    marginBottom: 3 
  },
  bulletMarker: { 
    width: 10, 
    marginRight: 5 
  },
  bulletText: { 
    flex: 1,
    flexWrap: 'wrap'
  },
  keyValueItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  keyItem: {
    fontWeight: 'bold',
    width: 120
  },
  valueItem: {
    flex: 1,
    flexWrap: 'wrap'
  },
  header: {
    marginBottom: 20
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    marginVertical: 10
  }
});

// Helper functie om tekst te verwerken en markdown formaat te behouden
const parseMarkdown = (text: string) => {
  if (!text) return [];

  // Split de tekst in regels
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    
    // Als het een bullet point is (begint met -, * of •)
    if (trimmedLine.match(/^[-*•]\s+/)) {
      const bulletText = trimmedLine.replace(/^[-*•]\s+/, '');
      return (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletMarker}>•</Text>
          <Text style={styles.bulletText}>{bulletText}</Text>
        </View>
      );
    }
    
    // Proces voor bold tekst (tussen ** of __)
    if (trimmedLine.includes('**') || trimmedLine.includes('__')) {
      const parts = [];
      let currentIndex = 0;
      let isBold = false;
      let startDelimiter = '';
      
      for (let i = 0; i < trimmedLine.length; i++) {
        if (
          (trimmedLine.substring(i, i + 2) === '**' || 
           trimmedLine.substring(i, i + 2) === '__') && 
          (i === 0 || trimmedLine[i-1] !== '\\')
        ) {
          // Voeg de tekst voor de delimiter toe
          if (i > currentIndex) {
            parts.push(
              <Text key={`${index}-${currentIndex}`} style={isBold ? styles.boldText : {}}>
                {trimmedLine.substring(currentIndex, i)}
              </Text>
            );
          }
          
          // Update state
          startDelimiter = trimmedLine.substring(i, i + 2);
          isBold = !isBold;
          currentIndex = i + 2;
          i++; // Skip de tweede karakter van de delimiter
        }
      }
      
      // Voeg de resterende tekst toe
      if (currentIndex < trimmedLine.length) {
        parts.push(
          <Text key={`${index}-${currentIndex}`} style={isBold ? styles.boldText : {}}>
            {trimmedLine.substring(currentIndex)}
          </Text>
        );
      }
      
      return (
        <Text key={index} style={styles.text}>
          {parts}
        </Text>
      );
    }
    
    // Als het een titel is (voor secties)
    if (trimmedLine.match(/^#+\s+/)) {
      const match = trimmedLine.match(/^(#+)/);
      if (match) {
        const level = match[0].length;
        const titleText = trimmedLine.replace(/^#+\s+/, '');
        
        if (level === 1) {
          return <Text key={index} style={styles.sectionTitle}>{titleText}</Text>;
        } else if (level === 2 || level === 3) {
          return <Text key={index} style={styles.subsectionTitle}>{titleText}</Text>;
        }
      }
    }
    
    // Reguliere tekst
    return trimmedLine ? (
      <Text key={index} style={styles.text}>{trimmedLine}</Text>
    ) : (
      <Text key={index}> </Text> // Lege regel voor spacing
    );
  });
};

// Component voor het weergeven van een sectie met titel en inhoud
interface PDFSectionProps {
  title?: string;
  content?: string;
}

const PDFSection: React.FC<PDFSectionProps> = ({ title, content }) => {
  if (!content) return null;
  
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {parseMarkdown(content)}
    </View>
  );
};

// Definitie van de PDF Template props
interface PdfTemplateProps {
  data: {
    title: string;
    paspoort?: string;
    description?: string;
    collectiefVsIndiviueel?: string;
    // effecten?: string;
    investering?: string;
    uitvoeringsmogelijkheden?: string;
    implementatie?: string;
    governanceModels?: (GovernanceModel | string)[];
    governancemodellenToelichting?: string;
  };
}

// De hoofdcomponent voor de PDF Template
const PdfTemplate: React.FC<PdfTemplateProps> = ({ data }) => {
  // Helper functie om paspoort-data te extraheren en weer te geven
  const renderPassport = () => {
    if (!data.paspoort) return null;
    
    // Extract de key-value pairs uit de paspoort tekst
    const passportItems = [];
    const lines = data.paspoort.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Als de regel een : bevat, behandel het als een key-value pair
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        passportItems.push(
          <View key={`passport-${i}`} style={styles.keyValueItem}>
            <Text style={styles.keyItem}>{key}:</Text>
            <Text style={styles.valueItem}>{value}</Text>
          </View>
        );
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        // Als het een bullet point is
        const bulletText = line.replace(/^[•\-*]\s+/, '');
        passportItems.push(
          <View key={`passport-${i}`} style={styles.bulletItem}>
            <Text style={styles.bulletMarker}>•</Text>
            <Text style={styles.bulletText}>{bulletText}</Text>
          </View>
        );
      } else {
        // Reguliere tekst
        passportItems.push(
          <Text key={`passport-${i}`} style={styles.text}>{line}</Text>
        );
      }
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paspoort</Text>
        {passportItems}
      </View>
    );
  };

  // Render governance modellen indien aanwezig
  const renderGovernanceModels = () => {
    if (!data.governanceModels || data.governanceModels.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Governance Modellen</Text>
        {data.governanceModels.map((model, index) => {
          // Check of het een GovernanceModel object is
          if (typeof model === 'object' && model !== null && 'title' in model && 'description' in model) {
            return (
              <View key={`gov-${index}`} style={{ marginBottom: 10 }}>
                <Text style={styles.subsectionTitle}>{model.title}</Text>
                {parseMarkdown(model.description)}
              </View>
            );
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header met titel */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.horizontalLine} />
        </View>

        {/* Paspoort sectie */}
        {renderPassport()}

        {/* Overige secties */}
        <PDFSection title="Beschrijving" content={data.description} />
        <PDFSection title="Collectief vs. Individueel" content={data.collectiefVsIndiviueel} />
        {/* <PDFSection title="Effecten" content={data.effecten} /> */}
        <PDFSection title="Investering" content={data.investering} />
        <PDFSection title="Uitvoeringsmogelijkheden" content={data.uitvoeringsmogelijkheden} />
        <PDFSection title="Implementatie" content={data.implementatie} />

        {/* Governance modellen */}
        {renderGovernanceModels()}
        <PDFSection title="Toelichting Governance Modellen" content={data.governancemodellenToelichting} />
      </Page>
    </Document>
  );
};

export default PdfTemplate; 