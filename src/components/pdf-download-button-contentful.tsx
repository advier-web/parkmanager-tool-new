'use client';

import { useState } from 'react';
import { MobilitySolution } from '@/domain/models';
import { getMobilitySolutionForPdf } from '@/services/contentful-service';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PdfDownloadButtonContentfulProps {
  mobilityServiceId: string;
  fileName?: string;
}

type GovernanceModel = {
  sys: { id: string };
  title: string;
  description: string;
}

export function PdfDownloadButtonContentful({ mobilityServiceId, fileName }: PdfDownloadButtonContentfulProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Functie om markdown op te schonen en opmaak te behouden
  const processText = (text: string): { segments: Array<{ text: string, isBold: boolean, isHeader: boolean, level?: number, isList?: boolean }> } => {
    if (!text) return { segments: [] };
    
    const segments: Array<{ text: string, isBold: boolean, isHeader: boolean, level?: number, isList?: boolean }> = [];
    
    // Pre-processing voor markdown tekst - fix veelvoorkomende problemen
    let processedText = text
      // Fix dubbelpunten die op een nieuwe regel komen
      .replace(/(\S+)\s*:\s*(?:\r?\n)+/g, '$1: ')
      // Fix het probleem met dubbelpunten en streepjes
      .replace(/(\S+)\s*:\s*(?:\r?\n)*\s*-\s+/g, '$1: • ')
      // Normaliseer spaties in tekst (verwijder overbodige witruimte)
      .replace(/\s{2,}/g, ' ')
      // Fix voor problemen met CO2 notatie (zorg dat er geen vreemde witruimte in zit)
      .replace(/CO\s*(?:[,‚]\s*|[,.]\s*|)\s*-\s*uitstoot/gi, 'CO₂-uitstoot')
      // Vervang markdown-stijl onderstrepingen door gewone tekst wanneer het niet om opmaak gaat
      .replace(/([^_])_([^_]+)_([^_])/g, '$1$2$3')
      // Verwijder alleenstaande underscore karakters
      .replace(/\s_\s/g, ' ')
      // Fix dubbele underscores die geen bold zijn
      .replace(/([^_])__([^_]+)__([^_])/g, '$1**$2**$3');

    // Zorgen dat bullets ook correct worden herkend in lijst
    processedText = processedText.replace(/^\s*[-*]\s+/gm, '• ');
    
    // Herken headers en sectienamen, waarbij we dubbelpunten correct hanteren
    const sectionRegex = /^([A-Z][A-Za-z0-9 ]+):\s*$/gm;
    processedText = processedText.replace(sectionRegex, '### $1');

    // Splits de tekst in secties op basis van headers
    const sections = processedText.split(/^(#{1,3} .+)$/m);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Check of dit een header is
      if (/^#{1,3} .+$/m.test(section)) {
        const headerLevel = (section.match(/^(#+)/) || [''])[0].length;
        const headerText = section.replace(/^#{1,3} (.+)$/m, '$1').trim();
        segments.push({ text: headerText, isBold: true, isHeader: true, level: headerLevel });
      } else {
        // Detecteer en verwerk bulletlijsten eerst - verbeterde detectie
        const lines = section.split('\n');
        let bulletList: string[] = [];
        let currentText = '';
        
        for (let j = 0; j < lines.length; j++) {
          let line = lines[j].trim();
          if (!line) continue;
          
          // Detecteer bullet items (beginnend met •, -, of *)
          if (line.match(/^[•\-*]\s+.+/)) {
            // Als we al tekst hebben, voeg die eerst toe
            if (currentText.trim()) {
              // Verwerk eerst bold segmenten in deze huidige tekst
              const boldSegments = extractBoldSegments(currentText);
              segments.push(...boldSegments);
              currentText = '';
            }
            
            // Voeg dit bullet toe aan de bullet lijst
            // Verwijder het bullet teken en laat alleen de tekst over
            const bulletText = line.replace(/^[•\-*]\s+/, '').trim();
            bulletList.push(bulletText);
            
            // Kijk vooruit naar volgende regels voor doorlopende bullets of sub-items
            let k = j + 1;
            while (k < lines.length) {
              const nextLine = lines[k].trim();
              
              // Als de volgende regel ook een bullet is, stop met vooruit kijken
              if (nextLine.match(/^[•\-*]\s+.+/)) break;
              
              // Als het een lege regel is, sla over
              if (!nextLine) {
                k++;
                continue;
              }
              
              // Dit is tekst die bij het huidige bullet punt hoort - voeg toe
              bulletList[bulletList.length - 1] += ' ' + nextLine;
              j = k; // Update j om deze regel over te slaan bij de volgende iteratie
              k++;
            }
          } else {
            // Als er bullet items in de lijst staan, verwerk ze eerst
            if (bulletList.length > 0) {
              segments.push({
                text: bulletList.map(item => item).join('\n'),
                isBold: false,
                isHeader: false,
                isList: true
              });
              bulletList = [];
            }
            
            // Voeg deze regel toe aan de huidige tekst
            if (currentText) {
              currentText += ' ' + line;
            } else {
              currentText = line;
            }
          }
        }
        
        // Verwerk eventuele resterende bullet items
        if (bulletList.length > 0) {
          segments.push({
            text: bulletList.map(item => item).join('\n'),
            isBold: false,
            isHeader: false,
            isList: true
          });
        }
        
        // Verwerk eventuele resterende tekst
        if (currentText.trim()) {
          const boldSegments = extractBoldSegments(currentText);
          segments.push(...boldSegments);
        }
      }
    }
    
    return { segments };
  };
  
  // Helper functie om bold segmenten uit tekst te halen
  const extractBoldSegments = (text: string): Array<{ text: string, isBold: boolean, isHeader: boolean }> => {
    const segments: Array<{ text: string, isBold: boolean, isHeader: boolean }> = [];
    let remainingText = text.trim();
    
    // Als er geen bold markers zijn, return de gehele tekst als één segment
    if (!remainingText.includes('**') && !remainingText.includes('__')) {
      return [{ text: remainingText, isBold: false, isHeader: false }];
    }
    
    // Verwerk tekst met bold markers
    while (remainingText) {
      // Zoek naar het begin van een bold sectie
      const boldStartDouble = remainingText.indexOf('**');
      const boldStartUnder = remainingText.indexOf('__');
      
      // Bepaal welk marker eerst voorkomt
      let boldStart = -1;
      let boldMarker = '';
      
      if (boldStartDouble !== -1 && (boldStartUnder === -1 || boldStartDouble < boldStartUnder)) {
        boldStart = boldStartDouble;
        boldMarker = '**';
      } else if (boldStartUnder !== -1) {
        boldStart = boldStartUnder;
        boldMarker = '__';
      }
      
      // Als er geen bold marker meer is, voeg de rest van de tekst toe als normaal
      if (boldStart === -1) {
        if (remainingText.trim()) {
          segments.push({ text: remainingText.trim(), isBold: false, isHeader: false });
        }
        break;
      }
      
      // Voeg tekst voor de bold marker toe als normaal segment
      if (boldStart > 0) {
        const normalText = remainingText.substring(0, boldStart).trim();
        if (normalText) {
          segments.push({ text: normalText, isBold: false, isHeader: false });
        }
      }
      
      // Zoek het einde van de bold sectie
      const boldEnd = remainingText.indexOf(boldMarker, boldStart + boldMarker.length);
      
      if (boldEnd === -1) {
        // Geen afsluitende bold marker gevonden, behandel de rest als normale tekst
        segments.push({ text: remainingText.substring(boldStart).trim(), isBold: false, isHeader: false });
        break;
      }
      
      // Extract de bold tekst
      const boldText = remainingText.substring(boldStart + boldMarker.length, boldEnd).trim();
      if (boldText) {
        segments.push({ text: boldText, isBold: true, isHeader: false });
      }
      
      // Update de remaining tekst
      remainingText = remainingText.substring(boldEnd + boldMarker.length);
    }
    
    return segments;
  };

  const generatePdf = async () => {
    setIsLoading(true);
    try {
      // Haal de volledige data op van Contentful
      const data = await getMobilitySolutionForPdf(mobilityServiceId);
      console.log('Contentful data geladen:', data);
      
      try {
        // Maak een nieuw PDF document
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        // Basis instellingen
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        let y = margin;
        
        // Helper functie om tekst met opmaak toe te voegen
        const addFormattedText = (
          content: string, 
          sectionTitle?: string,
          initialY: number = y
        ): number => {
          if (!content) return initialY;
          
          let newY = initialY;
          
          // Voeg sectie titel toe indien aanwezig
          if (sectionTitle) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(sectionTitle, margin, newY);
            newY += 8; // kleinere afstand na een sectie titel
          }
          
          // Voorbereiding voor tekst verwerking - normaliseer formatting
          const cleanedContent = content
            // Fix voor CO2 notatie problemen
            .replace(/CO\s*(?:[,‚]\s*|[,.]\s*|)\s*-\s*uitstoot/gi, 'CO₂-uitstoot')
            // Fix dubbelpunten die op een nieuwe regel terecht komen
            .replace(/(\S+)\s*:\s*(?:\r?\n)+/g, '$1: ')
            // Fix het probleem met dubbelpunten gevolgd door streepjes
            .replace(/(\S+)\s*:\s*(?:\r?\n)*\s*-\s+/g, '$1: • ')
            // Vervang markdown-stijl lijsten met bullets
            .replace(/^\s*[-*]\s+/gm, '• ')
            // Verwijder dubbele newlines
            .replace(/\n{3,}/g, '\n\n')
            // Fix tekst met enkele underscores voor gewone tekst
            .replace(/([^_])_([^_]+)_([^_])/g, '$1$2$3');
          
          // Verwerk de tekst met opmaak
          const { segments } = processText(cleanedContent);
          
          // Doorloop alle segmenten en geef ze weer
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            
            // Stel de font in
            doc.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
            
            // Bepaal lettergrootte op basis van type
            if (segment.isHeader) {
              const fontSize = segment.level === 1 ? 16 : (segment.level === 2 ? 14 : 12);
              doc.setFontSize(fontSize);
              
              // Voeg ruimte toe boven headers
              if (segment.level === 3) {
                newY += 5; // Extra ruimte voor h3 headers
              }
            } else {
              doc.setFontSize(11);
            }
            
            // Bereken de beschikbare ruimte op de huidige pagina
            const availableHeight = pageHeight - newY - margin;
            
            // Verwerk de tekst voor weergave
            let textToRender = segment.text.trim();
            
            // Fix overmatige letter-spacing
            doc.setCharSpace(0);
            
            // Voor bullet lijsten hebben we speciale verwerking nodig
            if (segment.isList) {
              // Bereken de ruimte tussen regels
              const lineHeight = 6; // Ruimte tussen bullet points
              
              // Splits de bullet lijst in individuele items
              const bulletItems = textToRender.split('\n');
              
              // Bereken de totale hoogte van alle bullets
              const totalHeight = bulletItems.length * lineHeight;
              
              // Check of er paginawissel nodig is
              if (totalHeight > availableHeight) {
                doc.addPage();
                newY = margin;
              }
              
              // Doorloop alle bullet items
              for (let j = 0; j < bulletItems.length; j++) {
                const bulletText = bulletItems[j].trim();
                if (!bulletText) continue;
                
                // Teken bullet teken
                doc.text('•', margin, newY);
                
                // Bereken maximale tekstbreedte voor tekst na bullet
                const textWidth = contentWidth - 5; // Verminder met bullet breedte
                
                // Splits tekst na bullet voor word wrapping
                const wrappedLines = doc.splitTextToSize(bulletText, textWidth);
                
                // Teken de eerste regel van de bullet tekst
                doc.text(wrappedLines[0], margin + 5, newY);
                newY += lineHeight;
                
                // Als er meerdere regels zijn, teken de rest met inspringing
                for (let k = 1; k < wrappedLines.length; k++) {
                  doc.text(wrappedLines[k], margin + 5, newY);
                  newY += lineHeight;
                }
              }
            } else {
              // Normale tekst (niet-bullets)
              const lineHeight = segment.isHeader ? 7 : 5;
              
              // Fix voor tekst met dubbelpunten die mogelijk nog problemen geeft
              textToRender = textToRender.replace(/(\S+)\s*:\s*(?:\r?\n)+/g, '$1: ');
              
              // Splits lange regels in meerdere regels
              const wrappedLines = doc.splitTextToSize(textToRender, contentWidth);
              
              // Bereken totale hoogte
              const totalHeight = wrappedLines.length * lineHeight;
              
              // Check of paginawissel nodig is
              if (totalHeight > availableHeight) {
                doc.addPage();
                newY = margin;
              }
              
              // Teken alle regels
              doc.text(wrappedLines, margin, newY);
              newY += totalHeight;
            }
            
            // Voeg extra ruimte toe na specifieke elementen
            if (segment.isHeader) {
              newY += segment.level === 1 ? 5 : (segment.level === 2 ? 4 : 3);
            }
          }
          
          // Kleine ruimte aan het eind van elke sectie
          return newY + 3;
        };
        
        // Titel
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(data.title, margin, y);
        y += 12;
        
        // Horizontale lijn
        doc.setDrawColor(180);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        
        // Voeg de paspoort informatie toe
        if (data.paspoort) {
          // Zorg dat er geen lege regels zijn in de paspoort informatie
          const fixedPaspoort = data.paspoort
            .replace(/:\s*\n+/g, ': ') // Fix dubbelpunten gevolgd door newline
            .replace(/\n{2,}/g, '\n') // Verwijder dubbele lege regels
            .replace(/([^_])_([^_]+)_([^_])/g, '$1$2$3'); // Verwijder enkele underscores
            
          y = addFormattedText(fixedPaspoort, 'Paspoort', y);
        }
        
        // Voeg de beschrijving toe
        if (data.description) {
          y = addFormattedText(data.description, 'Beschrijving', y);
        }
        
        // Voeg collectief vs individueel toe
        if (data.collectiefVsIndiviueel) {
          y = addFormattedText(data.collectiefVsIndiviueel, 'Collectief vs. Individueel', y);
        }
        
        // Voeg effecten toe
        if (data.effecten) {
          y = addFormattedText(data.effecten, 'Effecten', y);
        }
        
        // Voeg investering toe
        if (data.investering) {
          y = addFormattedText(data.investering, 'Investering', y);
        }
        
        // Voeg implementatie toe
        if (data.implementatie) {
          y = addFormattedText(data.implementatie, 'Implementatie', y);
        }
        
        // Voeg governance modellen toe als ze beschikbaar zijn
        if (data.governanceModels && data.governanceModels.length > 0) {
          // Voeg sectie titel toe
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Governance Modellen', margin, y);
          y += 8;
          
          data.governanceModels
            .filter((model): model is GovernanceModel => 
              typeof model === 'object' && 
              model !== null && 
              'title' in model && 
              'description' in model
            )
            .forEach((model) => {
              // Voeg model titel toe
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text(model.title, margin, y);
              y += 8;
              
              // Voeg model beschrijving toe
              if (model.description) {
                y = addFormattedText(model.description, undefined, y);
              }
            });
        }
        
        // Voeg governance modellen toelichting toe
        if (data.governancemodellenToelichting) {
          y = addFormattedText(data.governancemodellenToelichting, 'Toelichting Governance Modellen', y);
        }
        
        // PDF opslaan
        const pdfFileName = fileName || `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
        doc.save(pdfFileName);
      } catch (pdfError) {
        console.error('Error creating PDF:', pdfError);
        alert('Er is een fout opgetreden bij het genereren van de PDF.');
      }
    } catch (error) {
      console.error('Error loading data for PDF:', error);
      alert('Er is een fout opgetreden bij het laden van de data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={generatePdf}
      disabled={isLoading}
      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      {isLoading ? 'PDF wordt gegenereerd...' : 'Download als PDF'}
    </button>
  );
} 