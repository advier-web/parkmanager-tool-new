import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SimpleAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SimpleAccordion({ title, children, defaultOpen = false }: SimpleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180 transform' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-6">
          {children}
        </div>
      )}
    </div>
  );
} 