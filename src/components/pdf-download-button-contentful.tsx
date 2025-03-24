'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

interface PdfDownloadButtonContentfulProps {
  mobilityServiceId: string;
  fileName?: string;
  className?: string;
}

export default function PdfDownloadButtonContentful({
  mobilityServiceId,
  fileName,
  className = ''
}: PdfDownloadButtonContentfulProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import the service dynamically
      const { getMobilitySolutionForPdf } = await import('../services/mobilityService');
      
      // Fetch the data
      const data = await getMobilitySolutionForPdf(mobilityServiceId);
      
      // Prepare the PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Set document properties
      pdf.setProperties({
        title: data.title || 'Mobiliteitsdocument',
        subject: 'Mobiliteitsoplossing',
        author: 'Parkmanager Tool',
        creator: 'Parkmanager Tool'
      });
      
      // Helper function to clean markdown text
      const cleanText = (text: string | undefined): string => {
        if (!text) return '';
        return text
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
          .replace(/__(.*?)__/g, '$1')     // Remove underscore bold
          .replace(/\*(.*?)\*/g, '$1')      // Remove italic markdown
          .replace(/_(.*?)_/g, '$1')       // Remove underscore italic
          .replace(/#+\s(.*?)(\n|$)/g, '$1\n') // Clean headers but keep text
          .replace(/(?:\r\n|\r|\n){2,}/g, '\n\n'); // Reduce multiple newlines
      };
      
      // Helper function to add text with wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };
      
      // Add title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      let yPos = 20;
      yPos = addWrappedText(data.title, 20, yPos, 170, 10) + 5;
      
      // Add horizontal line
      pdf.setDrawColor(150, 150, 150);
      pdf.line(20, yPos, 190, yPos);
      yPos += 10;
      
      // Reset font for normal text
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Add sections with proper spacing
      const addSection = (title: string, content: string | undefined): void => {
        if (!content) return;
        
        // Add section title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(title, 20, yPos);
        yPos += 8;
        
        // Add content with normal font
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        
        // Process bullet points for better display
        const processedContent = cleanText(content).split('\n').map(line => {
          // Convert markdown bullet points to proper bullet points
          if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            return '• ' + line.trim().substring(1).trim();
          }
          return line;
        }).join('\n');
        
        yPos = addWrappedText(processedContent, 20, yPos, 170, 6) + 10;
        
        // Add extra space after section
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      };
      
      // Add each section
      if (data.paspoort) {
        addSection('Paspoort', data.paspoort);
      }
      
      if (data.description) {
        addSection('Beschrijving', data.description);
      }
      
      if (data.collectiefVsIndiviueel) {
        addSection('Collectief vs. Individueel', data.collectiefVsIndiviueel);
      }
      
      if (data.effecten) {
        addSection('Effecten', data.effecten);
      }
      
      if (data.investering) {
        addSection('Investering', data.investering);
      }
      
      if (data.implementatie) {
        addSection('Implementatie', data.implementatie);
      }
      
      // Add governance models if they exist
      const governanceModels = data.governanceModels || [];
      if (governanceModels.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('Governance Modellen', 20, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        
        governanceModels.forEach((model, index) => {
          if (typeof model === 'object' && model !== null && 'title' in model && 'description' in model) {
            // Add subsection title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text(model.title, 20, yPos);
            yPos += 6;
            
            // Add description
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            
            const processedDescription = cleanText(model.description).split('\n').map(line => {
              if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return '• ' + line.trim().substring(1).trim();
              }
              return line;
            }).join('\n');
            
            yPos = addWrappedText(processedDescription, 20, yPos, 170, 6) + 8;
            
            // Add page break if needed
            if (yPos > 270 && index < governanceModels.length - 1) {
              pdf.addPage();
              yPos = 20;
            }
          }
        });
        
        yPos += 5;
      }
      
      // Add governance models toelichting
      if (data.governancemodellenToelichting) {
        addSection('Toelichting Governance Modellen', data.governancemodellenToelichting);
      }
      
      // Generate the file name
      const pdfFileName = fileName || 
        `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      
      // Save the PDF
      pdf.save(pdfFileName);
      
    } catch (err) {
      console.error('Fout bij genereren PDF:', err);
      setError('Er is een fout opgetreden bij het genereren van de PDF');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <button
        className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700`}
        disabled
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {error}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${className} inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PDF genereren...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download als PDF
        </>
      )}
    </button>
  );
} 