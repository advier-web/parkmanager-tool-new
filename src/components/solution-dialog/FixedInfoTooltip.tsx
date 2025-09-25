'use client';

import React, { useEffect, useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export function InlineFixedTooltip({ text }: { text: string }) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const position = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tooltipWidth = 320;
    const padding = 8;
    const rawLeft = rect.left;
    const maxLeft = Math.max(0, window.innerWidth - tooltipWidth - padding);
    const clampedLeft = Math.min(Math.max(padding, rawLeft), maxLeft);
    const top = rect.bottom + padding;
    setPos({ top, left: clampedLeft });
  };
  const show = () => { position(); setVisible(true); };
  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => position();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [visible]);

  return (
    <span className="ml-1 inline-flex align-middle">
      <button
        ref={btnRef}
        type="button"
        aria-label="Toelichting"
        onMouseEnter={show}
        onFocus={show}
        onMouseLeave={hide}
        onBlur={hide}
        className="mt-0.5 text-blue-600 hover:text-blue-700 focus:outline-none"
      >
        <InformationCircleIcon className="h-6 w-6 shrink-0" />
      </button>
      {visible && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 320, zIndex: 99999 }}
          className="rounded-md bg-black text-white px-3 py-2 text-sm leading-snug shadow-2xl ring-1 ring-black/20"
        >
          {text}
        </div>
      )}
    </span>
  );
}

export function CostInfoTooltip() {
  const costTooltipText =
    'Dit zijn geschatte kosten op basis van een voorbeeldberekening. De volledige berekening vindt u in de factsheet van de implementatievariant in de volgende stap van de tool. De daadwerkelijke kosten verschillen per situatie.';
  return <InlineFixedTooltip text={costTooltipText} />;
}


