'use client';

import { RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfDownloadButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
  fileName: string;
  title?: string;
  onBeforeDownload?: () => void;
}

export function PdfDownloadButton({ contentRef, fileName, title, onBeforeDownload }: PdfDownloadButtonProps) {
  // Functie om alleen de tekst uit een element te halen
  const extractTextContent = (element: HTMLElement): string => {
    // Kopie maken om de originele DOM niet aan te passen
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Verwijder scripts en stijlen
    const scripts = clone.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Vervang headers door tekst met asterisks
    const headers = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      const level = parseInt(header.tagName.substring(1));
      const prefix = '#'.repeat(level) + ' ';
      const textNode = document.createTextNode(prefix + header.textContent + '\n\n');
      header.parentNode?.replaceChild(textNode, header);
    });
    
    // Vervang lijstjes door tekstlijstjes
    const listItems = clone.querySelectorAll('li');
    listItems.forEach(item => {
      const textNode = document.createTextNode('• ' + item.textContent + '\n');
      item.parentNode?.replaceChild(textNode, item);
    });
    
    // Vervang breaks door newlines
    const breaks = clone.querySelectorAll('br');
    breaks.forEach(br => {
      const textNode = document.createTextNode('\n');
      br.parentNode?.replaceChild(textNode, br);
    });
    
    // Vervang divs en paragrafen door tekst met newlines
    const blocks = clone.querySelectorAll('div, p');
    blocks.forEach(block => {
      if (block.textContent && block.textContent.trim() !== '') {
        const text = block.textContent.trim() + '\n\n';
        if (block.parentNode) {
          const textNode = document.createTextNode(text);
          block.parentNode.replaceChild(textNode, block);
        }
      }
    });
    
    // Haal de volledige tekstinhoud op
    let textContent = clone.textContent || '';
    
    // Verwijder overbodige witruimte en lege regels
    textContent = textContent
      .replace(/\n{3,}/g, '\n\n') // Reduceer meerdere lege regels tot maximaal 2
      .trim();
    
    return textContent;
  };
  
  // Functie om een tekstuele PDF te genereren als fallback
  const generateTextPdf = (textContent: string) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Voeg titel toe
      if (title) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, 20);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.line(20, 25, 190, 25);
      }
      
      // Tekstinhoud splitsen in regels
      const textLines = pdf.splitTextToSize(textContent, 170);
      
      // Voeg tekst toe, begin na de titel
      pdf.text(textLines, 20, 35);
      
      // PDF opslaan
      pdf.save(`${fileName}-text.pdf`);
      
      return true;
    } catch (error) {
      console.error('Error generating text PDF:', error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    try {
      // Roep de onBeforeDownload callback aan als deze is meegegeven
      if (onBeforeDownload) {
        onBeforeDownload();
      }
      
      // Extraheer de textContent als fallback voor de afbeeldingsgebaseerde aanpak
      const textContent = extractTextContent(contentRef.current);
      
      // Clone the node to avoid modifying the actual DOM
      const originalNode = contentRef.current;
      const clonedNode = originalNode.cloneNode(true) as HTMLElement;
      
      // Apply some temporary styling to make things more predictable
      clonedNode.style.width = `${originalNode.offsetWidth}px`;
      clonedNode.style.margin = '0';
      clonedNode.style.padding = '15px';
      clonedNode.style.backgroundColor = '#ffffff';
      
      // Fix SVG rendering issues
      const svgs = clonedNode.querySelectorAll('svg');
      svgs.forEach(svg => {
        if (svg.getAttribute('width') === null) {
          svg.setAttribute('width', '24');
        }
        if (svg.getAttribute('height') === null) {
          svg.setAttribute('height', '24');
        }
      });
      
      // Add cloned node to body temporarily (but hidden) for proper rendering
      document.body.appendChild(clonedNode);
      clonedNode.style.position = 'absolute';
      clonedNode.style.left = '-9999px';
      clonedNode.style.top = '-9999px';
      
      // Use html2canvas with improved options
      const canvas = await html2canvas(clonedNode, {
        scale: 1.5, // Balance between quality and performance
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow potentially tainted images
        logging: true, // Enable logging to help debug
        backgroundColor: '#ffffff',
        onclone: (document) => {
          // Further modifications to the cloned document if needed
          return document;
        },
        removeContainer: false // Don't automatically remove the container
      });
      
      // Remove the cloned node from the document
      if (clonedNode.parentNode) {
        clonedNode.parentNode.removeChild(clonedNode);
      }
      
      // Get the image data
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Initialize the PDF with more space
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add title if provided
      if (title) {
        pdf.setFontSize(16);
        pdf.text(title, 15, 15);
        pdf.setFontSize(12);
        pdf.line(15, 20, 195, 20); // Horizontal line below title
      }
      
      // Calculate dimensions with more conservative ratio
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Use a slightly more conservative approach to sizing
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Use a more conservative ratio calculation
      let ratio = Math.min(pdfWidth / imgWidth * 0.9, (pdfHeight - 35) / imgHeight * 0.9);
      
      // Ensure ratio is reasonable
      if (ratio <= 0 || !isFinite(ratio)) {
        ratio = 0.7; // Fallback value
      }
      
      // Calculate position
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 25; // Start below the title
      
      try {
        // Add the image to the PDF with error handling
        pdf.addImage(
          imgData,
          'JPEG', // Use JPEG instead of PNG for better compatibility
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        );
        
        // Save the PDF
        pdf.save(`${fileName}.pdf`);
      } catch (innerError) {
        console.error('Error adding image to PDF:', innerError);
        
        // Gebruik de tekstfallback
        const textPdfSuccess = generateTextPdf(textContent);
        
        if (textPdfSuccess) {
          alert('De PDF kon niet met afbeeldingen worden gegenereerd. Een tekstversie is gedownload.');
        } else {
          alert('Er is een fout opgetreden bij het genereren van de PDF. Probeer het later opnieuw.');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Als er een fout optreedt in de hoofdfunctie, probeer nog steeds de tekst PDF te genereren
      if (contentRef.current) {
        const textContent = extractTextContent(contentRef.current);
        const textPdfSuccess = generateTextPdf(textContent);
        
        if (textPdfSuccess) {
          alert('Er was een probleem met het genereren van de PDF. Een tekstversie is gedownload.');
        } else {
          alert('Er is een fout opgetreden bij het genereren van de PDF. Probeer het later opnieuw of neem een screenshot van de pagina.');
        }
      } else {
        alert('Er is een fout opgetreden bij het genereren van de PDF. Probeer het later opnieuw of neem een screenshot van de pagina.');
      }
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