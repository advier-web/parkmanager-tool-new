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
    
    // Splits de tekst in secties op basis van headers en verwerk elke sectie
    const sections = text.split(/^(#{1,3} .+)$/m);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Check of dit een header is
      if (/^#{1,3} .+$/m.test(section)) {
        const headerLevel = (section.match(/^(#+)/) || [''])[0].length;
        const headerText = section.replace(/^#{1,3} (.+)$/m, '$1');
        segments.push({ text: headerText, isBold: true, isHeader: true, level: headerLevel });
      } else {
        // Verwerk eerst alle bulletpoints om er echte lijsten van te maken
        let processedText = section;
        
        // Fix voor het dubbelpunt probleem: zorg dat het dubbelpunt op dezelfde regel komt
        processedText = processedText.replace(/(\S)\s*:\s*\n+/g, '$1: ');
        
        // Bereid de rest van de tekst voor
        let currentText = processedText;
        
        // Detecteer bulletlijsten (regels beginnend met bullet markers)
        const bulletRegex = /^([•*-])\s+(.+)(?:\n|$)/gm;
        const bulletMatches = [...currentText.matchAll(bulletRegex)];
        
        if (bulletMatches.length > 0) {
          // We hebben een lijst gevonden
          let processedLists = currentText;
          const listMatches = [];
          let lastIndex = 0;
          
          // Extraheer normale tekst en lijsten
          while ((bulletRegex.lastIndex = lastIndex) !== currentText.length) {
            const match = bulletRegex.exec(currentText);
            if (!match) break;
            
            // Vind het begin en eind van de huidige lijst
            const listStart = match.index;
            let listEnd = match.index + match[0].length;
            
            // Controleer of er meer bullets volgen
            let nextIndex = listEnd;
            let nextMatch;
            while ((nextMatch = bulletRegex.exec(currentText)) !== null && 
                  nextMatch.index === nextIndex) {
              listEnd = nextMatch.index + nextMatch[0].length;
              nextIndex = listEnd;
            }
            
            // Voeg normale tekst toe voor de lijst
            if (listStart > lastIndex) {
              const normalText = currentText.substring(lastIndex, listStart);
              if (normalText.trim()) {
                segments.push({
                  text: normalText.trim()
                    .replace(/\n+/g, '\n'),
                  isBold: false,
                  isHeader: false
                });
              }
            }
            
            // Verzamel alle items van de lijst
            const listText = currentText.substring(listStart, listEnd);
            const listItems = listText.split('\n')
              .filter(line => line.trim().match(/^[•*-]/))
              .map(line => line.trim().replace(/^[•*-]\s+/, ''))
              .join('\n• ');
            
            // Voeg de lijst toe als een speciaal segment
            segments.push({
              text: '• ' + listItems,
              isBold: false,
              isHeader: false,
              isList: true
            });
            
            lastIndex = listEnd;
          }
          
          // Voeg tekst toe na de laatste lijst indien aanwezig
          if (lastIndex < currentText.length) {
            const normalText = currentText.substring(lastIndex).trim();
            if (normalText) {
              segments.push({
                text: normalText.replace(/\n+/g, '\n'),
                isBold: false,
                isHeader: false
              });
            }
          }
        } else {
          // Geen lijsten, verwerk bold zoals voorheen
          let currentText = processedText;
          
          // Verwerk bold tekst
          while (currentText.includes('**') || currentText.includes('__')) {
            const boldStart = Math.min(
              currentText.indexOf('**') !== -1 ? currentText.indexOf('**') : Infinity,
              currentText.indexOf('__') !== -1 ? currentText.indexOf('__') : Infinity
            );
            
            if (boldStart === Infinity) break;
            
            // Voeg normale tekst toe voor de bold
            if (boldStart > 0) {
              segments.push({ 
                text: currentText.substring(0, boldStart)
                  .replace(/\n- /g, '\n• ') // Converteer bullet points 
                  .replace(/^- /gm, '• '), // Converteer begin bulllet points
                isBold: false, 
                isHeader: false 
              });
            }
            
            // Bepaal het eindpunt van de bold tekst
            const boldDelimiter = currentText.substring(boldStart, boldStart + 2);
            const boldEnd = currentText.indexOf(boldDelimiter, boldStart + 2);
            
            if (boldEnd === -1) break; // Geen sluitend delimeter gevonden
            
            // Voeg bold tekst toe
            segments.push({ 
              text: currentText.substring(boldStart + 2, boldEnd)
                .replace(/\n- /g, '\n• ') // Converteer bullet points
                .replace(/^- /gm, '• '), // Converteer begin bullet points
              isBold: true, 
              isHeader: false 
            });
            
            // Update de huidige tekst
            currentText = currentText.substring(boldEnd + 2);
          }
          
          // Voeg eventuele resterende tekst toe
          if (currentText) {
            segments.push({ 
              text: currentText
                .replace(/\n- /g, '\n• ') // Converteer bullet points
                .replace(/^- /gm, '• ') // Converteer begin bullet points
                .replace(/^\* /gm, '• '), // Converteer asterisk bullet points
              isBold: false, 
              isHeader: false 
            });
          }
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
          
          // Verwerk de tekst met opmaak
          const { segments } = processText(content);
          
          let lastListItem = false;
          let titleForBullet = "";
          
          for (const segment of segments) {
            doc.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
            
            // Bepaal lettergrootte op basis van type
            if (segment.isHeader) {
              // Verschillende groottes voor verschillende header niveaus
              const fontSize = segment.level === 1 ? 16 : (segment.level === 2 ? 14 : 12);
              doc.setFontSize(fontSize);
              
              // Voeg extra ruimte toe boven headers, vooral voor h3
              if (segment.level === 3) {
                newY += 5; // Extra ruimte voor h3 headers
              }
              
              // Sla de titel op voor eventuele bullets die volgen
              titleForBullet = segment.text;
              lastListItem = false;
            } else {
              doc.setFontSize(11);
            }
            
            // Bereken de beschikbare ruimte op de huidige pagina
            const availableHeight = pageHeight - newY - margin;
            
            // Fix voor het ":" probleem
            let textToRender = segment.text;
            
            // Detecteer of dit segment een lijsttitel is (bevat een dubbelpunt aan het einde)
            const isBulletTitle = !segment.isList && textToRender.trim().endsWith(':');
            
            if (textToRender.startsWith(':')) {
              // Als het een losstaande dubbelpunt is, combineer het met de vorige regel
              textToRender = textToRender.substring(1).trim();
            }
            
            // Speciale verwerking voor bulletpoints
            if (segment.isList) {
              // Maak elke bullet item een aparte regel met juiste inspringing
              const bulletItems = textToRender.split('\n• ');
              let formattedBullets = [];
              
              for (let i = 0; i < bulletItems.length; i++) {
                if (!bulletItems[i].trim()) continue;
                
                // Verwerk eerste item (kan zonder bullet aanduiding komen)
                if (i === 0 && !bulletItems[i].startsWith('•')) {
                  formattedBullets.push('• ' + bulletItems[i].trim());
                } else {
                  formattedBullets.push(bulletItems[i].trim().startsWith('•') ? 
                    bulletItems[i].trim() : '• ' + bulletItems[i].trim());
                }
              }
              
              // Converteer de bulletpoints naar het juiste formaat
              textToRender = formattedBullets.join('\n');
              
              // Markeer dat we een lijst aan het verwerken zijn
              lastListItem = true;
            } else if (isBulletTitle) {
              // Dit is een titel voor een lijst, maar geen lijst zelf
              titleForBullet = textToRender.replace(/:$/, '');
              lastListItem = false;
            } else {
              lastListItem = false;
            }
            
            // Fix voor overmatige letter-spacing door karaktercodering
            textToRender = textToRender
              .replace(/\s+/g, ' ')  // Normaliseer whitespace 
              .trim();
            
            // Splits tekst in regels die binnen de breedte passen
            doc.setCharSpace(0); // Zet character spacing terug naar normaal
            
            // Voor bulletpoints, pas speciale inspringing toe
            let lines;
            if (segment.isList) {
              // Maak eerst een array van bulletpoint regels
              const bulletLines = textToRender.split('\n');
              lines = [];
              
              // Verwerk elke bulletpoint regel met inspringing
              for (const bulletLine of bulletLines) {
                if (!bulletLine.trim()) continue;
                
                // Splits bullet punt in onderdelen (bullet + tekst)
                const bulletMatch = bulletLine.match(/^(\s*[•*-]\s*)(.+)$/);
                if (bulletMatch) {
                  const [_, bulletMarker, bulletText] = bulletMatch;
                  
                  // Bereken inspringing voor doorlopende tekst
                  const bulletIndent = margin + 5;
                  const textIndent = margin + 7; // Kleine inspringing voor het tekst-gedeelte
                  const wrappedWidth = contentWidth - 7; // Verminder breedte voor inspringing
                  
                  // Voeg bullet toe
                  lines.push(bulletLine);
                  
                  // Bereken doorlopende regels als tekst te lang is
                  const wrappedText = doc.splitTextToSize(bulletText, wrappedWidth);
                  if (wrappedText.length > 1) {
                    // Verwijder eerste regel (die is al toegevoegd met bullet)
                    wrappedText.shift();
                    
                    // Voeg overige regels toe met inspringing
                    for (const line of wrappedText) {
                      lines.push('    ' + line); // Extra inspringing
                    }
                  }
                } else {
                  lines.push(bulletLine);
                }
              }
            } else {
              lines = doc.splitTextToSize(textToRender, contentWidth);
            }
            
            // Bereken de benodigde hoogte voor deze tekstsegment
            let lineHeight;
            if (segment.isHeader) {
              lineHeight = 7;
            } else if (segment.isList) {
              lineHeight = 6; // Iets meer ruimte tussen bullet points
            } else {
              lineHeight = 5;
            }
            
            const textHeight = lines.length * lineHeight;
            
            // Check of we een nieuwe pagina nodig hebben
            if (textHeight > availableHeight) {
              doc.addPage();
              newY = margin;
            }
            
            // Teken de tekst met de juiste opmaak
            if (segment.isList) {
              // Teken elke bulletpoint regel afzonderlijk
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Bepaal of dit een bullet (eerste niveau) of een doorlopende regel is
                const isActualBullet = line.trim().startsWith('•');
                const indent = isActualBullet ? margin : margin + 7;
                
                doc.text(line, indent, newY + (i * lineHeight));
              }
              newY += textHeight;
            } else {
              // Teken gewone tekst
              doc.text(lines, margin, newY);
              newY += textHeight;
            }
            
            // Voeg extra ruimte toe na headers
            if (segment.isHeader) {
              newY += segment.level === 1 ? 5 : (segment.level === 2 ? 4 : 3);
            } 
            // Voeg minder ruimte toe na een bulletpoint, tenzij het de laatste is
            else if (segment.isList) {
              newY += 2;
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
            .replace(/\n{2,}/g, '\n'); // Verwijder dubbele lege regels
            
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