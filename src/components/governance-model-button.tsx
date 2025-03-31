'use client';

import { GovernanceModel } from '@/domain/models';
import Link from 'next/link';
import Image from 'next/image';

interface GovernanceModelButtonProps {
  model: GovernanceModel;
}

/**
 * A button component for displaying a governance model with a background color and image
 */
export default function GovernanceModelButton({ model }: GovernanceModelButtonProps) {
  // Generate the slug for linking to the model's detail page
  const slug = model.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Determine the background color based on the model's title
  const bgColorClass = getModelColor(model.title);
  
  // Determine the background image based on the model's title
  const bgImage = getModelImage(model.title);

  return (
    <Link 
      href={`/governance-models/${slug}`}
      className={`relative block rounded-lg ${bgColorClass} p-6 h-48 overflow-hidden transition-transform hover:scale-105 shadow-md hover:shadow-lg`}
    >
      {bgImage && (
        <div className="absolute inset-0 opacity-20">
          <Image 
            src={bgImage} 
            alt="" 
            fill
            style={{ objectFit: 'cover' }} 
          />
        </div>
      )}
      <div className="relative z-10">
        <h3 className="text-white font-bold text-xl mb-2">{model.title}</h3>
        {model.summary && (
          <p className="text-white/90 text-sm line-clamp-3">{model.summary}</p>
        )}
      </div>
    </Link>
  );
}

/**
 * Determine the background color class based on the governance model title
 */
function getModelColor(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('biz') || titleLower.includes('bedrijveninvesteringszone')) {
    return 'bg-purple-600';
  }
  
  if (titleLower.includes('vereniging') || titleLower.includes('vve')) {
    return 'bg-teal-600';
  }
  
  if (titleLower.includes('coöperatie') || titleLower.includes('cooperatie')) {
    return 'bg-yellow-600';
  }
  
  if (titleLower.includes('stichting')) {
    return 'bg-red-600';
  }
  
  if (titleLower.includes('convenant')) {
    return 'bg-blue-600';
  }
  
  // Default color for other types
  return 'bg-indigo-600';
}

/**
 * Determine the background image based on the governance model title
 */
function getModelImage(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('biz') || titleLower.includes('bedrijveninvesteringszone')) {
    return '/images/governance-biz.jpg';
  }
  
  if (titleLower.includes('vereniging') || titleLower.includes('vve')) {
    return '/images/governance-vereniging.jpg';
  }
  
  if (titleLower.includes('coöperatie') || titleLower.includes('cooperatie')) {
    return '/images/governance-cooperatie.jpg';
  }
  
  if (titleLower.includes('stichting')) {
    return '/images/governance-stichting.jpg';
  }
  
  if (titleLower.includes('convenant')) {
    return '/images/governance-convenant.jpg';
  }
  
  // Default image for other types
  return '/images/governance-default.jpg';
} 