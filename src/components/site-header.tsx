import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-6 py-6 flex justify-between items-center">
        <div>
          <Link href="/" className="text-xl font-bold text-blue-600">
            ParkManager Tool
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/wizard" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition-colors text-base"
              >
                Start de wizard
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 