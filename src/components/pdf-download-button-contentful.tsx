'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { MobilitySolution } from '@/domain/models';
import { getMobilitySolutionForPdf } from '@/services/contentful-service';
import { Download } from 'lucide-react';

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

  const generatePdf = async () => {
    setIsLoading(true);
    try {
      // Haal de volledige data op van Contentful
      const data = await getMobilitySolutionForPdf(mobilityServiceId);
      
      // Maak een nieuw PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let y = margin;
      
      // Helper functie om tekst toe te voegen met word wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length * fontSize * 0.5) + 5;
        
        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
      };
      
      // Voeg de titel toe
      addText(data.title, 24, true);
      y += 10;
      
      // Voeg een horizontale lijn toe
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Voeg de paspoort informatie toe
      if (data.paspoort) {
        addText('Paspoort', 16, true);
        addText(data.paspoort);
        y += 10;
      }
      
      // Voeg de beschrijving toe
      if (data.description) {
        addText('Beschrijving', 16, true);
        addText(data.description);
        y += 10;
      }
      
      // Voeg collectief vs individueel toe
      if (data.collectiefVsIndiviueel) {
        addText('Collectief vs. Individueel', 16, true);
        addText(data.collectiefVsIndiviueel);
        y += 10;
      }
      
      // Voeg effecten toe
      if (data.effecten) {
        addText('Effecten', 16, true);
        addText(data.effecten);
        y += 10;
      }
      
      // Voeg investering toe
      if (data.investering) {
        addText('Investering', 16, true);
        addText(data.investering);
        y += 10;
      }
      
      // Voeg implementatie toe
      if (data.implementatie) {
        addText('Implementatie', 16, true);
        addText(data.implementatie);
        y += 10;
      }
      
      // Voeg governance modellen toe
      if (data.governanceModels && data.governanceModels.length > 0) {
        addText('Governance Modellen', 16, true);
        data.governanceModels
          .filter((model): model is GovernanceModel => 
            typeof model === 'object' && 
            model !== null && 
            'title' in model && 
            'description' in model
          )
          .forEach((model) => {
            addText(model.title, 14, true);
            if (model.description) {
              addText(model.description);
            }
            y += 5;
          });
        y += 10;
      }
      
      // Voeg governance modellen toelichting toe
      if (data.governancemodellenToelichting) {
        addText('Toelichting Governance Modellen', 16, true);
        addText(data.governancemodellenToelichting);
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