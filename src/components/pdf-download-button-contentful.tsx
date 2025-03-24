'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { MobilitySolution } from '@/domain/models';
import { getMobilitySolutionForPdf } from '@/services/contentful-service';
import { Download } from 'lucide-react';
import MarkdownIt from 'markdown-it';

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
  const md = new MarkdownIt({ breaks: true });

  // Helper functie om markdown om te zetten naar platte tekst met opmaak
  const parseMarkdown = (markdown: string): { text: string, format: 'normal' | 'bold' | 'italic' | 'heading' | 'list' }[] => {
    if (!markdown) return [];
    
    const result: { text: string, format: 'normal' | 'bold' | 'italic' | 'heading' | 'list' }[] = [];
    
    // Vervang markdown headings
    let processedText = markdown
      // Headers
      .replace(/^### (.*?)$/gm, '<<heading>>$1<<heading>>')
      .replace(/^## (.*?)$/gm, '<<heading>>$1<<heading>>')
      .replace(/^# (.*?)$/gm, '<<heading>>$1<<heading>>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<<bold>>$1<<bold>>')
      .replace(/__(.*?)__/g, '<<bold>>$1<<bold>>')
      // Italic
      .replace(/\*(.*?)\*/g, '<<italic>>$1<<italic>>')
      .replace(/_(.*?)_/g, '<<italic>>$1<<italic>>')
      // Lists
      .replace(/^- (.*?)$/gm, '<<list>>$1<<list>>')
      .replace(/^\* (.*?)$/gm, '<<list>>$1<<list>>')
      .replace(/^([0-9]+)\. (.*?)$/gm, '<<list>>$2<<list>>');

    const lines = processedText.split('\n');
    
    lines.forEach(line => {
      if (line.includes('<<heading>>')) {
        const parts = line.split('<<heading>>');
        if (parts.length >= 3) {
          result.push({ text: parts[1], format: 'heading' });
        }
      } else if (line.includes('<<list>>')) {
        const parts = line.split('<<list>>');
        if (parts.length >= 3) {
          result.push({ text: '• ' + parts[1], format: 'list' });
        }
      } else if (line.includes('<<bold>>')) {
        let text = line;
        
        // Extract the bold parts
        while (text.includes('<<bold>>')) {
          const start = text.indexOf('<<bold>>');
          const end = text.indexOf('<<bold>>', start + 8);
          
          if (start >= 0 && end >= 0) {
            const normalText = text.substring(0, start);
            const boldText = text.substring(start + 8, end);
            
            if (normalText) result.push({ text: normalText, format: 'normal' });
            result.push({ text: boldText, format: 'bold' });
            
            text = text.substring(end + 8);
          } else {
            break;
          }
        }
        
        // Add remaining normal text
        if (text) result.push({ text, format: 'normal' });
      } else if (line.includes('<<italic>>')) {
        let text = line;
        
        while (text.includes('<<italic>>')) {
          const start = text.indexOf('<<italic>>');
          const end = text.indexOf('<<italic>>', start + 10);
          
          if (start >= 0 && end >= 0) {
            const normalText = text.substring(0, start);
            const italicText = text.substring(start + 10, end);
            
            if (normalText) result.push({ text: normalText, format: 'normal' });
            result.push({ text: italicText, format: 'italic' });
            
            text = text.substring(end + 10);
          } else {
            break;
          }
        }
        
        if (text) result.push({ text, format: 'normal' });
      } else if (line.trim()) {
        result.push({ text: line, format: 'normal' });
      }
    });
    
    return result;
  };

  const generatePdf = async () => {
    setIsLoading(true);
    try {
      // Haal de volledige data op van Contentful
      const data = await getMobilitySolutionForPdf(mobilityServiceId);
      
      // Maak een nieuw PDF document
      const doc = new jsPDF();
      doc.setFont('helvetica');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let y = margin;
      
      // Helper functie om markdown tekst toe te voegen
      const addMarkdownText = (markdown: string, startY: number = y): number => {
        if (!markdown) return startY;
        
        const parsedContent = parseMarkdown(markdown);
        let currentY = startY;
        
        for (const item of parsedContent) {
          let fontSize = 12;
          let fontStyle = 'normal';
          let indent = 0;
          
          if (item.format === 'heading') {
            fontSize = 16;
            fontStyle = 'bold';
            
            // Voeg wat ruimte toe voor headings
            if (currentY > startY) currentY += 5;
          } else if (item.format === 'bold') {
            fontStyle = 'bold';
          } else if (item.format === 'italic') {
            fontStyle = 'italic';
          } else if (item.format === 'list') {
            indent = 5;
          }
          
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', fontStyle);
          
          const lines = doc.splitTextToSize(item.text, contentWidth - indent);
          
          // Als de tekst niet past op de huidige pagina, maak een nieuwe pagina
          if (currentY + (lines.length * fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            currentY = margin;
          }
          
          doc.text(lines, margin + indent, currentY);
          currentY += (lines.length * fontSize * 0.5) + 3;
          
          // Voeg extra ruimte toe na headings
          if (item.format === 'heading') {
            currentY += 5;
          }
        }
        
        return currentY + 5; // Extra ruimte na secties
      };
      
      // Voeg de titel toe
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, margin, y);
      y += 15;
      
      // Voeg een horizontale lijn toe
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Voeg de paspoort informatie toe
      if (data.paspoort) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Paspoort', margin, y);
        y += 10;
        y = addMarkdownText(data.paspoort, y);
      }
      
      // Voeg de beschrijving toe
      if (data.description) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Beschrijving', margin, y);
        y += 10;
        y = addMarkdownText(data.description, y);
      }
      
      // Voeg collectief vs individueel toe
      if (data.collectiefVsIndiviueel) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Collectief vs. Individueel', margin, y);
        y += 10;
        y = addMarkdownText(data.collectiefVsIndiviueel, y);
      }
      
      // Voeg effecten toe
      if (data.effecten) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Effecten', margin, y);
        y += 10;
        y = addMarkdownText(data.effecten, y);
      }
      
      // Voeg investering toe
      if (data.investering) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Investering', margin, y);
        y += 10;
        y = addMarkdownText(data.investering, y);
      }
      
      // Voeg implementatie toe
      if (data.implementatie) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Implementatie', margin, y);
        y += 10;
        y = addMarkdownText(data.implementatie, y);
      }
      
      // Voeg governance modellen toe
      if (data.governanceModels && data.governanceModels.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Governance Modellen', margin, y);
        y += 10;
        
        data.governanceModels
          .filter((model): model is GovernanceModel => 
            typeof model === 'object' && 
            model !== null && 
            'title' in model && 
            'description' in model
          )
          .forEach((model) => {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(model.title, margin, y);
            y += 8;
            
            if (model.description) {
              y = addMarkdownText(model.description, y);
            }
          });
      }
      
      // Voeg governance modellen toelichting toe
      if (data.governancemodellenToelichting) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Toelichting Governance Modellen', margin, y);
        y += 10;
        y = addMarkdownText(data.governancemodellenToelichting, y);
      }
      
      // Sla het PDF bestand op
      const pdfFileName = fileName || `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      doc.save(pdfFileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Hier zou je een toast of andere error feedback kunnen toevoegen
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