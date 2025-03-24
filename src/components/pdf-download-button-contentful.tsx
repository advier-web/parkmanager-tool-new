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
      
      // Helper functie voor tekst met regeleinden
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
        // Check voor bold stukken
        const hasBold = text.includes('**') || text.includes('__');
        
        if (!hasBold) {
          // Normale tekst zonder formatting
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return y + (lines.length * lineHeight);
        } else {
          // Tekst met bold formatting
          const segments = [];
          let currentText = '';
          let isBold = false;
          
          // Regex om bold secties te vinden (zowel ** als __)
          const boldPattern = /(\*\*|__)(.*?)(\*\*|__)/g;
          let lastIndex = 0;
          let match;
          
          while ((match = boldPattern.exec(text)) !== null) {
            // Voeg normale tekst toe die voor de match staat
            const normalText = text.substring(lastIndex, match.index);
            if (normalText.length > 0) {
              segments.push({ text: normalText, bold: false });
            }
            
            // Voeg de bold tekst toe
            segments.push({ text: match[2], bold: true });
            
            lastIndex = match.index + match[0].length;
          }
          
          // Voeg eventuele resterende normale tekst toe
          if (lastIndex < text.length) {
            segments.push({ text: text.substring(lastIndex), bold: false });
          }
          
          // Als er geen bold segmenten gevonden zijn, gebruik de hele tekst
          if (segments.length === 0) {
            segments.push({ text, bold: false });
          }
          
          // Render de segmenten met juiste opmaak
          let currentY = y;
          for (const segment of segments) {
            pdf.setFont('helvetica', segment.bold ? 'bold' : 'normal');
            const lines = pdf.splitTextToSize(segment.text, maxWidth);
            pdf.text(lines, x, currentY);
            currentY += lines.length * lineHeight;
          }
          
          return currentY;
        }
      };
      
      // Helper functie voor het tekenen van tekst met speciale karakters
      const renderTextWithSpecialChars = (text: string, x: number, y: number, pdf: jsPDF): number => {
        // Check of er speciale tekens in de tekst zitten (uitgebreid met meer speciale tekens)
        const hasSpecialChars = /[₂²≈₁₃₄]/g.test(text);
        
        if (!hasSpecialChars) {
          // Normale rendering als er geen speciale tekens zijn
          pdf.text(text, x, y);
          return x + pdf.getTextWidth(text);
        } else {
          // Karakter voor karakter renderen bij speciale tekens
          let currentX = x;
          for (let char of text) {
            pdf.text(char, currentX, y);
            currentX += pdf.getTextWidth(char);
          }
          return currentX;
        }
      };
      
      // Helper voor speciale tekst rendering character by character
      const renderTextCharByChar = (text: string, x: number, y: number, pdf: jsPDF): number => {
        let currentX = x;
        for (let char of text) {
          pdf.text(char, currentX, y);
          currentX += pdf.getTextWidth(char);
        }
        return currentX;
      };
      
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
              
              // Check op speciale tekens in headers
              const hasSpecialChars = /[₂²≈]/g.test(segment.content);
              if (hasSpecialChars) {
                // Render karakter voor karakter bij speciale tekens
                let xPos = 20;
                for (let char of segment.content) {
                  pdf.text(char, xPos, yPos);
                  xPos += pdf.getTextWidth(char);
                }
              } else {
                pdf.text(segment.content, 20, yPos);
              }
              yPos += 8;
            } else if (segment.level === 2) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(14);
              
              // Check op speciale tekens in headers
              const hasSpecialChars = /[₂²≈]/g.test(segment.content);
              if (hasSpecialChars) {
                // Render karakter voor karakter bij speciale tekens
                let xPos = 20;
                for (let char of segment.content) {
                  pdf.text(char, xPos, yPos);
                  xPos += pdf.getTextWidth(char);
                }
              } else {
                pdf.text(segment.content, 20, yPos);
              }
              yPos += 7;
            } else if (segment.level === 3) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(12);
              
              // Check op speciale tekens in headers
              const hasSpecialChars = /[₂²≈]/g.test(segment.content);
              if (hasSpecialChars) {
                // Render karakter voor karakter bij speciale tekens
                let xPos = 20;
                for (let char of segment.content) {
                  pdf.text(char, xPos, yPos);
                  xPos += pdf.getTextWidth(char);
                }
              } else {
                pdf.text(segment.content, 20, yPos);
              }
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
              
              // Bereken beschikbare ruimte (iets minder breed door indent)
              const bulletText = item.trim();
              const hasBold = bulletText.includes('**') || bulletText.includes('__');
              const hasSpecialChars = /[₂²≈₁₃₄]/g.test(bulletText);
              
              if (hasBold || hasSpecialChars) {
                // Check extra op specifieke patronen die problemen veroorzaken
                const containsCO2 = /vermindering\s+van\s+co₂/i.test(bulletText.toLowerCase());
                const containsSpacedText = /^V\s*e\s*r\s*m\s*i\s*n\s*d\s*e\s*r\s*i\s*n\s*g/i.test(bulletText);
                
                if (containsCO2 || containsSpacedText) {
                  // Voor bullets die "Vermindering van CO₂" of gespatieerde tekst bevatten, render volledig karakter voor karakter
                  pdf.setFont('helvetica', 'normal'); // Start met normale tekst
                  
                  // Eerst controleren of de tekst op één regel past
                  const fullText = formatBoldText(bulletText); // Verwijder bolding-markers voor breedte-berekening
                  const maxWidth = 160; // Max breedte voor bullet tekst
                  const wrappedLines = pdf.splitTextToSize(fullText, maxWidth);
                  
                  if (wrappedLines.length === 1) {
                    // Alles past op één regel - render karakter voor karakter
                    let xPos = 25;
                    let i = 0;
                    let isBold = false;
                    
                    while (i < bulletText.length) {
                      // Check voor bold markers
                      if (bulletText.substr(i, 2) === '**' || bulletText.substr(i, 2) === '__') {
                        // Toggle bold state
                        isBold = !isBold;
                        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                        i += 2; // Skip de markers
                      } else {
                        // Render karakter voor karakter
                        pdf.text(bulletText[i], xPos, yPos);
                        xPos += pdf.getTextWidth(bulletText[i]);
                        i++;
                      }
                    }
                    
                    yPos += 4; // Standaard ruimte na één regel
                  } else {
                    // Tekst moet over meerdere regels verdeeld worden
                    let currentY = yPos;
                    let lineX = 25;
                    let lineWidth = 0;
                    let i = 0;
                    let isBold = false;
                    
                    while (i < bulletText.length) {
                      // Check voor bold markers
                      if (bulletText.substr(i, 2) === '**' || bulletText.substr(i, 2) === '__') {
                        // Toggle bold state
                        isBold = !isBold;
                        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                        i += 2; // Skip de markers
                        continue;
                      }
                      
                      // Bereken of het karakter nog op deze regel past
                      const char = bulletText[i];
                      const charWidth = pdf.getTextWidth(char);
                      
                      if (lineWidth + charWidth > maxWidth) {
                        // Begin een nieuwe regel
                        currentY += 6;
                        lineX = 25;
                        lineWidth = 0;
                        
                        // Check of we een nieuwe pagina nodig hebben
                        if (currentY > 270) {
                          pdf.addPage();
                          currentY = 20;
                        }
                      }
                      
                      // Render het karakter
                      pdf.text(char, lineX, currentY);
                      lineX += charWidth;
                      lineWidth += charWidth;
                      i++;
                    }
                    
                    // Update yPos voor de volgende bullet
                    yPos = currentY + 6; // Ruimte na meerdere regels
                  }
                } else {
                  // Verbeterde methode voor bullets met bold tekst of speciale tekens
                  // Parse de bold secties
                  const segments = [];
                  let currentText = '';
                  let isBold = false;
                  
                  for (let i = 0; i < bulletText.length; i++) {
                    if (bulletText.substr(i, 2) === '**' || bulletText.substr(i, 2) === '__') {
                      if (currentText) {
                        segments.push({ text: currentText, bold: isBold });
                        currentText = '';
                      }
                      isBold = !isBold;
                      i++; // Skip het tweede karakter van **
                    } else {
                      currentText += bulletText[i];
                    }
                  }
                  
                  if (currentText) {
                    segments.push({ text: currentText, bold: isBold });
                  }
                  
                  // Verbeterde tekstweergave met respect voor regeleinden en speciale tekens
                  // Controleer eerst of het geheel op één regel past
                  const fullText = segments.map(s => s.text).join('');
                  const wrappedLines = pdf.splitTextToSize(fullText, 160); // Iets smallere breedte voor indentatie
                  
                  if (wrappedLines.length === 1) {
                    // Alles past op één regel - render met juiste formatting
                    let startX = 25; // Indent voor bulletpoints
                    for (const segment of segments) {
                      pdf.setFont('helvetica', segment.bold ? 'bold' : 'normal');
                      
                      // Altijd controleren op speciale tekens
                      const containsSpecialChars = /[₂²≈₁₃₄]/g.test(segment.text);
                      if (containsSpecialChars) {
                        // Speciale behandeling voor tekst met speciale tekens
                        // Render karakter voor karakter
                        let xOffset = startX;
                        for (let char of segment.text) {
                          pdf.text(char, xOffset, yPos);
                          xOffset += pdf.getTextWidth(char);
                        }
                        startX = xOffset;
                      } else {
                        pdf.text(segment.text, startX, yPos);
                        startX += pdf.getTextWidth(segment.text);
                      }
                    }
                    yPos += 4; // Verminderde ruimte voor één-regel bullets
                  } else {
                    // Tekst moet over meerdere regels verdeeld worden
                    let lineY = yPos;
                    let lineStartX = 25;
                    let lineRemainingWidth = 160; // Maximum breedte voor de regel
                    
                    // Maak een kopie van de segments om mee te werken
                    const workingSegments = [...segments];
                    let currentSegmentIndex = 0;
                    
                    while (currentSegmentIndex < workingSegments.length) {
                      // Haal het huidige segment op
                      const currentSegment = workingSegments[currentSegmentIndex];
                      pdf.setFont('helvetica', currentSegment.bold ? 'bold' : 'normal');
                      
                      // Hoeveel tekst past er nog op deze regel?
                      const segmentText = currentSegment.text;
                      const textWidth = pdf.getTextWidth(segmentText);
                      
                      if (textWidth <= lineRemainingWidth) {
                        // Hele segment past op huidige regel
                        pdf.text(segmentText, lineStartX, lineY);
                        lineStartX += textWidth;
                        lineRemainingWidth -= textWidth;
                        currentSegmentIndex++; // Ga naar volgende segment
                      } else {
                        // Segment past niet volledig op huidige regel
                        // Bereken hoeveel tekst wel past
                        let textIndex = 0;
                        let partialText = '';
                        let partialWidth = 0;
                        
                        // Zoek de maximale tekst die past
                        while (textIndex < segmentText.length) {
                          const nextChar = segmentText[textIndex];
                          const charWidth = pdf.getTextWidth(nextChar);
                          
                          if (partialWidth + charWidth <= lineRemainingWidth) {
                            partialText += nextChar;
                            partialWidth += charWidth;
                            textIndex++;
                          } else {
                            break;
                          }
                        }
                        
                        // Als er niets past, ga naar de volgende regel
                        if (partialText === '') {
                          lineY += 6;
                          lineStartX = 25;
                          lineRemainingWidth = 160;
                          
                          // Check of we een nieuwe pagina nodig hebben
                          if (lineY > 270) {
                            pdf.addPage();
                            lineY = 20;
                          }
                          continue;
                        }
                        
                        // Teken het deel dat past
                        pdf.text(partialText, lineStartX, lineY);
                        
                        // Update het segment met de resterende tekst
                        workingSegments[currentSegmentIndex] = {
                          ...currentSegment,
                          text: segmentText.substring(textIndex)
                        };
                        
                        // Ga naar de volgende regel
                        lineY += 6;
                        lineStartX = 25;
                        lineRemainingWidth = 160;
                        
                        // Check of we een nieuwe pagina nodig hebben
                        if (lineY > 270) {
                          pdf.addPage();
                          lineY = 20;
                        }
                      }
                    }
                    
                    yPos = lineY + 6; // Verhoog de ruimte na de bullet significant (was lineY + 3)
                  }
                }
              } else {
                // Eenvoudige bullet zonder bold of speciale tekens
                const lines = pdf.splitTextToSize(bulletText, 160);
                
                // Check of tekst speciale tekens bevat, zelfs als er geen bold in zit
                const hasSpecialChars = /[₂²≈₁₃₄]/g.test(bulletText);
                
                if (hasSpecialChars) {
                  // Verwerk regels met speciale tekens
                  let currentY = yPos;
                  for (const line of lines) {
                    let lineX = 25;
                    const parts = line.split(/([₂²≈₁₃₄])/g).filter(Boolean);
                    for (const part of parts) {
                      lineX = renderTextWithSpecialChars(part, lineX, currentY, pdf);
                    }
                    currentY += 5; // Line height consistent houden
                  }
                  
                  if (lines.length === 1) {
                    yPos += 4; // Verminderde ruimte voor één-regel bullets
                  } else {
                    yPos += 5 * (lines.length - 1) + 6; // Behoud meer ruimte voor meerdere regels
                  }
                } else {
                  // Normale rendering zonder speciale tekens
                  pdf.text(lines, 25, yPos);
                  if (lines.length === 1) {
                    yPos += 4; // Verminderde ruimte voor één-regel bullets
                  } else {
                    yPos += lines.length * 5 + 6; // Behoud meer ruimte voor meerdere regels
                  }
                }
              }
            }
            
            // Extra ruimte onder bulletlijsten
            yPos += 8; // Significant meer ruimte tussen bullet lists (was 4)
            continue;
          }
          
          if (segment.type === 'paragraph') {
            // Paginawissel indien nodig
            if (yPos > 270) {
              pdf.addPage();
              yPos = 20;
            }
            
            // Check voor bold tekst
            const hasBold = segment.content.includes('**') || segment.content.includes('__');
            
            if (hasBold) {
              // Bold tekst gevonden, verwerk deze
              const segments = [];
              let startIdx = 0;
              let currentText = '';
              let isBold = false;
              
              // Split en format de bold tekst
              const text = segment.content;
              for (let i = 0; i < text.length; i++) {
                if (text.substr(i, 2) === '**' || text.substr(i, 2) === '__') {
                  if (currentText) {
                    segments.push({ text: currentText, bold: isBold });
                    currentText = '';
                  }
                  isBold = !isBold;
                  i++; // Skip het tweede karakter van **
                } else {
                  currentText += text[i];
                }
              }
              
              if (currentText) {
                segments.push({ text: currentText, bold: isBold });
              }
              
              // Render de segmenten met juiste font en speciale tekens ondersteuning
              let currentY = yPos;
              let lineWidth = 0;
              let currentLine = '';
              const maxWidth = 170; // Maximum breedte
              
              for (const segment of segments) {
                pdf.setFont('helvetica', segment.bold ? 'bold' : 'normal');
                
                // Split indien nodig over meerdere regels
                const words = segment.text.split(' ');
                for (let i = 0; i < words.length; i++) {
                  const word = words[i];
                  // Extra spatie toevoegen na elk woord behalve het laatste in een segment
                  const wordWithSpace = i < words.length - 1 ? word + ' ' : word;
                  const wordWidth = pdf.getTextWidth(wordWithSpace);
                  
                  if (lineWidth + wordWidth > maxWidth) {
                    // Begin nieuwe regel - render met speciale tekens ondersteuning
                    let lineX = 20;
                    const parts = currentLine.split(/([₂²≈₁₃₄])/g).filter(Boolean);
                    for (const part of parts) {
                      lineX = renderTextWithSpecialChars(part, lineX, currentY, pdf);
                    }
                    
                    currentY += 6;
                    currentLine = wordWithSpace;
                    lineWidth = wordWidth;
                    
                    // Nieuwe pagina indien nodig
                    if (currentY > 270) {
                      pdf.addPage();
                      currentY = 20;
                    }
                  } else {
                    // Voeg toe aan huidige regel
                    currentLine += wordWithSpace;
                    lineWidth += wordWidth;
                  }
                }
              }
              
              // Render laatste regel indien nodig
              if (currentLine) {
                let lineX = 20;
                const parts = currentLine.split(/([₂²≈₁₃₄])/g).filter(Boolean);
                for (const part of parts) {
                  lineX = renderTextWithSpecialChars(part, lineX, currentY, pdf);
                }
                currentY += 6;
              }
              
              yPos = currentY + 4; // Extra ruimte na paragrafen
            } else {
              // Normale paragraaf zonder bold
              const processedText = formatBoldText(segment.content);
              
              // Check of er speciale tekens in de tekst zitten
              const hasSpecialChars = /[₂²≈₁₃₄]/g.test(processedText);
              
              if (hasSpecialChars) {
                // Split de tekst op regels
                const textLines = pdf.splitTextToSize(processedText, 170);
                
                // Render elke regel met speciale tekens ondersteuning
                let currentY = yPos;
                for (const line of textLines) {
                  let lineX = 20;
                  const parts = line.split(/([₂²≈₁₃₄])/g).filter(Boolean);
                  for (const part of parts) {
                    lineX = renderTextWithSpecialChars(part, lineX, currentY, pdf);
                  }
                  currentY += 6; // Consistente regelafstand van 6 punten
                }
                
                yPos = currentY + 4; // Voeg consistente ruimte van 4 punten toe na elke paragraaf
              } else {
                // Normale rendering zonder speciale tekens
                const lines = pdf.splitTextToSize(processedText, 170);
                pdf.text(lines, 20, yPos);
                yPos += lines.length * 6; // Verwijder de extra 4 punten ruimte voor consistentie
              }
            }
            
            // Extra ruimte na paragrafen 
            yPos += 4; // Voeg uniforme ruimte toe na alle paragrafen in governance sectie
          }
          
          // Paginawissel indien nodig
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        }
      };
      
      // Add title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      let yPos = 20;
      const titleLines = pdf.splitTextToSize(data.title, 170);
      pdf.text(titleLines, 20, yPos);
      yPos += (titleLines.length * 10) + 5;
      
      // Add horizontal line
      pdf.setDrawColor(150, 150, 150);
      pdf.line(20, yPos, 190, yPos);
      yPos += 10;
      
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
            
            // Add description with full markdown parsing
            if (model.description) {
              const segments = parseMarkdown(model.description);
              
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(11);
              
              for (const segment of segments) {
                if (segment.type === 'empty-line') {
                  yPos += 4;
                  continue;
                }
                
                if (segment.type === 'bullet-list') {
                  // Extra ruimte boven bulletlijsten
                  yPos += 5;
                  
                  const bulletItems = segment.content.split('\n');
                  for (const item of bulletItems) {
                    // Paginawissel indien nodig
                    if (yPos > 270) {
                      pdf.addPage();
                      yPos = 20;
                    }
                    
                    // Teken het bullet point
                    pdf.text('•', 20, yPos);
                    
                    // Check voor bold tekst
                    const hasBold = item.includes('**') || item.includes('__');
                    const hasSpecialChars = /[₂²≈₁₃₄]/g.test(item);
                    
                    if (hasBold || hasSpecialChars) {
                      // Check extra op specifieke patronen die problemen veroorzaken
                      const containsCO2 = /vermindering\s+van\s+co₂/i.test(item.toLowerCase());
                      const containsSpacedText = /^V\s*e\s*r\s*m\s*i\s*n\s*d\s*e\s*r\s*i\s*n\s*g/i.test(item);
                      
                      if (containsCO2 || containsSpacedText) {
                        // Voor bullets die "Vermindering van CO₂" of gespatieerde tekst bevatten, render volledig karakter voor karakter
                        pdf.setFont('helvetica', 'normal'); // Start met normale tekst
                        
                        // Eerst controleren of de tekst op één regel past
                        const fullText = formatBoldText(item); // Verwijder bolding-markers voor breedte-berekening
                        const maxWidth = 160; // Max breedte voor bullet tekst
                        const wrappedLines = pdf.splitTextToSize(fullText, maxWidth);
                        
                        if (wrappedLines.length === 1) {
                          // Alles past op één regel - render karakter voor karakter
                          let xPos = 25;
                          let i = 0;
                          let isBold = false;
                          
                          while (i < item.length) {
                            // Check voor bold markers
                            if (item.substr(i, 2) === '**' || item.substr(i, 2) === '__') {
                              // Toggle bold state
                              isBold = !isBold;
                              pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                              i += 2; // Skip de markers
                            } else {
                              // Render karakter voor karakter
                              pdf.text(item[i], xPos, yPos);
                              xPos += pdf.getTextWidth(item[i]);
                              i++;
                            }
                          }
                          
                          yPos += 4; // Standaard ruimte na één regel
                        } else {
                          // Tekst moet over meerdere regels verdeeld worden
                          let currentY = yPos;
                          let lineX = 25;
                          let lineWidth = 0;
                          let i = 0;
                          let isBold = false;
                          
                          while (i < item.length) {
                            // Check voor bold markers
                            if (item.substr(i, 2) === '**' || item.substr(i, 2) === '__') {
                              // Toggle bold state
                              isBold = !isBold;
                              pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                              i += 2; // Skip de markers
                              continue;
                            }
                            
                            // Bereken of het karakter nog op deze regel past
                            const char = item[i];
                            const charWidth = pdf.getTextWidth(char);
                            
                            if (lineWidth + charWidth > maxWidth) {
                              // Begin een nieuwe regel
                              currentY += 6;
                              lineX = 25;
                              lineWidth = 0;
                              
                              // Check of we een nieuwe pagina nodig hebben
                              if (currentY > 270) {
                                pdf.addPage();
                                currentY = 20;
                              }
                            }
                            
                            // Render het karakter
                            pdf.text(char, lineX, currentY);
                            lineX += charWidth;
                            lineWidth += charWidth;
                            i++;
                          }
                          
                          // Update yPos voor de volgende bullet
                          yPos = currentY + 6; // Ruimte na meerdere regels
                        }
                      } else {
                        // Normale verwerking voor andere bullets
                        // Process bold formatting
                        let startX = 25;
                        const segments = [];
                        let currentText = '';
                        let isBold = false;
                        
                        // Split en format de bold tekst
                        for (let i = 0; i < item.length; i++) {
                          if (item.substr(i, 2) === '**' || item.substr(i, 2) === '__') {
                            if (currentText) {
                              segments.push({ text: currentText, bold: isBold });
                              currentText = '';
                            }
                            isBold = !isBold;
                            i++; // Skip het tweede karakter van **
                          } else {
                            currentText += item[i];
                          }
                        }
                        
                        if (currentText) {
                          segments.push({ text: currentText, bold: isBold });
                        }
                        
                        // Render de segments met juiste font
                        for (const segment of segments) {
                          pdf.setFont('helvetica', segment.bold ? 'bold' : 'normal');
                          
                          // Altijd controleren op speciale tekens
                          const containsSpecialChars = /[₂²≈₁₃₄]/g.test(segment.text);
                          if (containsSpecialChars) {
                            // Speciale behandeling voor tekst met speciale tekens
                            // Render karakter voor karakter
                            let xOffset = startX;
                            for (let char of segment.text) {
                              pdf.text(char, xOffset, yPos);
                              xOffset += pdf.getTextWidth(char);
                            }
                            startX = xOffset;
                          } else {
                            const segmentLines = pdf.splitTextToSize(segment.text, 163);
                            pdf.text(segmentLines, startX, yPos);
                            startX += pdf.getTextWidth(segment.text);
                          }
                        }
                        
                        yPos += 12; // Behoud ruimte tussen bullets in governance sectie
                      }
                    } else {
                      // Normale tekst zonder bold
                      const bulletText = formatBoldText(item.trim());
                      const lines = pdf.splitTextToSize(bulletText, 163);
                      
                      // Check of bullet speciale tekens bevat
                      const hasSpecialChars = /[₂²≈₁₃₄]/g.test(bulletText);
                      
                      if (hasSpecialChars) {
                        // Verwerk regels met speciale tekens
                        let currentY = yPos;
                        for (const line of lines) {
                          let lineX = 25;
                          const parts = line.split(/([₂²≈₁₃₄])/g).filter(Boolean);
                          for (const part of parts) {
                            lineX = renderTextWithSpecialChars(part, lineX, currentY, pdf);
                          }
                          currentY += 5; // Line height consistent houden
                        }
                        
                        if (lines.length === 1) {
                          yPos += 4; // Verminderde ruimte voor één-regel bullets
                        } else {
                          yPos += 5 * (lines.length - 1) + 7; // Behoud meer ruimte voor meerdere regels
                        }
                      } else {
                        // Normale rendering zonder speciale tekens
                        pdf.text(lines, 25, yPos);
                        if (lines.length === 1) {
                          yPos += 4; // Verminderde ruimte voor één-regel bullets
                        } else {
                          yPos += lines.length * 5 + 7; // Behoud meer ruimte voor meerdere regels
                        }
                      }
                    }
                  }
                  
                  // Extra ruimte na bulletlijsten
                  yPos += 8; // Meer ruimte (was niet expliciet aangegeven)
                  continue;
                }
                
                if (segment.type === 'paragraph') {
                  // Paginawissel indien nodig
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = 20;
                  }
                  
                  // Check voor bold tekst
                  const hasBold = segment.content.includes('**') || segment.content.includes('__');
                  
                  if (hasBold) {
                    // Bold tekst verwerken
                    const segments = [];
                    let currentText = '';
                    let isBold = false;
                    
                    for (let i = 0; i < segment.content.length; i++) {
                      if (segment.content.substr(i, 2) === '**' || segment.content.substr(i, 2) === '__') {
                        if (currentText) {
                          segments.push({ text: currentText, bold: isBold });
                          currentText = '';
                        }
                        isBold = !isBold;
                        i++; // Skip het tweede karakter van **
                      } else {
                        currentText += segment.content[i];
                      }
                    }
                    
                    if (currentText) {
                      segments.push({ text: currentText, bold: isBold });
                    }
                    
                    // Render segments
                    let startX = 20;
                    for (const segment of segments) {
                      pdf.setFont('helvetica', segment.bold ? 'bold' : 'normal');
                      const text = segment.text;
                      const segmentWidth = pdf.getTextWidth(text);
                      
                      // Wrap text if needed
                      if (startX + segmentWidth > 190) {
                        yPos += 6;
                        startX = 20;
                      }
                      
                      const lines = pdf.splitTextToSize(text, 170 - (startX - 20));
                      pdf.text(lines, startX, yPos);
                      
                      // Update position
                      if (lines.length > 1) {
                        yPos += (lines.length - 1) * 6;
                        startX = 20 + pdf.getTextWidth(lines[lines.length - 1]);
                      } else {
                        startX += segmentWidth;
                      }
                    }
                    
                    yPos += 6; // Ga naar de volgende regel
                  } else {
                    // Normale tekst zonder bold
                    const processedText = formatBoldText(segment.content);
                    const lines = pdf.splitTextToSize(processedText, 170);
                    pdf.text(lines, 20, yPos);
                    yPos += lines.length * 6; // Verwijder de extra 4 punten ruimte voor consistentie
                  }
                  
                  // Extra ruimte na paragrafen 
                  yPos += 4; // Voeg uniforme ruimte toe na alle paragrafen in governance sectie
                }
              }
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
      }
      
      // Add governance models toelichting
      if (data.governancemodellenToelichting) {
        addSection('Toelichting Governance Modellen', data.governancemodellenToelichting);
      }
      
      // Genereer bestandsnaam
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