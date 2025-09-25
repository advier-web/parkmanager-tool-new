'use client';

import React from 'react';

export function parseLeadingStars(raw?: string): { stars: number; text: string } {
  const source = typeof raw === 'string' ? raw : '';
  const m = source.match(/^\s*(\*{1,5})\s*([\s\S]*)$/);
  if (!m) {
    return { stars: 0, text: source || '' };
  }
  return { stars: m[1].length, text: m[2] || '' };
}

export function Stars({ count }: { count: number }) {
  if (!count || count <= 0) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.95 13.93a1 1 0 00-1.175 0L6.615 16.281c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function StarsWithText({ raw }: { raw?: string }) {
  const { stars, text } = parseLeadingStars(raw);
  if (!stars && !text) return <span className="text-gray-500">-</span>;
  return (
    <div className="space-y-1">
      {stars > 0 && <Stars count={stars} />}
      {text && <div className="prose prose-sm max-w-none overflow-hidden">{text}</div>}
    </div>
  );
}


