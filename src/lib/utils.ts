import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse values like "€1,94 ... [tooltip text]" into main text + tooltip
export function parseValueAndTooltip(raw?: string): { main: string; tip?: string } {
  const source = typeof raw === 'string' ? raw : ''
  if (!source) return { main: '' }
  const bracketMatch = source.match(/\[([\s\S]*?)\]/)
  if (!bracketMatch) {
    return { main: source.trim() }
  }
  const tip = bracketMatch[1]?.trim()
  const main = source.replace(/\[[\s\S]*?\]/g, '').trim()
  return { main, tip }
}
