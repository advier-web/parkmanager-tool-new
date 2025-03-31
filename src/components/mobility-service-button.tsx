'use client';

import Link from 'next/link';
import { MobilitySolution } from '@/domain/models';
import Image from 'next/image';

interface MobilityServiceButtonProps {
  solution: MobilitySolution;
}

// Functie om een kleur te bepalen op basis van de categorie
function getCategoryColor(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'fiets':
      return 'bg-green-600';
    case 'openbaar vervoer':
      return 'bg-blue-600';
    case 'auto':
      return 'bg-red-600';
    default:
      return 'bg-indigo-600';
  }
}

// Functie om een afbeelding te bepalen op basis van de categorie of icon
function getCategoryImage(solution: MobilitySolution): string {
  // We gebruiken standaard afbeeldingen per categorie
  const category = solution.category?.toLowerCase();
  const icon = solution.icon?.toLowerCase();
  
  if (category === 'fiets' || icon === 'bike') {
    return '/images/fiets.jpg';
  } else if (category === 'openbaar vervoer' || icon === 'bus') {
    return '/images/bus.jpg';
  } else if (category === 'auto' || icon === 'car') {
    return '/images/auto.jpg';
  } else if (icon === 'shuttle-van') {
    return '/images/shuttle.jpg';
  }
  
  // Fallback afbeelding
  return '/images/mobility.jpg';
}

export function MobilityServiceButton({ solution }: MobilityServiceButtonProps) {
  // Genereer een slug van de titel: lowercase en spaties/speciale tekens vervangen door koppeltekens
  const slug = solution.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Log de slug voor debugging
  console.log(`Generated slug for Contentful solution ${solution.id}:`, slug);
  
  // Bepaal de kleur en afbeelding voor deze oplossing
  const bgColor = getCategoryColor(solution.category);
  const imageSrc = getCategoryImage(solution);
  
  return (
    <Link 
      href={`/mobility-services/${slug}`}
      className={`relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 h-48 block ${bgColor}`}
    >
      {/* Probeer de afbeelding te laden, maar toon de knop ook zonder afbeelding */}
      <div className="absolute inset-0 opacity-30">
        <Image 
          src={imageSrc} 
          alt={solution.title}
          width={400}
          height={300}
          className="object-cover w-full h-full"
          priority
          onError={(e) => {
            // Als de afbeelding niet kan worden geladen, verberg deze dan
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      
      {/* Titel over de afbeelding heen */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <h3 className="text-xl font-bold text-white text-center">{solution.title}</h3>
      </div>
    </Link>
  );
} 