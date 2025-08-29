'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function SiteHeader() {
  const pathname = usePathname() || '';
  const isWizardPage = pathname.startsWith('/wizard');
  
  return (
    <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-6 grid grid-cols-3 items-center">
        <div className="leading-tight py-3">
          <Link href="/" className="block text-lg sm:text-xl font-bold text-black">
            <span className="block">Parkmanager Tool</span>
            <span className="block text-sm sm:text-base font-medium text-gray-800">Collectieve Vervoersoplossingen</span>
          </Link>
        </div>
        <div className="flex justify-center py-0">
          <Link href="/" aria-label="Ministerie van Infrastructuur en Waterstaat">
            <Image
              src="/Logo IenW.png"
              alt="Ministerie van Infrastructuur en Waterstaat"
              width={240}
              height={70}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>
        </div>
        <nav className="flex justify-end py-3">
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