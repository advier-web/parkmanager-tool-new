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
    
    // Fix probleem met onderstrepingen en onderstrepingen die om tekst heen staan
    let processedText = text
      // Vervang markdown-stijl onderstrepingen door gewone tekst wanneer het niet om opmaak gaat
      .replace(/([^_])_([^_]+)_([^_])/g, '$1$2$3')
      // Verwijder alleenstaande underscore karakters
      .replace(/\s_\s/g, ' ')
      // Fix dubbele underscores die geen bold zijn
      .replace(/([^_])__([^_]+)__([^_])/g, '$1**$2**$3')
      // Normaliseer whitespace (verwijder onnodige spaties)
      .replace(/\s{2,}/g, ' ')
      // Fix probleem met dubbelpunten gevolgd door witruimte
      .replace(/(\S)\s*:\s*\n+/g, '$1: ');
    
    // Splits de tekst in secties op basis van headers en verwerk elke sectie
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
        // Detecteer en verwerk bulletlijsten eerst
        const lines = section.split('\n');
        let currentSegment: { text: string; isBold: boolean; isHeader: boolean; isList?: boolean } | null = null;
        let inBulletList = false;
        let bulletItems: string[] = [];
        
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim();
          if (!line) continue;
          
          // Check of dit een bullet point is
          const isBullet = /^[•*\-]\s+.+/.test(line);
          
          if (isBullet) {
            // Als we nog niet in een bulletlist waren, push het vorige segment en begin een nieuw bullet segment
            if (!inBulletList) {
              if (currentSegment) {
                segments.push(currentSegment);
                currentSegment = null;
              }
              inBulletList = true;
              bulletItems = [];
            }
            
            // Voeg dit bullet item toe aan de verzameling
            const bulletText = line.replace(/^[•*\-]\s+/, '').trim();
            bulletItems.push(bulletText);
          } else {
            // Dit is geen bullet, controleer of we uit een bullet lijst komen
            if (inBulletList) {
              // We hebben alle bullets verzameld, voeg ze toe als één segment
              if (bulletItems.length > 0) {
                segments.push({
                  text: bulletItems.map(item => `• ${item}`).join('\n'),
                  isBold: false,
                  isHeader: false,
                  isList: true
                });
                bulletItems = [];
              }
              inBulletList = false;
            }
            
            // Verwerk normale tekst en bold secties
            if (!currentSegment) {
              currentSegment = { text: '', isBold: false, isHeader: false };
            }
            
            // Zoek naar bold secties in deze regel
            let remainingLine = line;
            let boldSegments = [];
            
            // Detecteer bold secties (omringd door ** of __)
            while (remainingLine && (remainingLine.includes('**') || remainingLine.includes('__'))) {
              const boldStartDouble = remainingLine.indexOf('**');
              const boldStartUnder = remainingLine.indexOf('__');
              
              // Bepaal welk bold delimeter eerst komt
              const boldStart = 
                boldStartDouble !== -1 && (boldStartUnder === -1 || boldStartDouble < boldStartUnder) ? 
                boldStartDouble : boldStartUnder;
              const boldDelimiter = boldStart === boldStartDouble ? '**' : '__';
              
              if (boldStart === -1) break;
              
              // Tekst voor de bold sectie
              if (boldStart > 0) {
                const normalText = remainingLine.substring(0, boldStart);
                boldSegments.push({ text: normalText, isBold: false });
              }
              
              // Zoek het einde van de bold sectie
              const boldEnd = remainingLine.indexOf(boldDelimiter, boldStart + 2);
              if (boldEnd === -1) {
                // Geen afsluitend delimeter gevonden, behandel de rest als normale tekst
                boldSegments.push({ text: remainingLine.substring(boldStart), isBold: false });
                remainingLine = '';
              } else {
                // Bold sectie gevonden
                const boldText = remainingLine.substring(boldStart + 2, boldEnd);
                boldSegments.push({ text: boldText, isBold: true });
                remainingLine = remainingLine.substring(boldEnd + 2);
              }
            }
            
            // Voeg eventuele resterende tekst toe
            if (remainingLine) {
              boldSegments.push({ text: remainingLine, isBold: false });
            }
            
            // Als we bold secties hebben gevonden, voeg ze toe als individuele segmenten
            if (boldSegments.length > 0) {
              // Eerst het huidige segment toevoegen als het tekst bevat
              if (currentSegment && currentSegment.text.trim()) {
                segments.push(currentSegment);
              }
              
              // Voeg vervolgens alle bold segmenten toe
              for (const segment of boldSegments) {
                if (segment.text.trim()) {
                  segments.push({
                    text: segment.text.trim(),
                    isBold: segment.isBold,
                    isHeader: false
                  });
                }
              }
              
              currentSegment = null;
            } else {
              // Geen bold sectie gevonden, voeg de tekst toe aan het huidige segment
              if (currentSegment.text) {
                currentSegment.text += ' ' + line;
              } else {
                currentSegment.text = line;
              }
            }
          }
        }
        
        // Voeg eventuele resterende bulletpoints toe
        if (inBulletList && bulletItems.length > 0) {
          segments.push({
            text: bulletItems.map(item => `• ${item}`).join('\n'),
            isBold: false,
            isHeader: false,
            isList: true
          });
        }
        
        // Voeg eventueel resterend tekst segment toe
        if (currentSegment && currentSegment.text.trim()) {
          segments.push(currentSegment);
        }
      }
    }
    
    return { segments };
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
            // Vervang dubbele newlines door enkele
            .replace(/\n{3,}/g, '\n\n')
            // Fix tekst met underscore die geen opmaak is
            .replace(/([^_])_([^_]+)_([^_])/g, '$1$2$3');
          
          // Verwerk de tekst met opmaak
          const { segments } = processText(cleanedContent);
          
          // Variabele om bij te houden of de vorige regel een bullet was
          let previousWasBullet = false;
          
          // Doorloop alle segmenten en geef ze weer
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            
            // Stel de font in
            doc.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
            
            // Bepaal lettergrootte op basis van type
            if (segment.isHeader) {
              const fontSize = segment.level === 1 ? 16 : (segment.level === 2 ? 14 : 12);
              doc.setFontSize(fontSize);
              
              // Voeg ruimte toe boven headers, vooral voor h3
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
            
            // Fix voor bullet formatting
            if (segment.isList) {
              // Zet alle bullets op nieuwe regels
              const bulletLines = textToRender
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
              
              // Voeg ze correct geformatteerd samen
              textToRender = bulletLines.join('\n');
              
              previousWasBullet = true;
            } else {
              previousWasBullet = false;
            }
            
            // Fix overmatige letter-spacing
            doc.setCharSpace(0);
            
            // Voor bullet lijsten hebben we speciale verwerking nodig
            if (segment.isList) {
              // Bereken de ruimte tussen regels
              const lineHeight = 6; // Iets meer ruimte tussen bullet points
              
              // Splits de bullet lijst in regels
              const bulletLines = textToRender.split('\n');
              
              // Bereken de totale hoogte van alle bullets
              const totalHeight = bulletLines.length * lineHeight;
              
              // Check of er paginawissel nodig is
              if (totalHeight > availableHeight) {
                doc.addPage();
                newY = margin;
              }
              
              // Doorloop alle bullet regels
              for (let j = 0; j < bulletLines.length; j++) {
                const line = bulletLines[j].trim();
                
                // Extraheerbullet en tekst
                const bulletMatch = line.match(/^(\s*[•*\-]\s*)(.+)$/);
                
                if (bulletMatch) {
                  const bulletMarker = '•';
                  const bulletText = bulletMatch[2].trim();
                  
                  // Bullet teken
                  doc.text(bulletMarker, margin, newY);
                  
                  // Bereken maximale tekstbreedte voor bullet items
                  const textWidth = contentWidth - 5; // Verminder met bullet breedte
                  
                  // Splits en render tekst met word wrapping
                  const wrappedLines = doc.splitTextToSize(bulletText, textWidth);
                  
                  // Teken de eerste regel van de bullet tekst
                  doc.text(wrappedLines[0], margin + 5, newY);
                  newY += lineHeight;
                  
                  // Als er meerdere regels zijn, teken de rest met inspringing
                  for (let k = 1; k < wrappedLines.length; k++) {
                    doc.text(wrappedLines[k], margin + 5, newY);
                    newY += lineHeight;
                  }
                } else {
                  // Fallback voor oneigenlijk geformatteerde bullets
                  doc.text(line, margin, newY);
                  newY += lineHeight;
                }
              }
            } else {
              // Normale tekst (niet-bullets)
              const lineHeight = segment.isHeader ? 7 : 5;
              
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