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
        compress: true,
        hotfixes: ['px_scaling'],
        filters: ['ASCIIHexEncode']
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
      
      // Update the formatSpecialText function to handle CO₂ more reliably
      const formatSpecialText = (text: string): string => {
        if (!text) return '';
        
        // Eerst controleren of de tekst het unicode subscript 2 bevat (₂)
        // en deze vervangen door een stabielere representatie
        let processed = text
          // Voor CO₂ eerst als een geheel woord behandelen
          .replace(/CO₂-uitstoot/g, 'CO2-uitstoot') // Vervang eerst alle volledige termen
          .replace(/CO₂/g, 'CO2') // Vervang daarna de losse CO₂ termen
          
          // Dan kijken naar variaties met spaties
          .replace(/C O ₂/g, 'CO2')
          .replace(/C O 2/g, 'CO2')
          .replace(/C O ,/g, 'CO2')
          
          // Tenslotte, de volledige "uitstoot" patronen met spaties
          .replace(/CO2[\s-]*uitstoot/g, 'CO2-uitstoot')
          .replace(/CO[\s-]*2[\s-]*uitstoot/g, 'CO2-uitstoot')
          .replace(/C\s*O\s*2[\s-]*uitstoot/g, 'CO2-uitstoot');
        
        return processed;
      };
      
      // Parse markdown function - verbeterde versie om ook __ en ** te herkennen
      const parseMarkdown = (text: string | undefined): { type: string; content: string; level?: number; isBold?: boolean }[] => {
        if (!text) return [];
        
        const segments: { type: string; content: string; level?: number; isBold?: boolean }[] = [];
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
          
          // Headers (### Heading or ## Heading or # Heading)
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
              content: formatSpecialText(headerMatch[2]), // Clean up the header text
              level: level 
            });
            continue;
          }
          
          // Gehele regel is bold text (__text__ of **text**)
          const boldLineMatch = line.match(/^__(.+)__$/) || line.match(/^\*\*(.+)\*\*$/);
          if (boldLineMatch) {
            if (inBulletList && bulletItems.length > 0) {
              segments.push({ type: 'bullet-list', content: bulletItems.join('\n') });
              bulletItems = [];
              inBulletList = false;
            }
            
            segments.push({
              type: 'paragraph',
              content: formatSpecialText(boldLineMatch[1]),
              isBold: true
            });
            continue;
          }
          
          // Bullet points (- item or * item or • item)
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
      
      // Functie om bullet lists correct weer te geven
      const renderBulletList = (pdf: jsPDF, content: string, startY: number, pageWidth = 170, leftMargin = 20): number => {
        let yPos = startY;
        const bulletItems = content.split('\n');
        
        for (const item of bulletItems) {
          if (!item.trim()) continue;
          
          // Check for page break
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          // Check for bold header pattern with __ markers
          const boldHeaderMatch = item.match(/^__([^_]+)__:\s*(.*)/);
          
          if (boldHeaderMatch) {
            // Draw bullet point
            pdf.text('•', leftMargin, yPos);
            
            // Get header and content
            const header = boldHeaderMatch[1].trim();
            const itemContent = boldHeaderMatch[2].trim();
            
            // Draw header in bold
            pdf.setFont('helvetica', 'bold');
            pdf.text(header + ':', leftMargin + 5, yPos);
            
            // Calculate header width for content positioning
            const headerWidth = pdf.getTextWidth(header + ':');
            
            // Reset font for content
            pdf.setFont('helvetica', 'normal');
            
            // Handle content after the header
            if (itemContent) {
              // Calculate available width
              const maxWidth = pageWidth - (leftMargin + 5 + headerWidth + 3);
              
              // Process the content for CO₂
              const processedContent = formatSpecialText(itemContent);
              
              // Plaats de eerste regel na de header als er ruimte is
              if (maxWidth > 20) {
                // Split tekst met juiste breedte
                const contentLines = pdf.splitTextToSize(processedContent, maxWidth);
                
                if (contentLines.length > 0) {
                  // First line
                  pdf.text(contentLines[0], leftMargin + 5 + headerWidth + 3, yPos);
                  
                  // Subsequent lines (if any) aligned with bullet point indentation
                  for (let i = 1; i < contentLines.length; i++) {
                    yPos += 5; // Verminderde regelafstand
                    
                    // Check for page break
                    if (yPos > 270) {
                      pdf.addPage();
                      yPos = 20;
                    }
                    
                    pdf.text(contentLines[i], leftMargin + 5, yPos);
                  }
                }
              } else {
                // Not enough space to put content after header, start on next line
                yPos += 5; // Verminderde regelafstand
                
                // Check for page break
                if (yPos > 270) {
                  pdf.addPage();
                  yPos = 20;
                }
                
                // All content on new lines aligned with bullet indentation
                const contentLines = pdf.splitTextToSize(processedContent, pageWidth - (leftMargin + 5));
                pdf.text(contentLines, leftMargin + 5, yPos);
                
                // Adjust y position for subsequent lines
                if (contentLines.length > 1) {
                  yPos += (contentLines.length - 1) * 5; // Verminderde regelafstand
                }
              }
            }
          } else {
            // Regular bullet point
            
            // Draw bullet
            pdf.text('•', leftMargin, yPos);
            
            // Process the content for CO₂
            const processedItem = formatSpecialText(item);
            
            // Split into lines with proper width
            const lines = pdf.splitTextToSize(processedItem, pageWidth - (leftMargin + 5));
            
            // Draw text
            pdf.text(lines, leftMargin + 5, yPos);
            
            // Adjust y position for wrapped lines
            if (lines.length > 1) {
              yPos += (lines.length - 1) * 5; // Verminderde regelafstand
            }
          }
          
          // Move to next bullet point
          yPos += 5; // Verminderde ruimte tussen bullets (was 6)
        }
        
        return yPos;
      };
      
      // Functie om paragrafen correct weer te geven
      const renderParagraph = (pdf: jsPDF, content: string, startY: number, isBold = false, pageWidth = 170, leftMargin = 20): number => {
        let yPos = startY;
        
        // Check for page break
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Process content for CO₂ text
        const processedContent = formatSpecialText(content);
        
        // Set font based on whether this is a bold paragraph
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        // Split text into lines that fit the page width
        const lines = pdf.splitTextToSize(processedContent, pageWidth - leftMargin);
        
        // Draw text
        pdf.text(lines, leftMargin, yPos);
        
        // Reset font to normal if we changed it
        if (isBold) {
          pdf.setFont('helvetica', 'normal');
        }
        
        // Calculate new y position
        yPos += lines.length * 5; // Verminderde regelafstand
        
        return yPos;
      };
      
      // Functie om een sectie toe te voegen
      const addSection = (pdf: jsPDF, title: string, content: string | undefined, startY: number): number => {
        if (!content) return startY;
        
        let yPos = startY;
        
        // Check for page break
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Add section title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, yPos);
        yPos += 8; // Verminderde ruimte na sectie titel
        
        // Reset font for content
        pdf.setFontSize(9); // Kleinere tekstgrootte voor body tekst
        pdf.setFont('helvetica', 'normal');
        
        // Parse content into segments
        const segments = parseMarkdown(content);
        
        // Process each segment
        for (const segment of segments) {
          // Check for page break
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          if (segment.type === 'empty-line') {
            yPos += 1; // Verminderde witruimte bij lege regels (was 2)
          } else if (segment.type === 'header') {
            // Handle headers
            pdf.setFont('helvetica', 'bold');
            
            if (segment.level === 1) {
              // Extra check om witruimte boven H1 te verminderen
              if (segments.indexOf(segment) > 0) { // Niet het eerste element
                yPos += 4; // Verminderde witruimte boven H1 (was 8)
              }
              
              pdf.setFontSize(16);
              pdf.text(segment.content, 20, yPos);
              yPos += 8; // Witruimte onder H1
            } else if (segment.level === 2) {
              // Meer witruimte boven H2
              yPos += 10; // Vergrote witruimte boven H2 (was impliciet 0)
              
              pdf.setFontSize(14);
              pdf.text(segment.content, 20, yPos);
              yPos += 6; // Witruimte onder H2
            } else { // level === 3
              pdf.setFontSize(12);
              pdf.text(segment.content, 20, yPos);
              yPos += 5; // Meer witruimte onder H3 (was 4)
            }
            
            // Reset font
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9); // Terug naar kleinere body tekstgrootte
          } else if (segment.type === 'paragraph') {
            // Handle paragraphs (with improved bold support)
            yPos = renderParagraph(pdf, segment.content, yPos, segment.isBold);
            yPos += 1; // Verminderde witruimte na paragraaf (was 1.5)
          } else if (segment.type === 'bullet-list') {
            // Handle bullet lists
            yPos = renderBulletList(pdf, segment.content, yPos);
            yPos += 2; // Verminderde witruimte na lijst
          }
        }
        
        return yPos;
      };
      
      // Add the title at the top of the first page
      let yPos = 20;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(title, 20, yPos);
      yPos += 15;
      
      if (contentType === 'mobilityService') {
        const sections = [
          { title: 'Beschrijving', content: mobilityData?.description },
          { title: 'Collectief vs. Individueel', content: mobilityData?.collectiefVsIndiviueel },
          { title: 'Effecten', content: mobilityData?.effecten },
          { title: 'Investering', content: mobilityData?.investering },
          { title: 'Implementatie', content: mobilityData?.implementatie }
        ];
        
        // Process each section
        for (const section of sections) {
          if (section.content) {
            yPos = addSection(pdf, section.title, section.content, yPos);
            yPos += 8; // Verminderde witruimte tussen secties
          }
        }
        
        // Helper functie om de juiste rechtsvorm tekst te bepalen voor een governance model
        const getRechtsvormText = (model: any) => {
          if (!mobilityData) return '';
          
          console.log('[PDF] Finding rechtsvorm text for model:', model.title);
          
          // First check if we have all the rechtsvorm fields available
          const hasRechtsvormen = (
            mobilityData.geenRechtsvorm || 
            mobilityData.vereniging || 
            mobilityData.stichting || 
            mobilityData.ondernemersBiz || 
            mobilityData.vastgoedBiz || 
            mobilityData.gemengdeBiz || 
            mobilityData.cooperatieUa || 
            mobilityData.bv || 
            mobilityData.ondernemersfonds
          );
          
          if (!hasRechtsvormen) {
            console.log('[PDF] Warning: No rechtsvorm texts found in mobilityData');
            return ''; 
          }
          
          // Log available fields for debugging
          console.log('[PDF] Available rechtsvorm fields:', {
            geenRechtsvorm: mobilityData.geenRechtsvorm ? 'yes' : 'no',
            vereniging: mobilityData.vereniging ? 'yes' : 'no', 
            stichting: mobilityData.stichting ? 'yes' : 'no',
            ondernemersBiz: mobilityData.ondernemersBiz ? 'yes' : 'no',
            vastgoedBiz: mobilityData.vastgoedBiz ? 'yes' : 'no',
            gemengdeBiz: mobilityData.gemengdeBiz ? 'yes' : 'no',
            cooperatieUa: mobilityData.cooperatieUa ? 'yes' : 'no',
            bv: mobilityData.bv ? 'yes' : 'no',
            ondernemersfonds: mobilityData.ondernemersfonds ? 'yes' : 'no'
          });
          
          // Exact matcher to ensure we don't get false positives with partial matches
          const exactMatch = (source: string, patterns: string[]): boolean => {
            if (!source) return false;
            const normalizedSource = source.toLowerCase().trim();
            return patterns.some(pattern => 
              normalizedSource === pattern.toLowerCase().trim() ||
              normalizedSource.startsWith(pattern.toLowerCase().trim() + ' ') ||
              normalizedSource.endsWith(' ' + pattern.toLowerCase().trim())
            );
          };
          
          // Get legalForm and title
          const legalForm = model.legalForm ? model.legalForm.toLowerCase().trim() : '';
          const title = model.title ? model.title.toLowerCase().trim() : '';
          
          // Model type detection logic
          if (exactMatch(legalForm, ['vereniging']) || exactMatch(title, ['vereniging', 'bedrijvenvereniging'])) {
            console.log('[PDF] Found match for vereniging');
            return mobilityData.vereniging;
          }
          
          if (exactMatch(legalForm, ['stichting']) || exactMatch(title, ['stichting'])) {
            console.log('[PDF] Found match for stichting');
            return mobilityData.stichting;
          }
          
          if (exactMatch(legalForm, ['ondernemers biz', 'ondernemersbiz']) || 
              exactMatch(title, ['ondernemers biz', 'ondernemersbiz'])) {
            console.log('[PDF] Found match for ondernemersBiz');
            return mobilityData.ondernemersBiz;
          }
          
          if (exactMatch(legalForm, ['vastgoed biz', 'vastgoedbiz']) || 
              exactMatch(title, ['vastgoed biz', 'vastgoedbiz'])) {
            console.log('[PDF] Found match for vastgoedBiz');
            return mobilityData.vastgoedBiz;
          }
          
          if (exactMatch(legalForm, ['gemengde biz', 'gemengdebiz']) || 
              exactMatch(title, ['gemengde biz', 'gemengdebiz'])) {
            console.log('[PDF] Found match for gemengdeBiz');
            return mobilityData.gemengdeBiz;
          }
          
          if (exactMatch(legalForm, ['coöperatie', 'cooperatie', 'coöperatie u.a.', 'cooperatie u.a.', 'coöperatie ua', 'cooperatie ua']) || 
              exactMatch(title, ['coöperatie', 'cooperatie', 'coöperatie u.a.', 'cooperatie u.a.', 'coöperatie ua', 'cooperatie ua'])) {
            console.log('[PDF] Found match for cooperatieUa');
            return mobilityData.cooperatieUa;
          }
          
          if (exactMatch(legalForm, ['bv', 'besloten vennootschap']) || 
              exactMatch(title, ['bv', 'besloten vennootschap'])) {
            console.log('[PDF] Found match for bv');
            return mobilityData.bv;
          }
          
          if (exactMatch(legalForm, ['ondernemersfonds']) || exactMatch(title, ['ondernemersfonds'])) {
            console.log('[PDF] Found match for ondernemersfonds');
            return mobilityData.ondernemersfonds;
          }
          
          // Fallback to more relaxed pattern matching for title
          const contains = (str: string, pattern: string): boolean => 
            str.toLowerCase().includes(pattern.toLowerCase());
          
          if (legalForm) {
            if (contains(legalForm, 'vereniging')) return mobilityData.vereniging;
            if (contains(legalForm, 'stichting')) return mobilityData.stichting;
            if (contains(legalForm, 'ondernemers') && contains(legalForm, 'biz')) return mobilityData.ondernemersBiz;
            if (contains(legalForm, 'vastgoed') && contains(legalForm, 'biz')) return mobilityData.vastgoedBiz;
            if (contains(legalForm, 'gemengde') && contains(legalForm, 'biz')) return mobilityData.gemengdeBiz;
            if (contains(legalForm, 'coöperatie') || contains(legalForm, 'cooperatie')) return mobilityData.cooperatieUa;
            if (contains(legalForm, 'bv') || contains(legalForm, 'besloten vennootschap')) return mobilityData.bv;
            if (contains(legalForm, 'ondernemersfonds')) return mobilityData.ondernemersfonds;
          }
          
          if (title) {
            if (contains(title, 'vereniging')) return mobilityData.vereniging;
            if (contains(title, 'stichting')) return mobilityData.stichting;
            if (contains(title, 'ondernemers') && contains(title, 'biz')) return mobilityData.ondernemersBiz;
            if (contains(title, 'vastgoed') && contains(title, 'biz')) return mobilityData.vastgoedBiz;
            if (contains(title, 'gemengde') && contains(title, 'biz')) return mobilityData.gemengdeBiz;
            if (contains(title, 'coöperatie') || contains(title, 'cooperatie')) return mobilityData.cooperatieUa;
            if (contains(title, 'bv') || contains(title, 'besloten vennootschap')) return mobilityData.bv;
            if (contains(title, 'ondernemersfonds')) return mobilityData.ondernemersfonds;
          }
          
          // If we get here, use geenRechtsvorm as default/fallback
          console.log('[PDF] No match found, using geenRechtsvorm as default');
          return mobilityData.geenRechtsvorm || '';
        };
        
        // Aanbevolen governance modellen sectie
        if (mobilityData?.governanceModels && mobilityData.governanceModels.length > 0) {
          // Check for page break before adding a new section
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          // Add section title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text('Aanbevolen governance modellen', 20, yPos);
          yPos += 8;
          
          // Add description text
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          const description = "Deze modellen worden aanbevolen voor de door u geselecteerde mobiliteitsoplossingen.";
          const descriptionLines = pdf.splitTextToSize(description, 170);
          pdf.text(descriptionLines, 20, yPos);
          yPos += descriptionLines.length * 5 + 5;
          
          // Add each governance model
          for (const model of mobilityData.governanceModels) {
            if (typeof model === 'string') continue;
            
            // Check for page break before adding a new model
            if (yPos > 250) {
              pdf.addPage();
              yPos = 20;
            }
            
            // Get the rechtsvorm text for this model
            const rechtsvormText = getRechtsvormText(model);
            
            // Model title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text(model.title, 20, yPos);
            yPos += 6;
            
            // Model rechtsvorm text
            if (rechtsvormText) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              const lines = pdf.splitTextToSize(rechtsvormText, 170);
              
              // Check if we need a page break for long text
              if (yPos + (lines.length * 5) > 260) {
                pdf.addPage();
                yPos = 20;
              }
              
              pdf.text(lines, 20, yPos);
              yPos += lines.length * 5 + 5;
            }
            
            yPos += 5;
          }
          
          yPos += 5;
        }
        
        // Aanbevolen governance modellen mits sectie
        if (mobilityData?.governanceModelsMits && mobilityData.governanceModelsMits.length > 0) {
          // Check for page break before adding a new section
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          // Add section title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text('Aanbevolen, mits...', 20, yPos);
          yPos += 8;
          
          // Add description text
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          const description = "Deze modellen zijn geschikt voor uw mobiliteitsoplossingen, maar vereisen extra aandacht of aanpassingen.";
          const descriptionLines = pdf.splitTextToSize(description, 170);
          pdf.text(descriptionLines, 20, yPos);
          yPos += descriptionLines.length * 5 + 5;
          
          // Add each governance model (mits section)
          for (const model of mobilityData.governanceModelsMits) {
            if (typeof model === 'string') continue;
            
            // Check for page break before adding a new model
            if (yPos > 250) {
              pdf.addPage();
              yPos = 20;
            }
            
            // Get the rechtsvorm text for this model
            const rechtsvormText = getRechtsvormText(model);
            
            // Model title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text(model.title, 20, yPos);
            yPos += 6;
            
            // Model rechtsvorm text
            if (rechtsvormText) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              const lines = pdf.splitTextToSize(rechtsvormText, 170);
              
              // Check if we need a page break for long text
              if (yPos + (lines.length * 5) > 260) {
                pdf.addPage();
                yPos = 20;
              }
              
              pdf.text(lines, 20, yPos);
              yPos += lines.length * 5 + 5;
            }
            
            yPos += 5;
          }
          
          yPos += 5;
        }
        
        // Ongeschikte governance modellen sectie
        if (mobilityData?.governanceModelsNietgeschikt && mobilityData.governanceModelsNietgeschikt.length > 0) {
          // Check for page break before adding a new section
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          // Add section title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text('Ongeschikte governance modellen', 20, yPos);
          yPos += 8;
          
          // Add description text
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          const description = "Deze modellen zijn minder geschikt voor de door u geselecteerde mobiliteitsoplossingen.";
          const descriptionLines = pdf.splitTextToSize(description, 170);
          pdf.text(descriptionLines, 20, yPos);
          yPos += descriptionLines.length * 5 + 5;
          
          // Add each governance model (niet geschikt section)
          for (const model of mobilityData.governanceModelsNietgeschikt) {
            if (typeof model === 'string') continue;
            
            // Check for page break before adding a new model
            if (yPos > 250) {
              pdf.addPage();
              yPos = 20;
            }
            
            // Get the rechtsvorm text for this model
            const rechtsvormText = getRechtsvormText(model);
            
            // Model title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text(model.title, 20, yPos);
            yPos += 6;
            
            // Model rechtsvorm text
            if (rechtsvormText) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              const lines = pdf.splitTextToSize(rechtsvormText, 170);
              
              // Check if we need a page break for long text
              if (yPos + (lines.length * 5) > 260) {
                pdf.addPage();
                yPos = 20;
              }
              
              pdf.text(lines, 20, yPos);
              yPos += lines.length * 5 + 5;
            }
            
            yPos += 5;
          }
        }
      } else if (contentType === 'governanceModel' && governanceData) {
        // Process description
        if (governanceData.description) {
          yPos = addSection(pdf, 'Beschrijving', governanceData.description, yPos);
          yPos += 8; // Verminderde witruimte (was 10)
        }
        
        // Process other sections
        if (governanceData.aansprakelijkheid) {
          yPos = addSection(pdf, 'Aansprakelijkheid', governanceData.aansprakelijkheid, yPos);
          yPos += 8; // Verminderde witruimte (was 10)
        }
        
        // Voordelen
        if (governanceData.advantages) {
          if (Array.isArray(governanceData.advantages) && governanceData.advantages.length > 0) {
            // Fix voor onjuiste bullets: gebruik geen extra bullet in de lijst-items
            const voordelenList = governanceData.advantages.map(item => item).join('\n\n');
            yPos = addSection(pdf, 'Voordelen', voordelenList, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          } else if (typeof governanceData.advantages === 'string') {
            yPos = addSection(pdf, 'Voordelen', governanceData.advantages, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          }
        }
        
        // Nadelen
        if (governanceData.disadvantages) {
          if (Array.isArray(governanceData.disadvantages) && governanceData.disadvantages.length > 0) {
            // Fix voor onjuiste bullets: gebruik geen extra bullet in de lijst-items
            const nadelenList = governanceData.disadvantages.map(item => item).join('\n\n');
            yPos = addSection(pdf, 'Nadelen', nadelenList, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          } else if (typeof governanceData.disadvantages === 'string') {
            yPos = addSection(pdf, 'Nadelen', governanceData.disadvantages, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          }
        }
        
        // Benodigdheden
        if (governanceData.benodigdhedenOprichting) {
          if (Array.isArray(governanceData.benodigdhedenOprichting) && governanceData.benodigdhedenOprichting.length > 0) {
            // Fix voor onjuiste bullets: gebruik geen extra bullet in de lijst-items
            const benodigdhedenList = governanceData.benodigdhedenOprichting.map(item => item).join('\n\n');
            yPos = addSection(pdf, 'Benodigdheden Oprichting', benodigdhedenList, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          } else {
            yPos = addSection(pdf, 'Benodigdheden Oprichting', String(governanceData.benodigdhedenOprichting), yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          }
        }
        
        // Links
        if (governanceData.links) {
          if (Array.isArray(governanceData.links) && governanceData.links.length > 0) {
            // Fix voor onjuiste bullets: gebruik geen extra bullet in de lijst-items
            const linksList = governanceData.links.map(item => item).join('\n\n');
            yPos = addSection(pdf, 'Links', linksList, yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          } else {
            yPos = addSection(pdf, 'Links', String(governanceData.links), yPos);
            yPos += 8; // Verminderde witruimte (was 10)
          }
        }
        
        // Doorlooptijd
        if (governanceData.doorlooptijdLang) {
          yPos = addSection(pdf, 'Doorlooptijd', governanceData.doorlooptijdLang, yPos);
          yPos += 8; // Verminderde witruimte (was 10)
        } else if (governanceData.doorlooptijd) {
          yPos = addSection(pdf, 'Doorlooptijd', governanceData.doorlooptijd, yPos);
          yPos += 8; // Verminderde witruimte (was 10)
        }
        
        // Implementatie
        if (governanceData.implementatie) {
          yPos = addSection(pdf, 'Implementatie', governanceData.implementatie, yPos);
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
      className={className || 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-current">Factsheet genereren...</span>
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-current">Download {itemTitle} factsheet</span>
        </>
      )}
    </button>
  );
} 