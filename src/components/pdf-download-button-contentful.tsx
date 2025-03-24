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
  const processText = (text: string): { segments: Array<{ text: string, isBold: boolean, isHeader: boolean }> } => {
    if (!text) return { segments: [] };
    
    const segments: Array<{ text: string, isBold: boolean, isHeader: boolean }> = [];
    
    // Splits de tekst in secties op basis van headers en verwerk elke sectie
    const sections = text.split(/^(#{1,3} .+)$/m);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Check of dit een header is
      if (/^#{1,3} .+$/m.test(section)) {
        const headerText = section.replace(/^#{1,3} (.+)$/m, '$1');
        segments.push({ text: headerText, isBold: true, isHeader: true });
      } else {
        // Verwerk de rest van de tekst om bold te behouden
        let currentText = section;
        
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
                .replace(/\n- /g, '\n• '), // Converteer bullet points 
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
              .replace(/\n- /g, '\n• '), // Converteer bullet points
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
              .replace(/^\* /gm, '• '), // Converteer asterisk bullet points
            isBold: false, 
            isHeader: false 
          });
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
          
          for (const segment of segments) {
            doc.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
            
            // Bepaal lettergrootte op basis van type
            if (segment.isHeader) {
              doc.setFontSize(14);
            } else {
              doc.setFontSize(11);
            }
            
            // Bereken de beschikbare ruimte op de huidige pagina
            const availableHeight = pageHeight - newY - margin;
            
            // Splits tekst in regels die binnen de breedte passen
            const lines = doc.splitTextToSize(segment.text, contentWidth);
            
            // Bereken de benodigde hoogte voor deze tekstsegment
            const lineHeight = segment.isHeader ? 7 : 5;
            const textHeight = lines.length * lineHeight;
            
            // Check of we een nieuwe pagina nodig hebben
            if (textHeight > availableHeight) {
              doc.addPage();
              newY = margin;
            }
            
            // Teken de tekst
            doc.text(lines, margin, newY);
            
            // Update Y positie
            newY += textHeight;
            
            // Voeg extra ruimte toe na headers
            if (segment.isHeader) {
              newY += 3;
            }
          }
          
          // Voeg een kleine ruimte toe aan het eind van elke sectie
          return newY + 5;
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
          y = addFormattedText(data.paspoort, 'Paspoort', y);
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