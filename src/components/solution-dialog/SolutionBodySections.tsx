'use client';

import React from 'react';
import { MarkdownWithAccordions } from '@/components/markdown-with-accordions';

export function SectionMarkdown({ title, content }: { title?: string; content?: string }) {
  if (!content) return null;
  return (
    <section>
      {title ? <h1 className="text-3xl font-bold mb-2">{title}</h1> : null}
      <div className="overflow-x-auto"><div className="min-w-full"><MarkdownWithAccordions content={content} /></div></div>
    </section>
  );
}


