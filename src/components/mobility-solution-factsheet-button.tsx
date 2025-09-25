import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Robust dynamic import with retry and one-time hard reload fallback for stale chunks
  const loadPdfWithRetry = async (retries: number = 1, allowReload: boolean = false) => {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const mod = await import('./mobility-solution-factsheet-pdf');
        return mod.default as any;
      } catch (e: any) {
        lastErr = e;
        const message: string = typeof e?.message === 'string' ? e.message : '';
        const isChunkLoadError = message.includes('ChunkLoadError') || message.includes('Loading chunk') || message.includes('failed');
        if (attempt < retries) {
          // small backoff before retry
          await new Promise(res => setTimeout(res, 150));
          continue;
        }
        // Final attempt failed: optionally do a one-time hard reload
        if (allowReload && typeof window !== 'undefined' && isChunkLoadError) {
          try {
            const key = 'pdfFactsheetChunkReloaded';
            if (!window.sessionStorage.getItem(key)) {
              window.sessionStorage.setItem(key, '1');
              window.location.replace(window.location.href);
              await new Promise(() => {});
            }
          } catch {}
        }
      }
    }
    // As a last resort, rethrow the last error so caller can handle silently
    throw lastErr;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamically import the PDF component on the client to avoid SSR/import crashes
  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        const Mod = await loadPdfWithRetry(1, false);
        if (!cancelled) setPdfComponent(() => Mod);
      } catch (e) {
        // Swallow to prevent dev overlay; will retry on first click
        console.warn('PDF component voor factsheet kon niet vooraf geladen worden. Probeert opnieuw bij klik.');
      }
    })();
    return () => { cancelled = true; };
  }, [isClient]);

  const fileName = useMemo(() => `Factsheet_${(solution?.title || 'oplossing').replace(/[^a-z0-9]/gi, '_')}.pdf`, [solution?.title]);

  const handleGenerate = useCallback(async () => {
      if (!isClient || !solution) return;
      setGenerating(true);
      try {
        let Mod = PdfComponent;
        if (!Mod) {
          Mod = await loadPdfWithRetry(1, true);
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
        // Gebruik warn zonder error object om Next dev overlay te vermijden
        console.warn('Kon PDF niet genereren. Probeer de pagina te herladen als dit blijft gebeuren.');
      } finally {
        setGenerating(false);
      }
  }, [PdfComponent, isClient, solution, fileName]);

  return (
    <Button onClick={solution ? handleGenerate : undefined} variant="default" className={`${className} ${buttonColorClassName}`} disabled={!isClient || generating || !solution}>
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
            {solution ? `Download factsheet ${solution.title}` : 'Factsheet Oplossing (niet beschikbaar)'}
          </>
        )
      )}
    </Button>
  );
};

export default React.memo(MobilitySolutionFactsheetButtonComponent); 