'use client';

import Link from 'next/link';
import { MobilitySolution } from '@/domain/models';

interface MobilityServiceButtonProps {
  solution: MobilitySolution;
}

export function MobilityServiceButton({ solution }: MobilityServiceButtonProps) {
  // Genereer een slug van de titel: lowercase en spaties/speciale tekens vervangen door koppeltekens
  const slug = solution.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Log de slug voor debugging
  console.log(`Generated slug for ${solution.title}:`, slug);
  
  return (
    <Link 
      href={`/mobility-services/${slug}`}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 h-full"
    >
      <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
      <p className="text-gray-600 line-clamp-3">
        {solution.description}
      </p>
    </Link>
  );
} 