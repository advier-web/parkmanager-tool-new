'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { MobilitySolution, GovernanceModel } from '../types/mobilityTypes';

interface PdfDownloadButtonContentfulProps {
  mobilityServiceId: string;
  fileName?: string;
  className?: string;
  contentType?: 'mobilityService' | 'governanceModel';
}

export default function PdfDownloadButtonContentful({
  mobilityServiceId,
  fileName,
  className = '',
  contentType = 'mobilityService'
}: PdfDownloadButtonContentfulProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState<string>('');

  // Bij het laden van de component, haal de titel op voor de knop
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        if (contentType === 'mobilityService') {
          const { getMobilitySolutionForPdf } = await import('../services/mobilityService');
          const data = await getMobilitySolutionForPdf(mobilityServiceId);
          setItemTitle(data.title || 'mobiliteitsoplossing');
        } else if (contentType === 'governanceModel') {
          const { getGovernanceModelForPdf } = await import('../services/mobilityService');
          const data = await getGovernanceModelForPdf(mobilityServiceId);
          setItemTitle(data.title || 'governance model');
        }
      } catch (err) {
        console.error('Fout bij ophalen titel:', err);
        setItemTitle(contentType === 'mobilityService' ? 'mobiliteitsoplossing' : 'governance model');
      }
    };
    
    fetchTitle();
  }, [mobilityServiceId, contentType]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      let mobilityData: MobilitySolution | null = null;
      let governanceData: GovernanceModel | null = null;
      
      if (contentType === 'mobilityService') {
        // Import the service dynamically
        const { getMobilitySolutionForPdf } = await import('../services/mobilityService');
        
        // Fetch the data
        mobilityData = await getMobilitySolutionForPdf(mobilityServiceId);
      } else if (contentType === 'governanceModel') {
        // Import the service dynamically for governance model
        const { getGovernanceModelForPdf } = await import('../services/mobilityService');
        
        // Fetch the governance model data
        governanceData = await getGovernanceModelForPdf(mobilityServiceId);
      } else {
        throw new Error("Onbekend contentType: alleen 'mobilityService' of 'governanceModel' worden ondersteund");
      }
      
      // Prepare the PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Set document properties
      const title = contentType === 'mobilityService' 
        ? mobilityData?.title || 'Mobiliteitsdocument'
        : governanceData?.title || 'Governance Model';
        
      pdf.setProperties({
        title: title,
        subject: contentType === 'mobilityService' ? 'Mobiliteitsoplossing' : 'Governance Model',
        author: 'Parkmanager Tool',
        creator: 'Parkmanager Tool'
      });
      
      // Identificeer markdown elementen
      const parseMarkdown = (text: string | undefined): { type: string; content: string; level?: number }[] => {
        if (!text) return [];
        
        const segments: { type: string; content: string; level?: number }[] = [];
        const lines = text.split('\n');
        
        let inBulletList = false;
        let bulletItems: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) {
            if (inBulletList && bulletItems.length > 0) {
              segments.push({ type: 'bullet-list', content: bulletItems.join('\n') });
              bulletItems = [];
              inBulletList = false;
            }
            segments.push({ type: 'empty-line', content: '' });
            continue;
          }
          
          // Headers (# Heading)
          const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
          if (headerMatch) {
            if (inBulletList && bulletItems.length > 0) {
              segments.push({ type: 'bullet-list', content: bulletItems.join('\n') });
              bulletItems = [];
              inBulletList = false;
            }
            
            const level = headerMatch[1].length; // aantal # symbolen
            segments.push({ 
              type: 'header', 
              content: headerMatch[2],
              level: level 
            });
            continue;
          }
          
          // Bullet points
          if (line.match(/^[-*•]\s+/)) {
            inBulletList = true;
            bulletItems.push(line.replace(/^[-*•]\s+/, ''));
            continue;
          }
          
          // Als we in een bulletlijst waren maar nu een reguliere regel tegenkomen
          if (inBulletList && bulletItems.length > 0) {
            segments.push({ type: 'bullet-list', content: bulletItems.join('\n') });
            bulletItems = [];
            inBulletList = false;
          }
          
          // Reguliere paragraaf
          segments.push({ type: 'paragraph', content: line });
        }
        
        // Als er nog bulletpoints in de buffer staan
        if (inBulletList && bulletItems.length > 0) {
          segments.push({ type: 'bullet-list', content: bulletItems.join('\n') });
        }
        
        return segments;
      };
      
      // Functie om tekst met bold te formatteren
      const formatBoldText = (text: string): string => {
        // Zorg dat speciale tekens zoals CO₂ en ≈ behouden blijven
        return text.replace(/\*\*(.*?)\*\*/g, '$1')
                  .replace(/__(.*?)__/g, '$1');
      };
      
      // Add the title at the top of the first page
      let yPos = 20;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(title, 20, yPos);
      yPos += 15;
      
      // Hoofdfunctie voor het toevoegen van een sectie
      const addSection = (title: string, content: string | undefined): void => {
        if (!content) return;
        
        // Add section title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(title, 20, yPos);
        yPos += 10; // Meer ruimte onder sectiehoofdingen
        
        // Parse markdown content
        const segments = parseMarkdown(content);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        
        for (const segment of segments) {
          if (segment.type === 'empty-line') {
            yPos += 4; // Kleinere spatiëring voor lege regels
            continue;
          }
          
          if (segment.type === 'header') {
            // Paginawissel indien nodig
            if (yPos > 270) {
              pdf.addPage();
              yPos = 20;
            }
            
            if (segment.level === 1) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(16);
              pdf.text(segment.content, 20, yPos);
              yPos += 8;
            } else if (segment.level === 2) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(14);
              pdf.text(segment.content, 20, yPos);
              yPos += 7;
            } else if (segment.level === 3) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(12);
              pdf.text(segment.content, 20, yPos);
              yPos += 6;
            }
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            continue;
          }
          
          if (segment.type === 'bullet-list') {
            // Extra ruimte boven bulletlijsten
            yPos += 5;
            
            // Paginawissel indien nodig
            if (yPos > 270) {
              pdf.addPage();
              yPos = 20;
            }
            
            const bulletItems = segment.content.split('\n');
            for (const item of bulletItems) {
              pdf.setFont('helvetica', 'normal');
              
              // Paginawissel indien nodig
              if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
              }
              
              // Teken het bullet point
              pdf.text('•', 20, yPos);
              
              const bulletText = item.trim();
              // Simpele tekst render
              const lines = pdf.splitTextToSize(bulletText, 160);
              pdf.text(lines, 25, yPos);
              
              if (lines.length === 1) {
                yPos += 5;
              } else {
                yPos += lines.length * 5;
              }
            }
            
            // Extra ruimte onder bulletlijsten
            yPos += 5;
            continue;
          }
          
          if (segment.type === 'paragraph') {
            // Paginawissel indien nodig
            if (yPos > 270) {
              pdf.addPage();
              yPos = 20;
            }
            
            const processedText = formatBoldText(segment.content);
            const lines = pdf.splitTextToSize(processedText, 170);
            pdf.text(lines, 20, yPos);
            yPos += lines.length * 6;
            
            // Extra ruimte na paragrafen 
            yPos += 4;
          }
        }
      };

      // Different content types have different fields
      if (contentType === 'mobilityService' && mobilityData) {
        // Add the mobility service fields
        if (mobilityData.paspoort) {
          addSection('Paspoort', mobilityData.paspoort);
        }
        
        if (mobilityData.description) {
          addSection('Beschrijving', mobilityData.description);
        }
        
        if (mobilityData.collectiefVsIndiviueel) {
          addSection('Collectief vs. Individueel', mobilityData.collectiefVsIndiviueel);
        }
        
        if (mobilityData.effecten) {
          addSection('Effecten', mobilityData.effecten);
        }
        
        if (mobilityData.investering) {
          addSection('Investering', mobilityData.investering);
        }
        
        if (mobilityData.implementatie) {
          addSection('Implementatie', mobilityData.implementatie);
        }
        
        // Add governance models if they exist
        const governanceModels = mobilityData.governanceModels || [];
        if (governanceModels.length > 0) {
          // Paginawissel indien nodig
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text('Governance Modellen', 20, yPos);
          yPos += 10;
          
          governanceModels.forEach((model, index) => {
            if (typeof model === 'object' && model !== null && 'title' in model && 'description' in model) {
              // Paginawissel indien nodig
              if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
              }
              
              // Add subsection title
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(14);
              pdf.text(model.title, 20, yPos);
              yPos += 8;
              
              // Add description
              if (model.description) {
                addSection('', model.description);
              }
              
              // Extra ruimte na een model
              yPos += 8;
              
              // Page break if needed
              if (yPos > 270 && index < governanceModels.length - 1) {
                pdf.addPage();
                yPos = 20;
              }
            }
          });
          
          // Add governance models toelichting
          if (mobilityData.governancemodellenToelichting) {
            addSection('Toelichting Governance Modellen', mobilityData.governancemodellenToelichting);
          }
        }
      } else if (contentType === 'governanceModel' && governanceData) {
        // Add the governance model fields
        console.log('Governance data advantages:', governanceData.advantages);
        console.log('Governance data disadvantages:', governanceData.disadvantages);
        
        if (governanceData.description) {
          addSection('Beschrijving', governanceData.description);
        }
        
        if (governanceData.aansprakelijkheid) {
          addSection('Aansprakelijkheid', governanceData.aansprakelijkheid);
        }
        
        // Verbeterde afhandeling van voordelen, controleer specifiek het type
        if (governanceData.advantages) {
          if (Array.isArray(governanceData.advantages) && governanceData.advantages.length > 0) {
            const voordelenList = governanceData.advantages.map(item => `• ${item}`).join('\n\n');
            addSection('Voordelen', voordelenList);
          } else if (typeof governanceData.advantages === 'string') {
            const voordelen = governanceData.advantages as string;
            if (voordelen.trim() !== '') {
              addSection('Voordelen', voordelen);
            }
          }
        }
        
        // Verbeterde afhandeling van nadelen, controleer specifiek het type
        if (governanceData.disadvantages) {
          if (Array.isArray(governanceData.disadvantages) && governanceData.disadvantages.length > 0) {
            const nadelenList = governanceData.disadvantages.map(item => `• ${item}`).join('\n\n');
            addSection('Nadelen', nadelenList);
          } else if (typeof governanceData.disadvantages === 'string') {
            const nadelen = governanceData.disadvantages as string;
            if (nadelen.trim() !== '') {
              addSection('Nadelen', nadelen);
            }
          }
        }
        
        if (governanceData.benodigdhedenOprichting) {
          // Controleer of benodigdhedenOprichting een array is
          if (Array.isArray(governanceData.benodigdhedenOprichting) && governanceData.benodigdhedenOprichting.length > 0) {
            const benodigdhedenList = governanceData.benodigdhedenOprichting.map(item => `• ${item}`).join('\n\n');
            addSection('Benodigdheden Oprichting', benodigdhedenList);
          } else {
            addSection('Benodigdheden Oprichting', String(governanceData.benodigdhedenOprichting));
          }
        }
        
        if (governanceData.links) {
          // Controleer of links een array is
          if (Array.isArray(governanceData.links) && governanceData.links.length > 0) {
            const linksList = governanceData.links.map(item => `• ${item}`).join('\n\n');
            addSection('Links', linksList);
          } else {
            addSection('Links', String(governanceData.links));
          }
        }
        
        if (governanceData.doorlooptijdLang) {
          addSection('Doorlooptijd', governanceData.doorlooptijdLang);
        } else if (governanceData.doorlooptijd) {
          addSection('Doorlooptijd', governanceData.doorlooptijd);
        }
        
        if (governanceData.implementatie) {
          addSection('Implementatie', governanceData.implementatie);
        }
      }
      
      // Genereer bestandsnaam
      const pdfFileName = fileName || 
        `${(contentType === 'mobilityService' ? mobilityData?.title : governanceData?.title) || 'document'}`.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.pdf';
      
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
          Factsheet genereren...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download {itemTitle} factsheet
        </>
      )}
    </button>
  );
} 