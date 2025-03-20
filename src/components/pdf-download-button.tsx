'use client';

import { RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfDownloadButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
  fileName: string;
  title?: string;
}

export function PdfDownloadButton({ contentRef, fileName, title }: PdfDownloadButtonProps) {
  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Initialize the PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title if provided
      if (title) {
        pdf.setFontSize(16);
        pdf.text(title, 20, 15);
        pdf.setFontSize(12);
        pdf.line(20, 20, 190, 20); // Horizontal line below title
      }
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 30) / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      let imgY = 25; // Start below the title
      
      // Add the image to the PDF
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      
      // Save the PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van de PDF.');
    }
  };
  
  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      Download als PDF
    </button>
  );
} 