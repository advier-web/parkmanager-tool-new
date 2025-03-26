import { useState } from 'react';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export const Accordion = ({ title, children, defaultOpen = false, icon }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-2.5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <span className="text-2xl">
          {isOpen ? <BiChevronUp /> : <BiChevronDown />}
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 mb-6' : 'h-0 opacity-0 overflow-hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
}; 