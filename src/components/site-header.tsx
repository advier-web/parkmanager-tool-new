'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname() || '';
  const isWizardPage = pathname.startsWith('/wizard');
  
  return (
    <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        <div className="leading-tight">
          <Link href="/" className="block text-lg sm:text-xl font-bold text-black">
            <span className="block">Parkmanager Tool</span>
            <span className="block text-sm sm:text-base font-medium text-gray-800">Collectieve Vervoersoplossingen</span>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              {isWizardPage ? (
                <Link 
                  href="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-md transition-colors text-sm"
                >
                  <span className="sm:hidden">Home</span>
                  <span className="hidden sm:inline">Terug naar homepage</span>
                </Link>
              ) : (
                <Link 
                  href="/wizard" 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-md transition-colors text-sm"
                >
                  Start de wizard
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 