'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname() || '';
  const isWizardPage = pathname.startsWith('/wizard');
  
  return (
    <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        <div>
          <Link href="/" className="text-xl font-bold text-black">
            Parkmanager tool
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
                  Terug naar homepage
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