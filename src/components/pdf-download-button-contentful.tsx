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

  // Eenvoudige functie om markdown tekens te verwijderen
  const cleanText = (text: string): string => {
    if (!text) return '';
    
    // Verwijder alle markdown tekens
    return text
      .replace(/[#*_\[\]`]/g, '')      // Verwijder markdown speciale tekens
      .replace(/\n- /g, '\n• ');       // Zet lijstitems om in bullets
  };

  const generatePdf = async () => {
    setIsLoading(true);
    try {
      // Haal de volledige data op van Contentful
      const data = await getMobilitySolutionForPdf(mobilityServiceId);
      console.log('Contentful data geladen:', data);
      
      try {
        // Maak een nieuw PDF document
        const doc = new jsPDF();
        
        // Basis instellingen
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        let y = margin;
        
        // Helper functie voor tekst toevoegen
        const addText = (text: string, fontSize = 12, isBold = false) => {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          
          const cleanedText = cleanText(text || '');
          const lines = doc.splitTextToSize(cleanedText, contentWidth);
          
          // Nieuwe pagina indien nodig
          if (y + (lines.length * fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          
          // Tekst toevoegen
          doc.text(lines, margin, y);
          y += (lines.length * fontSize * 0.5) + 5;
        };
        
        // Titel
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(data.title, margin, y);
        y += 15;
        
        // Horizontale lijn
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        // Samenvatting
        if (data.paspoort) {
          addText('Paspoort', 16, true);
          addText(data.paspoort);
          y += 5;
        }
        
        // Beschrijving
        if (data.description) {
          addText('Beschrijving', 16, true);
          addText(data.description);
          y += 5;
        }
        
        // Collectief vs individueel
        if (data.collectiefVsIndiviueel) {
          addText('Collectief vs. Individueel', 16, true);
          addText(data.collectiefVsIndiviueel);
          y += 5;
        }
        
        // Effecten
        if (data.effecten) {
          addText('Effecten', 16, true);
          addText(data.effecten);
          y += 5;
        }
        
        // Investering
        if (data.investering) {
          addText('Investering', 16, true);
          addText(data.investering);
          y += 5;
        }
        
        // Implementatie
        if (data.implementatie) {
          addText('Implementatie', 16, true);
          addText(data.implementatie);
          y += 5;
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