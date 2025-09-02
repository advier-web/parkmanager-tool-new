import React, { useState, useEffect, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { MobilitySolution, ImplementationVariation } from '@/domain/models';
import { getImplementationVariationsForSolution } from '@/services/contentful-service';

interface MobilitySolutionFactsheetButtonProps {
  solution: MobilitySolution | null;
  className?: string;
  buttonColorClassName?: string;
  children?: React.ReactNode;
}

const MobilitySolutionFactsheetButtonComponent: React.FC<MobilitySolutionFactsheetButtonProps> = ({ 
  solution, 
  className, 
  buttonColorClassName = 'bg-blue-600 hover:bg-blue-700 text-white',
  children
}) => {
  const [isClient, setIsClient] = useState(false);
  const [PdfComponent, setPdfComponent] = useState<React.ComponentType<{ solution: MobilitySolution; variations?: ImplementationVariation[] }> | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamically import the PDF component on the client to avoid SSR/import crashes
  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('./mobility-solution-factsheet-pdf');
        if (!cancelled) setPdfComponent(() => mod.default as any);
      } catch (e) {
        console.error('Kon PDF component niet laden:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [isClient]);

  const fileName = useMemo(() => `Factsheet_${(solution?.title || 'oplossing').replace(/[^a-z0-9]/gi, '_')}.pdf`, [solution?.title]);

  if (!solution) {
    return (
      <Button variant="default" disabled className={`${className} ${buttonColorClassName} opacity-50`}>
        <DocumentTextIcon className="h-4 w-4" />
        Factsheet Oplossing (niet beschikbaar)
      </Button>
    );
  }

  const handleGenerate = useMemo(() => {
    return async () => {
      if (!isClient || !solution) return;
      setGenerating(true);
      try {
        let Mod = PdfComponent;
        if (!Mod) {
          const mod = await import('./mobility-solution-factsheet-pdf');
          Mod = mod.default as any;
          setPdfComponent(() => Mod!);
        }
        // Pre-fetch variations to ensure the comparison table always renders
        let variations: ImplementationVariation[] = [];
        try {
          variations = await getImplementationVariationsForSolution(solution.id);
        } catch {}
        const Cmp = Mod as React.ComponentType<{ solution: MobilitySolution; variations?: ImplementationVariation[] }>;
        const doc = <Cmp solution={solution} variations={variations} />;
        const blob = await pdf(doc as any).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.style.display = 'none';
        document.body.appendChild(a); a.click();
        URL.revokeObjectURL(url); a.remove();
      } catch (e) {
        console.error('Kon PDF niet genereren:', e);
      } finally {
        setGenerating(false);
      }
    };
  }, [PdfComponent, isClient, solution, fileName]);

  return (
    <Button onClick={handleGenerate} variant="default" className={`${className} ${buttonColorClassName}`} disabled={!isClient || generating}>
      {generating ? (
        <>
          <DocumentTextIcon className="h-4 w-4" />
          Even geduld…
        </>
      ) : (
        children ? (
          children
        ) : (
          <>
            <DocumentTextIcon className="h-4 w-4" />
            {`Download factsheet ${solution.title}`}
          </>
        )
      )}
    </Button>
  );
};

export default React.memo(MobilitySolutionFactsheetButtonComponent); 